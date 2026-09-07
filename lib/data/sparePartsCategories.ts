/**
 * SYM Egypt — Spare Parts Categories
 * 10 categories with Arabic/English names, icons, and keyword matchers
 */

export interface SparePartCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  gradient: string;
  glowColor: string;
  keywords: string[];
}

export const SPARE_PARTS_CATEGORIES: SparePartCategory[] = [
  {
    id: 'engine',
    nameAr: 'المحرك والكرتيرة',
    nameEn: 'Engine & Crankcase',
    icon: '🔧',
    gradient: 'from-orange-950/40 to-red-950/40',
    glowColor: 'rgba(234,88,12,0.3)',
    keywords: [
      'كرنك', 'كرتير', 'بستم', 'شميز', 'سلندر', 'تاكيه', 'صباب',
      'ماتور', 'حدافة', 'روتور', 'كامة', 'راس سلندر', 'وش كهرباء',
      'طبة زيت', 'قله زيت', 'لافيه', 'شجرة تروس', 'ترس', 'كمال',
      'سيخ فتيس', 'انبوبة هواء', 'شورت بلوك',
      // English OEM part names (many current-lineup models — Husky, Joymax Z, CRUiSYM,
      // Fiddle 4, X-Wolf, Symphony ST(New), NHX, Jet 14 EVO — are catalogued in English,
      // not Arabic, so this category was silently matching almost nothing for them.
      'crank case', 'crankcase', 'crankshaft', 'crank shaft', 'crank', 'cranl case',
      'cylinder', 'cyl. head', 'cyl head', 'piston', 'cam shaft', 'camshaft',
      'cam sprocket', 'cam chain', 'valve', 'rocker arm', 'oil pump',
      'balance shaft', 'centrifugal disk', 'head cover', 'flywheel', 'fly wheel',
      'oil relief', 'headcover', 'breather', 'push plug', 'tensioner',
      'oil lever gauge', 'oil level gauge',
    ],
  },
  {
    id: 'brakes',
    nameAr: 'الفرامل',
    nameEn: 'Brakes',
    icon: '🛑',
    gradient: 'from-red-950/40 to-rose-950/40',
    glowColor: 'rgba(220,38,38,0.3)',
    keywords: [
      'تيل', 'فرامل', 'جشمة', 'طنبور', 'خزنة', 'دسك', 'ديسك',
      'فحمات', 'لقمة', 'رجل فرامل', 'سوسته فرامل', 'خرطوم باكم',
      'سلك فرامل', 'جلبة سيخ فرامل', 'باكم', 'كاليبر',
      'بنز سيخ فرامل', 'واير فرامل',
      'brake', 'caliper', 'brake disk', 'brake disc', 'abs detective', 'brake pad',
    ],
  },
  {
    id: 'body',
    nameAr: 'الهيكل والفيبر',
    nameEn: 'Body & Fairing',
    icon: '🏍',
    gradient: 'from-zinc-900/60 to-neutral-950/60',
    glowColor: 'rgba(161,161,170,0.2)',
    keywords: [
      'وش', 'جنب', 'رفرف', 'فيبر', 'فبرة', 'بلاستيك', 'كفر',
      'دواسة', 'غطاء', 'كرسي', 'شلتة', 'اسكرينة', 'حليه',
      'رفرف امامي', 'رفرف خلفي', 'وش امامي', 'جنب فبر',
      'لوحة', 'حامل بضائع', 'حامل دواسه', 'حامل معدني',
      'fender', 'panel', 'garnish', 'emblem', 'luggage box', 'wind screen',
      'windscreen', 'splash board', 'mudguard', 'floor mat', 'inner box',
      'inner tray', 'body cover', 'seat', 'reflector', 'grommet', 'floor panel',
      'front cover', 'rear cover', 'rr. cover', 'fr. cover', 'side cover',
      'center cover', 'top cover', 'down cover', 'inner cover', 'up cover',
      'stripe', 'lid', 'tray',
    ],
  },
  {
    id: 'electrical',
    nameAr: 'الكهربا والإضاءة',
    nameEn: 'Electrical & Lighting',
    icon: '⚡',
    gradient: 'from-yellow-950/40 to-amber-950/40',
    glowColor: 'rgba(234,179,8,0.25)',
    keywords: [
      'فانوس', 'اشارة', 'لمبة', 'كشاف', 'ملف', 'موبينة', 'شاحن',
      'بلاطة', 'بطارية', 'سلف', 'بادئ', 'مارش', 'ريليه', 'فيوز',
      'عداد', 'تابلوه', 'مفتاح', 'كونتاكت', 'انذار',
      'دينامو', 'ملف كهرباء', 'ملف شحن', 'head light', 'اسطب', 'فلاشة',
      'light', 'lamp', 'winker', 'ign coil', 'ign. coil', 'ignition coil',
      'battery', 'start motor', 'starter', 'relay', 'sensor', 'speedometer',
      'speedmeter', 'horn', 'ecu', 'cdi', 'c.d.i', 'wire harness', 'main sw',
      'handle sw', 'switch', 'fuse', 'meter', 'usb', 'stator', 'earth cable',
      'battery cable', 'anti-theft', 'hazard', 'high tension cord',
    ],
  },
  {
    id: 'suspension',
    nameAr: 'التعليق والعجلات',
    nameEn: 'Suspension & Wheels',
    icon: '🛞',
    gradient: 'from-blue-950/40 to-indigo-950/40',
    glowColor: 'rgba(59,130,246,0.25)',
    keywords: [
      'مساعد', 'مقص', 'جنط', 'كاوتش', 'إطار', 'اطار', 'طوق',
      'عجلة', 'كفرات', 'مساعدين', 'سوست',
      'مساعد امامي', 'مساعد خلفي', 'مقصات',
      'cushion', 'fork', 'wheel', 'tire', 'tyre', 'axle', 'rim valve',
    ],
  },
  {
    id: 'transmission',
    nameAr: 'الفتيس والدبرياج',
    nameEn: 'Transmission & Drive',
    icon: '⚙️',
    gradient: 'from-violet-950/40 to-purple-950/40',
    glowColor: 'rgba(139,92,246,0.25)',
    keywords: [
      'سير', 'دبرياج', 'كلتش', 'فارييتور', 'بلية', 'بلي',
      'كورونا', 'سحب', 'فتيس', 'جنزير', 'كاتينة', 'شداد',
      'اكس فتيس', 'اويسيل', 'اولسيه', 'oil seal', 'بلي دبرياج',
      'ورقة دبرياج', 'بكر', 'ثقالات', 'اسطوانة دبرياج',
      'clutch', 'pulley', 'drive belt', 'driven pulley', 'drive shaft',
      'counter shaft', 'counter gear', 'final gear', 'final shaft',
      'weight roller', 'reduction gear', 'starting clutch', 'mission cover',
      'mission', 'movable drive face', 'ramp plate', 'drive plate',
      'drive face', 'driven face',
    ],
  },
  {
    id: 'steering',
    nameAr: 'الجادون والقيادة',
    nameEn: 'Handlebar & Steering',
    icon: '🎛️',
    gradient: 'from-teal-950/40 to-cyan-950/40',
    glowColor: 'rgba(20,184,166,0.25)',
    keywords: [
      'جادون', 'رقبة', 'ظرف بلي', 'مقبض', 'جراب يد', 'يد يمين',
      'يد شمال', 'لوك', 'ابق', 'قفيز', 'رقبة جادون',
      'صاموله رقبه', 'مراية', 'مرايا', 'دركسيون', 'سلك غاز',
      'steering', 'strg.', 'handle', 'grip', 'mirror', 'stem comp',
      'wind arm', 'top bridge',
    ],
  },
  {
    id: 'cooling',
    nameAr: 'التبريد والزيت',
    nameEn: 'Cooling & Lubrication',
    icon: '🌡️',
    gradient: 'from-sky-950/40 to-blue-950/40',
    glowColor: 'rgba(14,165,233,0.25)',
    keywords: [
      'طرمبة', 'مضخة', 'ترموستات', 'مياه', 'تبريد',
      'فلتر', 'خرطوم', 'بنزين', 'طرمبة بنزين',
      'رشاش', 'كربيراتير', 'انجيكشن', 'بخاخ', 'فلتر زيت',
      'فلتر هواء', 'فلتر بنزين', 'بوجيه', 'شمعة',
      'radiator', 'water pump', 'water hose', 'thermostat', 'fuel', 'fule',
      'carb', 'carburetor', 'throttle', 'throt', 'air cleaner', 'air/c',
      'filter', 'muffler', 'exhaust', 'exh.', 'spark plug', 'reed valve',
      'inlet pipe', 'fuel tank', 'fuel pump', 'fuel injector', 'reserve tank',
      'cooling fan', 'fan cover', 'duct',
    ],
  },
  {
    id: 'chassis',
    nameAr: 'الشاسية والمسامير',
    nameEn: 'Chassis & Fasteners',
    icon: '🔩',
    gradient: 'from-stone-900/60 to-zinc-950/60',
    glowColor: 'rgba(120,113,108,0.25)',
    keywords: [
      'شاسية', 'هيكل', 'حمالة', 'استاند', 'شكمان', 'ماسورة',
      'علبة شكمان', 'وردة', 'مسمار', 'برغي', 'صامولة', 'جوايط',
      'بنز', 'خابور', 'رنديلة', 'جلبة', 'نص كراتيرا', 'حامل',
      'frame', 'bolt', 'nut', 'washer', 'bearing', 'brg.', 'o-ring', 'o ring',
      'collar', 'main stand', 'side stand', 'flange', 'rubber bush',
      'stand comp', 'stopper rubber', 'bearning', 'setting plate', 'gasket',
      'hanger bush', 'joint cap', 'outer ring',
    ],
  },
  {
    id: 'accessories',
    nameAr: 'أكسسوار ومتفرقات',
    nameEn: 'Accessories & Misc',
    icon: '✨',
    gradient: 'from-pink-950/40 to-rose-950/30',
    glowColor: 'rgba(236,72,153,0.2)',
    keywords: [],
  },
];

/** Auto-classify a spare part by its Arabic name */
export function categorizePart(name: string): string {
  // Collapse repeated whitespace — real OEM part names in the inventory sheet frequently
  // have double/triple spaces (e.g. "CRANK  CASE  GASKET"), which broke multi-word
  // keyword matches like "crank case" that assume a single space.
  const lower = name.toLowerCase().replace(/\s+/g, ' ');
  for (const cat of SPARE_PARTS_CATEGORIES) {
    if (cat.id === 'accessories') continue;
    if (cat.keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return cat.id;
    }
  }
  return 'accessories';
}

/** Get full category object by id */
export function getCategoryById(id: string): SparePartCategory {
  return (
    SPARE_PARTS_CATEGORIES.find((c) => c.id === id) ??
    SPARE_PARTS_CATEGORIES[SPARE_PARTS_CATEGORIES.length - 1]
  );
}

