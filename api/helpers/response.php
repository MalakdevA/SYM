<?php
/**
 * SYM Egypt Enterprise Platform - High Speed REST API Security & Response Helper
 * Includes Enterprise Security Headers, Input Sanitization, and Error Protection
 */

function setupCORS() {
    // Every endpoint is a JSON API — a PHP notice/warning/deprecation printed mid-request would
    // land inside the same output buffer as the JSON below and corrupt the response body for
    // every client (this actually happened: a PHP 8.5 deprecation notice was breaking the Fawry
    // payment endpoint's JSON contract). Errors still reach the PHP error log; they just never
    // get echoed into an API response.
    ini_set('display_errors', '0');

    // Enable Output Compression for maximum payload speed
    if (!ob_start("ob_gzhandler")) {
        ob_start();
    }

    // Enterprise Security Headers
    header("Content-Type: application/json; charset=UTF-8");
    header("X-Content-Type-Options: nosniff");
    header("X-Frame-Options: SAMEORIGIN");
    header("X-XSS-Protection: 1; mode=block");
    header("Referrer-Policy: strict-origin-when-cross-origin");
    header("X-Powered-By: SYM-Egypt-Enterprise-Security/2.0");

    // Dynamic Origin Handling for CORS Security
    $allowedOrigins = [
        'https://symegypt.com',
        'https://www.symegypt.com',
        'https://sym-egypt.com',
        'https://www.sym-egypt.com',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1'
    ];

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (!empty($origin) && in_array($origin, $allowedOrigins, true)) {
        header("Access-Control-Allow-Origin: " . $origin);
        header("Access-Control-Allow-Credentials: true");
    } elseif (empty($origin)) {
        // Same-origin or internal server calls
        header("Access-Control-Allow-Origin: https://symegypt.com");
    }

    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Max-Age: 86400"); // Cache CORS preflight for 24h
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    // Handle OPTIONS Preflight request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

/**
 * Standard JSON Response Sender with Sanitized Output
 */
function sendResponse(bool $success, $data = null, ?string $error = null, int $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode([
        "success"   => $success,
        "data"      => $data,
        "error"     => $error,
        "timestamp" => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
    exit();
}

/**
 * Parses and Sanitizes incoming JSON Body
 */
function getJsonInput(): array {
    $raw = file_get_contents('php://input');
    if (empty($raw)) {
        return sanitizeInputArray($_POST);
    }
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        return [];
    }
    return sanitizeInputArray($decoded);
}

/**
 * Recursive Input Sanitizer against XSS & Injection Vectors
 */
function sanitizeInputArray(array $data): array {
    $sanitized = [];
    foreach ($data as $key => $value) {
        $cleanKey = preg_replace('/[^a-zA-Z0-9_\-]/', '', $key);
        if (is_array($value)) {
            $sanitized[$cleanKey] = sanitizeInputArray($value);
        } elseif (is_string($value)) {
            // Strip null bytes and sanitize HTML characters
            $val = str_replace("\0", '', $value);
            $sanitized[$cleanKey] = trim(htmlspecialchars($val, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'));
        } else {
            $sanitized[$cleanKey] = $value;
        }
    }
    return $sanitized;
}

/**
 * Helper to sanitize single string input
 */
function sanitizeString(?string $str): string {
    if ($str === null) return '';
    $val = str_replace("\0", '', $str);
    return trim(htmlspecialchars($val, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'));
}

/**
 * Helper to extract trusted client IP behind Proxies/CDNs.
 *
 * X-Forwarded-For / X-Real-IP / CF-Connecting-IP are client-settable headers — trusting them
 * unconditionally lets any caller spoof a fresh IP on every request to bypass rate limiting
 * entirely. They are only honored when the immediate TCP peer (REMOTE_ADDR) is itself a
 * known/trusted reverse proxy (configurable via TRUSTED_PROXY_IPS, comma-separated).
 */
function getTrustedClientIp(): string {
    $remoteAddr = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $trustedProxies = array_filter(array_map('trim', explode(',', getenv('TRUSTED_PROXY_IPS') ?: '127.0.0.1,::1')));

    if (in_array($remoteAddr, $trustedProxies, true)) {
        foreach (['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP'] as $key) {
            $ip = $_SERVER[$key] ?? '';
            if (!empty($ip)) {
                $ip = trim(explode(',', $ip)[0]);
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }
    }

    return filter_var($remoteAddr, FILTER_VALIDATE_IP) ? $remoteAddr : '127.0.0.1';
}

/**
 * SEC-04 Fix: Lightweight File-based IP Rate Limiter against Spam & DoS
 */
function enforceRateLimit(string $endpointKey, int $maxRequests = 10, int $windowSeconds = 60): void {
    $ip = getTrustedClientIp();
    $ipHash = md5($ip . '_' . $endpointKey);
    $tmpDir = sys_get_temp_dir() . '/sym_rate_limits';
    
    if (!is_dir($tmpDir)) {
        @mkdir($tmpDir, 0777, true);
    }
    
    $file = $tmpDir . '/rl_' . $ipHash . '.json';
    $now = time();
    $data = ['requests' => [], 'count' => 0];

    if (file_exists($file)) {
        $content = @file_get_contents($file);
        if ($content) {
            $parsed = json_decode($content, true);
            if (is_array($parsed) && isset($parsed['requests'])) {
                // Filter out timestamps outside the active window
                $validRequests = array_filter($parsed['requests'], function($timestamp) use ($now, $windowSeconds) {
                    return ($now - $timestamp) < $windowSeconds;
                });
                $data['requests'] = array_values($validRequests);
            }
        }
    }

    if (count($data['requests']) >= $maxRequests) {
        sendResponse(false, null, "تم تجاوز حد الطلبات المسموح به. يرجى الانتظار دقيقة وتكرار المحاولة.", 429);
    }

    $data['requests'][] = $now;
    @file_put_contents($file, json_encode($data));
}

