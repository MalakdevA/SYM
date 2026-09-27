<?php
/**
 * REST API Endpoint: Warranty Verification & Registration
 * GET (search or list), POST (register), PUT (update), DELETE /api/warranty
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

/**
 * The warranty "status" is derived from the real expiry date, not manually tracked — a record
 * registered as "فعّال" a year ago must not silently stay "فعّال" forever just because nobody
 * remembered to go edit it. "ملغي" is the one true manual/business decision and always wins.
 */
function resolveWarrantyStatus(string $warrantyExpiry, string $storedStatus): string {
    if ($storedStatus === 'ملغي') {
        return 'ملغي';
    }
    $today = new DateTime('today');
    $expiry = new DateTime($warrantyExpiry);
    if ($expiry < $today) {
        return 'منتهي';
    }
    $daysRemaining = (int)$today->diff($expiry)->format('%a');
    return $daysRemaining <= 90 ? 'قارب على الانتهاء' : 'فعّال';
}

/** Self-heals the stored column too, so anything querying the table directly stays accurate. */
function persistResolvedStatus(PDO $pdo, string $id, string $resolvedStatus, string $storedStatus): void {
    if ($resolvedStatus === $storedStatus) {
        return;
    }
    $stmt = $pdo->prepare("UPDATE warranty_registrations SET status = ? WHERE id = ?");
    $stmt->execute([$resolvedStatus, $id]);
}

