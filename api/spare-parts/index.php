<?php
/**
 * REST API Endpoint: Spare Parts & Accessories Inventory
 * GET, POST, PUT, DELETE /api/spare-parts
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
        $stmt = $pdo->query("SELECT * FROM spare_parts ORDER BY category ASC, name ASC");
        $parts = $stmt->fetchAll();

        sendResponse(true, $parts);
        break;

    case 'POST':
        requireAdminAuth();
        $input = getJsonInput();
        if (empty($input['name']) || empty($input['price'])) {
            sendResponse(false, null, "Name and Price are required", 400);
        }

        $id = $input['id'] ?? 'sp-' . time();
        $sku = sanitizeString($input['sku'] ?? '') ?: 'SYM-SP-' . rand(1000, 9999);
        $name = sanitizeString($input['name']);
        $category = sanitizeString($input['category'] ?? 'الزيوت والصيانة');
        $price = (float)$input['price'];
        $costPrice = isset($input['cost_price']) && $input['cost_price'] !== '' ? (float)$input['cost_price'] : null;
        $stock = (int)($input['stock'] ?? 0);
        $compatible = sanitizeString($input['compatible_model'] ?? ($input['compatibleModel'] ?? 'جميع الموديلات'));
        $brand = sanitizeString($input['brand'] ?? '') ?: null;
        $rackLocation = sanitizeString($input['rack_location'] ?? '') ?: null;
        $warrantyPeriod = sanitizeString($input['warranty_period'] ?? '') ?: null;
        $status = $stock > 10 ? 'نشط' : ($stock > 0 ? 'مخزون منخفض' : 'نفذ المخزون');

        $stmt = $pdo->prepare("INSERT INTO spare_parts (id, sku, name, category, price, cost_price, stock, compatible_model, brand, rack_location, warranty_period, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id, $sku, $name, $category, $price, $costPrice, $stock, $compatible, $brand, $rackLocation, $warrantyPeriod, $status]);

        sendResponse(true, ["id" => $id, "sku" => $sku, "message" => "تمت إضافة قطعة الغيار بنجاح"], 201);
        break;

    case 'PUT':
        requireAdminAuth();
        $input = getJsonInput();
        if (empty($input['id'])) {
            sendResponse(false, null, "Spare part ID is required", 400);
        }

        $id = sanitizeString($input['id']);
        $name = sanitizeString($input['name'] ?? '');
        $price = isset($input['price']) ? (float)$input['price'] : null;
        $costPrice = isset($input['cost_price']) && $input['cost_price'] !== '' ? (float)$input['cost_price'] : null;
        $stock = isset($input['stock']) ? (int)$input['stock'] : null;
        $category = sanitizeString($input['category'] ?? '');
        $compatible = sanitizeString($input['compatible_model'] ?? ($input['compatibleModel'] ?? ''));
        $brand = sanitizeString($input['brand'] ?? '');
        $rackLocation = sanitizeString($input['rack_location'] ?? '');
        $warrantyPeriod = sanitizeString($input['warranty_period'] ?? '');

        $status = $stock !== null ? ($stock > 10 ? 'نشط' : ($stock > 0 ? 'مخزون منخفض' : 'نفذ المخزون')) : null;

        $stmt = $pdo->prepare("UPDATE spare_parts SET
            name = COALESCE(?, name),
            price = COALESCE(?, price),
            cost_price = COALESCE(?, cost_price),
            stock = COALESCE(?, stock),
            category = COALESCE(?, category),
            compatible_model = COALESCE(?, compatible_model),
            brand = COALESCE(?, brand),
            rack_location = COALESCE(?, rack_location),
            warranty_period = COALESCE(?, warranty_period),
            status = COALESCE(?, status)
            WHERE id = ?");
        $stmt->execute([
            $name ?: null,
            $price,
            $costPrice,
            $stock,
            $category ?: null,
            $compatible ?: null,
            $brand ?: null,
            $rackLocation ?: null,
            $warrantyPeriod ?: null,
            $status,
            $id
        ]);

        sendResponse(true, ["message" => "تم تحديث بيانات قطعة الغيار بنجاح"]);
        break;

    case 'DELETE':
        requireAdminAuth();
        $input = getJsonInput();
        $id = sanitizeString($_GET['id'] ?? ($input['id'] ?? ''));
        if (!$id) {
            sendResponse(false, null, "Spare part ID is required", 400);
        }

        $stmt = $pdo->prepare("DELETE FROM spare_parts WHERE id = ?");
        $stmt->execute([$id]);

        sendResponse(true, ["message" => "تم حذف قطعة الغيار بنجاح"]);
        break;

    default:
        sendResponse(false, null, "Method not allowed", 405);
        break;
}
