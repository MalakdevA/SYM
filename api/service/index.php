<?php
/**
 * REST API Endpoint: Maintenance & Warranty Support Tickets
 * GET, POST, PUT, DELETE /api/service
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
 * When a service ticket for a chassis is completed, reflect that visit on the chassis's warranty
 * registration (if one exists) — service_count, last_service_date, mileage_km, next_service_date.
 * A chassis with no warranty record on file (out-of-warranty customers still get serviced) is
 * simply left untouched; this never creates a warranty record on its own.
 */
function syncWarrantyFromTicket(PDO $pdo, ?string $chassisNo, ?int $mileage): void {
    $chassisNo = trim((string)$chassisNo);
    if ($chassisNo === '') {
        return;
    }

    if ($mileage !== null) {
        $stmt = $pdo->prepare("
            UPDATE warranty_registrations SET
                service_count = service_count + 1,
                last_service_date = CURDATE(),
                next_service_date = DATE_ADD(CURDATE(), INTERVAL 3 MONTH),
                mileage_km = GREATEST(mileage_km, ?)
            WHERE UPPER(chassis_no) = UPPER(?)
        ");
        $stmt->execute([$mileage, $chassisNo]);
    } else {
        $stmt = $pdo->prepare("
            UPDATE warranty_registrations SET
                service_count = service_count + 1,
                last_service_date = CURDATE(),
                next_service_date = DATE_ADD(CURDATE(), INTERVAL 3 MONTH)
            WHERE UPPER(chassis_no) = UPPER(?)
        ");
        $stmt->execute([$chassisNo]);
    }
}

switch ($method) {
    case 'GET':
        requireAdminAuth();
        $stmt = $pdo->query("SELECT * FROM service_tickets ORDER BY created_at DESC");
        $tickets = $stmt->fetchAll();

        sendResponse(true, $tickets);
        break;

    case 'POST':
        // Protected admin or public endpoint to create ticket
        $input = getJsonInput();
        if (empty($input['customer_name']) || empty($input['scooter_model'])) {
            sendResponse(false, null, "Customer name and Scooter model are required", 400);
        }

        $id = sanitizeString($input['id'] ?? '') ?: 'srv-' . time();
        $ticketNo = 'SRV-' . date('Y') . '-' . rand(100, 999);
        $customerName = sanitizeString($input['customer_name']);
        $customerPhone = sanitizeString($input['customer_phone'] ?? '01000000000');
        $scooterModel = sanitizeString($input['scooter_model']);
        $chassisNo = sanitizeString($input['chassis_no'] ?? 'SYM-CHASSIS-000');
        $serviceType = sanitizeString($input['service_type'] ?? 'صيانة دورية');
        $showroom = sanitizeString($input['showroom'] ?? 'معرض مدينة نصر الرئيسي');
        $status = sanitizeString($input['status'] ?? 'pending');
        $notes = sanitizeString($input['notes'] ?? '');
        $mileage = isset($input['mileage']) && $input['mileage'] !== '' ? (int)$input['mileage'] : null;

        $stmt = $pdo->prepare("INSERT INTO service_tickets (id, ticket_no, customer_name, customer_phone, scooter_model, chassis_no, service_type, showroom, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id, $ticketNo, $customerName, $customerPhone, $scooterModel, $chassisNo, $serviceType, $showroom, $status, $notes]);

        if ($status === 'completed') {
            syncWarrantyFromTicket($pdo, $chassisNo, $mileage);
        }

        sendResponse(true, ["id" => $id, "ticket_no" => $ticketNo, "message" => "تم فتح تذكرة الصيانة بنجاح"], 201);
        break;

    case 'PUT':
        requireAdminAuth();
        $input = getJsonInput();
        if (empty($input['id'])) {
            sendResponse(false, null, "Ticket ID is required", 400);
        }

        $id = sanitizeString($input['id']);
        $customerName = isset($input['customer_name']) ? sanitizeString($input['customer_name']) : null;
        $customerPhone = isset($input['customer_phone']) ? sanitizeString($input['customer_phone']) : null;
        $scooterModel = isset($input['scooter_model']) ? sanitizeString($input['scooter_model']) : null;
        $chassisNo = isset($input['chassis_no']) ? sanitizeString($input['chassis_no']) : null;
        $serviceType = isset($input['service_type']) ? sanitizeString($input['service_type']) : null;
        $showroom = isset($input['showroom']) ? sanitizeString($input['showroom']) : null;
        $status = isset($input['status']) ? sanitizeString($input['status']) : null;
        $notes = isset($input['notes']) ? sanitizeString($input['notes']) : null;
        $mileage = isset($input['mileage']) && $input['mileage'] !== '' ? (int)$input['mileage'] : null;
        $cost = isset($input['cost']) && $input['cost'] !== '' ? (float)$input['cost'] : null;
        $deliveryTime = isset($input['delivery_time']) && $input['delivery_time'] !== '' ? sanitizeString($input['delivery_time']) : null;

        // Only a real pending/in_progress -> completed TRANSITION should count as one service
        // visit — re-saving an already-completed ticket (e.g. just editing its notes) must not
        // increment the linked warranty's service_count again.
        $prevStmt = $pdo->prepare("SELECT status FROM service_tickets WHERE id = ? OR ticket_no = ? LIMIT 1");
        $prevStmt->execute([$id, $id]);
        $previousStatus = $prevStmt->fetchColumn();

        $stmt = $pdo->prepare("
            UPDATE service_tickets SET
                customer_name = COALESCE(?, customer_name),
                customer_phone = COALESCE(?, customer_phone),
                scooter_model = COALESCE(?, scooter_model),
                chassis_no = COALESCE(?, chassis_no),
                service_type = COALESCE(?, service_type),
                showroom = COALESCE(?, showroom),
                status = COALESCE(?, status),
                notes = COALESCE(?, notes),
                mileage = COALESCE(?, mileage),
                cost = COALESCE(?, cost),
                delivery_time = COALESCE(?, delivery_time)
            WHERE id = ? OR ticket_no = ?
        ");
        $stmt->execute([
            $customerName, $customerPhone, $scooterModel, $chassisNo, $serviceType,
            $showroom, $status, $notes, $mileage, $cost, $deliveryTime, $id, $id,
        ]);

        if ($status === 'completed' && $previousStatus !== 'completed') {
            // The chassis may not have been in this PUT payload (e.g. a quick status-only
            // change) — read back whatever the ticket actually has on file right now.
            $ticketStmt = $pdo->prepare("SELECT chassis_no, mileage FROM service_tickets WHERE id = ? OR ticket_no = ? LIMIT 1");
            $ticketStmt->execute([$id, $id]);
            $ticket = $ticketStmt->fetch();
            if ($ticket) {
                syncWarrantyFromTicket($pdo, $ticket['chassis_no'], $ticket['mileage'] !== null ? (int)$ticket['mileage'] : null);
            }
        }

        sendResponse(true, ["message" => "تم تحديث تذكرة الصيانة بنجاح"]);
        break;

    case 'DELETE':
        requireAdminAuth();
        $input = getJsonInput();
        $id = sanitizeString($_GET['id'] ?? ($input['id'] ?? ''));
        if (!$id) {
            sendResponse(false, null, "Ticket ID is required", 400);
        }

        $stmt = $pdo->prepare("DELETE FROM service_tickets WHERE id = ? OR ticket_no = ?");
        $stmt->execute([$id, $id]);

        sendResponse(true, ["message" => "تم حذف تذكرة الصيانة بنجاح"]);
        break;

    default:
        sendResponse(false, null, "Method not allowed", 405);
        break;
}
