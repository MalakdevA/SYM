<?php
/**
 * REST API Endpoint: Pageview & Telemetry Tracking
 * GET, POST /api/analytics
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
        $stmt = $pdo->query("SELECT * FROM analytics ORDER BY views_count DESC");
        $analytics = $stmt->fetchAll();

        sendResponse(true, $analytics);
        break;

    case 'POST':
        enforceRateLimit('analytics_telemetry', 60, 60);
        $input = getJsonInput();
        $path = sanitizeString($input['path'] ?? '/');
        $title = sanitizeString($input['title'] ?? 'SYM Egypt');

        $stmt = $pdo->prepare("INSERT INTO analytics (path, title, views_count, unique_visitors) 
            VALUES (?, ?, 1, 1) 
            ON DUPLICATE KEY UPDATE views_count = views_count + 1, title = VALUES(title)");
        $stmt->execute([$path, $title]);

        sendResponse(true, ["message" => "Pageview logged successfully"]);
        break;

    default:
        sendResponse(false, null, "Method not allowed", 405);
        break;
}
