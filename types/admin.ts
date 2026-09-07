// Shared type definitions for the admin dashboard.
// Field names mirror the real PHP backend contracts exactly — do not rename without updating the API.

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar?: string;
  token: string;
}

export type AdminRole = 'Super Admin' | 'Sales Manager' | 'Content Editor' | 'Support Staff' | 'Finance Admin';

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AdminRole;
  status: 'active' | 'inactive';
  showroom?: string;
  last_login?: string;
  password?: string;
}

// ---------- Products / Inventory ----------
// Mirrors every field the real product detail page (ScooterDetailView.tsx) actually reads and
// renders (conditionally — a field only shows if it has a value). `brakes` is legacy: the page
// falls back to it only when `frontBrakes` is empty; new edits should use frontBrakes/rearBrakes.
export interface ProductSpecifications {
  // Chassis & Dimensions
  dimensions?: string;
  wheelBase?: string;
  weight?: string;
  frontSuspension?: string;
  rearSuspension?: string;
  rimMaterial?: string;
  frontTire?: string;
  rearTire?: string;
  tirePressure?: string;
  frontBrakes?: string;
  rearBrakes?: string;
  fuelTank?: string;
  seatHeight?: string;
  // Engine
  emissionsStandard?: string;
  engine?: string;
  capacity?: string;
  boreStroke?: string;
  compressionRatio?: string;
  idlingSpeed?: string;
  fuelSystem?: string;
  power?: string;
  torque?: string;
  clutchType?: string;
  valveTrain?: string;
  tensioner?: string;
  engineOilCapacity?: string;
  maxSpeed?: string;
  cooling?: string;
  transmission?: string;
  // Electrical
  startingSystem?: string;
  headlightSpec?: string;
  taillightSpec?: string;
  frontPositionLamp?: string;
  turningSignalLight?: string;
  ignitionSystem?: string;
  alternator?: string;
  battery?: string;
  licenseLight?: string;
  fuseSpec?: string;
  sparkPlug?: string;
  // Legacy combined field, kept for old data only — not exposed in the admin form
  brakes?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  category: 'scooter' | 'bike';
  subCategory: string;
  price: number;
  image: string;
  images: string[];
  colors: string[];
  images360: string[];
  description: string;
  capacity?: string;
  power?: string;
  speed?: string;
  cooling?: string;
  catalogPdf?: string;
  videoUrl?: string;
  specifications: ProductSpecifications;
  inStock: boolean;
  isNew: boolean;
}

// ---------- Spare Parts ----------
// Mirrors the real 10-category keyword taxonomy in lib/data/sparePartsCategories.ts (SPARE_PARTS_CATEGORIES),
// the same one the customer-facing spare parts catalog uses — kept in sync so admin and storefront agree.
export type SparePartCategory =
  | 'المحرك والكرتيرة'
  | 'الفرامل'
  | 'الهيكل والفيبر'
  | 'الكهربا والإضاءة'
  | 'التعليق والعجلات'
  | 'الفتيس والدبرياج'
  | 'الجادون والقيادة'
  | 'التبريد والزيت'
  | 'الشاسية والمسامير'
  | 'أكسسوار ومتفرقات';

export interface SparePart {
  id: string;
  sku: string;
  name: string;
  category: SparePartCategory;
  price: number;
  cost_price?: number;
  stock: number;
  compatible_model: string;
  brand?: string;
  rack_location?: string;
  warranty_period?: string;
  status?: 'active' | 'inactive';
}

// ---------- Showrooms ----------
export type ShowroomStatus = 'active' | 'maintenance' | 'coming_soon';

export type ShowroomType = 'flagship' | 'authorized' | 'service' | 'parts';

export interface Showroom {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  working_hours: string;
  status: ShowroomStatus;
  type: ShowroomType;
  whatsapp?: string;
  google_maps_url?: string;
  has_test_ride: boolean;
  has_maintenance: boolean;
  has_spare_parts: boolean;
  has_shipping: boolean;
  installment_options: string[];
  notes?: string;
  /** Optional real English translations for the free-text fields, shown when the UI language is English. */
  name_en?: string;
  address_en?: string;
  working_hours_en?: string;
}

// ---------- Orders ----------
export type OrderStatus = 'قيد المعالجة' | 'في الطريق' | 'تم التسليم' | 'معلق' | 'ملغي';

export interface Order {
  id: string;
  order_no: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  scooter_model: string;
  amount: number;
  created_at: string;
  payment_method: string;
  status: OrderStatus;
  chassis_no?: string;
  fawry_ref_number?: string;
}

// ---------- Customers ----------
export type CustomerTier = 'عميل ماسي' | 'عميل ذهبي' | 'عميل فضي' | 'عميل جديد';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  scooter?: string;
  total_spent: number;
  orders_count?: number;
  tier: CustomerTier;
}

// Real DB column (`test_rides.status`) is VARCHAR, seeded/written in Arabic — must match exactly
// what api/test-ride/index.php reads/writes, not an English vocabulary.
export interface TestRide {
  id: string;
  name: string;
  phone: string;
  email?: string;
  scooter_model: string;
  showroom: string;
  preferred_date: string;
  status: 'معلق' | 'مؤكد' | 'مكتمل' | 'ملغي';
  created_at: string;
}

// Real DB column (`contact_messages.status`) defaults to 'unread', not 'new'.
export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  created_at: string;
}

// ---------- Service & Warranty ----------
export type ServiceTicketStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface ServiceTicket {
  id: string;
  ticket_no: string;
  customer_name: string;
  customer_phone: string;
  scooter_model: string;
  chassis_no: string;
  service_type: string;
  showroom: string;
  status: ServiceTicketStatus;
  notes?: string;
  mileage?: number;
  cost?: number;
  delivery_time?: string;
  created_at: string;
}

// Real DB column (`warranty_registrations.status`) is an ENUM restricted to these exact Arabic
// values — writing anything else throws a PDOException (PDO::ERRMODE_EXCEPTION).
export type WarrantyStatus = 'فعّال' | 'قارب على الانتهاء' | 'منتهي' | 'ملغي';

export interface WarrantyItem {
  id: string;
  chassis_no: string;
  engine_no?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  scooter_model: string;
  scooter_color?: string;
  purchase_date: string;
  warranty_expiry: string;
  warranty_years: number;
  showroom: string;
  last_service_date?: string;
  next_service_date?: string;
  service_count?: number;
  mileage_km?: number;
  status: WarrantyStatus;
  notes?: string;
}

// ---------- Analytics ----------
export interface PageViewRecord {
  path: string;
  title: string;
  views_count: number;
  unique_visitors: number;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalUniqueVisitors: number;
  topPages: PageViewRecord[];
}

// ---------- Settings ----------
export interface ThemeColors {
  primary_color: string;
  primary_hover: string;
  text_primary: string;
  text_secondary: string;
  text_muted: string;
  bg_canvas: string;
  bg_surface: string;
}

export interface SiteContent {
  hero_title: string;
  hero_subtitle: string;
  banner_text: string;
  show_banner: boolean;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  footer_notice: string;
  maintenance_mode: boolean;
}

export type AdminSettings = ThemeColors & SiteContent;

// ---------- Generic API envelope ----------
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ---------- Dashboard overview ----------
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  lowStockCount: number;
  pendingServiceTickets: number;
  activeShowrooms: number;
}