switch ($method) {
    case 'GET':
        $chassisNo = filter_input(INPUT_GET, 'chassis_no', FILTER_SANITIZE_SPECIAL_CHARS);
        $phone = filter_input(INPUT_GET, 'phone', FILTER_SANITIZE_SPECIAL_CHARS);

        $chassisNo = $chassisNo ? trim($chassisNo) : '';
        $phone = $phone ? trim($phone) : '';

        // If no specific chassis is provided, this is an Admin request to list all warranties
        if (empty($chassisNo)) {
            requireAdminAuth();
            $stmt = $pdo->query("SELECT * FROM warranty_registrations ORDER BY purchase_date DESC");
            $allWarranties = $stmt->fetchAll();

            foreach ($allWarranties as &$row) {
                $resolved = resolveWarrantyStatus($row['warranty_expiry'], $row['status']);
                persistResolvedStatus($pdo, $row['id'], $resolved, $row['status']);
                $row['status'] = $resolved;
            }
            unset($row);

            sendResponse(true, $allWarranties);
        }

        // Public lookup by Chassis VIN (Rate Limited to prevent VIN enumeration/scraping)
        enforceRateLimit('warranty_chassis_lookup', 15, 60);
        $query = "SELECT * FROM warranty_registrations WHERE UPPER(chassis_no) = UPPER(?)";
        $params = [$chassisNo];

        if (!empty($phone)) {
            $query .= " AND (customer_phone = ? OR customer_phone = ?)";
            $params[] = $phone;
            $params[] = preg_replace('/[^0-9]/', '', $phone);
        }

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $warranty = $stmt->fetch();

        if ($warranty) {
            try {
                $today = new DateTime();
                $expiry = new DateTime($warranty['warranty_expiry']);
                $purchase = new DateTime($warranty['purchase_date']);
                
                $totalDays = max(1, $purchase->diff($expiry)->days);
                $remainingDays = max(0, $today->diff($expiry)->days);
                $isExpired = $today > $expiry;
                
                if ($isExpired) {
                    $remainingDays = 0;
                }
                
                $diffObj = $today->diff($expiry);
                $remainingMonths = max(0, ($diffObj->y * 12) + $diffObj->m);
                $progressPercent = $totalDays > 0 ? round((($totalDays - $remainingDays) / $totalDays) * 100, 1) : 100;

                $statusMap = [
                    'فعّال' => 'Active',
                    'قارب على الانتهاء' => 'Expiring Soon',
                    'منتهي' => 'Expired',
                    'ملغي' => 'Voided'
                ];

                $currentStatus = resolveWarrantyStatus($warranty['warranty_expiry'], $warranty['status']);
                persistResolvedStatus($pdo, $warranty['id'], $currentStatus, $warranty['status']);

                $warranty['status'] = $currentStatus;
                $warranty['status_en'] = $statusMap[$currentStatus] ?? 'Active';
                $warranty['status_raw'] = $currentStatus;
                $warranty['remaining_days'] = $remainingDays;
                $warranty['remaining_months'] = $isExpired ? 0 : $remainingMonths;
                $warranty['progress_percent'] = $progressPercent;
                $warranty['is_expired'] = $isExpired;
                $warranty['total_warranty_days'] = $totalDays;

                // Check if current user is an authenticated admin
                $authHeader = '';
                if (function_exists('apache_request_headers')) {
                    $headers = apache_request_headers();
                    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
                }
                if (empty($authHeader) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
                    $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
                } elseif (empty($authHeader) && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
                    $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
                }

                $isAdmin = false;
                if (!empty($authHeader) && preg_match('/Bearer\s(\S+)/i', $authHeader, $matches)) {
                    $token = trim($matches[1]);
                    $admStmt = $pdo->prepare("SELECT id FROM admin_users WHERE token = ? AND status = 'active' LIMIT 1");
                    $admStmt->execute([$token]);
                    if ($admStmt->fetch()) {
                        $isAdmin = true;
                    }
                }

                // Mask PII for public lookups to prevent scraping customer identities
                if (!$isAdmin) {
                    if (!empty($warranty['customer_name'])) {
                        $parts = explode(' ', trim($warranty['customer_name']));
                        $firstName = $parts[0] ?? '';
                        $warranty['customer_name'] = $firstName . ' ' . (isset($parts[1]) ? mb_substr($parts[1], 0, 1, 'UTF-8') . '. ' : '') . '***';
                    }
                    if (!empty($warranty['customer_phone'])) {
                        $p = $warranty['customer_phone'];
                        $warranty['customer_phone'] = (strlen($p) >= 6) ? substr($p, 0, 4) . '****' . substr($p, -2) : '0100****00';
                    }
                    if (!empty($warranty['customer_email'])) {
                        $eParts = explode('@', $warranty['customer_email']);
                        $warranty['customer_email'] = substr($eParts[0], 0, 1) . '***@' . ($eParts[1] ?? 'symegypt.com');
                    }
                }

                if (isset($warranty['national_id'])) {
                    $warranty['national_id'] = 'XXXX-XXXX-' . substr($warranty['national_id'], -4);
                }

                sendResponse(true, $warranty);
            } catch (Exception $e) {
                sendResponse(false, null, "Error processing warranty calculation dates.", 500);
            }
        } else {
            sendResponse(false, null, "لم يتم العثور على سجل ضمان مطابق لرقم الشاسيه المدخل.", 404);
        }
        break;

    case 'POST':
        requireAdminAuth();
        $input = getJsonInput();
        
        $chassisNo = sanitizeString($input['chassis_no'] ?? '');
        $customerName = sanitizeString($input['customer_name'] ?? '');
        $scooterModel = sanitizeString($input['scooter_model'] ?? '');

        if (empty($chassisNo) || empty($customerName) || empty($scooterModel)) {
            sendResponse(false, null, "Chassis VIN, Customer Name, and Scooter Model are required.", 400);
        }

        $id = 'wrn-' . bin2hex(random_bytes(8));
        $purchaseDate = sanitizeString($input['purchase_date'] ?? date('Y-m-d'));
        $warrantyYears = (int)($input['warranty_years'] ?? 2);
        $warrantyExpiry = date('Y-m-d', strtotime("+{$warrantyYears} years", strtotime($purchaseDate)));

        $stmt = $pdo->prepare("
            INSERT INTO warranty_registrations (
                id, chassis_no, engine_no, customer_name, customer_phone, customer_email, national_id,
                scooter_model, scooter_color, purchase_date, warranty_expiry, warranty_years, showroom,
                mileage_km, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $id,
            strtoupper(trim($chassisNo)),
            sanitizeString($input['engine_no'] ?? null),
            trim($customerName),
            sanitizeString($input['customer_phone'] ?? ''),
            filter_var($input['customer_email'] ?? null, FILTER_VALIDATE_EMAIL) ?: null,
            sanitizeString($input['national_id'] ?? null),
            trim($scooterModel),
            sanitizeString($input['scooter_color'] ?? 'أسود'),
            $purchaseDate,
            $warrantyExpiry,
            $warrantyYears,
            sanitizeString($input['showroom'] ?? 'معرض مدينة نصر الرئيسي'),
            (int)($input['mileage_km'] ?? 0),
            'فعّال'
        ]);

        sendResponse(true, ["id" => $id, "warranty_expiry" => $warrantyExpiry, "message" => "تم تسجيل الضمان بنجاح"], 201);
        break;

    case 'PUT':
        requireAdminAuth();
        $input = getJsonInput();
        $id = sanitizeString($input['id'] ?? '');

        if (empty($id)) {
            sendResponse(false, null, "Warranty record ID is required.", 400);
        }

        $status = sanitizeString($input['status'] ?? 'فعّال');
        $mileage = isset($input['mileage_km']) ? (int)$input['mileage_km'] : null;
        $notes = sanitizeString($input['notes'] ?? null);

        $stmt = $pdo->prepare("UPDATE warranty_registrations SET status = ?, mileage_km = COALESCE(?, mileage_km), notes = COALESCE(?, notes) WHERE id = ? OR chassis_no = ?");
        $stmt->execute([$status, $mileage, $notes, $id, $id]);

        sendResponse(true, ["message" => "تم تحديث سجل الضمان بنجاح"]);
        break;

    case 'DELETE':
        requireAdminAuth();
        $id = filter_input(INPUT_GET, 'id', FILTER_SANITIZE_SPECIAL_CHARS);
        if (empty($id)) {
            $input = getJsonInput();
            $id = sanitizeString($input['id'] ?? '');
        }

        if (empty($id)) {
            sendResponse(false, null, "Warranty record ID is required.", 400);
        }

        $stmt = $pdo->prepare("DELETE FROM warranty_registrations WHERE id = ? OR chassis_no = ?");
        $stmt->execute([$id, $id]);

        sendResponse(true, ["message" => "تم حذف سجل الضمان بنجاح"]);
        break;

    default:
        sendResponse(false, null, "Method not allowed.", 405);
        break;
}
