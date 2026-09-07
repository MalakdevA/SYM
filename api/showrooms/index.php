<?php
/**
 * REST API Endpoint: Showrooms & Dealers Network
 * GET, POST, PUT, DELETE /api/showrooms
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

function formatShowroomRow(array $s): array {
    $s['has_test_ride'] = (bool)$s['has_test_ride'];
    $s['has_maintenance'] = (bool)$s['has_maintenance'];
    $s['has_spare_parts'] = (bool)$s['has_spare_parts'];
    $s['has_shipping'] = (bool)$s['has_shipping'];
    $decoded = !empty($s['installment_options']) ? json_decode($s['installment_options'], true) : null;
    $s['installment_options'] = is_array($decoded) ? $decoded : [];
    return $s;
}

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM showrooms ORDER BY city ASC, name ASC");
        $showrooms = array_map('formatShowroomRow', $stmt->fetchAll());

        sendResponse(true, $showrooms);
        break;

    case 'POST':
        requireAdminAuth();
        $input = getJsonInput();
        if (empty($input['name']) || empty($input['address'])) {
            sendResponse(false, null, "Name and address are required", 400);
        }

        $id = sanitizeString($input['id'] ?? '') ?: 'shr-' . time();
        $name = sanitizeString($input['name']);
        $city = sanitizeString($input['city'] ?? 'القاهرة');
        $address = sanitizeString($input['address']);
        $phone = sanitizeString($input['phone'] ?? '01000000000');
        $hours = sanitizeString($input['working_hours'] ?? ($input['workingHours'] ?? '9:00 ص - 10:00 م'));
        $status = sanitizeString($input['status'] ?? 'active');
        $type = in_array($input['type'] ?? '', ['flagship', 'authorized', 'service', 'parts'], true) ? $input['type'] : 'authorized';
        $whatsapp = sanitizeString($input['whatsapp'] ?? '') ?: null;
        $mapsUrl = sanitizeString($input['google_maps_url'] ?? '') ?: null;
        $hasTestRide = !empty($input['has_test_ride']) ? 1 : 0;
        $hasMaintenance = !empty($input['has_maintenance']) ? 1 : 0;
        $hasSpareParts = !empty($input['has_spare_parts']) ? 1 : 0;
        $hasShipping = !empty($input['has_shipping']) ? 1 : 0;
        $installmentOptions = isset($input['installment_options']) && is_array($input['installment_options'])
            ? json_encode(array_values(array_filter($input['installment_options'])), JSON_UNESCAPED_UNICODE) : null;
        $notes = sanitizeString($input['notes'] ?? '') ?: null;
        $nameEn = sanitizeString($input['name_en'] ?? '') ?: null;
        $addressEn = sanitizeString($input['address_en'] ?? '') ?: null;
        $hoursEn = sanitizeString($input['working_hours_en'] ?? '') ?: null;

        $stmt = $pdo->prepare("
            INSERT INTO showrooms (id, name, city, address, phone, working_hours, status, type, whatsapp, google_maps_url, has_test_ride, has_maintenance, has_spare_parts, has_shipping, installment_options, notes, name_en, address_en, working_hours_en)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $id, $name, $city, $address, $phone, $hours, $status, $type, $whatsapp, $mapsUrl,
            $hasTestRide, $hasMaintenance, $hasSpareParts, $hasShipping, $installmentOptions, $notes,
            $nameEn, $addressEn, $hoursEn,
        ]);

        sendResponse(true, ["id" => $id, "message" => "تم تسجيل المعرض بنجاح"], 201);
        break;

    case 'PUT':
        requireAdminAuth();
        $input = getJsonInput();
        if (empty($input['id'])) {
            sendResponse(false, null, "Showroom ID is required", 400);
        }

        $id = sanitizeString($input['id']);
        $name = sanitizeString($input['name'] ?? '');
        $city = sanitizeString($input['city'] ?? '');
        $address = sanitizeString($input['address'] ?? '');
        $phone = sanitizeString($input['phone'] ?? '');
        $hours = sanitizeString($input['working_hours'] ?? ($input['workingHours'] ?? ''));
        $status = sanitizeString($input['status'] ?? '');
        $type = in_array($input['type'] ?? '', ['flagship', 'authorized', 'service', 'parts'], true) ? $input['type'] : null;
        $whatsapp = sanitizeString($input['whatsapp'] ?? '');
        $mapsUrl = sanitizeString($input['google_maps_url'] ?? '');
        $hasTestRide = isset($input['has_test_ride']) ? (!empty($input['has_test_ride']) ? 1 : 0) : null;
        $hasMaintenance = isset($input['has_maintenance']) ? (!empty($input['has_maintenance']) ? 1 : 0) : null;
        $hasSpareParts = isset($input['has_spare_parts']) ? (!empty($input['has_spare_parts']) ? 1 : 0) : null;
        $hasShipping = isset($input['has_shipping']) ? (!empty($input['has_shipping']) ? 1 : 0) : null;
        $installmentOptions = isset($input['installment_options']) && is_array($input['installment_options'])
            ? json_encode(array_values(array_filter($input['installment_options'])), JSON_UNESCAPED_UNICODE) : null;
        $notes = sanitizeString($input['notes'] ?? '');
        $nameEn = sanitizeString($input['name_en'] ?? '');
        $addressEn = sanitizeString($input['address_en'] ?? '');
        $hoursEn = sanitizeString($input['working_hours_en'] ?? '');

        $stmt = $pdo->prepare("UPDATE showrooms SET
            name = COALESCE(?, name),
            city = COALESCE(?, city),
            address = COALESCE(?, address),
            phone = COALESCE(?, phone),
            working_hours = COALESCE(?, working_hours),
            status = COALESCE(?, status),
            type = COALESCE(?, type),
            whatsapp = COALESCE(?, whatsapp),
            google_maps_url = COALESCE(?, google_maps_url),
            has_test_ride = COALESCE(?, has_test_ride),
            has_maintenance = COALESCE(?, has_maintenance),
            has_spare_parts = COALESCE(?, has_spare_parts),
            has_shipping = COALESCE(?, has_shipping),
            installment_options = COALESCE(?, installment_options),
            notes = COALESCE(?, notes),
            name_en = COALESCE(?, name_en),
            address_en = COALESCE(?, address_en),
            working_hours_en = COALESCE(?, working_hours_en)
            WHERE id = ?");
        $stmt->execute([
            $name ?: null,
            $city ?: null,
            $address ?: null,
            $phone ?: null,
            $hours ?: null,
            $status ?: null,
            $type,
            $whatsapp ?: null,
            $mapsUrl ?: null,
            $hasTestRide,
            $hasMaintenance,
            $hasSpareParts,
            $hasShipping,
            $installmentOptions,
            $notes ?: null,
            $nameEn ?: null,
            $addressEn ?: null,
            $hoursEn ?: null,
            $id
        ]);

        sendResponse(true, ["message" => "تم تحديث بيانات المعرض بنجاح"]);
        break;

    case 'DELETE':
        requireAdminAuth();
        $input = getJsonInput();
        $id = sanitizeString($_GET['id'] ?? ($input['id'] ?? ''));
        if (!$id) {
            sendResponse(false, null, "Showroom ID is required", 400);
        }

        $stmt = $pdo->prepare("DELETE FROM showrooms WHERE id = ?");
        $stmt->execute([$id]);

        sendResponse(true, ["message" => "تم حذف المعرض بنجاح"]);
        break;

    default:
        sendResponse(false, null, "Method not allowed", 405);
        break;
}
