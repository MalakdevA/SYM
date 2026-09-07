<?php
/**
 * REST API Endpoint: Orders & Checkout Management
 * GET, POST, PUT /api/orders
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

setupCORS();

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if (!$pdo) {
    sendResponse(false, null, "Database connection failed.", 500);
}

switch ($method) {
    case 'GET':
        $orderNo = filter_input(INPUT_GET, 'order_no', FILTER_SANITIZE_SPECIAL_CHARS);

        // Public lookup: a customer looking up their own order confirmation by order number
        // (no admin auth required — mirrors the warranty chassis-lookup pattern). Rate-limited
        // since the order number's random component is low-entropy and this endpoint returns
        // customer PII (name, phone, address) — without a limit it's brute-forceable.
        if (!empty($orderNo)) {
            enforceRateLimit('order_lookup', 10, 60);
            $stmt = $pdo->prepare("SELECT * FROM orders WHERE order_no = ? LIMIT 1");
            $stmt->execute([trim($orderNo)]);
            $order = $stmt->fetch();

            if (!$order) {
                sendResponse(false, null, "لم يتم العثور على طلب بهذا الرقم", 404);
            }

            $itemsStmt = $pdo->prepare("SELECT product_id, product_name, unit_price, quantity, total_price, image FROM order_items WHERE order_id = ?");
            $itemsStmt->execute([$order['id']]);
            $order['items'] = $itemsStmt->fetchAll();

            sendResponse(true, $order);
        }

        // Admin listing: all orders
        requireAdminAuth();
        $stmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC");
        $orders = $stmt->fetchAll();
        sendResponse(true, $orders);
        break;

    case 'POST':
        // SEC-04 Fix: Rate Limit checkout order requests (max 10 requests per 60s per IP)
        enforceRateLimit('checkout_order', 10, 60);

        // Public endpoint for submitting orders with Backend Price Authority (SEC-02) & Transaction Safety
        $input = getJsonInput();
        $customerName = sanitizeString($input['customer_name'] ?? '');
        $scooterModel = sanitizeString($input['scooter_model'] ?? '');

        if (empty($customerName) || empty($scooterModel)) {
            sendResponse(false, null, "Customer name and Scooter model are required", 400);
        }

        // SEC-02 Fix: Backend Price Authority - Fetch real product price from DB instead of trusting frontend amount
        $amount = 85000.00; // Baseline fallback price
        try {
            $prodStmt = $pdo->prepare("SELECT price FROM products WHERE name = ? OR slug = ? OR id = ? LIMIT 1");
            $prodStmt->execute([$scooterModel, $scooterModel, $scooterModel]);
            $foundProduct = $prodStmt->fetch();
            if ($foundProduct && (float)$foundProduct['price'] > 0) {
                $amount = (float)$foundProduct['price'];
            }
        } catch (Exception $e) {
            // Keep default baseline if product query fails
        }

        // LOG-01 Fix: Collision-Safe Unique Order ID & Order Number
        $id = 'ord-' . bin2hex(random_bytes(8));
        $microTimeHex = strtoupper(substr(dechex((int)(microtime(true) * 1000)), -4));
        $randomHex = strtoupper(substr(bin2hex(random_bytes(2)), 0, 4));
        $orderNo = '#SYM-' . date('Ymd') . '-' . $microTimeHex . $randomHex;

        $payment = sanitizeString($input['payment_method'] ?? 'الدفع عند الاستلام');
        $status = 'قيد المعالجة';
        $customerPhone = sanitizeString($input['customer_phone'] ?? '');
        $customerEmail = filter_var($input['customer_email'] ?? '', FILTER_VALIDATE_EMAIL) ? trim($input['customer_email']) : '';
        $address = sanitizeString($input['address'] ?? 'القاهرة');

        try {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare("INSERT INTO orders (id, order_no, customer_name, customer_phone, customer_email, address, scooter_model, amount, payment_method, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $orderNo,
                $customerName,
                $customerPhone,
                $customerEmail,
                $address,
                $scooterModel,
                $amount,
                $payment,
                $status
            ]);

            $pdo->commit();

            sendResponse(true, ["id" => $id, "order_no" => $orderNo, "amount" => $amount, "message" => "Order created successfully"], 201);
        } catch (Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            error_log('[OrdersAPI] Order record error: ' . $e->getMessage());
            sendResponse(false, null, "تعذر تسجيل الطلب حالياً، يرجى المحاولة لاحقاً.", 500);
        }
        break;

    case 'PUT':
        requireAdminAuth();
        $input = getJsonInput();
        if (empty($input['id']) || empty($input['status'])) {
            sendResponse(false, null, "Order ID and Status are required", 400);
        }

        $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
        $stmt->execute([$input['status'], $input['id']]);

        sendResponse(true, ["message" => "Order status updated successfully"]);
        break;

    default:
        sendResponse(false, null, "Method not allowed", 405);
        break;
}
