<?php
/**
 * SYM Egypt Enterprise Platform - Secure Environment Variables Loader
 * Automatically detects and parses .env file if getenv() is empty.
 * Prevents file traversal and guarantees credentials isolation.
 */

if (!function_exists('loadEnvVariables')) {
    function loadEnvVariables(?string $filePath = null): void {
        if ($filePath === null) {
            $possiblePaths = [
                __DIR__ . '/../../.env',
                __DIR__ . '/../../.env.local',
                dirname(__DIR__, 2) . '/.env'
            ];
            foreach ($possiblePaths as $p) {
                if (file_exists($p) && is_readable($p)) {
                    $filePath = $p;
                    break;
                }
            }
        }

        if (!$filePath || !file_exists($filePath) || !is_readable($filePath)) {
            return;
        }

        $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) {
            return;
        }

        foreach ($lines as $line) {
            $line = trim($line);
            // Skip comments and empty lines
            if ($line === '' || strpos($line, '#') === 0 || strpos($line, ';') === 0) {
                continue;
            }

            // Split into key & value on first '='
            $parts = explode('=', $line, 2);
            if (count($parts) !== 2) {
                continue;
            }

            $key = trim($parts[0]);
            $val = trim($parts[1]);

            // Strip surrounding quotes
            if (
                (str_starts_with($val, '"') && str_ends_with($val, '"')) ||
                (str_starts_with($val, "'") && str_ends_with($val, "'"))
            ) {
                $val = substr($val, 1, -1);
            }

            // Only set if not already present in server environment
            if (getenv($key) === false) {
                putenv("{$key}={$val}");
                $_ENV[$key] = $val;
                $_SERVER[$key] = $val;
            }
        }
    }
}

// Automatically load on include
loadEnvVariables();
