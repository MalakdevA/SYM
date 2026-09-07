<?php
/**
 * REST API Endpoint: Customers Directory & Loyalty Profiles
 * GET, POST, PUT, DELETE /api/customers
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
        $stmt = $pdo->query("SELECT * FROM customers ORDER BY total_spent DESC, created_at DESC");
        $customers = $stmt->fetchAll();

        // If customers table is currently empty, derive one profile per unique phone number from
        // real orders — NOT one row per order, which would show the same person once per purchase.
        if (empty($customers)) {
            $orders = $pdo->query("SELECT customer_name, customer_phone, customer_email, address, scooter_model, amount FROM orders WHERE customer_phone IS NOT NULL AND customer_phone != '' ORDER BY created_at ASC")->fetchAll();
            if (!empty($orders)) {
                $byPhone = [];
                foreach ($orders as $ord) {
                    $phone = $ord['customer_phone'];
                    if (!isset($byPhone[$phone])) {
                        $byPhone[$phone] = [
                            'name' => $ord['customer_name'] ?: 'عميل SYM',
                            'phone' => $phone,
                            'email' => $ord['customer_email'] ?: 'customer@sym-egypt.com',
                            'city' => $ord['address'] ?: 'القاهرة',
                            'scooter' => $ord['scooter_model'] ?: 'SYM Cruisym 400',
                            'total_spent' => 0.0,
                            'orders_count' => 0,
                        ];
                    }
                    // Later orders override name/email/city/scooter with the most recent values
                    $byPhone[$phone]['name'] = $ord['customer_name'] ?: $byPhone[$phone]['name'];
                    $byPhone[$phone]['email'] = $ord['customer_email'] ?: $byPhone[$phone]['email'];
                    $byPhone[$phone]['city'] = $ord['address'] ?: $byPhone[$phone]['city'];
                    $byPhone[$phone]['scooter'] = $ord['scooter_model'] ?: $byPhone[$phone]['scooter'];
                    $byPhone[$phone]['total_spent'] += (float)$ord['amount'];
                    $byPhone[$phone]['orders_count'] += 1;
                }

                $ins = $pdo->prepare("INSERT IGNORE INTO customers (id, name, phone, email, city, scooter, total_spent, orders_count, tier) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
                foreach ($byPhone as $phone => $c) {
                    $cid = 'CUST-' . strtoupper(substr(md5($phone), 0, 8));
                    $ctier = $c['total_spent'] >= 200000 ? 'عميل ماسي' : ($c['total_spent'] >= 100000 ? 'عميل ذهبي' : 'عميل فضي');
                    $ins->execute([$cid, $c['name'], $c['phone'], $c['email'], $c['city'], $c['scooter'], $c['total_spent'], $c['orders_count'], $ctier]);
                }
                $customers = $pdo->query("SELECT * FROM customers ORDER BY total_spent DESC, created_at DESC")->fetchAll();
            }
        }

        sendResponse(true, $customers);
        break;

    case 'POST':
    case 'PUT':
        requireAdminAuth();
        $input = getJsonInput();
        if (empty($input['name']) || empty($input['phone'])) {
            sendResponse(false, null, "Name and Phone are required", 400);
        }

        $id = sanitizeString($input['id'] ?? '') ?: 'CUST-' . rand(100, 999);
        $name = sanitizeString($input['name']);
        $phone = sanitizeString($input['phone']);
        $email = filter_var($input['email'] ?? '', FILTER_VALIDATE_EMAIL) ? trim($input['email']) : 'customer@sym-egypt.com';
        $city = sanitizeString($input['city'] ?? 'القاهرة');
        $scooter = sanitizeString($input['scooter'] ?? 'SYM Jet 14 EVO 200');
        $totalSpent = (float)($input['total_spent'] ?? ($input['totalSpent'] ?? 75000));
        $tier = sanitizeString($input['tier'] ?? ($totalSpent >= 200000 ? 'عميل ماسي' : ($totalSpent >= 100000 ? 'عميل ذهبي' : 'عميل فضي')));

        $stmt = $pdo->prepare("INSERT INTO customers (id, name, phone, email, city, scooter, total_spent, tier) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), email = VALUES(email), city = VALUES(city), scooter = VALUES(scooter), total_spent = VALUES(total_spent), tier = VALUES(tier)");
        $stmt->execute([$id, $name, $phone, $email, $city, $scooter, $totalSpent, $tier]);

        sendResponse(true, ["id" => $id, "message" => "تم حفظ ملف العميل بنجاح"], 201);
        break;

    case 'DELETE':
        requireAdminAuth();
        $input = getJsonInput();
        $id = sanitizeString($_GET['id'] ?? ($input['id'] ?? ''));
        if (!$id) {
            sendResponse(false, null, "Customer ID is required", 400);
        }

        $stmt = $pdo->prepare("DELETE FROM customers WHERE id = ?");
        $stmt->execute([$id]);

        sendResponse(true, ["message" => "تم حذف ملف العميل بنجاح"]);
        break;

    default:
        sendResponse(false, null, "Method not allowed", 405);
        break;
}
