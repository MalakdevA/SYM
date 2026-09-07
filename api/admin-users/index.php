<?php
/**
 * REST API Endpoint: Admin Users & Permissions Management
 * GET, POST, PUT, DELETE /api/admin-users
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
        requireAdminAuth();
        // SEC-05 Fix: Omit sensitive password hashes and session tokens from user list payload
        $stmt = $pdo->query("SELECT id, name, email, phone, role, status, showroom, last_login, created_at FROM admin_users ORDER BY created_at DESC");
        $users = $stmt->fetchAll();

        sendResponse(true, $users);
        break;

    case 'POST':
        $currentAdmin = requireAdminAuth();
        if ($currentAdmin['role'] !== 'Super Admin') {
            sendResponse(false, null, "Only a Super Admin can create new admin accounts", 403);
        }
        $input = getJsonInput();
        if (empty($input['name']) || empty($input['email'])) {
            sendResponse(false, null, "Name and Email are required", 400);
        }

        // A missing password must reject the request, not silently fall back to a fixed,
        // publicly-known default that would apply to every account created this way.
        if (empty($input['password']) || strlen($input['password']) < 8) {
            sendResponse(false, null, "Password is required and must be at least 8 characters", 400);
        }

        $id = 'adm-' . bin2hex(random_bytes(6));
        $name = sanitizeString($input['name']);
        $email = filter_var($input['email'], FILTER_VALIDATE_EMAIL) ? trim($input['email']) : '';
        if (empty($email)) {
            sendResponse(false, null, "Invalid email address format", 400);
        }

        $phone = sanitizeString($input['phone'] ?? '+20 100 000 0000');
        $role = sanitizeString($input['role'] ?? 'Support Staff');
        $status = sanitizeString($input['status'] ?? 'active');
        $showroom = sanitizeString($input['showroom'] ?? 'المقر الرئيسي');

        // SEC-05 Fix: Hash admin password securely with BCRYPT
        $hashedPassword = password_hash($input['password'], PASSWORD_BCRYPT, ['cost' => 12]);

        $stmt = $pdo->prepare("INSERT INTO admin_users (id, name, email, phone, role, status, showroom, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id, $name, $email, $phone, $role, $status, $showroom, $hashedPassword]);

        sendResponse(true, ["id" => $id, "message" => "تم إنشاء حساب المسؤول بنجاح"], 201);
        break;

    case 'PUT':
        $currentAdmin = requireAdminAuth();
        $input = getJsonInput();
        if (empty($input['id'])) {
            sendResponse(false, null, "User ID is required", 400);
        }

        $id = sanitizeString($input['id']);
        $isSuperAdmin = ($currentAdmin['role'] === 'Super Admin');
        $isSelf = ($id === $currentAdmin['id']);

        // Privilege escalation guard: a non-Super-Admin may only edit their own profile,
        // and never their own (or anyone else's) role/status — otherwise a low-privilege
        // account like "Support Staff" could grant itself "Super Admin" via this endpoint.
        if (!$isSuperAdmin && !$isSelf) {
            sendResponse(false, null, "Insufficient permissions to modify other admin accounts", 403);
        }
        if (!$isSuperAdmin && (isset($input['role']) || isset($input['status']))) {
            sendResponse(false, null, "Only a Super Admin can change role or status", 403);
        }

        $name = sanitizeString($input['name'] ?? '');
        $email = filter_var($input['email'] ?? '', FILTER_VALIDATE_EMAIL) ? trim($input['email']) : null;
        $phone = sanitizeString($input['phone'] ?? '');
        $role = sanitizeString($input['role'] ?? '');
        $status = sanitizeString($input['status'] ?? '');
        $showroom = sanitizeString($input['showroom'] ?? '');

        if (!empty($input['password'])) {
            $hashedPassword = password_hash($input['password'], PASSWORD_BCRYPT, ['cost' => 12]);
            $stmt = $pdo->prepare("UPDATE admin_users SET name = COALESCE(?, name), email = COALESCE(?, email), phone = COALESCE(?, phone), role = COALESCE(?, role), status = COALESCE(?, status), showroom = COALESCE(?, showroom), password = ? WHERE id = ?");
            $stmt->execute([$name ?: null, $email, $phone ?: null, $role ?: null, $status ?: null, $showroom ?: null, $hashedPassword, $id]);
        } else {
            $stmt = $pdo->prepare("UPDATE admin_users SET name = COALESCE(?, name), email = COALESCE(?, email), phone = COALESCE(?, phone), role = COALESCE(?, role), status = COALESCE(?, status), showroom = COALESCE(?, showroom) WHERE id = ?");
            $stmt->execute([$name ?: null, $email, $phone ?: null, $role ?: null, $status ?: null, $showroom ?: null, $id]);
        }

        sendResponse(true, ["message" => "تم تحديث بيانات المسؤول بنجاح"]);
        break;

    case 'DELETE':
        $currentAdmin = requireAdminAuth();
        if ($currentAdmin['role'] !== 'Super Admin') {
            sendResponse(false, null, "Only a Super Admin can delete admin accounts", 403);
        }
        $input = getJsonInput();
        $id = sanitizeString($_GET['id'] ?? ($input['id'] ?? ''));
        if (!$id) {
            sendResponse(false, null, "User ID is required", 400);
        }

        if ($id === 'adm-101') {
            sendResponse(false, null, "Cannot delete primary Super Admin", 403);
        }

        $stmt = $pdo->prepare("DELETE FROM admin_users WHERE id = ?");
        $stmt->execute([$id]);

        sendResponse(true, ["message" => "تم حذف حساب المسؤول بنجاح"]);
        break;

    default:
        sendResponse(false, null, "Method not allowed", 405);
        break;
}
