<?php
/**
 * REST API Endpoint: Secure Image Upload Handler
 * POST /api/upload
 * 
 * Enterprise Security Protections:
 * 1. Admin Authentication Required (requireAdminAuth)
 * 2. Strict MIME-Type & Image Binary Inspection (getimagesize & finfo)
 * 3. Whitelisted Image Extensions Only (jpg, jpeg, png, webp - SVG prohibited due to XSS)
 * 4. Cryptographically Secure Random Filename Generation (No Path Traversal)
 * 5. Automated .htaccess Script Execution Blocking in Upload Directory
 */

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

setupCORS();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, null, "Method not allowed", 405);
}

// 1. Require Admin Authentication & Enforce Rate Limit
$admin = requireAdminAuth();
enforceRateLimit('admin_upload', 20, 60);

if (!isset($_FILES['file']) && !isset($_FILES['image'])) {
    sendResponse(false, null, "No image file provided", 400);
}

$file = $_FILES['file'] ?? $_FILES['image'];

if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
    sendResponse(false, null, "Invalid file upload attempt", 400);
}

if ($file['error'] !== UPLOAD_ERR_OK) {
    sendResponse(false, null, "File upload error occurred", 400);
}

// 2. Size Check (Max 10MB)
if ($file['size'] > 10 * 1024 * 1024) {
    sendResponse(false, null, "File size exceeds 10MB limit", 400);
}

// 3. Strict Extension Whitelist (SVG explicitly omitted to eliminate Stored XSS)
$allowedExtensions = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp'];
$fileExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

if (!array_key_exists($fileExt, $allowedExtensions)) {
    sendResponse(false, null, "Invalid file format. Allowed formats: JPG, PNG, WEBP", 400);
}

// 4. Inspect MIME Type & Image Binary Structure
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, array_values($allowedExtensions), true)) {
    sendResponse(false, null, "Security alert: File content mime-type mismatch.", 400);
}

$imageSize = @getimagesize($file['tmp_name']);
if ($imageSize === false) {
    sendResponse(false, null, "Corrupted image file or invalid image structure", 400);
}

// 5. Target Directory Setup & Protection
$targetDir = __DIR__ . '/../../public/uploads/';
if (!is_dir($targetDir)) {
    mkdir($targetDir, 0755, true);
}

// Automatically create .htaccess to prevent PHP execution inside uploads folder
$htaccessPath = $targetDir . '.htaccess';
if (!file_exists($htaccessPath)) {
    file_put_contents($htaccessPath, "
# Disable PHP execution in uploads directory
<FilesMatch \"\.(php|phtml|php3|php4|php5|php7|phps|pl|py|jsp|asp|sh|cgi|exe)$\">
    Order allow,deny
    Deny from all
</FilesMatch>
Options -ExecCGI -Indexes
RemoveHandler .php .phtml .php3 .php4 .php5 .php7
");
}

// 6. Generate Hashed Cryptographic Filename
$safeFileName = 'sym_' . bin2hex(random_bytes(16)) . '.' . $fileExt;
$targetPath = $targetDir . $safeFileName;

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    $publicUrl = '/uploads/' . $safeFileName;
    sendResponse(true, [
        "url" => $publicUrl, 
        "filename" => $safeFileName, 
        "message" => "Image uploaded securely"
    ]);
} else {
    sendResponse(false, null, "Failed to store image securely on server", 500);
}
