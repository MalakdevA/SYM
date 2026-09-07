<?php
/**
 * REST API Endpoint: E-Commerce Cart Engine
 * GET, POST, PUT, DELETE /api/cart
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

setupCORS();

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if (!$pdo) {
    sendResponse(false, null, "Database connection failed.", 500);
}

function getOrCreateCart(PDO $pdo, string $sessionId): string {
    $stmt = $pdo->prepare("SELECT id FROM carts WHERE user_session_id = ? AND status = 'active' LIMIT 1");
    $stmt->execute([$sessionId]);
    $cart = $stmt->fetch();
    if ($cart) {
        return $cart['id'];
    }

    $cartId = 'crt-' . bin2hex(random_bytes(8));
    $insertStmt = $pdo->prepare("INSERT INTO carts (id, user_session_id, status) VALUES (?, ?, 'active')");
    $insertStmt->execute([$cartId, $sessionId]);
    return $cartId;
}

switch ($method) {
    case 'GET':
        $sessionId = filter_input(INPUT_GET, 'session_id', FILTER_SANITIZE_SPECIAL_CHARS);
        if (empty($sessionId)) {
            sendResponse(false, null, "Session ID is required", 400);
        }

        $cartId = getOrCreateCart($pdo, $sessionId);
        $stmt = $pdo->prepare("SELECT * FROM cart_items WHERE cart_id = ? ORDER BY created_at DESC");
        $stmt->execute([$cartId]);
        $items = $stmt->fetchAll();

        $subtotal = 0;
        foreach ($items as &$item) {
            $item['price'] = (float)$item['price'];
            $item['quantity'] = (int)$item['quantity'];
            $item['total'] = $item['price'] * $item['quantity'];
            $subtotal += $item['total'];
        }

        sendResponse(true, [
            "cart_id" => $cartId,
            "session_id" => $sessionId,
            "items" => $items,
            "subtotal" => $subtotal,
            "count" => count($items)
        ]);
        break;

    case 'POST':
        $input = getJsonInput();
        $sessionId = sanitizeString($input['session_id'] ?? '');
        $productId = sanitizeString($input['product_id'] ?? '');
        $productName = sanitizeString($input['product_name'] ?? '');
        $quantity = max(1, (int)($input['quantity'] ?? 1));
        $itemType = sanitizeString($input['item_type'] ?? 'scooter');
        $image = sanitizeString($input['image'] ?? '/Husky ADV.png');

        if (empty($sessionId) || empty($productId) || empty($productName)) {
            sendResponse(false, null, "Session ID, Product ID, and Product Name are required", 400);
        }

        // Fetch real product price from DB (Backend Price Authority)
        $price = 0.0;
        try {
            if ($itemType === 'spare_part') {
                $pStmt = $pdo->prepare("SELECT price, name, sku FROM spare_parts WHERE id = ? OR sku = ? OR name = ? LIMIT 1");
                $pStmt->execute([$productId, $productId, $productName]);
                $pFound = $pStmt->fetch();
                if ($pFound && (float)$pFound['price'] > 0) {
                    $price = (float)$pFound['price'];
                    $productName = $pFound['name'];
                }
            } else {
                $pStmt = $pdo->prepare("SELECT price, name, image FROM products WHERE id = ? OR slug = ? OR name = ? LIMIT 1");
                $pStmt->execute([$productId, $productId, $productName]);
                $pFound = $pStmt->fetch();
                if ($pFound && (float)$pFound['price'] > 0) {
                    $price = (float)$pFound['price'];
                    $productName = $pFound['name'];
                    if (!empty($pFound['image'])) $image = $pFound['image'];
                }
            }
        } catch (Exception $e) {
            // Log or ignore
        }

        // Fallback to catalog known models if DB not yet seeded
        if ($price <= 0) {
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
            $searchStr = strtolower($productId . ' ' . $productName);
            foreach ($catalogFallbacks as $keyword => $catPrice) {
                if (strpos($searchStr, $keyword) !== false) {
                    $price = $catPrice;
                    break;
                }
            }
        }

        if ($price <= 0) {
            $price = ($itemType === 'spare_part') ? 450.00 : 85000.00;
        }

        $cartId = getOrCreateCart($pdo, $sessionId);

        // Check if item already exists in cart
        $checkStmt = $pdo->prepare("SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? LIMIT 1");
        $checkStmt->execute([$cartId, $productId]);
        $existing = $checkStmt->fetch();

        if ($existing) {
            $newQty = $existing['quantity'] + $quantity;
            $updateStmt = $pdo->prepare("UPDATE cart_items SET quantity = ?, price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $updateStmt->execute([$newQty, $price, $existing['id']]);
        } else {
            $itemId = 'cit-' . bin2hex(random_bytes(8));
            $insertStmt = $pdo->prepare("INSERT INTO cart_items (id, cart_id, product_id, product_name, price, quantity, image, item_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $insertStmt->execute([$itemId, $cartId, $productId, $productName, $price, $quantity, $image, $itemType]);
        }

        sendResponse(true, ["message" => "Item added to cart successfully"], 201);
        break;

    case 'PUT':
        $input = getJsonInput();
        $sessionId = sanitizeString($input['session_id'] ?? '');
        $productId = sanitizeString($input['product_id'] ?? '');
        $quantity = (int)($input['quantity'] ?? 1);

        if (empty($sessionId) || empty($productId)) {
            sendResponse(false, null, "Session ID and Product ID are required", 400);
        }

        $cartId = getOrCreateCart($pdo, $sessionId);

        if ($quantity <= 0) {
            $delStmt = $pdo->prepare("DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?");
            $delStmt->execute([$cartId, $productId]);
        } else {
            $updateStmt = $pdo->prepare("UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE cart_id = ? AND product_id = ?");
            $updateStmt->execute([$quantity, $cartId, $productId]);
        }

        sendResponse(true, ["message" => "Cart updated successfully"]);
        break;

    case 'DELETE':
        $sessionId = filter_input(INPUT_GET, 'session_id', FILTER_SANITIZE_SPECIAL_CHARS);
        $productId = filter_input(INPUT_GET, 'product_id', FILTER_SANITIZE_SPECIAL_CHARS);

        if (empty($sessionId)) {
            sendResponse(false, null, "Session ID is required", 400);
        }

        $cartId = getOrCreateCart($pdo, $sessionId);

        if ($productId) {
            $stmt = $pdo->prepare("DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?");
            $stmt->execute([$cartId, $productId]);
        } else {
            // Clear entire cart
            $stmt = $pdo->prepare("DELETE FROM cart_items WHERE cart_id = ?");
            $stmt->execute([$cartId]);
        }

        sendResponse(true, ["message" => "Cart cleared successfully"]);
        break;

    default:
        sendResponse(false, null, "Method not allowed", 405);
        break;
}
