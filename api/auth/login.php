<?php
/**
 * REST API Endpoint: Admin Authentication & Login
 * POST /api/auth/login.php
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

setupCORS();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, null, "Method not allowed", 405);
}

// Rate Limiting: Max 5 login attempts per 5 minutes per IP
enforceRateLimit('admin_login', 5, 300);

$input = getJsonInput();
$email = trim($input['email'] ?? '');
$password = trim($input['password'] ?? '');

if (empty($email) || empty($password)) {
    sendResponse(false, null, "يرجى إدخال البريد الإلكتروني وكلمة المرور", 400);
}

$pdo = Database::getConnection();
$authenticated = false;
$user = null;

if ($pdo) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM admin_users WHERE email = ? AND status = 'active' LIMIT 1");
        $stmt->execute([$email]);
        $dbUser = $stmt->fetch();

        if ($dbUser) {
            // Check password securely via BCRYPT
            if (!empty($dbUser['password']) && password_verify($password, $dbUser['password'])) {
                $token = "sym_sec_token_" . bin2hex(random_bytes(32));

                // Save token and update last login in DB. token_created_at anchors the
                // session-expiry check in requireAdminAuth().
                $updateStmt = $pdo->prepare("UPDATE admin_users SET token = ?, token_created_at = CURRENT_TIMESTAMP, last_login = CURRENT_TIMESTAMP WHERE id = ?");
                $updateStmt->execute([$token, $dbUser['id']]);

                $authenticated = true;
                $user = [
                    "id" => $dbUser['id'],
                    "name" => $dbUser['name'],
                    "email" => $dbUser['email'],
                    "role" => $dbUser['role'],
                    "avatar" => "/SymLogo-S-red.png",
                    "token" => $token
                ];
            }
        }
    } catch (Exception $e) {
        error_log('[AdminLogin] Error: ' . $e->getMessage());
        sendResponse(false, null, "تعذر إتمام عملية تسجيل الدخول حالياً، يرجى المحاولة لاحقاً.", 500);
    }
}

if ($authenticated && $user) {
    sendResponse(true, [
        "user" => $user,
        "message" => "تم تسجيل الدخول بنجاح"
    ]);
} else {
    sendResponse(false, null, "البريد الإلكتروني أو كلمة المرور غير صحيحة", 401);
}
