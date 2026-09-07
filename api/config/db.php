<?php
/**
 * SYM Egypt Enterprise Platform - Ultra-Fast PDO Database Singleton
 * Built for High Performance, Security & Automatic Table Initialization
 */

// SEC-03 Fix: Support Environment Variables with Local Development Fallbacks
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'sym_egypt_db');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') !== false ? getenv('DB_PASS') : '');
define('DB_CHARSET', 'utf8mb4');

class Database {
    private static ?PDO $instance = null;
    private static bool $tablesInitialized = false;

    public static function getConnection(): ?PDO {
        if (self::$instance === null) {
            try {
                // 1. Connect to MySQL Server
                $dsn = "mysql:host=" . DB_HOST . ";charset=" . DB_CHARSET;
                $options = [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                    PDO::ATTR_PERSISTENT         => false, // PERF-01 Fix: Disable persistent connections to prevent connection pool exhaustion
                ];
                
                $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
                
                // 2. Ensure Database Exists
                $pdo->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                $pdo->exec("USE `" . DB_NAME . "`");
                
                self::$instance = $pdo;

                // 3. Auto-initialize tables & indexes once per execution lifecycle (QUAL-02 Fix)
                if (!self::$tablesInitialized) {
                    self::autoInitializeTables($pdo);
                    self::$tablesInitialized = true;
                }

            } catch (PDOException $e) {
                // Connection fail-safe
                return null;
            }
        }
        return self::$instance;
    }

