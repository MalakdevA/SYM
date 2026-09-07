<?php
/**
 * SYM Egypt — Fawry Payment Initiation Endpoint
 * POST /api/fawry/initiate
 * 
 * Creates order + initiates Fawry Express Checkout → returns redirectUrl
 * 
 * Security:
 * - Server-side price verification (DB prices, not frontend)
 * - SHA-256 signed request
 * - Rate limiting (3 attempts / 5 min)
 * - Idempotency protection
 * - Full audit trail
 */

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../security.php';

setupCORS();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, null, "Method not allowed", 405);
}

// Rate limit: max 3 payment attempts per 5 minutes per IP
FawrySecurity::enforcePaymentRateLimit();

// Validate Fawry credentials are configured
$configCheck = FawryConfig::validate();
if (!$configCheck['valid']) {
    sendResponse(false, null, "Payment gateway configuration error. Please contact support.", 500);
}

$pdo = Database::getConnection();
if (!$pdo) {
    sendResponse(false, null, "Database connection failed.", 500);
}

$input = getJsonInput();

// ━━━━ 1. Validate Customer Input ━━━━
$customerName  = sanitizeString($input['customer_name'] ?? '');
$customerPhone = sanitizeString($input['customer_phone'] ?? '');
$customerEmail = filter_var($input['customer_email'] ?? '', FILTER_VALIDATE_EMAIL) ? trim($input['customer_email']) : '';
$city          = sanitizeString($input['city'] ?? 'القاهرة');
$addressLine   = sanitizeString($input['address'] ?? '');
$sessionId     = sanitizeString($input['session_id'] ?? '');
$directItems   = $input['items'] ?? [];
$paymentMethod = sanitizeString($input['payment_method'] ?? 'CARD');

if (empty($customerName) || empty($customerPhone) || empty($addressLine)) {
    sendResponse(false, null, "يرجى إدخال اسم العميل الكامل ورقم الهاتف والعنوان بالتفصيل", 400);
}

if (empty($directItems) || !is_array($directItems)) {
    sendResponse(false, null, "سلة التسوق فارغة، يرجى إضافة منتجات أولاً", 400);
}

// Normalize payment method
$allowedMethods = [FawryConfig::METHOD_CARD, FawryConfig::METHOD_FAWRY_REF, FawryConfig::METHOD_WALLET];
if (!in_array($paymentMethod, $allowedMethods, true)) {
    $paymentMethod = FawryConfig::METHOD_CARD;
}

// ━━━━ 2. Server-Side Price Verification (NEVER trust frontend prices) ━━━━
$verification = FawrySecurity::verifyOrderAmount($directItems, $pdo);
$subtotal       = $verification['subtotal'];
$checkoutItems  = $verification['verified_items'];

if ($subtotal <= 0) {
    sendResponse(false, null, "لم نتمكن من حساب إجمالي الطلب. يرجى التأكد من المنتجات.", 400);
}

$shippingFee = 0.00;
$vatRate     = 0.14;
$vatAmount   = round($subtotal * $vatRate, 2);
$grandTotal  = round($subtotal + $vatAmount + $shippingFee, 2);

$fullAddress    = $city . ' - ' . $addressLine;
$scooterSummary = $checkoutItems[0]['product_name'] . (count($checkoutItems) > 1 ? ' + ' . (count($checkoutItems) - 1) . ' منتجات أخرى' : '');
$customerProfileId = 'CUS-' . md5($customerPhone);

