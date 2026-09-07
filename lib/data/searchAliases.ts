/**
 * SYM Egypt — Arabic Search Aliases
 *
 * Product names in the catalog (and the model field on spare parts) are stored in Latin/English
 * (e.g. "Husky ADV 200"), but customers naturally search in Arabic transliteration (e.g. "هاسكي").
 * A plain substring match on the English name never matches Arabic text, so search silently
 * returned nothing for the exact terms real customers type. This maps each product slug to the
 * common Arabic spellings people actually use.
 */
export const PRODUCT_ARABIC_ALIASES: Record<string, string[]> = {
  'cruisym-400i': ['كروزيم 400', 'كروسيم 400', 'كروزيم اربعمية', 'كروزيم'],
  'cruisym-300': ['كروزيم 300', 'كروسيم 300'],
  'joymax-z-300': ['جوي ماكس', 'جويماكس', 'جوي ماكس زد', 'جوى ماكس'],
  'husky-adv': ['هاسكي', 'هاسكى', 'هاسكي ادف', 'هاسكي أدف'],
  'jet-x-200': ['جيت اكس', 'جت اكس', 'جيت إكس'],
  'jet-14-evo': ['جيت 14 ايفو', 'جت 14 ايفو', 'جيت اربعتاشر ايفو', 'جيت ١٤ ايفو'],
  'jet-14-dd': ['جيت 14', 'جت 14', 'جيت اربعتاشر', 'جيت ١٤', 'جيت دي دي'],
  'jet-4-150': ['جيت 4', 'جت 4', 'جيت اربعة', 'جيت ٤'],
  'symphony-st-new': ['سيمفوني st', 'سيمفوني ست', 'سمفوني ست', 'سيمفوني اس تي'],
  'symphony-st-150': ['سيمفوني ست القديم', 'سمفوني ست القديم'],
  'symphony-sr-150': ['سيمفوني sr', 'سيمفوني اس ار', 'سمفوني sr'],
  'fiddle-4-150': ['فيدل 4', 'فيدل اربعة', 'فيدل ٤'],
  'fiddle-3-150': ['فيدل 3', 'فيدل تلاتة', 'فيدل ٣'],
  'fiddle-2-150': ['فيدل 2', 'فيدل اتنين', 'فيدل ٢'],
  'orbit-2-150': ['اوربيت 2', 'أوربيت 2', 'اوربيت اتنين'],
  'orbit-3-dx-150': ['اوربيت 3', 'أوربيت 3', 'اوربيت ثري', 'اوربيت تلاتة'],
  'nhx-200': ['ان اتش اكس', 'ان اكس', 'ان.اتش.اكس'],
  'nht-200': ['ان اتش تي', 'ان تي', 'ان.اتش.تي'],
  'xwolf-300': ['اكس وولف', 'اكس ولف', 'إكس وولف'],
};

/** Generic Arabic category terms that should surface every scooter or every bike. */
export const CATEGORY_ARABIC_ALIASES: { category: 'scooter' | 'bike'; terms: string[] }[] = [
  { category: 'scooter', terms: ['سكوتر', 'سكوترات', 'اسكوتر'] },
  { category: 'bike', terms: ['دراجة نارية', 'دباب', 'موتوسيكل', 'دراجات نارية'] },
];
