'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, Sparkles, ArrowLeft, Command, Lightbulb } from 'lucide-react';
import { PRODUCTS, searchProducts, bestTier } from '@/lib/data/products';
import { SPARE_PARTS } from '@/lib/data/spareParts';
import { resolveModelGroup } from '@/lib/data/sparePartsModelMap';
import { PRODUCT_ARABIC_ALIASES } from '@/lib/data/searchAliases';

interface SearchResult {
  id: string;
  name: string;
  url: string;
  category: string;
  price?: number;
  image?: string;
  type: 'scooter' | 'spare_part';
  model?: string;
}

interface RawCustomSparePart {
  id?: string;
  sku?: string;
  name: string;
  compatibleModel?: string;
  price?: number | string;
  stock?: number;
  image?: string;
}

/** Classic edit-distance — small enough inputs (search terms) that no library is warranted. */
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/** Every term a customer might type for a product: its own name plus its Arabic aliases. */
const SUGGESTION_CANDIDATES: string[] = PRODUCTS.flatMap((p) => [
  p.name,
  ...(PRODUCT_ARABIC_ALIASES[p.slug] || []),
]);

/** "Did you mean...?" — nearest known product/alias terms to a query with no direct hits. */
function findFuzzySuggestions(query: string, max = 5): string[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const threshold = Math.max(2, Math.ceil(q.length / 2));
  const scored = SUGGESTION_CANDIDATES
    .map((term) => ({ term, dist: levenshtein(q, term.toLowerCase()) }))
    .filter((s) => s.dist <= threshold)
    .sort((a, b) => a.dist - b.dist);

  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of scored) {
    if (seen.has(s.term)) continue;
    seen.add(s.term);
    out.push(s.term);
    if (out.length >= max) break;
  }
  return out;
}

