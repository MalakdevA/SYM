<?php
/**
 * REST API Endpoint: Test Ride Form Submissions & Management
 * GET, POST, PUT, DELETE /api/test-ride
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
        // Protected: Only authenticated admins can read test ride reservations
        requireAdminAuth();
        $stmt = $pdo->query("SELECT * FROM test_rides ORDER BY created_at DESC");
        $rides = $stmt->fetchAll();
        sendResponse(true, $rides);
        break;

    case 'POST':
        // SEC-04 Fix: Rate Limit test-ride requests (max 5 requests per 60s per IP)
        enforceRateLimit('test_ride', 5, 60);

        $input = getJsonInput();
        if (empty($input['name']) || empty($input['phone']) || empty($input['scooter_model'])) {
            sendResponse(false, null, "Name, Phone and Scooter model are required", 400);
        }

        $name = sanitizeString($input['name']);
        $phone = sanitizeString($input['phone']);
        $email = filter_var($input['email'] ?? '', FILTER_VALIDATE_EMAIL) ? trim($input['email']) : '';
        $scooter = sanitizeString($input['scooter_model']);
        $showroom = sanitizeString($input['showroom'] ?? 'معرض مدينة نصر الرئيسي');
        $date = sanitizeString($input['preferred_date'] ?? date('Y-m-d', strtotime('+2 days')));
        $status = sanitizeString($input['status'] ?? 'معلق');

        $stmt = $pdo->prepare("INSERT INTO test_rides (name, phone, email, scooter_model, showroom, preferred_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$name, $phone, $email, $scooter, $showroom, $date, $status]);

        sendResponse(true, ["message" => "تم تسجيل طلب تجربة القيادة بنجاح وسيتم التواصل معك لتأكيد الموعد."], 201);
        break;

    case 'PUT':
        requireAdminAuth();
        $input = getJsonInput();
        $id = $input['id'] ?? null;
        $status = sanitizeString($input['status'] ?? '');

        if (!$id || empty($status)) {
            sendResponse(false, null, "Test ride ID and Status are required.", 400);
        }

        $stmt = $pdo->prepare("UPDATE test_rides SET status = ? WHERE id = ?");
        $stmt->execute([$status, $id]);

        sendResponse(true, ["message" => "تم تحديث حالة طلب تجربة القيادة بنجاح"]);
        break;

    case 'DELETE':
        requireAdminAuth();
        $id = filter_input(INPUT_GET, 'id', FILTER_SANITIZE_NUMBER_INT);
        if (empty($id)) {
            $input = getJsonInput();
            $id = (int)($input['id'] ?? 0);
        }

        if (!$id) {
            sendResponse(false, null, "Test ride ID is required.", 400);
        }

        $stmt = $pdo->prepare("DELETE FROM test_rides WHERE id = ?");
        $stmt->execute([$id]);

        sendResponse(true, ["message" => "تم حذف طلب تجربة القيادة بنجاح"]);
        break;

    default:
        sendResponse(false, null, "Method not allowed", 405);
        break;
}
