<?php
/**
 * REST API Endpoint: Customer Contact & Inquiry Messages
 * GET, POST, PUT, DELETE /api/contact
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
        // Protected: Only authenticated admins can read customer contact messages
        requireAdminAuth();
        $stmt = $pdo->query("SELECT * FROM contact_messages ORDER BY created_at DESC");
        $messages = $stmt->fetchAll();
        sendResponse(true, $messages);
        break;

    case 'POST':
        // SEC-04 Fix: Rate Limit contact form submissions (max 5 requests per 60s per IP)
        enforceRateLimit('contact_form', 5, 60);

        $input = getJsonInput();
        if (empty($input['name']) || empty($input['message'])) {
            sendResponse(false, null, "Name and Message content are required", 400);
        }

        $id = 'msg-' . time() . '-' . rand(100, 999);
        $name = sanitizeString($input['name']);
        $phone = sanitizeString($input['phone'] ?? '');
        $email = filter_var($input['email'] ?? '', FILTER_VALIDATE_EMAIL) ? trim($input['email']) : '';
        $subject = sanitizeString($input['subject'] ?? 'استفسار عام');
        $message = sanitizeString($input['message']);
        $status = 'unread';

        $stmt = $pdo->prepare("INSERT INTO contact_messages (id, name, phone, email, subject, message, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id, $name, $phone, $email, $subject, $message, $status]);

        sendResponse(true, ["message" => "تم استلام رسالتك بنجاح، وسيقوم فريق الدعم بالتواصل معك قريباً."], 201);
        break;

    case 'PUT':
        requireAdminAuth();
        $input = getJsonInput();
        $id = sanitizeString($input['id'] ?? '');
        $status = sanitizeString($input['status'] ?? 'read');

        if (empty($id)) {
            sendResponse(false, null, "Message ID is required.", 400);
        }

        $stmt = $pdo->prepare("UPDATE contact_messages SET status = ? WHERE id = ?");
        $stmt->execute([$status, $id]);

        sendResponse(true, ["message" => "تم تحديث حالة الرسالة بنجاح"]);
        break;

    case 'DELETE':
        requireAdminAuth();
        $id = filter_input(INPUT_GET, 'id', FILTER_SANITIZE_SPECIAL_CHARS);
        if (empty($id)) {
            $input = getJsonInput();
            $id = sanitizeString($input['id'] ?? '');
        }

        if (empty($id)) {
            sendResponse(false, null, "Message ID is required.", 400);
        }

        $stmt = $pdo->prepare("DELETE FROM contact_messages WHERE id = ?");
        $stmt->execute([$id]);

        sendResponse(true, ["message" => "تم حذف الرسالة بنجاح"]);
        break;

    default:
        sendResponse(false, null, "Method not allowed", 405);
        break;
}
