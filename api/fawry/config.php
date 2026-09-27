<?php
/**
 * SYM Egypt — Fawry Payment Gateway Configuration
 * Loads credentials from environment variables ONLY (never hardcoded)
 * 
 * SECURITY: This file must NEVER be accessible directly from browser.
 *           It is included by other API files only.
 */

// Prevent direct browser access
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'config.php') {
    http_response_code(403);
    exit('Forbidden');
}

require_once __DIR__ . '/../config/env.php';

class FawryConfig {
    /** Staging API base URL */
    private const STAGING_BASE  = 'https://atfawry.fawrystaging.com';
    /** Production API base URL */
    private const PROD_BASE     = 'https://www.atfawry.com';

    /** API Endpoints */
    private const ENDPOINT_INIT       = '/fawrypay-api/api/payments/init';
    private const ENDPOINT_CHARGE     = '/ECommerceWeb/Fawry/payments/charge';
    private const ENDPOINT_STATUS     = '/ECommerceWeb/Fawry/payments/status/v2';
    private const ENDPOINT_REFUND     = '/ECommerceWeb/Fawry/payments/refund';

    /** Supported payment methods */
    public const METHOD_CARD          = 'CARD';
    public const METHOD_FAWRY_REF     = 'PAYATFAWRY';
    public const METHOD_WALLET        = 'MWALLET';

    /** Currency */
    public const CURRENCY             = 'EGP';

    /** Fawry known IP ranges for webhook validation */
    private const FAWRY_IPS = [
        '35.156.88.153',
        '3.124.189.79',
        '18.185.97.18',
        '3.76.34.81',
        '3.74.8.180',
        '3.65.244.143',
        // Staging IPs
        '52.59.164.128',
        '3.123.84.153',
    ];

    /** Localhost is only ever a legitimate webhook caller during local dev — never in production,
     *  where a request that resolves to loopback (e.g. via a misconfigured trusted-proxy chain)
     *  must not bypass IP enforcement. */
    private const DEV_ONLY_IPS = ['127.0.0.1', '::1'];

    // ──────────── Credential Getters ────────────

    public static function getMerchantCode(): string {
        // No hardcoded fallback: a known-in-source value would let anyone who has read the
        // code (or this repo) forge Fawry requests/callbacks in any environment that forgot
        // to set the real env var, not just production. Missing config must fail closed via
        // validate() below, not silently run on a public default.
        $code = getenv('FAWRY_MERCHANT_CODE') ?: ($_ENV['FAWRY_MERCHANT_CODE'] ?? ($_SERVER['FAWRY_MERCHANT_CODE'] ?? ''));
        return trim($code);
    }

    public static function getSecurityKey(): string {
        $key = getenv('FAWRY_SECURITY_KEY') ?: ($_ENV['FAWRY_SECURITY_KEY'] ?? ($_SERVER['FAWRY_SECURITY_KEY'] ?? ''));
        return trim($key);
    }

    public static function isProduction(): bool {
        $env = getenv('FAWRY_ENV') ?: ($_ENV['FAWRY_ENV'] ?? ($_SERVER['FAWRY_ENV'] ?? 'staging'));
        return strtolower(trim($env)) === 'production';
    }

    // ──────────── URL Builders ────────────

    public static function getBaseUrl(): string {
        return self::isProduction() ? self::PROD_BASE : self::STAGING_BASE;
    }

    public static function getInitUrl(): string {
        return self::getBaseUrl() . self::ENDPOINT_INIT;
    }

    public static function getChargeUrl(): string {
        return self::getBaseUrl() . self::ENDPOINT_CHARGE;
    }

    public static function getStatusUrl(): string {
        return self::getBaseUrl() . self::ENDPOINT_STATUS;
    }

    public static function getRefundUrl(): string {
        return self::getBaseUrl() . self::ENDPOINT_REFUND;
    }

    public static function getCallbackUrl(): string {
        return getenv('FAWRY_CALLBACK_URL') ?: 'https://symegypt.com/api/fawry/callback/index.php';
    }

    public static function getReturnUrl(): string {
        return getenv('FAWRY_RETURN_URL') ?: 'https://symegypt.com/payment-return';
    }

    // ──────────── IP Whitelist ────────────

    /**
     * Check if the given IP is a known Fawry server IP
     */
    public static function isFawryIp(string $ip): bool {
        if (!self::isProduction() && in_array($ip, self::DEV_ONLY_IPS, true)) {
            return true;
        }
        return in_array($ip, self::FAWRY_IPS, true);
    }

    /**
     * Get all whitelisted IPs (for logging/debugging)
     */
    public static function getWhitelistedIps(): array {
        return self::FAWRY_IPS;
    }

    // ──────────── Validation ────────────

    /**
     * Validate that all required Fawry credentials are configured
     * @return array{valid: bool, errors: string[]}
     */
    public static function validate(): array {
        $errors = [];
        $merchant = self::getMerchantCode();
        $key = self::getSecurityKey();

        if (empty($merchant)) {
            $errors[] = 'Fawry Merchant Code is required';
        }
        if (empty($key)) {
            $errors[] = 'Fawry Security Key is required';
        }

        return ['valid' => empty($errors), 'errors' => $errors];
    }
}
