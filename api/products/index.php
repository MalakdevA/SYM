<?php
/**
 * REST API Endpoint: Products & Scooters Management
 * GET, POST, PUT, DELETE /api/products
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

setupCORS();

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if (!$pdo) {
    sendResponse(false, null, "Database connection failed. Please ensure MySQL is running.", 500);
}

function formatProductRow(array $product): array {
    $product['inStock'] = (bool)$product['in_stock'];
    $product['isNew'] = (bool)$product['is_new'];
    $product['price'] = (float)$product['price'];

    if (!empty($product['images'])) {
        $decoded = json_decode($product['images'], true);
        $product['images'] = is_array($decoded) ? $decoded : [$product['image']];
    } else {
        $product['images'] = [$product['image']];
    }

    if (!empty($product['colors'])) {
        $decoded = json_decode($product['colors'], true);
        $product['colors'] = is_array($decoded) ? $decoded : [];
    } else {
        $product['colors'] = [];
    }

    if (!empty($product['images_360'])) {
        $decoded = json_decode($product['images_360'], true);
        $product['images360'] = is_array($decoded) ? $decoded : [];
    } else {
        $product['images360'] = [];
    }

    if (!empty($product['specifications'])) {
        $decoded = json_decode($product['specifications'], true);
        $product['specifications'] = is_array($decoded) ? $decoded : [
            'capacity' => $product['capacity'] ?? '',
            'power' => $product['power'] ?? '',
            'speed' => $product['speed'] ?? '',
            'cooling' => $product['cooling'] ?? ''
        ];
    } else {
        $product['specifications'] = [
            'capacity' => $product['capacity'] ?? '',
            'power' => $product['power'] ?? '',
            'speed' => $product['speed'] ?? '',
            'cooling' => $product['cooling'] ?? ''
        ];
    }

    if (!empty($product['features'])) {
        $decoded = json_decode($product['features'], true);
        $product['features'] = is_array($decoded) ? $decoded : [];
    }

    $product['catalogPdf'] = $product['catalog_pdf'] ?? null;
    $product['videoUrl'] = $product['video_url'] ?? null;

    return $product;
}

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ? OR slug = ?");
            $stmt->execute([$_GET['id'], $_GET['id']]);
            $product = $stmt->fetch();
            if ($product) {
                sendResponse(true, formatProductRow($product));
            } else {
                sendResponse(false, null, "Product not found", 404);
            }
        } else {
            $stmt = $pdo->query("SELECT * FROM products ORDER BY created_at DESC");
            $products = $stmt->fetchAll();
            $formatted = array_map('formatProductRow', $products);
            sendResponse(true, $formatted);
        }
        break;

    case 'POST':
        requireAdminAuth();
        $input = getJsonInput();
        if (empty($input['name']) || empty($input['price'])) {
            sendResponse(false, null, "Name and Price are required", 400);
        }

        $id = sanitizeString($input['id'] ?? '') ?: 'sym-' . time();
        $slug = sanitizeString($input['slug'] ?? '') ?: strtolower(preg_replace('/[^A-Za-z0-9-]+/', '-', $input['name']));
        $category = in_array($input['category'] ?? '', ['scooter', 'bike'], true) ? $input['category'] : 'scooter';
        $subCategory = sanitizeString($input['subCategory'] ?? ($input['sub_category'] ?? 'سكوترز رياضية'));
        $price = (float)$input['price'];
        $image = sanitizeString($input['image'] ?? '/Husky ADV.png');
        $description = sanitizeString($input['description'] ?? '');
        $capacity = sanitizeString($input['capacity'] ?? '150 cc');
        $power = sanitizeString($input['power'] ?? '');
        $speed = sanitizeString($input['speed'] ?? '');
        $cooling = sanitizeString($input['cooling'] ?? '');
        $catalogPdf = sanitizeString($input['catalogPdf'] ?? ($input['catalog_pdf'] ?? ''));
        $videoUrl = sanitizeString($input['videoUrl'] ?? ($input['video_url'] ?? ''));

        $images = isset($input['images']) && is_array($input['images']) ? json_encode($input['images'], JSON_UNESCAPED_UNICODE) : json_encode([$image]);
        $colors = isset($input['colors']) && is_array($input['colors']) ? json_encode($input['colors'], JSON_UNESCAPED_UNICODE) : null;
        $images360 = isset($input['images360']) && is_array($input['images360']) ? json_encode($input['images360'], JSON_UNESCAPED_UNICODE) : null;
        $specifications = isset($input['specifications']) && is_array($input['specifications']) ? json_encode($input['specifications'], JSON_UNESCAPED_UNICODE) : null;
        $features = isset($input['features']) && is_array($input['features']) ? json_encode($input['features'], JSON_UNESCAPED_UNICODE) : null;

        $inStock = isset($input['inStock']) ? ($input['inStock'] ? 1 : 0) : 1;
        $isNew = isset($input['isNew']) ? ($input['isNew'] ? 1 : 0) : 1;

        $stmt = $pdo->prepare("
            INSERT INTO products (
                id, name, slug, category, sub_category, price, image, images, colors, images_360,
                catalog_pdf, video_url, specifications, features, description, capacity, power, speed, cooling, in_stock, is_new
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $id, $input['name'], $slug, $category, $subCategory, $price, $image, $images, $colors, $images360,
            $catalogPdf, $videoUrl, $specifications, $features, $description, $capacity, $power, $speed, $cooling, $inStock, $isNew
        ]);

        sendResponse(true, ["id" => $id, "slug" => $slug, "message" => "تمت إضافة السكوتر بنجاح إلى الكتالوج"], 201);
        break;

    case 'PUT':
        requireAdminAuth();
        $input = getJsonInput();
        if (empty($input['id'])) {
            sendResponse(false, null, "Product ID is required", 400);
        }

        $id = sanitizeString($input['id']);
        $name = sanitizeString($input['name'] ?? '');
        $category = in_array($input['category'] ?? '', ['scooter', 'bike'], true) ? $input['category'] : 'scooter';
        $subCategory = sanitizeString($input['subCategory'] ?? ($input['sub_category'] ?? 'سكوترز رياضية'));
        $price = (float)($input['price'] ?? 0);
        $image = sanitizeString($input['image'] ?? '');
        $description = sanitizeString($input['description'] ?? '');
        $capacity = sanitizeString($input['capacity'] ?? '');
        $power = sanitizeString($input['power'] ?? '');
        $speed = sanitizeString($input['speed'] ?? '');
        $cooling = sanitizeString($input['cooling'] ?? '');
        $catalogPdf = sanitizeString($input['catalogPdf'] ?? ($input['catalog_pdf'] ?? ''));
        $videoUrl = sanitizeString($input['videoUrl'] ?? ($input['video_url'] ?? ''));

        $images = isset($input['images']) && is_array($input['images']) ? json_encode($input['images'], JSON_UNESCAPED_UNICODE) : null;
        $colors = isset($input['colors']) && is_array($input['colors']) ? json_encode($input['colors'], JSON_UNESCAPED_UNICODE) : null;
        $images360 = isset($input['images360']) && is_array($input['images360']) ? json_encode($input['images360'], JSON_UNESCAPED_UNICODE) : null;
        $specifications = isset($input['specifications']) && is_array($input['specifications']) ? json_encode($input['specifications'], JSON_UNESCAPED_UNICODE) : null;
        $features = isset($input['features']) && is_array($input['features']) ? json_encode($input['features'], JSON_UNESCAPED_UNICODE) : null;

        $inStock = isset($input['inStock']) ? ($input['inStock'] ? 1 : 0) : 1;
        $isNew = isset($input['isNew']) ? ($input['isNew'] ? 1 : 0) : 1;

        $stmt = $pdo->prepare("
            UPDATE products SET
                name = COALESCE(?, name),
                category = COALESCE(?, category),
                sub_category = COALESCE(?, sub_category),
                price = ?,
                image = COALESCE(?, image),
                images = COALESCE(?, images),
                colors = COALESCE(?, colors),
                images_360 = COALESCE(?, images_360),
                catalog_pdf = COALESCE(?, catalog_pdf),
                video_url = COALESCE(?, video_url),
                specifications = COALESCE(?, specifications),
                features = COALESCE(?, features),
                description = COALESCE(?, description),
                capacity = COALESCE(?, capacity),
                power = COALESCE(?, power),
                speed = COALESCE(?, speed),
                cooling = COALESCE(?, cooling),
                in_stock = ?,
                is_new = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $name ?: null, $category, $subCategory, $price,
            $image ?: null, $images, $colors, $images360,
            $catalogPdf, $videoUrl, $specifications, $features,
            $description ?: null, $capacity ?: null, $power ?: null, $speed ?: null, $cooling ?: null,
            $inStock, $isNew, $id
        ]);

        sendResponse(true, ["message" => "تم تحديث بيانات ومواصفات السكوتر بنجاح"]);
        break;

    case 'DELETE':
        requireAdminAuth();
        $input = getJsonInput();
        $id = $_GET['id'] ?? ($input['id'] ?? null);
        if (!$id) {
            sendResponse(false, null, "Product ID is required", 400);
        }

        $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$id]);

        sendResponse(true, ["message" => "Product deleted successfully"]);
        break;

    default:
        sendResponse(false, null, "Method not allowed", 405);
        break;
}
