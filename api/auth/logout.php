<?php
/**
 * REST API Endpoint: Admin Logout
 * POST /api/auth/logout.php
 *
 * Clears the session token server-side so a stolen token can be revoked
 * instead of just forgotten client-side (localStorage.removeItem alone
 * leaves the token valid on the server until it expires or is overwritten).
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

setupCORS();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, null, "Method not allowed", 405);
}

$currentAdmin = requireAdminAuth();

$pdo = Database::getConnection();
if (!$pdo) {
    sendResponse(false, null, "Database connection failed.", 500);
}

$stmt = $pdo->prepare("UPDATE admin_users SET token = NULL, token_created_at = NULL WHERE id = ?");
$stmt->execute([$currentAdmin['id']]);

sendResponse(true, ["message" => "تم تسجيل الخروج بنجاح"]);
