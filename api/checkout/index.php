<?php
/**
 * REST API Endpoint: Transaction-Safe E-Commerce Checkout Engine (COD Only)
 * POST /api/checkout
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

setupCORS();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, null, "Method not allowed", 405);
}

// Rate Limiter against spam checkout requests (max 5 checkout attempts per 60s)
enforceRateLimit('checkout_submit', 5, 60);

$pdo = Database::getConnection();
if (!$pdo) {
    sendResponse(false, null, "Database connection failed.", 500);
}

$input = getJsonInput();

$customerName = sanitizeString($input['customer_name'] ?? '');
$customerPhone = sanitizeString($input['customer_phone'] ?? '');
$customerEmail = filter_var($input['customer_email'] ?? '', FILTER_VALIDATE_EMAIL) ? trim($input['customer_email']) : '';
$city = sanitizeString($input['city'] ?? 'القاهرة');
$addressLine = sanitizeString($input['address'] ?? '');
$sessionId = sanitizeString($input['session_id'] ?? '');
$directItems = $input['items'] ?? [];

// Strict backend validation
$cleanPhone = preg_replace('/[^0-9]/', '', $customerPhone);
if (empty($customerName) || mb_strlen($customerName) < 6) {
    sendResponse(false, null, "يرجى إدخال اسم العميل الكامل الثلاثي", 400);
}
if (!preg_match('/^01[0125][0-9]{8}$/', $cleanPhone)) {
    sendResponse(false, null, "رقم الهاتف غير صحيح، يجب أن يكون 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015", 400);
}
if (empty($addressLine) || mb_strlen($addressLine) < 10) {
    sendResponse(false, null, "يرجى إدخال عنوان التوصيل المفصل والدقيق (الشارع، العمارة، الشقة، والعلامة المميزة)", 400);
}

$fullAddress = (strpos($addressLine, $city) !== false) ? $addressLine : ($city . ' - ' . $addressLine);
$paymentMethod = sanitizeString($input['payment_method'] ?? 'فوري Fawry Pay & البطاقات البنكية');

// 1. Fetch Cart Items & Calculate Price in Backend
$checkoutItems = [];
$subtotal = 0.00;

if (!empty($sessionId)) {
    $cartStmt = $pdo->prepare("
        SELECT ci.* FROM cart_items ci
        JOIN carts c ON ci.cart_id = c.id
        WHERE c.user_session_id = ? AND c.status = 'active'
    ");
    $cartStmt->execute([$sessionId]);
    $dbCartItems = $cartStmt->fetchAll();

    foreach ($dbCartItems as $cItem) {
        $qty = max(1, (int)$cItem['quantity']);
        $unitPrice = (float)$cItem['price'];
        $itemTotal = $unitPrice * $qty;
        $subtotal += $itemTotal;

        $checkoutItems[] = [
            "product_id" => $cItem['product_id'],
            "product_name" => $cItem['product_name'],
            "unit_price" => $unitPrice,
            "quantity" => $qty,
            "total_price" => $itemTotal,
            "image" => $cItem['image'] ?? '/Husky ADV.png'
        ];
    }
}

// Fallback to direct items payload if cart session is empty
if (empty($checkoutItems) && is_array($directItems) && count($directItems) > 0) {
    foreach ($directItems as $dItem) {
        $prodId = sanitizeString($dItem['product_id'] ?? '');
        $prodName = sanitizeString($dItem['product_name'] ?? '');
        $qty = max(1, (int)($dItem['quantity'] ?? 1));
        
        // Fetch DB Price
        $unitPrice = 0.0;
        $image = sanitizeString($dItem['image'] ?? '/Husky ADV.png');

        try {
            $pStmt = $pdo->prepare("SELECT price, name, image FROM products WHERE id = ? OR slug = ? OR name = ? LIMIT 1");
            $pStmt->execute([$prodId, $prodId, $prodName]);
            $pFound = $pStmt->fetch();
            if ($pFound && (float)$pFound['price'] > 0) {
                $unitPrice = (float)$pFound['price'];
                $prodName = $pFound['name'];
                if (!empty($pFound['image'])) $image = $pFound['image'];
            }
        } catch (Exception $e) {}

        if ($unitPrice <= 0) {
            try {
                $spStmt = $pdo->prepare("SELECT price, name FROM spare_parts WHERE id = ? OR sku = ? OR name = ? LIMIT 1");
                $spStmt->execute([$prodId, $prodId, $prodName]);
                $spFound = $spStmt->fetch();
                if ($spFound && (float)$spFound['price'] > 0) {
                    $unitPrice = (float)$spFound['price'];
                    $prodName = $spFound['name'];
                }
            } catch (Exception $e) {}
        }

        // Fallback to catalog known models
        if ($unitPrice <= 0) {
            $catalogFallbacks = [
                'cruisym' => 315000.00,
                'joymax'  => 210000.00,
                'husky'   => 145000.00,
                'jet 14'  => 98000.00,
                'jet x'   => 105000.00,
                'symphony'=> 89000.00,
                'fiddle 4'=> 78000.00,
                'fiddle 3'=> 68000.00,
                'fiddle 2'=> 58000.00,
                'nhx'     => 92000.00,
                'nht'     => 95000.00,
            ];
            $searchStr = strtolower($prodId . ' ' . $prodName);
            foreach ($catalogFallbacks as $keyword => $catPrice) {
                if (strpos($searchStr, $keyword) !== false) {
                    $unitPrice = $catPrice;
                    break;
                }
            }
        }

        if ($unitPrice <= 0) {
            $unitPrice = 85000.00;
        }

        $itemTotal = $unitPrice * $qty;
        $subtotal += $itemTotal;

        $checkoutItems[] = [
            "product_id" => $prodId ?: 'prod-' . time(),
            "product_name" => $prodName ?: 'سكوتر SYM',
            "unit_price" => $unitPrice,
            "quantity" => $qty,
            "total_price" => $itemTotal,
            "image" => $image
        ];
    }
}

if (empty($checkoutItems)) {
    sendResponse(false, null, "سلة التسوق فارغة، يرجى إضافة منتجات أولاً", 400);
}

// 2. Shipping Fee Logic (0 EGP or baseline shipping)
$shippingFee = 0.00;
$grandTotal = $subtotal + $shippingFee;

// 3. Collision-Safe ID & Order Number
$orderId = 'ord-' . bin2hex(random_bytes(8));
$microTimeHex = strtoupper(substr(dechex((int)(microtime(true) * 1000)), -4));
$randomHex = strtoupper(substr(bin2hex(random_bytes(2)), 0, 4));
$orderNo = '#SYM-' . date('Ymd') . '-' . $microTimeHex . $randomHex;
$scooterSummary = $checkoutItems[0]['product_name'] . (count($checkoutItems) > 1 ? ' + ' . (count($checkoutItems) - 1) . ' منتجات أخرى' : '');

// 4. InnoDB Database Transaction
try {
    $pdo->beginTransaction();

    // Insert Master Order
    $orderStmt = $pdo->prepare("
        INSERT INTO orders (id, order_no, customer_name, customer_phone, customer_email, address, scooter_model, amount, payment_method, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'قيد المعالجة')
    ");
    $orderStmt->execute([
        $orderId,
        $orderNo,
        $customerName,
        $customerPhone,
        $customerEmail,
        $fullAddress,
        $scooterSummary,
        $grandTotal,
        $paymentMethod
    ]);

    // Insert Order Line Items
    $itemStmt = $pdo->prepare("
        INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, quantity, total_price, image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");

    foreach ($checkoutItems as $item) {
        $lineId = 'ori-' . bin2hex(random_bytes(8));
        $itemStmt->execute([
            $lineId,
            $orderId,
            $item['product_id'],
            $item['product_name'],
            $item['unit_price'],
            $item['quantity'],
            $item['total_price'],
            $item['image']
        ]);
    }

    // Clear Active Cart if session exists
    if (!empty($sessionId)) {
        $clearStmt = $pdo->prepare("
            DELETE ci FROM cart_items ci
            JOIN carts c ON ci.cart_id = c.id
            WHERE c.user_session_id = ?
        ");
        $clearStmt->execute([$sessionId]);
    }

    $pdo->commit();

    sendResponse(true, [
        "order_id" => $orderId,
        "order_no" => $orderNo,
        "customer_name" => $customerName,
        "customer_phone" => $customerPhone,
        "address" => $fullAddress,
        "subtotal" => $subtotal,
        "shipping_fee" => $shippingFee,
        "grand_total" => $grandTotal,
        "payment_method" => $paymentMethod,
        "items" => $checkoutItems,
        "message" => "تم إرسال طلبك بنجاح! تواصل معنا برقم الطلب للترتيب للتسليم."
    ], 201);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('[CheckoutAPI] Order creation error: ' . $e->getMessage());
    sendResponse(false, null, "تعذر تسجيل الطلب حالياً، يرجى مراجعة البيانات وإعادة المحاولة.", 500);
}
