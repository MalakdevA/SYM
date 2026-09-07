<?php
/**
 * SYM Egypt — Fawry Payment Security Layer
 * 
 * Provides:
 * 1. SHA-256 Signature generation & verification
 * 2. Server-side price verification (anti-tampering)
 * 3. Idempotency protection (anti-double-payment)
 * 4. Webhook HMAC verification
 * 5. IP whitelist enforcement
 * 6. Payment-specific rate limiting
 * 7. Immutable audit logging
 */

// Prevent direct browser access
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'security.php') {
    http_response_code(403);
    exit('Forbidden');
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

class FawrySecurity {

    // ━━━━━━━━━━ 1. SHA-256 Signature ━━━━━━━━━━

    /**
     * Build the SHA-256 signature for a charge/init request
     * Concatenation: merchantCode + merchantRefNum + customerProfileId + paymentMethod + amount(2dp) + secureKey
     */
    public static function buildChargeSignature(
        string $merchantRefNum,
        string $customerProfileId,
        string $paymentMethod,
        float  $amount
    ): string {
        $raw = FawryConfig::getMerchantCode()
             . $merchantRefNum
             . ($customerProfileId ?: '')
             . $paymentMethod
             . number_format($amount, 2, '.', '')
             . FawryConfig::getSecurityKey();

        return hash('sha256', $raw);
    }

    /**
     * Build the SHA-256 signature for a status check request
     * Concatenation: merchantCode + merchantRefNum + secureKey
     */
    public static function buildStatusSignature(string $merchantRefNum): string {
        $raw = FawryConfig::getMerchantCode()
             . $merchantRefNum
             . FawryConfig::getSecurityKey();

        return hash('sha256', $raw);
    }

    /**
     * Build the SHA-256 signature for a refund request
     * Concatenation: merchantCode + refNum + refundAmount(2dp) + reason + secureKey
     */
    public static function buildRefundSignature(
        string $fawryRefNumber,
        float  $refundAmount,
        string $reason = ''
    ): string {
        $raw = FawryConfig::getMerchantCode()
             . $fawryRefNumber
             . number_format($refundAmount, 2, '.', '')
             . $reason
             . FawryConfig::getSecurityKey();

        return hash('sha256', $raw);
    }

    /**
     * Verify a callback/webhook signature from Fawry
     * Fawry sends: SHA256(fawryRefNumber + merchantRefNum + paymentAmount + orderAmount + orderStatus + paymentMethod + paymentRefrenceNumber (if exists) + secureKey)
     */
    public static function verifyCallbackSignature(array $payload, string $receivedSignature): bool {
        $raw = ($payload['fawryRefNumber'] ?? '')
             . ($payload['merchantRefNumber'] ?? '')
             . number_format((float)($payload['paymentAmount'] ?? 0), 2, '.', '')
             . number_format((float)($payload['orderAmount'] ?? 0), 2, '.', '')
             . ($payload['orderStatus'] ?? '')
             . ($payload['paymentMethod'] ?? '')
             . ($payload['paymentRefrenceNumber'] ?? '')
             . FawryConfig::getSecurityKey();

        $expected = hash('sha256', $raw);
        return hash_equals($expected, $receivedSignature);
    }

    // ━━━━━━━━━━ 2. Server-Side Price Verification ━━━━━━━━━━

    /**
     * Calculate the REAL total from database prices — NEVER trust frontend amounts
     * @param array $items Array of items with product_id and quantity
     * @return array{subtotal: float, verified_items: array}
     */
    public static function verifyOrderAmount(array $items, PDO $pdo): array {
        $subtotal = 0.0;
        $verifiedItems = [];

        // Known static catalog fallback prices (EGP) for official SYM models
        $catalogFallbacks = [
            'cruisym' => 315000.00,
            'joymax'  => 210000.00,
            'husky'   => 145000.00,
            'jet 14'  => 98000.00,
            'jet x'   => 105000.00,
            'symphony'=> 89000.00,
            'fiddle 4'=> 78000.00,
            'fiddle 3'=> 68000.00,
            'fiddle 2'=> 58000.00,
            'nhx'     => 92000.00,
            'nht'     => 95000.00,
        ];

        foreach ($items as $item) {
            $productId = trim($item['product_id'] ?? '');
            $productName = trim($item['product_name'] ?? '');
            $qty = max(1, (int)($item['quantity'] ?? 1));
            $unitPrice = 0.0;
            $image = $item['image'] ?? '/SymLogo-S-red.png';

            // 1. Try fetching authoritative price from DB products table
            try {
                $stmt = $pdo->prepare("SELECT price, name, image FROM products WHERE id = ? OR slug = ? OR name = ? LIMIT 1");
                $stmt->execute([$productId, $productId, $productName]);
                $found = $stmt->fetch();
                if ($found && (float)$found['price'] > 0) {
                    $unitPrice = (float)$found['price'];
                    $productName = $found['name'];
                    if (!empty($found['image'])) $image = $found['image'];
                }
            } catch (\Exception $e) {}

            // 2. Try fetching authoritative price from DB spare_parts table
            if ($unitPrice <= 0) {
                try {
                    $stmt = $pdo->prepare("SELECT price, name FROM spare_parts WHERE id = ? OR sku = ? OR name = ? LIMIT 1");
                    $stmt->execute([$productId, $productId, $productName]);
                    $found = $stmt->fetch();
                    if ($found && (float)$found['price'] > 0) {
                        $unitPrice = (float)$found['price'];
                        $productName = $found['name'];
                    }
                } catch (\Exception $e) {}
            }

            // 3. Fallback to official catalog models baseline (Anti-tampering: Never accept arbitrary unverified client prices)
            if ($unitPrice <= 0) {
                $searchStr = strtolower($productId . ' ' . $productName);
                foreach ($catalogFallbacks as $keyword => $catPrice) {
                    if (strpos($searchStr, $keyword) !== false) {
                        $unitPrice = $catPrice;
                        break;
                    }
                }
            }

            // 4. Default safe baseline if still unresolved
            if ($unitPrice <= 0) {
                $unitPrice = 85000.00;
            }

            $itemTotal = $unitPrice * $qty;
            $subtotal += $itemTotal;

            $verifiedItems[] = [
                'product_id'   => $productId ?: 'prod-' . time(),
                'product_name' => $productName ?: 'SYM Product',
                'unit_price'   => $unitPrice,
                'quantity'     => $qty,
                'total_price'  => $itemTotal,
                'image'        => $image,
            ];
        }

        return [
            'subtotal'       => round($subtotal, 2),
            'verified_items' => $verifiedItems,
        ];
    }

    // ━━━━━━━━━━ 3. Idempotency ━━━━━━━━━━

    /**
     * Generate a unique, collision-safe merchant reference number
     */
    public static function generateMerchantRefNum(): string {
        return 'SYM-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(6)));
    }

    /**
     * Check if a merchantRefNum has already been used (anti-double-payment)
     */
    public static function isDuplicatePayment(string $merchantRefNum, PDO $pdo): bool {
        $stmt = $pdo->prepare(
            "SELECT id FROM payment_transactions WHERE merchant_ref_num = ? AND status IN ('PAID', 'NEW', 'INITIATED') LIMIT 1"
        );
        $stmt->execute([$merchantRefNum]);
        return (bool)$stmt->fetch();
    }

    // ━━━━━━━━━━ 4. Webhook IP Enforcement ━━━━━━━━━━

    /**
     * Enforce that incoming callback is from a Fawry IP address
     * @throws \RuntimeException if IP is not whitelisted
     */
    public static function enforceWebhookIp(): void {
        $ip = self::getClientIp();
        if (!FawryConfig::isFawryIp($ip)) {
            self::auditLog('SUSPICIOUS', null, null, [
                'reason'    => 'Webhook from non-whitelisted IP',
                'source_ip' => $ip,
            ]);
            http_response_code(403);
            exit(json_encode(['success' => false, 'error' => 'Forbidden: Unknown source IP']));
        }
    }

    /**
     * Get real client IP behind proxy/load balancer.
     *
     * X-Forwarded-For / X-Real-IP / CF-Connecting-IP are client-settable headers — trusting them
     * unconditionally lets any caller spoof any source IP (bypassing the Fawry webhook whitelist
     * and per-IP rate limits just by setting X-Forwarded-For: 127.0.0.1). They are only honored
     * when the immediate TCP peer (REMOTE_ADDR) is itself a known/trusted reverse proxy.
     */
    public static function getClientIp(): string {
        $remoteAddr = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        $trustedProxies = array_filter(array_map('trim', explode(',', getenv('TRUSTED_PROXY_IPS') ?: '127.0.0.1,::1')));

        if (in_array($remoteAddr, $trustedProxies, true)) {
            foreach (['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP'] as $key) {
                $ip = $_SERVER[$key] ?? '';
                if ($ip) {
                    $ip = trim(explode(',', $ip)[0]);
                    if (filter_var($ip, FILTER_VALIDATE_IP)) {
                        return $ip;
                    }
                }
            }
        }

        return filter_var($remoteAddr, FILTER_VALIDATE_IP) ? $remoteAddr : '0.0.0.0';
    }

    // ━━━━━━━━━━ 5. Payment Rate Limiting ━━━━━━━━━━

    /**
     * Rate-limit payment initiation: max 3 attempts per 5 minutes per IP
     */
    public static function enforcePaymentRateLimit(): void {
        enforceRateLimit('fawry_payment_init', 3, 300);
    }

    // ━━━━━━━━━━ 6. Amount Mismatch Detection ━━━━━━━━━━

    /**
     * Verify that Fawry's paid amount matches our expected amount
     * Used in callback processing
     */
    public static function verifyCallbackAmount(string $orderId, float $paidAmount, PDO $pdo): bool {
        $stmt = $pdo->prepare("SELECT amount FROM orders WHERE id = ? LIMIT 1");
        $stmt->execute([$orderId]);
        $order = $stmt->fetch();

        if (!$order) return false;

        $expectedAmount = round((float)$order['amount'], 2);
        $actualAmount   = round($paidAmount, 2);

        // Allow tiny floating-point tolerance (0.01 EGP)
        if (abs($expectedAmount - $actualAmount) > 0.01) {
            self::auditLog('AMOUNT_MISMATCH', $orderId, null, [
                'expected' => $expectedAmount,
                'received' => $actualAmount,
                'diff'     => abs($expectedAmount - $actualAmount),
            ]);
            return false;
        }

        return true;
    }

    // ━━━━━━━━━━ 7. Immutable Audit Log ━━━━━━━━━━

    /**
     * Log a payment event to the immutable audit trail
     * Event types: INITIATE, REDIRECT, CALLBACK, STATUS_CHECK, VERIFY_FAIL, 
     *              SIGNATURE_MISMATCH, AMOUNT_MISMATCH, REFUND, SUSPICIOUS
     */
    public static function auditLog(
        string  $eventType,
        ?string $orderId = null,
        ?string $merchantRefNum = null,
        ?array  $details = null
    ): void {
        try {
            $pdo = Database::getConnection();
            if (!$pdo) return;

            $stmt = $pdo->prepare("
                INSERT INTO payment_audit_log (event_type, order_id, merchant_ref_num, ip_address, user_agent, details)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $eventType,
                $orderId,
                $merchantRefNum,
                self::getClientIp(),
                substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500),
                $details ? json_encode($details, JSON_UNESCAPED_UNICODE) : null,
            ]);
        } catch (\Exception $e) {
            // Audit logging must never break the main flow
            error_log('[FawrySecurity] Audit log failed: ' . $e->getMessage());
        }
    }

    // ━━━━━━━━━━ 8. cURL Helper ━━━━━━━━━━

    /**
     * Send a secure HTTPS request to Fawry API
     */
    public static function sendToFawry(string $url, string $method = 'GET', ?array $body = null): array {
        $ch = curl_init();

        $headers = [
            'Content-Type: application/json',
            'Accept: application/json',
        ];

        curl_setopt_array($ch, [
            CURLOPT_URL            => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_USERAGENT      => 'SYM-Egypt-Platform/2.0',
        ]);

        if ($method === 'POST' && $body !== null) {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body, JSON_UNESCAPED_UNICODE));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error    = curl_error($ch);
        // curl_close() is a no-op since PHP 8.0 and deprecated in 8.5 — calling it here used to
        // print a deprecation notice directly into this endpoint's JSON response body, corrupting
        // every payment API response's JSON contract on this PHP version. CurlHandle is GC'd automatically.

        if ($error) {
            return [
                'success'   => false,
                'http_code' => $httpCode,
                'error'     => $error,
                'data'      => null,
                'raw'       => $response,
            ];
        }

        $decoded = json_decode($response, true);

        return [
            'success'   => $httpCode >= 200 && $httpCode < 300,
            'http_code' => $httpCode,
            'error'     => null,
            'data'      => $decoded,
            'raw'       => $response,
        ];
    }
}
