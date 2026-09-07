<?php
/**
 * SYM Egypt — Central Website CMS Pages Management API
 * GET, POST, PUT, DELETE /api/pages
 * 
 * Security:
 * - Admin Authentication enforced for all write operations
 * - Input sanitization against XSS
 * - Prepared Statements against SQL Injection
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
        if (isset($_GET['id']) || isset($_GET['path'])) {
            $identifier = $_GET['id'] ?? $_GET['path'];
            $stmt = $pdo->prepare("SELECT * FROM site_pages WHERE id = ? OR path = ? LIMIT 1");
            $stmt->execute([$identifier, $identifier]);
            $page = $stmt->fetch();
            if ($page) {
                sendResponse(true, $page);
            } else {
                sendResponse(false, null, "Page not found", 404);
            }
        } else {
            $stmt = $pdo->query("SELECT * FROM site_pages ORDER BY category ASC, id ASC");
            $pages = $stmt->fetchAll();
            sendResponse(true, $pages);
        }
        break;

    case 'POST':
        requireAdminAuth();
        $input = getJsonInput();
        
        $name = sanitizeString($input['name'] ?? '');
        $path = sanitizeString($input['path'] ?? '');
        if (empty($name) || empty($path)) {
            sendResponse(false, null, "Page name and path are required.", 400);
        }

        $id = sanitizeString($input['id'] ?? '') ?: 'page-' . bin2hex(random_bytes(4));
        $category = sanitizeString($input['category'] ?? 'الصفحات العامة');
        $status = in_array($input['status'] ?? '', ['published', 'draft'], true) ? $input['status'] : 'published';
        $seoScore = max(0, min(100, (int)($input['seo_score'] ?? $input['seoScore'] ?? 95)));
        $heroTitle = sanitizeString($input['hero_title'] ?? $input['heroTitle'] ?? $name);
        $description = sanitizeString($input['description'] ?? '');
        $lastUpdated = 'اليوم';
        $viewsThisMonth = sanitizeString($input['views_this_month'] ?? $input['viewsThisMonth'] ?? '0 زيارة');

        $stmt = $pdo->prepare("
            INSERT INTO site_pages (id, name, path, category, status, last_updated, views_this_month, seo_score, hero_title, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                category = VALUES(category),
                status = VALUES(status),
                last_updated = VALUES(last_updated),
                seo_score = VALUES(seo_score),
                hero_title = VALUES(hero_title),
                description = VALUES(description)
        ");
        $stmt->execute([$id, $name, $path, $category, $status, $lastUpdated, $viewsThisMonth, $seoScore, $heroTitle, $description]);

        sendResponse(true, ["id" => $id, "path" => $path, "message" => "تم حفظ وتحديث بيانات الصفحة بنجاح"], 201);
        break;

    case 'PUT':
        requireAdminAuth();
        $input = getJsonInput();
        $id = sanitizeString($input['id'] ?? '');

        if (empty($id)) {
            sendResponse(false, null, "Page ID is required for update.", 400);
        }

        $status = isset($input['status']) && in_array($input['status'], ['published', 'draft'], true) ? $input['status'] : null;
        $name = isset($input['name']) ? sanitizeString($input['name']) : null;
        $category = isset($input['category']) ? sanitizeString($input['category']) : null;
        $heroTitle = isset($input['hero_title']) ? sanitizeString($input['hero_title']) : (isset($input['heroTitle']) ? sanitizeString($input['heroTitle']) : null);
        $description = isset($input['description']) ? sanitizeString($input['description']) : null;
        $seoScore = isset($input['seo_score']) ? (int)$input['seo_score'] : (isset($input['seoScore']) ? (int)$input['seoScore'] : null);
        $lastUpdated = 'الآن';

        $stmt = $pdo->prepare("
            UPDATE site_pages SET
                name = COALESCE(?, name),
                category = COALESCE(?, category),
                status = COALESCE(?, status),
                hero_title = COALESCE(?, hero_title),
                description = COALESCE(?, description),
                seo_score = COALESCE(?, seo_score),
                last_updated = ?
            WHERE id = ?
        ");
        $stmt->execute([$name, $category, $status, $heroTitle, $description, $seoScore, $lastUpdated, $id]);

        sendResponse(true, ["message" => "تم تعديل الصفحة بنجاح"]);
        break;

    case 'DELETE':
        requireAdminAuth();
        $id = filter_input(INPUT_GET, 'id', FILTER_SANITIZE_SPECIAL_CHARS);
        if (empty($id)) {
            $input = getJsonInput();
            $id = sanitizeString($input['id'] ?? '');
        }

        if (empty($id)) {
            sendResponse(false, null, "Page ID is required for deletion.", 400);
        }

        // Protect critical core pages from accidental deletion
        $corePages = ['home', 'all-models', 'warranty', 'contact'];
        if (in_array($id, $corePages, true)) {
            sendResponse(false, null, "لا يمكن حذف الصفحات الرئيسية الأساسية للنظام.", 403);
        }

        $stmt = $pdo->prepare("DELETE FROM site_pages WHERE id = ?");
        $stmt->execute([$id]);

        sendResponse(true, ["message" => "تم حذف الصفحة بنجاح"]);
        break;

    default:
        sendResponse(false, null, "Method not allowed", 405);
        break;
}
