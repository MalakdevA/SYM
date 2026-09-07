<?php
/**
 * SYM Egypt — Fawry Payment Status Verification Endpoint
 * GET /api/fawry/verify?merchantRefNum=xxx
 * 
 * Checks payment status with Fawry API and syncs with local DB.
 * Used by: Return URL page, Admin panel, Cron jobs
 */

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../security.php';

setupCORS();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, null, "Method not allowed", 405);
}

// This endpoint is unauthenticated (used by the public return-URL page) and returns customer
// name/phone/amount for any merchantRefNum, plus proxies a live request to Fawry's status API
// on every call — without a limit here it's an open enumeration/cost-abuse vector.
enforceRateLimit('fawry_verify', 20, 60);

// Validate Fawry credentials are configured — a production deploy with an unset
// FAWRY_SECURITY_KEY must fail closed, not silently operate on the known dev default.
$configCheck = FawryConfig::validate();
if (!$configCheck['valid']) {
    sendResponse(false, null, "Payment gateway configuration error. Please contact support.", 500);
}

$merchantRefNum = trim($_GET['merchantRefNum'] ?? '');
if (empty($merchantRefNum)) {
    sendResponse(false, null, "merchantRefNum is required", 400);
}

$pdo = Database::getConnection();
if (!$pdo) {
    sendResponse(false, null, "Database connection failed.", 500);
}

// 1. Find local transaction record
$txnStmt = $pdo->prepare("
    SELECT pt.*, o.id AS db_order_id, o.order_no, o.amount AS db_amount, 
           o.payment_status AS db_payment_status, o.payment_method, o.fawry_ref_number AS db_fawry_ref,
           o.customer_name, o.customer_phone
    FROM payment_transactions pt 
    JOIN orders o ON pt.order_id = o.id 
    WHERE pt.merchant_ref_num = ? 
    LIMIT 1
");
$txnStmt->execute([$merchantRefNum]);
$txn = $txnStmt->fetch();

if (!$txn) {
    sendResponse(false, null, "لم يتم العثور على عملية دفع بهذا الرقم المرجعي", 404);
}

$orderId = $txn['db_order_id'];

// 2. Build status check signature
$signature = FawrySecurity::buildStatusSignature($merchantRefNum);

// 3. Query Fawry Status API
$statusUrl = FawryConfig::getStatusUrl()
    . '?merchantCode=' . urlencode(FawryConfig::getMerchantCode())
    . '&merchantRefNumber=' . urlencode($merchantRefNum)
    . '&signature=' . urlencode($signature);

$fawryResponse = FawrySecurity::sendToFawry($statusUrl, 'GET');

FawrySecurity::auditLog('STATUS_CHECK', $orderId, $merchantRefNum, [
    'http_code'  => $fawryResponse['http_code'] ?? 0,
    'success'    => $fawryResponse['success'],
    'db_status'  => $txn['db_payment_status'],
]);

$fawryData = $fawryResponse['data'] ?? null;

// 4. If Fawry returned valid data, sync with local DB
if ($fawryData && isset($fawryData['orderStatus'])) {
    $fawryStatus    = strtoupper($fawryData['orderStatus']);
    $fawryRef       = $fawryData['fawryRefNumber'] ?? $txn['db_fawry_ref'];
    $paymentAmount  = (float)($fawryData['paymentAmount'] ?? 0);

    // Map Fawry status
    $statusMap = [
        'PAID'      => 'paid',
        'NEW'       => 'pending',
        'UNPAID'    => 'pending',
        'CANCELLED' => 'cancelled',
        'CANCELED'  => 'cancelled',
        'FAILED'    => 'failed',
        'EXPIRED'   => 'expired',
        'REFUNDED'  => 'refunded',
    ];
    $internalStatus = $statusMap[$fawryStatus] ?? 'pending';

    // Verify amount if PAID
    if ($fawryStatus === 'PAID' && $paymentAmount > 0) {
        $amountOk = FawrySecurity::verifyCallbackAmount($orderId, $paymentAmount, $pdo);
        if (!$amountOk) {
            FawrySecurity::auditLog('AMOUNT_MISMATCH', $orderId, $merchantRefNum, [
                'db_amount'    => $txn['db_amount'],
                'fawry_amount' => $paymentAmount,
                'source'       => 'status_check',
            ]);
        }
    }

    // Update DB if status changed
    if ($txn['db_payment_status'] !== $internalStatus) {
        try {
            $paidAt = ($internalStatus === 'paid') ? date('Y-m-d H:i:s') : null;

            $pdo->prepare("UPDATE orders SET payment_status = ?, fawry_ref_number = COALESCE(?, fawry_ref_number), paid_at = COALESCE(?, paid_at) WHERE id = ?")
                ->execute([$internalStatus, $fawryRef, $paidAt, $orderId]);

            $pdo->prepare("UPDATE payment_transactions SET status = ?, fawry_ref_number = COALESCE(?, fawry_ref_number), updated_at = NOW() WHERE merchant_ref_num = ?")
                ->execute([$fawryStatus, $fawryRef, $merchantRefNum]);
        } catch (Exception $e) {}
    }

    sendResponse(true, [
        'order_id'         => $orderId,
        'order_no'         => $txn['order_no'],
        'merchant_ref_num' => $merchantRefNum,
        'fawry_ref_number' => $fawryRef,
        'payment_status'   => $internalStatus,
        'fawry_status'     => $fawryStatus,
        'amount'           => (float)$txn['db_amount'],
        'payment_method'   => $txn['payment_method'],
        'customer_name'    => $txn['customer_name'],
    ]);
} else {
    // Fawry API didn't return usable data, return local DB status
    sendResponse(true, [
        'order_id'         => $orderId,
        'order_no'         => $txn['order_no'],
        'merchant_ref_num' => $merchantRefNum,
        'fawry_ref_number' => $txn['db_fawry_ref'],
        'payment_status'   => $txn['db_payment_status'],
        'fawry_status'     => $txn['status'],
        'amount'           => (float)$txn['db_amount'],
        'payment_method'   => $txn['payment_method'],
        'customer_name'    => $txn['customer_name'],
        'note'             => 'Status from local database (Fawry API unavailable)',
    ]);
}