    private static function autoInitializeTables(PDO $pdo): void {
        try {
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS `products` (
                  `id` VARCHAR(64) PRIMARY KEY,
                  `name` VARCHAR(255) NOT NULL,
                  `slug` VARCHAR(255) NOT NULL UNIQUE,
                  `category` ENUM('scooter', 'bike') NOT NULL DEFAULT 'scooter',
                  `sub_category` VARCHAR(100) DEFAULT 'سكوترز',
                  `price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
                  `image` TEXT NOT NULL,
                  `images` LONGTEXT NULL,
                  `colors` TEXT NULL,
                  `images_360` LONGTEXT NULL,
                  `catalog_pdf` TEXT NULL,
                  `video_url` TEXT NULL,
                  `specifications` LONGTEXT NULL,
                  `features` LONGTEXT NULL,
                  `description` TEXT NULL,
                  `capacity` VARCHAR(50) DEFAULT '150 cc',
                  `power` VARCHAR(50) DEFAULT '13.5 HP',
                  `speed` VARCHAR(50) DEFAULT '110 km/h',
                  `cooling` VARCHAR(50) DEFAULT 'تبريد مائي/هواء',
                  `in_stock` TINYINT(1) NOT NULL DEFAULT 1,
                  `is_new` TINYINT(1) NOT NULL DEFAULT 1,
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                CREATE TABLE IF NOT EXISTS `orders` (
                  `id` VARCHAR(64) PRIMARY KEY,
                  `order_no` VARCHAR(50) NOT NULL UNIQUE,
                  `customer_name` VARCHAR(255) NOT NULL,
                  `customer_phone` VARCHAR(50) NOT NULL,
                  `customer_email` VARCHAR(255) NULL,
                  `address` TEXT NOT NULL,
                  `scooter_model` VARCHAR(255) NOT NULL,
                  `amount` DECIMAL(12,2) NOT NULL,
                  `payment_method` VARCHAR(100) NOT NULL DEFAULT 'cod',
                  `payment_status` VARCHAR(50) NOT NULL DEFAULT 'pending',
                  `fawry_ref_number` VARCHAR(100) NULL,
                  `merchant_ref_num` VARCHAR(100) NULL,
                  `paid_at` TIMESTAMP NULL,
                  `status` ENUM('قيد المعالجة', 'في الطريق', 'تم التسليم', 'معلق') NOT NULL DEFAULT 'قيد المعالجة',
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                CREATE TABLE IF NOT EXISTS `settings` (
                  `id` INT PRIMARY KEY DEFAULT 1,
                  `primary_color` VARCHAR(20) NOT NULL DEFAULT '#E60012',
                  `primary_hover` VARCHAR(20) NOT NULL DEFAULT '#C4000F',
                  `text_primary` VARCHAR(20) NOT NULL DEFAULT '#FFFFFF',
                  `text_secondary` VARCHAR(20) NOT NULL DEFAULT '#A1A1AA',
                  `text_muted` VARCHAR(20) NOT NULL DEFAULT '#71717A',
                  `bg_canvas` VARCHAR(20) NOT NULL DEFAULT '#000000',
                  `bg_surface` VARCHAR(20) NOT NULL DEFAULT '#0A0A0A',
                  `hero_title` TEXT NULL,
                  `hero_subtitle` TEXT NULL,
                  `banner_text` TEXT NULL,
                  `show_banner` TINYINT(1) DEFAULT 1,
                  `contact_phone` VARCHAR(50) DEFAULT '19088',
                  `contact_email` VARCHAR(100) DEFAULT 'info@sym-egypt.com',
                  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                CREATE TABLE IF NOT EXISTS `analytics` (
                  `id` INT AUTO_INCREMENT PRIMARY KEY,
                  `path` VARCHAR(255) NOT NULL UNIQUE,
                  `title` VARCHAR(255) NOT NULL,
                  `views_count` INT NOT NULL DEFAULT 1,
                  `unique_visitors` INT NOT NULL DEFAULT 1,
                  `last_visited_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                CREATE TABLE IF NOT EXISTS `warranty_registrations` (
                  `id` VARCHAR(64) PRIMARY KEY,
                  `chassis_no` VARCHAR(100) NOT NULL UNIQUE,
                  `engine_no` VARCHAR(100) NULL,
                  `customer_name` VARCHAR(255) NOT NULL,
                  `customer_phone` VARCHAR(50) NOT NULL,
                  `customer_email` VARCHAR(255) NULL,
                  `national_id` VARCHAR(20) NULL,
                  `scooter_model` VARCHAR(255) NOT NULL,
                  `scooter_color` VARCHAR(100) DEFAULT 'أسود',
                  `purchase_date` DATE NOT NULL,
                  `warranty_expiry` DATE NOT NULL,
                  `warranty_years` INT NOT NULL DEFAULT 2,
                  `showroom` VARCHAR(255) DEFAULT 'معرض مدينة نصر الرئيسي',
                  `last_service_date` DATE NULL,
                  `next_service_date` DATE NULL,
                  `service_count` INT NOT NULL DEFAULT 0,
                  `mileage_km` INT NOT NULL DEFAULT 0,
                  `status` ENUM('فعّال', 'قارب على الانتهاء', 'منتهي', 'ملغي') NOT NULL DEFAULT 'فعّال',
                  `notes` TEXT NULL,
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                CREATE TABLE IF NOT EXISTS `admin_users` (
                  `id` VARCHAR(64) PRIMARY KEY,
                  `name` VARCHAR(255) NOT NULL,
                  `email` VARCHAR(255) NOT NULL UNIQUE,
                  `phone` VARCHAR(50) NOT NULL,
                  `role` VARCHAR(100) NOT NULL DEFAULT 'Support Staff',
                  `status` VARCHAR(50) NOT NULL DEFAULT 'active',
                  `showroom` VARCHAR(255) DEFAULT 'المقر الرئيسي',
                  `password` VARCHAR(255) NULL,
                  `token` VARCHAR(255) NULL,
                  `last_login` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                CREATE TABLE IF NOT EXISTS `customers` (
                  `id` VARCHAR(64) PRIMARY KEY,
                  `name` VARCHAR(255) NOT NULL,
                  `phone` VARCHAR(50) NOT NULL,
                  `email` VARCHAR(255) NULL,
                  `city` VARCHAR(100) NOT NULL DEFAULT 'القاهرة',
                  `scooter` VARCHAR(255) NULL,
                  `total_spent` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
                  `orders_count` INT NOT NULL DEFAULT 1,
                  `tier` VARCHAR(50) DEFAULT 'عميل جديد',
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                CREATE TABLE IF NOT EXISTS `service_tickets` (
                  `id` VARCHAR(64) PRIMARY KEY,
                  `ticket_no` VARCHAR(50) NOT NULL UNIQUE,
                  `customer_name` VARCHAR(255) NOT NULL,
                  `customer_phone` VARCHAR(50) NOT NULL,
                  `scooter_model` VARCHAR(255) NOT NULL,
                  `chassis_no` VARCHAR(100) NULL,
                  `service_type` VARCHAR(100) DEFAULT 'صيانة دورية',
                  `showroom` VARCHAR(255) DEFAULT 'معرض مدينة نصر الرئيسي',
                  `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
                  `notes` TEXT NULL,
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                CREATE TABLE IF NOT EXISTS `showrooms` (
                  `id` VARCHAR(64) PRIMARY KEY,
                  `name` VARCHAR(255) NOT NULL,
                  `city` VARCHAR(100) NOT NULL DEFAULT 'القاهرة',
                  `address` TEXT NOT NULL,
                  `phone` VARCHAR(50) DEFAULT '01000000000',
                  `working_hours` VARCHAR(100) DEFAULT '9:00 ص - 10:00 م',
                  `status` VARCHAR(50) DEFAULT 'active',
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                CREATE TABLE IF NOT EXISTS `spare_parts` (
                  `id` VARCHAR(64) PRIMARY KEY,
                  `sku` VARCHAR(100) NULL,
                  `name` VARCHAR(255) NOT NULL,
                  `category` VARCHAR(100) DEFAULT 'الزيوت والصيانة',
                  `price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
                  `stock` INT NOT NULL DEFAULT 0,
                  `compatible_model` VARCHAR(255) DEFAULT 'جميع الموديلات',
                  `status` VARCHAR(50) DEFAULT 'نشط',
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                CREATE TABLE IF NOT EXISTS `contact_messages` (
                  `id` VARCHAR(64) PRIMARY KEY,
                  `name` VARCHAR(255) NOT NULL,
                  `email` VARCHAR(255) NULL,
                  `phone` VARCHAR(50) NOT NULL,
                  `subject` VARCHAR(255) NULL,
                  `message` TEXT NOT NULL,
                  `status` VARCHAR(50) DEFAULT 'unread',
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                CREATE TABLE IF NOT EXISTS `test_ride_requests` (
                  `id` VARCHAR(64) PRIMARY KEY,
                  `customer_name` VARCHAR(255) NOT NULL,
                  `phone` VARCHAR(50) NOT NULL,
                  `scooter_model` VARCHAR(255) NOT NULL,
                  `showroom` VARCHAR(255) NOT NULL,
                  `preferred_date` DATE NULL,
                  `status` VARCHAR(50) DEFAULT 'pending',
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                CREATE TABLE IF NOT EXISTS `test_rides` (
                  `id` INT AUTO_INCREMENT PRIMARY KEY,
                  `name` VARCHAR(255) NOT NULL,
                  `phone` VARCHAR(50) NOT NULL,
                  `email` VARCHAR(255) NULL,
                  `scooter_model` VARCHAR(255) NOT NULL,
                  `showroom` VARCHAR(255) DEFAULT 'معرض مدينة نصر الرئيسي',
                  `preferred_date` DATE NULL,
                  `status` VARCHAR(50) DEFAULT 'معلق',
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                CREATE TABLE IF NOT EXISTS `order_items` (
                  `id` VARCHAR(64) PRIMARY KEY,
                  `order_id` VARCHAR(64) NOT NULL,
                  `product_id` VARCHAR(64) NOT NULL,
                  `product_name` VARCHAR(255) NOT NULL,
                  `unit_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
                  `quantity` INT NOT NULL DEFAULT 1,
                  `total_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
                  `image` TEXT NULL,
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                CREATE TABLE IF NOT EXISTS `carts` (
                  `id` VARCHAR(64) PRIMARY KEY,
                  `user_session_id` VARCHAR(100) NOT NULL UNIQUE,
                  `status` VARCHAR(50) DEFAULT 'active',
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                CREATE TABLE IF NOT EXISTS `cart_items` (
                  `id` VARCHAR(64) PRIMARY KEY,
                  `cart_id` VARCHAR(64) NOT NULL,
                  `product_id` VARCHAR(64) NOT NULL,
                  `product_name` VARCHAR(255) NOT NULL,
                  `price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
                  `quantity` INT NOT NULL DEFAULT 1,
                  `image` TEXT NULL,
                  `item_type` VARCHAR(50) DEFAULT 'scooter',
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                CREATE TABLE IF NOT EXISTS `payment_transactions` (
                  `id` VARCHAR(64) PRIMARY KEY,
                  `order_id` VARCHAR(64) NOT NULL,
                  `merchant_ref_num` VARCHAR(100) NOT NULL UNIQUE,
                  `fawry_ref_number` VARCHAR(100) NULL,
                  `payment_method` VARCHAR(50) NOT NULL DEFAULT 'CARD',
                  `amount` DECIMAL(12,2) NOT NULL,
                  `currency` VARCHAR(10) NOT NULL DEFAULT 'EGP',
                  `status` VARCHAR(50) NOT NULL DEFAULT 'INITIATED',
                  `fawry_status_code` VARCHAR(20) NULL,
                  `fawry_message` TEXT NULL,
                  `signature_sent` VARCHAR(255) NOT NULL,
                  `signature_received` VARCHAR(255) NULL,
                  `ip_address` VARCHAR(45) NOT NULL DEFAULT '0.0.0.0',
                  `user_agent` TEXT NULL,
                  `raw_request` LONGTEXT NULL,
                  `raw_response` LONGTEXT NULL,
                  `raw_callback` LONGTEXT NULL,
                  `attempts` INT NOT NULL DEFAULT 1,
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                CREATE TABLE IF NOT EXISTS `payment_audit_log` (
                  `id` INT AUTO_INCREMENT PRIMARY KEY,
                  `event_type` VARCHAR(50) NOT NULL,
                  `order_id` VARCHAR(64) NULL,
                  `merchant_ref_num` VARCHAR(100) NULL,
                  `ip_address` VARCHAR(45) NOT NULL DEFAULT '0.0.0.0',
                  `user_agent` TEXT NULL,
                  `details` LONGTEXT NULL,
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                CREATE TABLE IF NOT EXISTS `site_pages` (
                  `id` VARCHAR(64) PRIMARY KEY,
                  `name` VARCHAR(255) NOT NULL,
                  `path` VARCHAR(255) NOT NULL UNIQUE,
                  `category` VARCHAR(100) DEFAULT 'الصفحات العامة',
                  `status` ENUM('published', 'draft') NOT NULL DEFAULT 'published',
                  `last_updated` VARCHAR(100) NULL,
                  `views_this_month` VARCHAR(100) DEFAULT '0 زيارة',
                  `seo_score` INT NOT NULL DEFAULT 95,
                  `hero_title` TEXT NULL,
                  `description` TEXT NULL,
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // Bootstrap the one real Super Admin account so the platform is loginable on a fresh install.
            // No other table is auto-seeded with placeholder business data (customers, orders, showrooms,
            // spare parts, service tickets, warranty records, analytics, site pages) — a freshly-deployed
            // real platform legitimately starts empty; it must never silently show fabricated records.
            $pdo->exec("
                INSERT IGNORE INTO `admin_users` (`id`, `name`, `email`, `phone`, `role`, `status`, `showroom`, `password`, `last_login`) VALUES
                ('adm-101', 'Malak Ashraf', 'admin@sym-egypt.com', '+20 100 482 9102', 'Super Admin', 'active', 'المقر الرئيسي (Cairo)', '\$2y\$12\$sRY34OSMvwaSt0OPxlRnKuAEa8dPYZy9GRGXTMypx5WoWxg4ru.9W', null);
            ");

            // Safe schema migrations for products
            $productColumns = [
                "ALTER TABLE `products` ADD COLUMN `colors` TEXT NULL",
                "ALTER TABLE `products` ADD COLUMN `images_360` LONGTEXT NULL",
                "ALTER TABLE `products` ADD COLUMN `catalog_pdf` TEXT NULL",
                "ALTER TABLE `products` ADD COLUMN `video_url` TEXT NULL",
                "ALTER TABLE `products` ADD COLUMN `specifications` LONGTEXT NULL",
                "ALTER TABLE `products` ADD COLUMN `features` LONGTEXT NULL",
            ];
            foreach ($productColumns as $colSql) {
                try {
                    $pdo->exec($colSql);
                } catch (Exception $e) {
                    // Column already exists, ignore safely
                }
            }

            // Safe schema migrations for spare_parts (full inventory-management detail)
            $sparePartsColumns = [
                "ALTER TABLE `spare_parts` ADD COLUMN `cost_price` DECIMAL(12,2) NULL",
                "ALTER TABLE `spare_parts` ADD COLUMN `brand` VARCHAR(150) NULL",
                "ALTER TABLE `spare_parts` ADD COLUMN `rack_location` VARCHAR(100) NULL",
                "ALTER TABLE `spare_parts` ADD COLUMN `warranty_period` VARCHAR(100) NULL",
            ];
            foreach ($sparePartsColumns as $colSql) {
                try {
                    $pdo->exec($colSql);
                } catch (Exception $e) {
                    // Column already exists, ignore safely
                }
            }

            // A login token with no expiry stays valid forever until the next login overwrites it —
            // a leaked/stolen token would otherwise never expire on its own. token_created_at lets
            // requireAdminAuth() enforce a session lifetime.
            $adminUserColumns = [
                "ALTER TABLE `admin_users` ADD COLUMN `token_created_at` TIMESTAMP NULL",
            ];
            foreach ($adminUserColumns as $colSql) {
                try {
                    $pdo->exec($colSql);
                } catch (Exception $e) {
                    // Column already exists, ignore safely
                }
            }

            // Real checkout idempotency requires knowing which cart session an order came from —
            // without this, a retried/duplicate checkout submission (e.g. after a payment gateway
            // timeout) has no way to be recognized and silently creates a second real order.
            $orderColumns = [
                "ALTER TABLE `orders` ADD COLUMN `session_id` VARCHAR(100) NULL",
            ];
            foreach ($orderColumns as $colSql) {
                try {
                    $pdo->exec($colSql);
                } catch (Exception $e) {
                    // Column already exists, ignore safely
                }
            }

            // Full showroom detail — everything the public dealer/showroom cards actually display
            // (badge type, WhatsApp, map link, service tags, installment plans, notes) so an admin
            // edit controls the real card, not just a thin subset of it.
            $showroomColumns = [
                "ALTER TABLE `showrooms` ADD COLUMN `type` VARCHAR(20) NOT NULL DEFAULT 'authorized'",
                "ALTER TABLE `showrooms` ADD COLUMN `whatsapp` VARCHAR(50) NULL",
                "ALTER TABLE `showrooms` ADD COLUMN `google_maps_url` TEXT NULL",
                "ALTER TABLE `showrooms` ADD COLUMN `has_test_ride` TINYINT(1) NOT NULL DEFAULT 1",
                "ALTER TABLE `showrooms` ADD COLUMN `has_maintenance` TINYINT(1) NOT NULL DEFAULT 1",
                "ALTER TABLE `showrooms` ADD COLUMN `has_spare_parts` TINYINT(1) NOT NULL DEFAULT 1",
                "ALTER TABLE `showrooms` ADD COLUMN `has_shipping` TINYINT(1) NOT NULL DEFAULT 0",
                "ALTER TABLE `showrooms` ADD COLUMN `installment_options` TEXT NULL",
                "ALTER TABLE `showrooms` ADD COLUMN `notes` TEXT NULL",
                "ALTER TABLE `showrooms` ADD COLUMN `name_en` VARCHAR(255) NULL",
                "ALTER TABLE `showrooms` ADD COLUMN `address_en` TEXT NULL",
                "ALTER TABLE `showrooms` ADD COLUMN `working_hours_en` VARCHAR(150) NULL",
            ];
            foreach ($showroomColumns as $colSql) {
                try {
                    $pdo->exec($colSql);
                } catch (Exception $e) {
                    // Column already exists, ignore safely
                }
            }

            // The admin ticket form has always collected mileage/cost/delivery date, but the table
            // never had columns for them — every edit to those fields silently vanished on save.
            $serviceTicketColumns = [
                "ALTER TABLE `service_tickets` ADD COLUMN `mileage` INT NULL",
                "ALTER TABLE `service_tickets` ADD COLUMN `cost` DECIMAL(12,2) NULL",
                "ALTER TABLE `service_tickets` ADD COLUMN `delivery_time` DATE NULL",
            ];
            foreach ($serviceTicketColumns as $colSql) {
                try {
                    $pdo->exec($colSql);
                } catch (Exception $e) {
                    // Column already exists, ignore safely
                }
            }

            // DB-01 Fix: Safely provision database indexes for fast query performance
            $indexes = [
                "CREATE INDEX `idx_orders_phone` ON `orders` (`customer_phone`)",
                "CREATE INDEX `idx_orders_status` ON `orders` (`status`)",
                "CREATE INDEX `idx_orders_scooter` ON `orders` (`scooter_model`)",
                "CREATE INDEX `idx_orders_payment_status` ON `orders` (`payment_status`)",
                "CREATE INDEX `idx_orders_fawry_ref` ON `orders` (`fawry_ref_number`)",
                "CREATE INDEX `idx_orders_merchant_ref` ON `orders` (`merchant_ref_num`)",
                "CREATE INDEX `idx_orders_session_id` ON `orders` (`session_id`)",
                "CREATE INDEX `idx_warranty_phone` ON `warranty_registrations` (`customer_phone`)",
                "CREATE INDEX `idx_warranty_status` ON `warranty_registrations` (`status`)",
                "CREATE INDEX `idx_spare_parts_category` ON `spare_parts` (`category`)",
                "CREATE INDEX `idx_spare_parts_sku` ON `spare_parts` (`sku`)",
                "CREATE INDEX `idx_pt_order` ON `payment_transactions` (`order_id`)",
                "CREATE INDEX `idx_pt_fawry_ref` ON `payment_transactions` (`fawry_ref_number`)",
                "CREATE INDEX `idx_pt_status` ON `payment_transactions` (`status`)",
                "CREATE INDEX `idx_pal_event` ON `payment_audit_log` (`event_type`)",
                "CREATE INDEX `idx_pal_order` ON `payment_audit_log` (`order_id`)",
            ];
            foreach ($indexes as $idxSql) {
                try {
                    $pdo->exec($idxSql);
                } catch (Exception $e) {
                    // Index already exists, ignore safely
                }
            }
        } catch (Exception $e) {
            // Ignore auto-init errors if tables already exist
        }
    }
}
