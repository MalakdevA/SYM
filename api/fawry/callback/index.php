<?php
/**
 * SYM Egypt — Fawry Webhook Callback Endpoint
 * POST /api/fawry/callback
 * 
 * Receives payment status notifications from Fawry servers.
 * 
 * Security Layers:
 * 1. IP Whitelist — Only Fawry IPs accepted
 * 2. Signature Verification — SHA-256 HMAC check
 * 3. Amount Verification — Paid amount must match DB amount
 * 4. Replay Protection — Duplicate callbacks ignored
 * 5. Immutable Audit Trail — Every callback logged
 */

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../security.php';

// Minimal CORS — webhooks don't need browser CORS but need JSON headers
header("Content-Type: application/json; charset=UTF-8");
header("X-Content-Type-Options: nosniff");

// Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['success' => false, 'error' => 'Method not allowed']));
}

// ━━━━ 1. IP Whitelist Enforcement ━━━━
FawrySecurity::enforceWebhookIp();

// Validate Fawry credentials are configured — a production deploy with an unset
// FAWRY_SECURITY_KEY must fail closed, not silently accept signatures forged with the known
// dev default key.
$configCheck = FawryConfig::validate();
if (!$configCheck['valid']) {
    http_response_code(500);
    exit(json_encode(['success' => false, 'error' => 'Payment gateway misconfigured']));
}

$pdo = Database::getConnection();
if (!$pdo) {
    http_response_code(500);
    exit(json_encode(['success' => false, 'error' => 'Database unavailable']));
}

// ━━━━ 2. Parse Callback Payload ━━━━
$rawBody = file_get_contents('php://input');
$payload = json_decode($rawBody, true);

if (!is_array($payload) || empty($payload)) {
    FawrySecurity::auditLog('SUSPICIOUS', null, null, [
        'reason'   => 'Empty or invalid callback payload',
        'raw_body' => substr($rawBody, 0, 2000),
    ]);
    http_response_code(400);
    exit(json_encode(['success' => false, 'error' => 'Invalid payload']));
}

$merchantRefNum = $payload['merchantRefNumber'] ?? '';
$fawryRefNumber = $payload['fawryRefNumber'] ?? '';
$orderStatus    = $payload['orderStatus'] ?? '';
$paymentAmount  = (float)($payload['paymentAmount'] ?? 0);
$orderAmount    = (float)($payload['orderAmount'] ?? 0);
$paymentMethod  = $payload['paymentMethod'] ?? '';
$receivedSig    = $payload['messageSignature'] ?? $payload['signature'] ?? '';

// Log full callback for forensics
FawrySecurity::auditLog('CALLBACK', null, $merchantRefNum, [
    'fawry_ref'      => $fawryRefNumber,
    'order_status'   => $orderStatus,
    'payment_amount' => $paymentAmount,
    'payment_method' => $paymentMethod,
]);

// ━━━━ 3. Validate Required Fields ━━━━
if (empty($merchantRefNum) || empty($orderStatus)) {
    FawrySecurity::auditLog('SUSPICIOUS', null, $merchantRefNum, [
        'reason' => 'Missing required callback fields',
    ]);
    http_response_code(400);
    exit(json_encode(['success' => false, 'error' => 'Missing required fields']));
}

// ━━━━ 4. Signature Verification — REQUIRED, never skippable ━━━━
// A missing signature must be treated exactly like an invalid one; otherwise an attacker who
// simply omits messageSignature/signature can forge a "PAID" callback with no verification at all.
if (empty($receivedSig) || !FawrySecurity::verifyCallbackSignature($payload, $receivedSig)) {
    FawrySecurity::auditLog('SIGNATURE_MISMATCH', null, $merchantRefNum, [
        'received_signature' => $receivedSig,
        'payload'            => $payload,
    ]);
    http_response_code(403);
    exit(json_encode(['success' => false, 'error' => 'Signature verification failed']));
}