const POPULAR_TAGS = [
  { label: 'Husky ADV 200', query: 'Husky' },
  { label: 'Cruisym 300', query: 'Cruisym' },
  { label: 'Jet 14 EVO', query: 'Jet 14' },
  { label: 'Fiddle 3', query: 'Fiddle' },
  { label: 'تيل فرامل', query: 'فرامل' },
  { label: 'فلتر زيت', query: 'فلتر' },
  { label: 'سير فتيس', query: 'سير' },
];

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Close search on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close search on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    startTransition(() => {
      const q = searchQuery.toLowerCase().trim();
      // Short fragments (still mid-typing a name) only match on the start of a word — plain
      // "appears anywhere" matching against thousands of spare-part names turns 2-3 letters
      // into noise (e.g. "ha" matching "mecHAnical", "SHAft", "cHAmber" — none of them Husky).
      const maxTier = q.length < 3 ? 1 : 2;

      // 1. Search Scooters
      const scooterItems: (SearchResult & { tier: number })[] = searchProducts(q).map((item) => ({
        id: item.id,
        name: item.name,
        url: `/scooter/${item.slug}`,
        category: 'سكوتر / دراجة',
        price: item.price,
        image: item.image,
        type: 'scooter' as const,
        model: item.category,
        // Re-derive the same tier searchProducts used internally, so scooters interleave
        // correctly with spare parts once both are merged and re-sorted below.
        tier: bestTier(
          [item.name, item.slug, item.subCategory, item.capacity, ...(PRODUCT_ARABIC_ALIASES[item.slug] || [])],
          q
        ) ?? 2,
      }));

      // 2. Search Spare Parts
      const spareMatches: (SearchResult & { tier: number })[] = [];
      let partsPool = SPARE_PARTS;
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('sym_spare_parts_custom');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              partsPool = parsed.map((p: RawCustomSparePart, idx: number) => ({
                id: p.id || `custom-sp-${idx}`,
                itemNo: idx + 1,
                internalCode: p.sku || 'SYM-SP-00',
                name: p.name,
                externalCode1: p.sku || 'SYM-SP-00',
                externalCode2: p.sku || 'SYM-SP-00',
                model: p.compatibleModel || 'جميع الموديلات',
                price: Number(p.price) || 0,
                inStock: (p.stock ?? 0) > 0,
                image: p.image,
              }));
            }
          }
        } catch (e) {}
      }

      const seenModelKeys = new Set<string>();
      for (const part of partsPool) {
        const group = resolveModelGroup(part.model);
        // A hit on the part's own name/code is a much stronger signal than a hit on its
        // model name — score them separately so a real part match always outranks a model
        // match, and so short fragments can suppress noisy part-name matches (tier 2) while
        // still allowing a clean model-name prefix match through.
        const directTier = bestTier([part.name, part.internalCode, part.externalCode1], q);
        const modelTier = bestTier([part.model, group.nameAr, group.nameEn], q);
        const hasDirectMatch = directTier !== null && directTier <= maxTier;
        const hasModelMatch = modelTier !== null && modelTier <= maxTier;
        if (!hasDirectMatch && !hasModelMatch) continue;

        // Once we've shown one hit for a model (very common on a model-name search like
        // "هاسكي"), point the rest of that model's matches at the same model page instead
        // of flooding the list with near-duplicate rows.
        if (!hasDirectMatch && seenModelKeys.has(group.key)) continue;
        seenModelKeys.add(group.key);

        const tier = Math.min(directTier ?? 99, modelTier ?? 99);
        spareMatches.push({
          id: part.id,
          name: part.name,
          url: `/spare-parts?model=${encodeURIComponent(group.key)}`,
          category: `قطع غيار أصلية · ${group.nameAr}`,
          price: part.price,
          image: part.image || '/SymLogo-S-red.png',
          type: 'spare_part' as const,
          model: group.nameAr,
          tier,
        });
      }

      const typeRank = (t: SearchResult['type']) => (t === 'scooter' ? 0 : 1);
      const combined = [...scooterItems, ...spareMatches]
        .sort((a, b) => a.tier - b.tier || typeRank(a.type) - typeRank(b.type))
        .slice(0, 20)
        .map(({ tier: _tier, ...rest }) => rest);
      setResults(combined);
      setSuggestions(combined.length === 0 ? findFuzzySuggestions(q) : []);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/all-models?search=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  return (
    <div ref={searchRef} className="relative">
      {/* Search Button Header Icon */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 rounded-full bg-zinc-900/80 hover:bg-[#E60012] border border-zinc-800 hover:border-[#E60012] text-zinc-300 hover:text-white flex items-center justify-center transition-all duration-300 shadow-md group focus:outline-none"
        aria-label="بحث السكوترات وقطع الغيار"
        title="بحث السكوترات وقطع الغيار"
      >
        <Search className="w-4 h-4 transition-transform group-hover:scale-110" />
      </button>

      {/* Modern Search Overlay Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-8 sm:pt-16 px-4">
          {/* Dark Glass Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />

          {/* Search Box Card */}
          <div className="relative w-full max-w-3xl bg-[#0A0A0A]/95 border border-zinc-800 rounded-3xl shadow-[0_0_60px_rgba(230,0,18,0.25)] overflow-hidden transition-all duration-300 dir-rtl" dir="rtl">
            {/* Top Glowing Edge Bar */}
            <div className="h-1 w-full bg-gradient-to-r from-[#E60012] via-rose-500 to-[#E60012]" />

            {/* Input Header Area */}
            <form onSubmit={handleSubmit} className="relative flex items-center p-4 sm:p-5 border-b border-zinc-800/80 bg-zinc-950/60">
              <div className="w-10 h-10 rounded-xl bg-[#E60012]/10 border border-[#E60012]/30 flex items-center justify-center text-[#E60012] ml-3 flex-shrink-0">
                <Search className="w-5 h-5" />
              </div>

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="ابحث عن موديل سكوتر أو قطعة غيار (Husky, Cruisym, تيل فرامل)..."
                className="w-full text-sm sm:text-base font-semibold text-white placeholder:text-zinc-500 bg-transparent focus:outline-none"
              />

              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                  }}
                  className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 rounded-lg">
                  <Command className="w-3 h-3" /> ESC
                </kbd>
              )}
            </form>

            {/* Popular Search Tags / Suggestions */}
            {!query && (
              <div className="p-5 space-y-3 bg-zinc-950/30">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                  <Sparkles className="w-3.5 h-3.5 text-[#E60012]" />
                  <span>الكلمات الأكثر بحثاً الآن:</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {POPULAR_TAGS.map((tag) => (
                    <button
                      key={tag.label}
                      type="button"
                      onClick={() => handleSearch(tag.query)}
                      className="px-3 py-1.5 bg-zinc-900/90 hover:bg-[#E60012]/20 border border-zinc-800 hover:border-[#E60012]/40 text-xs font-semibold text-zinc-300 hover:text-white rounded-xl transition-all duration-200"
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results List */}
            {query && (
              <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2 divide-y divide-zinc-900">
                {isPending ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <div className="w-8 h-8 border-2 border-[#E60012] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-zinc-400">جاري البحث في قاعدة البيانات...</span>
                  </div>
                ) : results.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-[11px] text-zinc-500 px-2 font-mono">
                      تم العثور على ({results.length}) نتيجة بحث:
                    </div>

                    {results.map((item) => (
                      <Link
                        key={item.id}
                        href={item.url}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-4 p-3 hover:bg-zinc-900/80 rounded-2xl border border-transparent hover:border-zinc-800 transition-all duration-200 group"
                      >
                        <div className="relative w-14 h-14 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                          <Image
                            src={item.image || '/SymLogo-S-red.png'}
                            alt={item.name}
                            fill
                            className="object-contain p-1 group-hover:scale-105 transition-transform"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white group-hover:text-[#E60012] transition-colors truncate">
                              {item.name}
                            </h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                item.type === 'scooter'
                                  ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                                  : 'bg-blue-950/80 text-blue-300 border-blue-800/60'
                              }`}
                            >
                              {item.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                            {item.model && <span className="font-mono text-zinc-500">{item.model}</span>}
                            {item.type !== 'spare_part' && item.price && item.price > 0 && (
                              <span className="font-bold text-white">{item.price.toLocaleString('ar-EG')} ج.م</span>
                            )}
                          </div>
                        </div>

                        <ArrowLeft className="w-4 h-4 text-zinc-600 group-hover:text-[#E60012] group-hover:-translate-x-1 transition-all flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-zinc-500">
                      <Search className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-zinc-300">لم نجد نتائج مطابقة لـ &quot;{query}&quot;</p>
                      <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                        تأكد من كتابة اسم السكوتر أو رقم قطعة الغيار بشكل صحيح، أو تواصل مع خدمة العملاء للحجز المباشر.
                      </p>
                    </div>

                    {suggestions.length > 0 && (
                      <div className="pt-1 space-y-2">
                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-zinc-400">
                          <Lightbulb className="w-3.5 h-3.5 text-[#E60012]" />
                          <span>هل تقصد:</span>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          {suggestions.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => handleSearch(s)}
                              className="px-3 py-1.5 bg-zinc-900/90 hover:bg-[#E60012]/20 border border-zinc-800 hover:border-[#E60012]/40 text-xs font-semibold text-zinc-300 hover:text-white rounded-xl transition-all duration-200"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
