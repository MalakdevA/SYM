// Feature toggles
// Purchasing is enabled — customers add to cart and order via WhatsApp.
export const PURCHASING_ENABLED = true;

// Color Palette
export const COLORS = {
  primary: {
    red: '#E60012',
    black: '#000000',
    white: '#FFFFFF',
  },
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },
} as const;

// Breakpoints (matching Tailwind defaults)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1440,
} as const;

// Application Limits
export const LIMITS = {
  maxProductsPerPage: 12,
  maxBlogsPerPage: 9,
  maxSearchResults: 50,
  maxComparisonProducts: 4,
  maxGalleryImages: 10,
  maxFileUploadSize: 5 * 1024 * 1024, // 5MB
  maxImageUploadSize: 10 * 1024 * 1024, // 10MB
} as const;

// Product Status
export const PRODUCT_STATUS = {
  draft: 'draft',
  published: 'published',
} as const;

// Stock Status
export const STOCK_STATUS = {
  in_stock: 'in_stock',
  out_of_stock: 'out_of_stock',
  pre_order: 'pre_order',
} as const;

// Blog Status
export const BLOG_STATUS = {
  draft: 'draft',
  published: 'published',
  scheduled: 'scheduled',
} as const;

// Dealer Services
export const DEALER_SERVICES = {
  sales: 'sales',
  service: 'service',
  parts: 'parts',
  test_rides: 'test_rides',
} as const;

// Lead Status
export const LEAD_STATUS = {
  pending: 'pending',
  contacted: 'contacted',
  qualified: 'qualified',
  converted: 'converted',
  rejected: 'rejected',
} as const;

// Testimonial Status
export const TESTIMONIAL_STATUS = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
} as const;

// Media Types
export const MEDIA_TYPES = {
  image: 'image',
  video: 'video',
} as const;

// Allowed File Extensions
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const;
export const ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx'] as const;

// SEO Defaults
export const SEO_DEFAULTS = {
  siteName: 'SYM Egypt',
  siteUrl: 'https://symegypt.com',
  locale: 'en_US',
  type: 'website',
  twitterCard: 'summary_large_image',
  defaultTitle: 'SYM Egypt - Premium Scooters & Motorcycles',
  defaultDescription: 'Discover premium electric scooters and motorcycles from SYM Egypt. Explore our range of high-performance vehicles designed for modern urban mobility.',
  defaultOgImage: '/og-image.png',
} as const;

// Social Media Links
export const SOCIAL_MEDIA = {
  facebook: 'https://www.facebook.com/share/1D4YAV4pSp/?mibextid=wwXIfr',
  instagram: 'https://www.instagram.com/sym_egypt_scooters?igsh=dmMwNml5a25qdDM4',
  tiktok: 'https://www.tiktok.com/@sym.hammers?_r=1&_t=ZS-98XiXssVcu5',
  whatsapp: 'https://wa.me/201279881123',
} as const;

// Contact Information
export const CONTACT_INFO = {
  phone: '01279881123',
  whatsapp: '201279881123',
  email: 'info@symegypt.com',
  address: 'Cairo, Egypt',
  supportEmail: 'support@symegypt.com',
  salesEmail: 'sales@symegypt.com',
} as const;

// Animation Durations (in seconds)
export const ANIMATION_DURATION = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slider: 5,
} as const;

// Routes
export const ROUTES = {
  home: '/',
  products: '/products',
  productDetail: (slug: string) => `/products/${slug}`,
  productCompare: '/products/compare',
  blogs: '/news',
  blogDetail: (slug: string) => `/news/${slug}`,
  dealers: '/dealers',
  about: '/about',
  contact: '/contact',
  faq: '/faq',
  warranty: '/warranty',
  careers: '/careers',
  dashboard: '/dashboard',
  dashboardProducts: '/dashboard/products',
  dashboardCategories: '/dashboard/categories',
  dashboardBlogs: '/dashboard/blogs',
  dashboardDealers: '/dashboard/dealers',
  dashboardMedia: '/dashboard/media',
  dashboardLeads: '/dashboard/leads',
} as const;
