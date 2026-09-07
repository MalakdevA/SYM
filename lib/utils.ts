import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind utility function
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price with currency
export function formatPrice(price: number, currency: string = 'EGP'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

// Format date
export function formatDate(date: string | Date, locale: string = 'en-US'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

/** True when a "YYYY-MM-DD HH:MM:SS"-style timestamp is older than `hours` (default 24). */
export function isOverdue(createdAt: string, hours: number = 24): boolean {
  const created = new Date(createdAt.replace(' ', 'T'));
  if (Number.isNaN(created.getTime())) return false;
  return Date.now() - created.getTime() > hours * 60 * 60 * 1000;
}

// Generate slug from string
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Get image URL
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder.png';
  return path;
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Debounce function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Calculate reading time
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// Check if object is empty
export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

// Deep clone object
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function getProductImageScale(imageSrc: string): string {
  if (!imageSrc) return 'scale-105 sm:scale-108 group-hover:scale-115';
  const src = imageSrc.toLowerCase();
  if (src.includes('orbit') || src.includes('orbi') || src.includes('/o1.png')) {
    return 'scale-105 sm:scale-110 group-hover:scale-116';
  }
  if (src.includes('joy')) {
    return 'scale-108 sm:scale-112 group-hover:scale-118';
  }
  if (src.includes('cruisym')) {
    return 'scale-105 sm:scale-110 group-hover:scale-116';
  }
  return 'scale-105 sm:scale-108 group-hover:scale-115';
}

export function shouldFlipImageToFaceLeft(imageSrc: string): boolean {
  if (!imageSrc) return false;

  const src = imageSrc.toLowerCase();

  // ALL Jet X 200 images (black, blue, red, grey, white) face right in raw files,
  // so flip them horizontally (scaleX(-1)) to face LEFT as requested:
  if (src.includes('jet-x-200') || src.includes('jetx200')) {
    return true;
  }

  // ALL Orbit III DX 150 images (orbit2, orbi1, orbi3, orbi4, orbi.png) match the exact natural angle of the white variant — do NOT flip them (return false):
  if (
    src.includes('orbit2') ||
    src.includes('orbi1') ||
    src.includes('orbi3') ||
    src.includes('orbi4') ||
    src.includes('/orbi.png') ||
    src.endsWith('orbi.png') ||
    src.includes('orbit-3')
  ) {
    return false;
  }

  // Preserve Fiddle series (Fiddle 4, Fiddle 3, Fiddle 2) original natural direction — do NOT flip:
  if (
    src.includes('fiddle') ||
    src.includes('black 0') ||
    src.includes('blue 0') ||
    src.includes('white 0') ||
    src.includes('gray 0')
  ) {
    return false;
  }

  // Husky ADV color-variant photos (grey, white, black, gunmetal) already face LEFT
  // in their raw source files — do NOT flip them (return false):
  if (
    src.includes('husky-adv-grey') ||
    src.includes('husky-adv-white') ||
    src.includes('husky-adv-black') ||
    src.includes('husky-adv-gunmetal')
  ) {
    return false;
  }

  // ADX 300 official color gallery photos already face LEFT — do NOT flip them:
  if (src.includes('adx-300') || src.includes('adx300')) {
    return false;
  }

  // NHT 300 official color gallery photos already face LEFT — do NOT flip them
  // (checked before the generic 'nht' rule below, which flips the older NHT 200 photos):
  if (src.includes('nht-300') || src.includes('nht300')) {
    return false;
  }

  // Other specific models that face right:
  if (
    src.includes('husky') ||
    src.includes('husk') ||
    src.includes('jet14-evo') ||
    src.includes('jet14 evo') ||
    src.includes('jet14-dd') ||
    src.includes('jet14 dd') ||
    src.includes('jet4-main') ||
    src.includes('champang') ||
    src.includes('5 copy') ||
    src.includes('nhx') ||
    src.includes('nht')
  ) {
    return true;
  }

  // Images that naturally face LEFT in raw source files — do NOT flip them (return false):
  if (
    src.includes('xwolf') ||
    src.includes('/xw') ||
    src.includes('xw.png') ||
    src.includes('xw1') ||
    src.includes('xw2') ||
    src.includes('xw3') ||
    src.includes('xw4') ||
    src.includes('sr1') ||
    src.includes('sr2') ||
    src.includes('sr3') ||
    src.includes('sr4') ||
    src.includes('sr5') ||
    src.includes('sr6') ||
    src.includes('sr-150') ||
    src.includes('sr150') ||
    src.includes('sr-125') ||
    src.includes('sr125') ||
    src.includes('symphony-sr-125') ||
    src.includes('st1') ||
    src.includes('st2') ||
    src.includes('st3') ||
    src.includes('st4') ||
    src.includes('st5') ||
    src.includes('st-150') ||
    src.includes('old-st') ||
    src.includes('cruisym') ||
    src.includes('joy') ||
    src.includes('jet4b') ||
    src.includes('red jet4') ||
    src.includes('white jet4') ||
    src.includes('jet4 b') ||
    src.includes('/f1.png') ||
    src.includes('/f2.png') ||
    src.includes('/f3.png') ||
    src.includes('/f4.png') ||
    src.includes('/f5.png') ||
    src.includes('/o1.png') ||
    src.includes('/o2.png') ||
    src.includes('/o3.png') ||
    src.includes('/o4.png') ||
    src.includes('/o5.png') ||
    src.includes('orbit-2') ||
    src.includes('gray.png') ||
    src.includes('red.png') ||
    src.includes('white.png') ||
    src.includes('yellow.png')
  ) {
    return false;
  }

  // Default fallback for any unspecified image that faces right in raw files:
  return true;
}
