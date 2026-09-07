/**
 * SYM Egypt — Spare Parts Model Map
 *
 * The spare-parts inventory (`SPARE_PARTS`) was imported from a real stock sheet, so its
 * `model` field is messy real-world data: inconsistent case, stray double spaces, and
 * abbreviations that don't literally match any of our product slugs (e.g. "get4" for
 * Jet 4, "F3 DD" for Fiddle 3). This file is the single place that resolves that raw
 * text into a clean, de-duplicated set of browsable model groups, linking each one to
 * its real product photo/page when the model is part of the current lineup.
 */
import { PRODUCTS } from './products';

export interface ModelGroup {
  /** Canonical, de-duplicated key (e.g. "HUSKY") */
  key: string;
  nameAr: string;
  nameEn: string;
  /** Real studio product photo, when this model is part of the current lineup */
  image?: string;
  /** Links the model card to its /scooter/[slug] product page */
  productSlug?: string;
  isCurrentLineup: boolean;
}

function normalizeModelKey(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').toUpperCase();
}

// Raw normalized inventory strings that refer to the same model as a canonical key below,
// captured from the actual distinct `model` values found in SPARE_PARTS.
const ALIASES: Record<string, string> = {
  'JET 14 AI': 'JET 14 EVO',
  'NHX ABS': 'NHX',
  'NH X ABS': 'NHX',
  'SYM NH X': 'NHX',
  'T1DD': 'SYM T1',
  'F4': 'FIDDLE 4',
  'F3 DD': 'FIDDLE 3',
  // "get4" appears 271 times with no corresponding "GET" model anywhere in SYM's lineup —
  // almost certainly a data-entry typo for "Jet 4" (g/j share the same QWERTY row).
  'GET4': 'JET 4',
  'SR150 / 200': 'SR 150',
  'NEW SR': 'SR 150',
  'NEW X WOLF': 'X WOLF',
};

const MODEL_INFO: Record<string, { nameAr: string; nameEn: string; productSlug?: string }> = {
  // ── Current lineup — linked to a real product page & photo ──
  'HUSKY': { nameAr: 'هاسكي ADV 200', nameEn: 'Husky ADV 200', productSlug: 'husky-adv' },
  'CRUISYM 400': { nameAr: 'كروزيم 400', nameEn: 'CRUiSYM 400', productSlug: 'cruisym-400i' },
  'CRUISYM 300': { nameAr: 'كروزيم 300', nameEn: 'CRUiSYM 300', productSlug: 'cruisym-300' },
  'JOYMAX Z': { nameAr: 'جوى ماكس Z 300', nameEn: 'Joymax Z 300', productSlug: 'joymax-z-300' },
  'JET X': { nameAr: 'جيت إكس 200', nameEn: 'Jet X 200', productSlug: 'jet-x-200' },
  'JET 14 EVO': { nameAr: 'جيت 14 إيفو', nameEn: 'Jet 14 EVO', productSlug: 'jet-14-evo' },
  'JET 14': { nameAr: 'جيت 14 DD', nameEn: 'Jet 14 DD 150/200', productSlug: 'jet-14-dd' },
  'JET 4': { nameAr: 'جيت 4', nameEn: 'Jet 4 150', productSlug: 'jet-4-150' },
  'NEW-ST': { nameAr: 'سيمفوني ST 200 (الجديد)', nameEn: 'Symphony ST 200 (New)', productSlug: 'symphony-st-new' },
  'ST': { nameAr: 'سيمفوني ST 150', nameEn: 'Symphony ST 150', productSlug: 'symphony-st-150' },
  'SR 150': { nameAr: 'سيمفوني SR 150', nameEn: 'Symphony SR 150', productSlug: 'symphony-sr-150' },
  'FIDDLE 4': { nameAr: 'فيدل 4', nameEn: 'Fiddle 4 150', productSlug: 'fiddle-4-150' },
  'FIDDLE 3': { nameAr: 'فيدل 3', nameEn: 'Fiddle 3 150', productSlug: 'fiddle-3-150' },
  'FIDDLE 2': { nameAr: 'فيدل 2', nameEn: 'Fiddle 2 150', productSlug: 'fiddle-2-150' },
  'ORBIT2': { nameAr: 'أوربيت II', nameEn: 'Orbit II 150', productSlug: 'orbit-2-150' },
  'NHX': { nameAr: 'NHX 200', nameEn: 'NHX 200', productSlug: 'nhx-200' },
  'SYM NH T/NH': { nameAr: 'NHT 300', nameEn: 'NHT 300', productSlug: 'nht-200' },
  'X WOLF': { nameAr: 'إكس وولف', nameEn: 'X-Wolf 150', productSlug: 'xwolf-300' },

  // ── Legacy / discontinued models still carried in inventory — no current product page ──
  'JOYRAID': { nameAr: 'جوي رايد', nameEn: 'Joyraid' },
  'GTS 300': { nameAr: 'GTS 300', nameEn: 'GTS 300' },
  'SYM T1': { nameAr: 'سيم T1', nameEn: 'SYM T1' },
  'S 150': { nameAr: 'سيمفوني S 150', nameEn: 'Symphony S 150' },
  'MAX 400': { nameAr: 'ماكس 400', nameEn: 'Max 400' },
  'MAX 500': { nameAr: 'ماكس 500', nameEn: 'Max 500' },
  'ADIVA': { nameAr: 'أديفا', nameEn: 'Adiva' },
  'SYM': { nameAr: 'قطع عامة لجميع الموديلات', nameEn: 'Universal Parts' },
  'HM': { nameAr: 'أخرى', nameEn: 'Other' },
};

export function resolveModelGroup(rawModel: string): ModelGroup {
  const norm = normalizeModelKey(rawModel || '');
  const canonicalKey = ALIASES[norm] || norm;
  const info = MODEL_INFO[canonicalKey];
  const product = info?.productSlug ? PRODUCTS.find((p) => p.slug === info.productSlug) : undefined;

  return {
    key: canonicalKey,
    nameAr: info?.nameAr || rawModel,
    nameEn: info?.nameEn || rawModel,
    image: product?.image,
    productSlug: info?.productSlug,
    isCurrentLineup: Boolean(info?.productSlug),
  };
}
