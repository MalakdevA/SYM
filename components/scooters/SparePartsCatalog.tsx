'use client';

import React, { useState, useMemo, useRef } from 'react';
import { SPARE_PARTS, SparePartItem } from '@/lib/data/spareParts';
import {
  SPARE_PARTS_CATEGORIES,
  categorizePart,
  getCategoryById,
} from '@/lib/data/sparePartsCategories';
import { resolveModelGroup, ModelGroup } from '@/lib/data/sparePartsModelMap';
import { CategoryCard } from './CategoryCard';
import { ModelCard } from './ModelCard';
import { PartCard } from './PartCard';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fetchApiCached } from '@/lib/api';
import {
  Search, ChevronLeft, ChevronRight, RefreshCcw, X,
  SlidersHorizontal, ArrowUpDown, Tag, Wrench, ExternalLink,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const WA_NUMBER = '201271384149';
const ITEMS_PER_PAGE = 24;

interface RawCustomSparePart {
  id?: string;
  sku?: string;
  name: string;
  compatibleModel?: string;
  price?: number | string;
  stock?: number;
  image?: string;
}

export function SparePartsCatalog() {
  const { language, dir } = useLanguage();
  const isAr = language === 'ar';

  // Model-first navigation: null = browsing the model grid, set = viewing one model's parts.
  // Deep-linkable via /spare-parts?model=<canonical key> (used by the header search results).
  // Deliberately NOT next/navigation's useSearchParams(): on a static export (output: 'export')
  // that hook forces its whole Suspense boundary to skip prerendering and stay hidden until
  // client JS hydrates, which shipped this entire page with empty initial HTML. Reading
  // window.location.search in a plain effect (client-only, no Suspense involvement) gets the
  // same deep link without that cost.
  const [activeModelKey, setActiveModelKey] = useState<string | null>(null);
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const model = new URLSearchParams(window.location.search).get('model');
    // Intentional: syncing from the URL, an external system unavailable during static
    // prerendering — this effect is the only safe place to read it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (model) setActiveModelKey(model);
  }, []);
  const [modelSearchTerm, setModelSearchTerm] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCodeGroup, setSelectedCodeGroup] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'DEFAULT' | 'CODE' | 'NAME' | 'PRICE_ASC' | 'PRICE_DESC'>('DEFAULT');
  const [priceFilter, setPriceFilter] = useState<'ALL' | 'PRICED' | 'INQUIRY_ONLY'>('ALL');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const searchRef = useRef<HTMLInputElement>(null);

  const [partsList, setPartsList] = useState<SparePartItem[]>(SPARE_PARTS);

  React.useEffect(() => {
    const sync = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('sym_spare_parts_custom');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const customMapped: SparePartItem[] = parsed.map((p: RawCustomSparePart, idx: number) => ({
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
              setPartsList(customMapped);
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    };
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
    };
  }, []);

  // Merge in real backend-managed spare parts (added/edited via the admin panel)
  React.useEffect(() => {
    interface DbSparePart {
      id: string;
      sku?: string;
      name: string;
      category?: string;
      price: number | string;
      stock: number | string;
      compatible_model?: string;
      image?: string;
    }

    fetchApiCached<DbSparePart[]>('/spare-parts/index.php').then((res) => {
      if (!res.success || !Array.isArray(res.data) || res.data.length === 0) return;

      setPartsList((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const fromDb: SparePartItem[] = res.data!
          .filter((p) => !existingIds.has(p.id))
          .map((p, idx) => ({
            id: p.id,
            itemNo: prev.length + idx + 1,
            internalCode: p.sku || 'SYM-SP-00',
            name: p.name,
            externalCode1: p.sku || 'SYM-SP-00',
            externalCode2: p.sku || 'SYM-SP-00',
            model: p.compatible_model || 'جميع الموديلات',
            price: Number(p.price) || 0,
            inStock: Number(p.stock) > 0,
            image: p.image,
          }));
        return fromDb.length > 0 ? [...fromDb, ...prev] : prev;
      });
    }).catch(() => {
      // Backend unreachable — keep serving the bundled static catalog
    });
  }, []);

  // Resolve each part's category + canonical model group once
  const partsEnriched = useMemo(() =>
    partsList.map((p) => ({ ...p, categoryId: categorizePart(p.name), group: resolveModelGroup(p.model) })),
    [partsList]
  );

  // ── Model groups (the "browse by model" grid) ──
  const modelGroups = useMemo(() => {
    const map = new Map<string, { group: ModelGroup; count: number }>();
    for (const p of partsEnriched) {
      const existing = map.get(p.group.key);
      if (existing) existing.count += 1;
      else map.set(p.group.key, { group: p.group, count: 1 });
    }
    const all = Array.from(map.values());
    // Current lineup first (alphabetical), then legacy/other models by part count
    const current = all.filter((m) => m.group.isCurrentLineup).sort((a, b) => a.group.nameEn.localeCompare(b.group.nameEn));
    const legacy = all.filter((m) => !m.group.isCurrentLineup).sort((a, b) => b.count - a.count);
    return [...current, ...legacy];
  }, [partsEnriched]);

  // Totals for the hero subtitle, scoped to what's actually browsable (current lineup only) —
  // showing the full 6,292-part / 27-model count here would be misleading once the grid below
  // only lists the current lineup.
  const currentLineupStats = useMemo(() => {
    const current = modelGroups.filter((m) => m.group.isCurrentLineup);
    return { models: current.length, parts: current.reduce((sum, m) => sum + m.count, 0) };
  }, [modelGroups]);

  // The browsable grid shows only the current lineup — models actually sold today. Legacy /
  // discontinued models (Joyraid, GTS 300, SYM T1, Universal Parts, ...) still exist in
  // `modelGroups` and stay reachable via direct search or a deep link, they just don't
  // clutter the "pick your model" grid with a wall of generic wrench-icon placeholders.
  const filteredModelGroups = useMemo(() => {
    const q = modelSearchTerm.trim().toLowerCase();
    const current = modelGroups.filter((m) => m.group.isCurrentLineup);
    if (!q) return current;
    return current.filter(({ group }) =>
      group.nameAr.toLowerCase().includes(q) || group.nameEn.toLowerCase().includes(q)
    );
  }, [modelGroups, modelSearchTerm]);

  const activeModel = useMemo(
    () => modelGroups.find((m) => m.group.key === activeModelKey)?.group ?? null,
    [modelGroups, activeModelKey]
  );

  // Parts scoped to the selected model only
  const modelParts = useMemo(() => {
    if (!activeModelKey) return [];
    return partsEnriched.filter((p) => p.group.key === activeModelKey);
  }, [partsEnriched, activeModelKey]);

  // Category counts within the active model
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { ALL: modelParts.length };
    modelParts.forEach(({ categoryId }) => {
      map[categoryId] = (map[categoryId] ?? 0) + 1;
    });
    return map;
  }, [modelParts]);

  // Filtered and Sorted parts (within the active model)
  const filteredParts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    let result = modelParts.filter((item) => {
      if (selectedCategory !== 'ALL' && item.categoryId !== selectedCategory) return false;

      // Code group filtering (first 2 digits of OEM part number)
      if (selectedCodeGroup !== 'ALL') {
        const mainCode = item.externalCode1 || item.externalCode2 || item.internalCode;
        const prefix2 = mainCode.split('-')[0].substring(0, 2);
        if (selectedCodeGroup === '11000' && prefix2 !== '11') return false;
        if (selectedCodeGroup === '12000' && prefix2 !== '12') return false;
        if (selectedCodeGroup === '13000' && prefix2 !== '13') return false;
        if (selectedCodeGroup === '14000' && prefix2 !== '14') return false;
        if (selectedCodeGroup === '16000' && prefix2 !== '16' && prefix2 !== '17') return false;
        if (selectedCodeGroup === '33000' && prefix2 !== '33' && prefix2 !== '35' && prefix2 !== '38') return false;
        if (selectedCodeGroup === '43000' && prefix2 !== '43' && prefix2 !== '45') return false;
        if (selectedCodeGroup === '50000' && prefix2 !== '50' && prefix2 !== '64' && prefix2 !== '83') return false;
      }

      const itemObj = item as unknown as Record<string, unknown>;
      const isUnpriced = Boolean(!item.price || item.price <= 0 || itemObj.unpriced);
      if (priceFilter === 'PRICED' && isUnpriced) return false;
      if (priceFilter === 'INQUIRY_ONLY' && !isUnpriced) return false;

      if (query) {
        return (
          item.name.toLowerCase().includes(query) ||
          item.internalCode.toLowerCase().includes(query) ||
          item.externalCode1.toLowerCase().includes(query)
        );
      }
      return true;
    });

    // Apply Sorting
    if (sortBy === 'CODE') {
      result = [...result].sort((a, b) => (a.externalCode1 || a.internalCode).localeCompare(b.externalCode1 || b.internalCode));
    } else if (sortBy === 'NAME') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    } else if (sortBy === 'PRICE_ASC') {
      result = [...result].sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'PRICE_DESC') {
      result = [...result].sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return result;
  }, [modelParts, searchTerm, selectedCategory, selectedCodeGroup, priceFilter, sortBy]);

  const totalPages = Math.ceil(filteredParts.length / ITEMS_PER_PAGE) || 1;
  const paginatedParts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredParts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredParts, currentPage]);

  const resetAll = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setSelectedCodeGroup('ALL');
    setSortBy('DEFAULT');
    setPriceFilter('ALL');
    setCurrentPage(1);
  };

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const openModel = (key: string) => {
    setActiveModelKey(key);
    resetAll();
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const backToModels = () => {
    setActiveModelKey(null);
    resetAll();
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openWhatsApp = (msg: string) => {
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const generalWaMsg = isAr
    ? 'مرحباً SYM مصر 👋\nأريد الاستفسار عن قطع الغيار\nهل يوجد توصيل لجميع المحافظات؟'
    : 'Hello SYM Egypt 👋\nI want to inquire about spare parts.\nDo you deliver nationwide?';

  return (
    <section className="w-full min-h-screen pb-32 font-sans bg-[#030306] relative overflow-hidden" dir={dir}>

      {/* ── AMBIENT NEBULA BACKGROUND (matches the About page's premium dark aesthetic) ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 50, -50, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-36 left-1/2 -translate-x-1/2 w-[1400px] h-[750px] bg-[radial-gradient(ellipse_at_center,rgba(230,0,18,0.20)_0%,rgba(150,0,15,0.08)_50%,transparent_80%)] blur-[140px] opacity-80 will-change-transform transform-gpu"
        />
        <motion.div
          animate={{ x: [0, -70, 70, 0], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 -left-36 w-[850px] h-[850px] bg-[radial-gradient(circle,rgba(220,0,18,0.14)_0%,rgba(110,0,10,0.06)_55%,transparent_80%)] blur-[160px] will-change-transform transform-gpu"
        />
      </div>

      <div className="relative z-10">
        {/* ── MINIMAL HEADER — only on the model grid step; the model-parts step has its own header (back bar) ── */}
        {!activeModel && (
          <div className="pt-28 pb-2 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto text-center">
              <p className="text-[#E60012] text-xs font-bold uppercase tracking-[0.25em] mb-3">
                {isAr ? 'قطع غيار SYM الأصلية' : 'Official SYM Spare Parts'}
              </p>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
                {isAr ? 'اختر موديلك' : 'Choose Your Model'}
              </h1>
              <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
                {isAr
                  ? `دوس على موديلك وشوف كل قطع غياره (${currentLineupStats.parts.toLocaleString('en-US')} قطعة عبر ${currentLineupStats.models} موديل)، مقسّمة حسب النوع.`
                  : `Click your model to see all of its genuine parts (${currentLineupStats.parts.toLocaleString('en-US')} parts across ${currentLineupStats.models} models), sorted by category.`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-8 space-y-6 relative z-10 ${activeModel ? 'pt-28' : 'pt-8'}`}>

        {!activeModel ? (
          // ═══════════════════ MODEL GRID (step 1) ═══════════════════
          <>
            <div className="relative max-w-xl mx-auto mb-2">
              <Search className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500`} />
              <input
                type="text"
                value={modelSearchTerm}
                onChange={(e) => setModelSearchTerm(e.target.value)}
                placeholder={isAr ? 'ابحث عن موديلك...' : 'Search for your model...'}
                className={`w-full ${isAr ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 text-sm font-medium focus:outline-none focus:border-[#E60012] focus:ring-1 focus:ring-[#E60012]/30 transition-all`}
              />
            </div>

            <p className="text-xs font-black text-zinc-500 uppercase tracking-widest px-1">
              {isAr ? `اختر موديلك (${filteredModelGroups.length})` : `Choose Your Model (${filteredModelGroups.length})`}
            </p>

            {filteredModelGroups.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredModelGroups.map(({ group, count }) => (
                  <ModelCard
                    key={group.key}
                    group={group}
                    count={count}
                    language={language}
                    onClick={() => openModel(group.key)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Wrench className="w-12 h-12 text-zinc-700 mb-4" />
                <p className="text-zinc-400 text-base font-medium">
                  {isAr ? 'لا يوجد موديل مطابق للبحث' : 'No model matches your search'}
                </p>
              </div>
            )}
          </>
        ) : (
          // ═══════════════════ MODEL PARTS (step 2) ═══════════════════
          <>
            {/* Back bar + model header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5">
              <button
                type="button"
                onClick={backToModels}
                className="flex-shrink-0 flex items-center gap-1.5 self-start px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold rounded-xl border border-zinc-800 transition-colors"
              >
                {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                <span>{isAr ? 'كل الموديلات' : 'All Models'}</span>
              </button>

              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center">
                  {activeModel.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={activeModel.image} alt={isAr ? activeModel.nameAr : activeModel.nameEn} className="w-full h-full object-contain p-1" />
                  ) : (
                    <Wrench className="w-6 h-6 text-zinc-600" />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-white font-black text-lg truncate">{isAr ? activeModel.nameAr : activeModel.nameEn}</h2>
                  <p className="text-zinc-500 text-xs font-medium">
                    {modelParts.length.toLocaleString('en-US')} {isAr ? 'قطعة غيار متاحة' : 'spare parts available'}
                  </p>
                </div>
              </div>

              {activeModel.productSlug && (
                <Link
                  href={`/scooter/${activeModel.productSlug}`}
                  className="flex-shrink-0 self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold rounded-xl border border-zinc-800 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{isAr ? 'صفحة الموديل' : 'Model Page'}</span>
                </Link>
              )}
            </div>

            {/* Category rail — scoped to this model */}
            <div>
              <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3 px-1">
                {isAr ? 'تصفح حسب التصنيف' : 'Browse by Category'}
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => handleCategoryClick('ALL')}
                  className={`flex-shrink-0 flex flex-col items-start w-36 sm:w-40 rounded-2xl p-4 border transition-all duration-200 ${
                    selectedCategory === 'ALL'
                      ? 'border-[#E60012]/70 bg-[#E60012]/10'
                      : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1 ${
                    selectedCategory === 'ALL' ? 'bg-white/10' : 'bg-zinc-900'
                  }`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${selectedCategory === 'ALL' ? 'text-[#E60012]' : 'text-zinc-400'}`}>
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                    </svg>
                  </div>
                  <p className={`text-xs font-black tracking-wide ${selectedCategory === 'ALL' ? 'text-[#E60012]' : 'text-white'}`}>
                    {isAr ? 'جميع القطع' : 'All Parts'}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-medium mt-0.5">{isAr ? 'All Catalog' : 'الكل'}</p>
                  <span className={`mt-2 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                    selectedCategory === 'ALL'
                      ? 'bg-white/10 border-[#E60012]/40 text-[#E60012]'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                  }`}>
                    {modelParts.length.toLocaleString('en-US')} {isAr ? 'قطعة' : 'parts'}
                  </span>
                </button>

                {SPARE_PARTS_CATEGORIES.filter((cat) => (categoryCounts[cat.id] ?? 0) > 0).map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    count={categoryCounts[cat.id] ?? 0}
                    isActive={selectedCategory === cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    language={language}
                  />
                ))}
              </div>
            </div>

            {/* Search + Precision Filter Bar */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">

              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500`} />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder={isAr ? `ابحث داخل قطع ${activeModel.nameAr}...` : `Search within ${activeModel.nameEn} parts...`}
                    className={`w-full ${isAr ? 'pr-11 pl-24' : 'pl-11 pr-24'} py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 text-sm font-medium focus:outline-none focus:border-[#E60012] focus:ring-1 focus:ring-[#E60012]/30 transition-all`}
                  />
                  <div className={`absolute ${isAr ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 flex items-center gap-1.5`}>
                    {searchTerm && (
                      <button onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                        className="p-1 text-zinc-500 hover:text-white transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className="hidden sm:inline-flex items-center text-[10px] font-black bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md border border-zinc-700">
                      {filteredParts.length.toLocaleString('en-US')} {isAr ? 'قطعة' : 'parts'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-bold rounded-xl transition-all border ${
                      showAdvancedFilters
                        ? 'bg-[#E60012] text-white border-[#E60012]'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
                    }`}
                  >
                    <SlidersHorizontal className={`w-4 h-4 ${showAdvancedFilters ? 'text-white' : 'text-[#E60012]'}`} />
                    <span>{isAr ? 'التصفية الدقيقة' : 'Precision Filters'}</span>
                  </button>

                  {(searchTerm || selectedCategory !== 'ALL' || selectedCodeGroup !== 'ALL' || sortBy !== 'DEFAULT') && (
                    <button onClick={resetAll}
                      className="flex items-center gap-1.5 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-red-400 hover:text-red-300 text-xs font-bold rounded-xl transition-colors border border-zinc-800 flex-shrink-0">
                      <RefreshCcw className="w-3.5 h-3.5" />
                      <span>{isAr ? 'مسح الكل' : 'Reset'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Precision Technical Filters Panel */}
              {showAdvancedFilters && (
                <div className="border-t border-zinc-800 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                      <Tag className="w-3 h-3 text-[#E60012]" />
                      {isAr ? 'تصفية حسب كود المجموعة الميكانيكية (OEM Prefix):' : 'Filter by OEM Code Group:'}
                    </label>
                    <select
                      value={selectedCodeGroup}
                      onChange={(e) => { setSelectedCodeGroup(e.target.value); setCurrentPage(1); }}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-200 focus:outline-none focus:border-[#E60012] cursor-pointer"
                    >
                      <option value="ALL">{isAr ? 'جميع مجموعات الأكوادالهندسية' : 'All OEM Code Groups'}</option>
                      <option value="11000">{isAr ? '11000 - كارتيرة ونصف كارتيرة وماتور (Engine Crankcase)' : '11000 - Engine Crankcase'}</option>
                      <option value="12000">{isAr ? '12000 - سلندر ورأس سلندر وتواكيهات (Cylinder & Head)' : '12000 - Cylinder & Head'}</option>
                      <option value="13000">{isAr ? '13000 - بستم وكرانك وشمبر (Piston & Crankshaft)' : '13000 - Piston & Crankshaft'}</option>
                      <option value="14000">{isAr ? '14000 - كامة وكاتينة وشواكيش (Camshaft & Valves)' : '14000 - Camshaft & Valves'}</option>
                      <option value="16000">{isAr ? '16000/17000 - وقود وهواء وعادم وطلمبات (Fuel & Exhaust)' : '16000/17000 - Fuel & Exhaust'}</option>
                      <option value="33000">{isAr ? '33000/35000 - إضاءة وكهرباء ومفاتيح (Electrical & Lighting)' : '33000/35000 - Electrical & Lighting'}</option>
                      <option value="43000">{isAr ? '43000/45000 - فرامل وباكم وتيل (Brakes & Hydraulics)' : '43000/45000 - Brakes & Hydraulics'}</option>
                      <option value="50000">{isAr ? '50000/80000 - هيكل وفبر خارجي وشاسيه (Body Plastics & Frame)' : '50000/80000 - Body & Frame'}</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                      <ArrowUpDown className="w-3 h-3 text-[#E60012]" />
                      {isAr ? 'ترتيب النتائج والمعروضات:' : 'Sort Results By:'}
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => { setSortBy(e.target.value as unknown as typeof sortBy); setCurrentPage(1); }}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-200 focus:outline-none focus:border-[#E60012] cursor-pointer"
                    >
                      <option value="DEFAULT">{isAr ? 'الترتيب الافتراضي' : 'Default Order'}</option>
                      <option value="CODE">{isAr ? 'حسب الكود الهندسي (A-Z)' : 'By OEM Code (A-Z)'}</option>
                      <option value="NAME">{isAr ? 'حسب اسم الصنف (أبجدي)' : 'By Part Name (Alphabetical)'}</option>
                      <option value="PRICE_ASC">{isAr ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
                      <option value="PRICE_DESC">{isAr ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Results Counter */}
            <div className="flex items-center justify-between px-1 text-xs text-zinc-500">
              <span>
                {isAr
                  ? `عرض ${paginatedParts.length} من ${filteredParts.length.toLocaleString('en-US')} قطعة`
                  : `Showing ${paginatedParts.length} of ${filteredParts.length.toLocaleString('en-US')} parts`}
                {selectedCategory !== 'ALL' && (
                  <span className="mx-1.5 text-[#E60012] font-bold">
                    · {getCategoryById(selectedCategory).icon} {isAr ? getCategoryById(selectedCategory).nameAr : getCategoryById(selectedCategory).nameEn}
                  </span>
                )}
              </span>
              {totalPages > 1 && (
                <span className="text-zinc-600">
                  {isAr ? `صفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
                </span>
              )}
            </div>

            {/* Parts Grid */}
            {paginatedParts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedParts.map((item) => (
                  <PartCard
                    key={item.id}
                    part={item}
                    categoryId={item.categoryId}
                    language={language}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Wrench className="w-12 h-12 text-zinc-700 mb-4" />
                <p className="text-zinc-400 text-base font-medium mb-2">
                  {isAr ? 'لا توجد قطع تطابق البحث' : 'No parts match your search'}
                </p>
                <button onClick={resetAll} className="text-xs text-[#E60012] font-bold underline mt-2 hover:text-red-400">
                  {isAr ? 'مسح الفلاتر والبحث من جديد' : 'Clear filters and try again'}
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 py-4">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <ChevronLeft className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
                </button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let p = currentPage;
                    if (currentPage <= 3) p = i + 1;
                    else if (currentPage >= totalPages - 2) p = totalPages - 4 + i;
                    else p = currentPage - 2 + i;
                    if (p < 1 || p > totalPages) return null;
                    return (
                      <button key={p} onClick={() => setCurrentPage(p)}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                          currentPage === p
                            ? 'bg-[#E60012] text-white shadow-lg shadow-[#E60012]/30'
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                        }`}>
                        {p}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <ChevronRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ════ FLOATING WhatsApp BUTTON ════ */}
      <div className={`fixed bottom-6 ${isAr ? 'left-5' : 'right-5'} z-50`}>
        <button
          onClick={() => openWhatsApp(generalWaMsg)}
          className="group flex items-center gap-3 bg-[#E60012] hover:bg-[#C4000F] text-white font-black text-sm px-5 py-3.5 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span className="hidden sm:inline">{isAr ? 'اسأل عن أي قطعة' : 'Ask About Any Part'}</span>
        </button>
      </div>
    </section>
  );
}
