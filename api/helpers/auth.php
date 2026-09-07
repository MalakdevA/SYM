<?php
/**
 * SYM Egypt Enterprise Platform - Admin Authorization Helper
 * Validates the Bearer token for protected API routes with multi-server support
 */
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/response.php';

function requireAdminAuth() {
    $authHeader = '';

    // Multi-server Header Extraction (Apache, Nginx, IIS, FastCGI)
    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }
    
    if (empty($authHeader) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (empty($authHeader) && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    
    // Check if Authorization header is missing or invalid
    if (empty($authHeader) || !preg_match('/Bearer\s(\S+)/i', $authHeader, $matches)) {
        sendResponse(false, null, 'Authentication required. Missing or invalid Bearer token.', 401);
    }
    
    $token = trim($matches[1]);
    if (strlen($token) < 16) {
        sendResponse(false, null, 'Malformed authentication token.', 401);
    }
    
    $pdo = Database::getConnection();
    if (!$pdo) {
        sendResponse(false, null, 'Database connection failed.', 500);
    }
    
    // Validate the token against admin_users using Prepared Statements
    $stmt = $pdo->prepare("SELECT id, name, email, role, status, token_created_at FROM admin_users WHERE token = ? AND status = 'active' LIMIT 1");
    $stmt->execute([$token]);
    $adminUser = $stmt->fetch();

    if (!$adminUser) {
        sendResponse(false, null, 'Invalid or expired authentication session.', 401);
    }

    // Session lifetime: a token issued more than 24h ago (matching the client-side
    // sym_admin_session cookie's max-age) is treated as expired, so a leaked/stolen
    // token cannot be replayed indefinitely.
    $tokenTtlSeconds = 86400;
    if (!empty($adminUser['token_created_at'])) {
        $issuedAt = strtotime($adminUser['token_created_at']);
        if ($issuedAt === false || (time() - $issuedAt) > $tokenTtlSeconds) {
            sendResponse(false, null, 'Session expired. Please log in again.', 401);
        }
    }

    unset($adminUser['token_created_at']);
    return $adminUser;
}

