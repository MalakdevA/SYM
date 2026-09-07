<?php
/**
 * REST API Endpoint: Site Theme & Content Central Settings
 * GET, POST /api/settings
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
        try {
            $stmt = $pdo->query("SELECT * FROM settings WHERE id = 1");
            $settings = $stmt->fetch();
            if (!$settings) {
                $defaultSettings = [
                    "primary_color" => "#E60012",
                    "primary_hover" => "#C4000F",
                    "text_primary"  => "#FFFFFF",
                    "text_secondary"=> "#A1A1AA",
                    "text_muted"    => "#71717A",
                    "bg_canvas"     => "#000000",
                    "bg_surface"    => "#0A0A0A",
                    "hero_title"    => "انطلق بقوة الحرية والأداء الأقصى مع SYM مصر",
                    "hero_subtitle" => "تشكيلة 2026 الرسمية من أحدث السكوترز والتكنولوجيا التايوانية المتقدمة مع ضمان الموزع المعتمد وشبكة صيانة في كافة المحافظات.",
                    "banner_text"   => "🔥 خصومات وعروض خاصة بمناسبة الصيف على موديلات Jet 14 EVO و Symphony ST!",
                    "show_banner"   => 1,
                    "contact_phone" => "01271384149",
                    "contact_email" => "info@sym-egypt.com",
                    "contact_address" => "القاهرة - مصر: المنطقة الصناعية - طريق النصر",
                    "footer_notice" => "جميع الحقوق محفوظة © 2026 شركة SYM Egypt - الوكيل الرسمي لموتوسيكلات وسكوترز SYM.",
                    "maintenance_mode" => 0,
                ];
                sendResponse(true, $defaultSettings);
            } else {
                sendResponse(true, $settings);
            }
        } catch (Exception $e) {
            error_log('[SettingsAPI] Fetch error: ' . $e->getMessage());
            sendResponse(false, null, "تعذر استرجاع الإعدادات حالياً.", 500);
        }
        break;

    case 'POST':
    case 'PUT':
        $admin = requireAdminAuth();
        $input = getJsonInput();

        try {
            // DB-02 Fix: Atomic Upsert using ON DUPLICATE KEY UPDATE to eliminate race condition
            $stmt = $pdo->prepare("
                INSERT INTO settings (
                    id, primary_color, primary_hover, text_primary, text_secondary, text_muted,
                    bg_canvas, bg_surface, hero_title, hero_subtitle, banner_text, show_banner,
                    contact_phone, contact_email, contact_address, footer_notice, maintenance_mode
                ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    primary_color = COALESCE(VALUES(primary_color), primary_color),
                    primary_hover = COALESCE(VALUES(primary_hover), primary_hover),
                    text_primary = COALESCE(VALUES(text_primary), text_primary),
                    text_secondary = COALESCE(VALUES(text_secondary), text_secondary),
                    text_muted = COALESCE(VALUES(text_muted), text_muted),
                    bg_canvas = COALESCE(VALUES(bg_canvas), bg_canvas),
                    bg_surface = COALESCE(VALUES(bg_surface), bg_surface),
                    hero_title = COALESCE(VALUES(hero_title), hero_title),
                    hero_subtitle = COALESCE(VALUES(hero_subtitle), hero_subtitle),
                    banner_text = COALESCE(VALUES(banner_text), banner_text),
                    show_banner = COALESCE(VALUES(show_banner), show_banner),
                    contact_phone = COALESCE(VALUES(contact_phone), contact_phone),
                    contact_email = COALESCE(VALUES(contact_email), contact_email),
                    contact_address = COALESCE(VALUES(contact_address), contact_address),
                    footer_notice = COALESCE(VALUES(footer_notice), footer_notice),
                    maintenance_mode = COALESCE(VALUES(maintenance_mode), maintenance_mode)
            ");

            $primaryColor = $input['primary_color'] ?? ($input['primary'] ?? null);
            $primaryHover = $input['primary_hover'] ?? ($input['primaryHover'] ?? null);
            $textPrimary = $input['text_primary'] ?? ($input['textPrimary'] ?? null);
            $textSecondary = $input['text_secondary'] ?? ($input['textSecondary'] ?? null);
            $textMuted = $input['text_muted'] ?? ($input['textMuted'] ?? null);
            $bgCanvas = $input['bg_canvas'] ?? ($input['bgCanvas'] ?? null);
            $bgSurface = $input['bg_surface'] ?? ($input['bgSurface'] ?? null);
            $heroTitle = $input['hero_title'] ?? ($input['heroTitle'] ?? null);
            $heroSubtitle = $input['hero_subtitle'] ?? ($input['heroSubtitle'] ?? null);
            $bannerText = $input['banner_text'] ?? ($input['bannerText'] ?? null);
            $showBanner = isset($input['show_banner']) ? ($input['show_banner'] ? 1 : 0) : (isset($input['showBanner']) ? ($input['showBanner'] ? 1 : 0) : null);
            $contactPhone = $input['contact_phone'] ?? ($input['contactPhone'] ?? null);
            $contactEmail = $input['contact_email'] ?? ($input['contactEmail'] ?? null);
            $contactAddress = $input['contact_address'] ?? ($input['contactAddress'] ?? null);
            $footerNotice = $input['footer_notice'] ?? ($input['footerNotice'] ?? null);
            $maintMode = isset($input['maintenance_mode']) ? ($input['maintenance_mode'] ? 1 : 0) : (isset($input['maintenanceMode']) ? ($input['maintenanceMode'] ? 1 : 0) : null);

            $stmt->execute([
                $primaryColor ?: '#E60012',
                $primaryHover ?: '#C4000F',
                $textPrimary ?: '#FFFFFF',
                $textSecondary ?: '#A1A1AA',
                $textMuted ?: '#71717A',
                $bgCanvas ?: '#000000',
                $bgSurface ?: '#0A0A0A',
                $heroTitle ?: 'انطلق بقوة الحرية والأداء الأقصى مع SYM مصر',
                $heroSubtitle ?: '',
                $bannerText ?: '',
                $showBanner !== null ? $showBanner : 1,
                $contactPhone ?: '01271384149',
                $contactEmail ?: 'info@sym-egypt.com',
                $contactAddress ?: 'القاهرة - مصر: المنطقة الصناعية - طريق النصر',
                $footerNotice ?: 'جميع الحقوق محفوظة © 2026 شركة SYM Egypt',
                $maintMode !== null ? $maintMode : 0
            ]);

            sendResponse(true, ["message" => "تم حفظ الإعدادات في قاعدة البيانات بنجاح"]);
        } catch (Exception $e) {
            error_log('[SettingsAPI] Save error: ' . $e->getMessage());
            sendResponse(false, null, "فشل حفظ الإعدادات، يرجى المحاولة لاحقاً.", 500);
        }
        break;

    default:
        sendResponse(false, null, "Method not allowed", 405);
        break;
}