// ━━━━ 3. Real Idempotency — reuse a still-pending order from the SAME checkout session
//         instead of creating a duplicate. session_id is stable across retries (stored in the
//         browser's localStorage), so if the same cart is resubmitted — e.g. because the Fawry
//         gateway timed out or the user double-clicked — we must not insert a second real order. ━━━━
$existingOrder = null;
if (!empty($sessionId)) {
    // Reuse the order as long as it hasn't actually completed payment — a 'pending' order is
    // mid-flight, a 'failed' one just means the last attempt (e.g. the gateway call itself)
    // didn't go through, and a retry should continue that same order, not start a new one.
    $lookup = $pdo->prepare("
        SELECT o.id AS order_id, o.order_no, o.merchant_ref_num, pt.id AS txn_id
        FROM orders o
        JOIN payment_transactions pt ON pt.order_id = o.id AND pt.merchant_ref_num = o.merchant_ref_num
        WHERE o.session_id = ? AND o.payment_status IN ('pending', 'failed') AND ABS(o.amount - ?) < 0.01
          AND o.created_at >= (NOW() - INTERVAL 30 MINUTE)
        ORDER BY o.created_at DESC LIMIT 1
    ");
    $lookup->execute([$sessionId, $grandTotal]);
    $existingOrder = $lookup->fetch();
}

if ($existingOrder) {
    $orderId        = $existingOrder['order_id'];
    $orderNo        = $existingOrder['order_no'];
    $merchantRefNum = $existingOrder['merchant_ref_num'];
    $txnId          = $existingOrder['txn_id'];
    try {
        $pdo->prepare("UPDATE payment_transactions SET attempts = attempts + 1, status = 'INITIATED', updated_at = NOW() WHERE id = ?")->execute([$txnId]);
        $pdo->prepare("UPDATE orders SET payment_status = 'pending' WHERE id = ?")->execute([$orderId]);
    } catch (Exception $e) {}
} else {
    // ━━━━ 4. Generate Unique IDs for a genuinely new order ━━━━
    $orderId        = 'ord-' . bin2hex(random_bytes(8));
    $merchantRefNum = FawrySecurity::generateMerchantRefNum();
    $microTimeHex   = strtoupper(substr(dechex((int)(microtime(true) * 1000)), -4));
    $randomHex      = strtoupper(substr(bin2hex(random_bytes(2)), 0, 4));
    $orderNo        = '#SYM-' . date('Ymd') . '-' . $microTimeHex . $randomHex;
}

// ━━━━ 5. Build SHA-256 Signature ━━━━
$signature = FawrySecurity::buildChargeSignature(
    $merchantRefNum,
    $customerProfileId,
    $paymentMethod,
    $grandTotal
);

// ━━━━ 6. Build Fawry Charge Items ━━━━
$chargeItems = [];
foreach ($checkoutItems as $idx => $item) {
    $chargeItems[] = [
        'itemId'      => $item['product_id'] ?: ('item-' . ($idx + 1)),
        'description' => mb_substr($item['product_name'], 0, 200),
        'price'       => round($item['unit_price'], 2),
        'quantity'     => $item['quantity'],
    ];
}

// ━━━━ 7. Build Fawry Request Payload ━━━━
$fawryPayload = [
    'merchantCode'      => FawryConfig::getMerchantCode(),
    'merchantRefNum'    => $merchantRefNum,
    'customerName'      => $customerName,
    'customerMobile'    => $customerPhone,
    'customerEmail'     => $customerEmail ?: ($customerPhone . '@symegypt.com'),
    'customerProfileId' => $customerProfileId,
    'paymentMethod'     => $paymentMethod,
    'amount'            => $grandTotal,
    'currencyCode'      => FawryConfig::CURRENCY,
    'language'          => 'ar-eg',
    'chargeItems'       => $chargeItems,
    'returnUrl'         => FawryConfig::getReturnUrl() . '?merchantRefNum=' . urlencode($merchantRefNum),
    'signature'         => $signature,
];

// ━━━━ 8. Database Transaction — Create Order + Payment Record (skipped entirely on a retry —
//         $existingOrder already has everything we need, nothing new to insert) ━━━━
if (!$existingOrder) {
    try {
        $pdo->beginTransaction();

        // Insert Master Order
        $orderStmt = $pdo->prepare("
            INSERT INTO orders (id, order_no, customer_name, customer_phone, customer_email, address, scooter_model, amount, payment_method, payment_status, merchant_ref_num, status, session_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, 'قيد المعالجة', ?)
        ");
        $orderStmt->execute([
            $orderId, $orderNo, $customerName, $customerPhone, $customerEmail,
            $fullAddress, $scooterSummary, $grandTotal,
            'fawry_' . strtolower($paymentMethod), $merchantRefNum, $sessionId ?: null,
        ]);

        // Insert Order Line Items
        $itemStmt = $pdo->prepare("
            INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, quantity, total_price, image)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        foreach ($checkoutItems as $item) {
            $lineId = 'ori-' . bin2hex(random_bytes(8));
            $itemStmt->execute([
                $lineId, $orderId, $item['product_id'], $item['product_name'],
                $item['unit_price'], $item['quantity'], $item['total_price'], $item['image'],
            ]);
        }

        // Insert Payment Transaction Record
        $txnStmt = $pdo->prepare("
            INSERT INTO payment_transactions (id, order_id, merchant_ref_num, payment_method, amount, currency, status, signature_sent, ip_address, user_agent, raw_request)
            VALUES (?, ?, ?, ?, ?, ?, 'INITIATED', ?, ?, ?, ?)
        ");
        $txnId = 'txn-' . bin2hex(random_bytes(8));
        $txnStmt->execute([
            $txnId, $orderId, $merchantRefNum, $paymentMethod, $grandTotal,
            FawryConfig::CURRENCY, $signature,
            FawrySecurity::getClientIp(),
            substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500),
            json_encode($fawryPayload, JSON_UNESCAPED_UNICODE),
        ]);

        // Clear Cart if session exists
        if (!empty($sessionId)) {
            try {
                $clearStmt = $pdo->prepare("DELETE ci FROM cart_items ci JOIN carts c ON ci.cart_id = c.id WHERE c.user_session_id = ?");
                $clearStmt->execute([$sessionId]);
            } catch (Exception $e) {}
        }

        $pdo->commit();
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        // Log the real DB/exception detail server-side only — echoing it to the client
        // would leak schema/query internals in the API response.
        error_log('[FawryInitiate] Order creation failed: ' . $e->getMessage());
        sendResponse(false, null, "فشل إنشاء الطلب. يرجى المحاولة لاحقاً.", 500);
    }
}

// ━━━━ 9. Send to Fawry API ━━━━
FawrySecurity::auditLog('INITIATE', $orderId, $merchantRefNum, [
    'amount'         => $grandTotal,
    'payment_method' => $paymentMethod,
    'items_count'    => count($checkoutItems),
]);

$fawryResponse = FawrySecurity::sendToFawry(FawryConfig::getInitUrl(), 'POST', $fawryPayload);

// Update transaction with Fawry response
try {
    $updateStmt = $pdo->prepare("UPDATE payment_transactions SET raw_response = ?, updated_at = NOW() WHERE id = ?");
    $updateStmt->execute([json_encode($fawryResponse, JSON_UNESCAPED_UNICODE), $txnId]);
} catch (Exception $e) {}

if (!$fawryResponse['success'] || empty($fawryResponse['data'])) {
    // Update order payment status to failed
    try {
        $pdo->prepare("UPDATE orders SET payment_status = 'failed' WHERE id = ?")->execute([$orderId]);
        $pdo->prepare("UPDATE payment_transactions SET status = 'FAILED', fawry_message = ? WHERE id = ?")->execute([
            $fawryResponse['error'] ?? 'Fawry API request failed', $txnId,
        ]);
    } catch (Exception $e) {}

    FawrySecurity::auditLog('VERIFY_FAIL', $orderId, $merchantRefNum, [
        'reason'    => 'Fawry init request failed',
        'http_code' => $fawryResponse['http_code'] ?? 0,
        'error'     => $fawryResponse['error'] ?? 'Unknown',
    ]);

    sendResponse(false, null, "تعذر الاتصال ببوابة الدفع. يرجى المحاولة لاحقاً أو اختيار الدفع عند الاستلام.", 502);
}

$responseData = $fawryResponse['data'];
$redirectUrl  = $responseData['redirectUrl'] ?? $responseData['paymentURL'] ?? null;
$fawryRef     = $responseData['fawryRefNumber'] ?? $responseData['referenceNumber'] ?? null;

// Update transaction with Fawry reference
if ($fawryRef) {
    try {
        $pdo->prepare("UPDATE payment_transactions SET fawry_ref_number = ?, status = 'NEW' WHERE id = ?")->execute([$fawryRef, $txnId]);
        $pdo->prepare("UPDATE orders SET fawry_ref_number = ? WHERE id = ?")->execute([$fawryRef, $orderId]);
    } catch (Exception $e) {}
}

FawrySecurity::auditLog('REDIRECT', $orderId, $merchantRefNum, [
    'redirect_url' => $redirectUrl ? 'present' : 'missing',
    'fawry_ref'    => $fawryRef,
]);

// ━━━━ 10. Return redirect URL to Frontend ━━━━
sendResponse(true, [
    'order_id'         => $orderId,
    'order_no'         => $orderNo,
    'merchant_ref_num' => $merchantRefNum,
    'fawry_ref_number' => $fawryRef,
    'redirect_url'     => $redirectUrl,
    'subtotal'         => $subtotal,
    'vat_amount'       => $vatAmount,
    'amount'           => $grandTotal,
    'payment_method'   => $paymentMethod,
], 201);