// ━━━━ 5-8. Find Matching Transaction, Verify & Update — one transaction, row-locked ━━━━
// Steps 5-8 used to run as separate, unlocked reads followed by a late beginTransaction()
// for the final update. Two callbacks for the same merchantRefNum arriving close together
// (Fawry retries a webhook that appears to time out) could both pass the "not yet paid"
// replay check before either one committed its update, double-processing the same payment.
// Locking the row with SELECT ... FOR UPDATE for the whole read-check-write sequence makes
// a concurrent callback block until the first one commits, so it then sees the now-updated
// status and correctly takes the "already processed" branch instead of racing it.
try {
    $pdo->beginTransaction();

    $txnStmt = $pdo->prepare("SELECT pt.*, o.id AS db_order_id, o.amount AS db_amount, o.payment_status AS db_payment_status
        FROM payment_transactions pt
        JOIN orders o ON pt.order_id = o.id
        WHERE pt.merchant_ref_num = ?
        LIMIT 1 FOR UPDATE");
    $txnStmt->execute([$merchantRefNum]);
    $txn = $txnStmt->fetch();

    if (!$txn) {
        $pdo->commit();
        FawrySecurity::auditLog('SUSPICIOUS', null, $merchantRefNum, [
            'reason' => 'Callback for unknown merchant_ref_num',
        ]);
        // Still return 200 to prevent Fawry retries for unknown refs
        http_response_code(200);
        exit(json_encode(['success' => true, 'message' => 'Acknowledged (unknown reference)']));
    }

    $orderId = $txn['db_order_id'];
    $txnId   = $txn['id'];

    // ━━━━ 6. Replay Protection — Skip if already processed ━━━━
    if (in_array($txn['status'], ['PAID', 'REFUNDED'], true) && $txn['db_payment_status'] === 'paid') {
        // Already processed, just acknowledge
        $pdo->commit();
        http_response_code(200);
        exit(json_encode(['success' => true, 'message' => 'Already processed']));
    }

    // ━━━━ 7. Amount Verification ━━━━
    if ($orderStatus === 'PAID' && $paymentAmount > 0) {
        $amountValid = FawrySecurity::verifyCallbackAmount($orderId, $paymentAmount, $pdo);
        if (!$amountValid) {
            // CRITICAL: Amount mismatch — do NOT update to paid.
            // Still acknowledge with 200 to stop Fawry retries, but flag for manual review.
            $pdo->prepare("UPDATE orders SET payment_status = 'disputed' WHERE id = ?")->execute([$orderId]);
            $pdo->prepare("UPDATE payment_transactions SET status = 'DISPUTED', fawry_message = 'Amount mismatch detected', raw_callback = ? WHERE id = ?")->execute([
                $rawBody, $txnId
            ]);
            $pdo->commit();

            FawrySecurity::auditLog('AMOUNT_MISMATCH', $orderId, $merchantRefNum, [
                'db_amount'   => $txn['db_amount'],
                'paid_amount' => $paymentAmount,
            ]);

            http_response_code(200);
            exit(json_encode(['success' => true, 'message' => 'Acknowledged (under review)']));
        }
    }

    // ━━━━ 8. Process Status Update ━━━━
    // Map Fawry status to our internal status
    $internalPaymentStatus = 'pending';
    $paidAt = null;

    switch (strtoupper($orderStatus)) {
        case 'PAID':
            $internalPaymentStatus = 'paid';
            $paidAt = date('Y-m-d H:i:s');
            break;
        case 'NEW':
            $internalPaymentStatus = 'pending';
            break;
        case 'CANCELLED':
        case 'CANCELED':
            $internalPaymentStatus = 'cancelled';
            break;
        case 'FAILED':
            $internalPaymentStatus = 'failed';
            break;
        case 'EXPIRED':
            $internalPaymentStatus = 'expired';
            break;
        case 'REFUNDED':
            $internalPaymentStatus = 'refunded';
            break;
        default:
            $internalPaymentStatus = 'pending';
    }

    // Update orders table
    $orderUpdate = $pdo->prepare("
        UPDATE orders SET 
            payment_status = ?, 
            fawry_ref_number = COALESCE(?, fawry_ref_number),
            paid_at = COALESCE(?, paid_at)
        WHERE id = ?
    ");
    $orderUpdate->execute([$internalPaymentStatus, $fawryRefNumber, $paidAt, $orderId]);

    // Update payment_transactions table
    $txnUpdate = $pdo->prepare("
        UPDATE payment_transactions SET
            status = ?,
            fawry_ref_number = COALESCE(?, fawry_ref_number),
            fawry_status_code = ?,
            signature_received = ?,
            raw_callback = ?,
            updated_at = NOW()
        WHERE id = ?
    ");
    $txnUpdate->execute([
        strtoupper($orderStatus),
        $fawryRefNumber,
        $payload['statusCode'] ?? $orderStatus,
        $receivedSig,
        $rawBody,
        $txnId,
    ]);

    $pdo->commit();

    FawrySecurity::auditLog('CALLBACK', $orderId, $merchantRefNum, [
        'new_status'     => $internalPaymentStatus,
        'fawry_status'   => $orderStatus,
        'fawry_ref'      => $fawryRefNumber,
        'payment_amount' => $paymentAmount,
        'result'         => 'processed_successfully',
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();

    FawrySecurity::auditLog('VERIFY_FAIL', $orderId, $merchantRefNum, [
        'reason' => 'Database update failed during callback processing',
        'error'  => $e->getMessage(),
    ]);

    // Return 500 so Fawry retries the callback
    http_response_code(500);
    exit(json_encode(['success' => false, 'error' => 'Internal processing error']));
}

// ━━━━ 9. Acknowledge to Fawry ━━━━
http_response_code(200);
echo json_encode(['success' => true, 'message' => 'Callback processed successfully']);
exit();
