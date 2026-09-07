'use client';

import React, { useState, useMemo } from 'react';
import Header from '@/components/customer/Header';
import Footer from '@/components/customer/Footer';
import { ProductItem, getActiveProducts, PRODUCTS } from '@/lib/data/products';
import { syncLiveProducts } from '@/lib/products-store';
import { formatPrice } from '@/lib/utils';
import {
  GitCompare,
  Bike,
  Check,
  Gauge,
  Zap,
  Rocket,
  ShieldCheck,
  ChevronDown,
  X,
  Plus,
  HelpCircle,
  Calculator,
  RefreshCw,
  Sparkles,
  Printer,
  MessageCircle,
  SlidersHorizontal,
  Trophy,
  Tag,
  ArrowRight,
  Palette,
  Snowflake,
  Weight,
  Fuel
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ComparePage() {
  const { dir, t, language } = useLanguage();
  const isAr = language === 'ar';
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');

  const [productsList, setProductsList] = useState<ProductItem[]>(PRODUCTS);

  React.useEffect(() => {
    const sync = () => {
      setProductsList(getActiveProducts());
    };
    sync();
    syncLiveProducts().then(sync);
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
    };
  }, []);

  // Selected models for live comparison — starts empty so the user picks
  // freely instead of the page presuming a default (e.g. CRUiSYM 400).
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter products by selected category pill
  const filteredProducts = useMemo(() => {
    if (activeCategoryFilter === 'ALL') return productsList;
    if (activeCategoryFilter === '150CC') {
      return productsList.filter((p) => (p.capacity || '').includes('150') || (p.capacity || '').includes('125'));
    }
    if (activeCategoryFilter === '200CC') {
      return productsList.filter((p) => (p.capacity || '').includes('200') || (p.capacity || '').includes('178'));
    }
    if (activeCategoryFilter === 'MAXI') {
      return productsList.filter((p) => (p.subCategory || '').includes('Maxi') || (p.capacity || '').includes('300') || (p.capacity || '').includes('508'));
    }
    return productsList;
  }, [productsList, activeCategoryFilter]);

  // Keep the live comparison in sync with the active category filter:
  // drop selections that fall outside it, backfilling from the filtered
  // list only if the user had actually picked something (so switching
  // categories doesn't leave a stale model stuck in the comparison).
  // An empty selection is left empty — that's the user's free choice, not
  // something to override with a default.
  React.useEffect(() => {
    // Intentional: this reconciles selectedIds (the source of truth) against the category
    // filter, which can't be expressed as a plain useMemo derivation without losing the
    // user's own add/remove choices — see the comment above.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIds((prev) => {
      if (prev.length === 0) return prev;
      const validIds = filteredProducts.map((p) => p.id);
      const kept = prev.filter((id) => validIds.includes(id));
      if (kept.length > 0) return kept;
      return filteredProducts.slice(0, 3).map((p) => p.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategoryFilter]);

  const comparedProducts = useMemo(() => {
    return productsList.filter((p) => selectedIds.includes(p.id) || selectedIds.includes(p.slug));
  }, [productsList, selectedIds]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      // Full freedom to add or remove — including clearing down to zero,
      // which the empty state below handles gracefully.
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      // Already comparing 3: swap out the oldest pick instead of ignoring the click
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  // Extracts just the leading number from a messy spec string (e.g. "34 HP @
  // 7500 RPM" -> 34). Naively stripping non-digit characters instead (the
  // previous approach) concatenates every number in the string together —
  // it turned "34 HP @ 7500 RPM" into 347500 and "278.3 cc" into 2783.
  const firstNumber = (raw: string, fallback: number): number => {
    const match = raw.match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : fallback;
  };

  // Helper to extract numerical CC for comparison
  const getCcVal = (p: ProductItem) => {
    const raw = p.specifications?.capacity || p.capacity || '150';
    return firstNumber(raw, 150);
  };

  // Helper to extract numerical HP for comparison — prefers an explicit HP
  // figure; falls back to converting kW to HP (1 kW ≈ 1.341 HP) when only
  // kW is given.
  const getHpVal = (p: ProductItem) => {
    const raw = p.specifications?.power || p.power || '13.5 HP';
    const hpMatch = raw.match(/(\d+(\.\d+)?)\s*HP/i);
    if (hpMatch) return parseFloat(hpMatch[1]);
    const kwMatch = raw.match(/(\d+(\.\d+)?)\s*kW/i);
    if (kwMatch) return Math.round(parseFloat(kwMatch[1]) * 1.341 * 10) / 10;
    return firstNumber(raw, 13.5);
  };

  // Localized, normalized display formatters — the raw spec strings are
  // inconsistently formatted (".c.c." vs "cc" vs "cm³", "Liquid" vs "Liquid
  // Cooled" vs mixed English phrases) which reads as mixed-language noise
  // inside an Arabic UI. These always render a clean value in the active
  // language instead of passing the raw English string straight through.
  const formatCapacity = (p: ProductItem) => {
    const val = getCcVal(p);
    return isAr ? `${val} سي سي` : `${val} cc`;
  };

  const formatPower = (p: ProductItem) => {
    const val = getHpVal(p);
    return isAr ? `${val} حصان` : `${val} HP`;
  };

  const formatSpeed = (p: ProductItem) => {
    const raw = p.specifications?.speed || p.speed || '115 km/h';
    const val = firstNumber(raw, 115);
    return isAr ? `${val} كم/س` : `${val} km/h`;
  };

  const formatCooling = (p: ProductItem) => {
    const raw = (p.specifications?.cooling || p.cooling || 'Liquid Cooled').toLowerCase();
    const isLiquid = raw.includes('liquid');
    if (isAr) return isLiquid ? 'تبريد مائي' : 'تبريد هوائي';
    return isLiquid ? 'Liquid Cooled' : 'Air Cooled';
  };

  const formatFuelTank = (p: ProductItem) => {
    const raw = p.specifications?.fuelTank || '7.5 L';
    const val = firstNumber(raw, 7.5);
    return isAr ? `${val} لتر` : `${val} L`;
  };

  // Weight isn't populated for every product (cruisym-400i, jet-x-200,
  // jet-14-evo are missing it in the catalog) — show an honest "N/A"
  // rather than a fabricated number when it's absent.
  const formatWeight = (p: ProductItem) => {
    const raw = p.specifications?.weight;
    if (!raw) return isAr ? 'غير متاح' : 'N/A';
    const val = firstNumber(raw, 0);
    return isAr ? `${val} كجم` : `${val} kg`;
  };

  // Every distinct sub-category string in the catalog, translated — a plain
  // lookup since it's a small fixed set, not free text.
  const subCategoryAr: Record<string, string> = {
    'Maxi Touring': 'ماكسي للرحلات الطويلة',
    'Power Sport ADV': 'مغامرات رياضية',
    'Sport Urban': 'رياضي حضري',
    'Modern Liquid Cooled': 'تصميم عصري بتبريد مائي',
    'Urban Commuter': 'تنقل يومي حضري',
    'Sport Compact': 'رياضي مدمج',
    'Big Wheel Euro': 'أوروبي بعجلات كبيرة',
    'Retro Luxury': 'كلاسيكي فاخر',
    'Classic Vintage': 'كلاسيكي عتيق',
    'Vintage Scooter': 'سكوتر تراثي',
    'Everyday Commuter': 'للاستخدام اليومي',
    'Urban Sport & Commuter': 'رياضي وتنقل حضري',
    'Sport Scooter': 'سكوتر رياضي',
    'Classic High Wheel': 'كلاسيكي بعجلات كبيرة',
    'Naked Street Bike': 'دراجة نيكد',
    'Adventure Touring Bike': 'دراجة مغامرات وتنقل',
    'Classic Commuter Bike': 'دراجة كلاسيكية للتنقل',
  };

  const formatSubCategory = (p: ProductItem) => {
    const raw = p.subCategory || (isAr ? 'سكوتر' : 'Scooter');
    if (!isAr) return raw;
    return subCategoryAr[raw] || raw;
  };

  // Calculate winner for CC and HP
  const maxCcId = useMemo(() => {
    if (comparedProducts.length === 0) return '';
    return comparedProducts.reduce((prev, curr) => (getCcVal(curr) > getCcVal(prev) ? curr : prev)).id;
  }, [comparedProducts]);

  const maxHpId = useMemo(() => {
    if (comparedProducts.length === 0) return '';
    return comparedProducts.reduce((prev, curr) => (getHpVal(curr) > getHpVal(prev) ? curr : prev)).id;
  }, [comparedProducts]);

  // Cheapest of the compared models — the single most important factor for most buyers,
  // and real per-model data that was previously missing from the comparison entirely.
  const minPriceId = useMemo(() => {
    if (comparedProducts.length < 2) return '';
    return comparedProducts.reduce((prev, curr) => (curr.price < prev.price ? curr : prev)).id;
  }, [comparedProducts]);

  // Construct WhatsApp inquiry link with selected models
  const comparedModelNames = comparedProducts.map((p) => p.name).join(' ، ');
  const whatsappMsg = isAr
    ? `مرحباً شركة SYM مصر، أود الاستفسار عن تفاصيل ومواصفات الموديلات التالية: ${comparedModelNames}`
    : `Hello SYM Egypt, I would like to inquire about specifications for: ${comparedModelNames}`;
  const whatsappUrl = `https://wa.me/201271384149?text=${encodeURIComponent(whatsappMsg)}`;

  // Handle Print Specs Report
  const handlePrintReport = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <main className="min-h-screen bg-[#030305] text-white select-none font-sans relative overflow-hidden print:bg-white print:text-black" dir={dir}>
      {/* 🌌 High-Impact Animated Background Plasma & Laser Beams */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden print:hidden">
        {/* Animated Laser Grid Background Pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(230, 0, 18, 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(230, 0, 18, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />

        {/* Dynamic Glowing Moving Orbs */}
        <motion.div
          animate={{
            x: [-100, 120, -80, -100],
            y: [-50, 100, -100, -50],
            scale: [1, 1.35, 0.9, 1],
            opacity: [0.35, 0.6, 0.35, 0.35]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 left-1/3 w-[650px] h-[650px] bg-[#E60012]/30 rounded-full blur-[150px]"
        />

        <motion.div
          animate={{
            x: [100, -120, 80, 100],
            y: [50, -100, 100, 50],
            scale: [1, 1.2, 0.85, 1],
            opacity: [0.3, 0.55, 0.3, 0.3]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 -right-40 w-[700px] h-[700px] bg-[#E60012]/20 rounded-full blur-[170px]"
        />

        <motion.div
          animate={{
            x: [-80, 90, -50, -80],
            y: [60, -80, 60, 60],
            scale: [1, 1.25, 0.9, 1],
            opacity: [0.25, 0.45, 0.25, 0.25]
          }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-10 left-10 w-[600px] h-[600px] bg-red-800/25 rounded-full blur-[160px]"
        />
      </div>

      <Header />

      <div className="relative z-10 pt-28 pb-24 px-4 md:px-8 max-w-7xl mx-auto space-y-16">
        
        {/* Page Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-5"
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-tight text-white max-w-4xl mx-auto leading-tight drop-shadow-2xl">
            {t('compare.title', 'قارن بين الموديلات واكتشف السكوتر المثالي')}
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-zinc-300 max-w-3xl mx-auto leading-relaxed font-normal">
            {t('compare.subtitle', 'قارن مواصفات وقوة وسرعة موديلات SYM المختلفة، واختر السكوتر الأنسب لاحتياجاتك.')}
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-4 print:hidden">
            <button
              onClick={() => document.getElementById('comparison-matrix')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="px-7 py-4 rounded-2xl bg-[#E60012] hover:bg-red-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-2xl shadow-[#E60012]/50 hover:scale-105 transition-all inline-flex items-center gap-2.5 border border-white/20"
            >
              <GitCompare className="w-5 h-5" />
              <span>{t('compare.launchMatrix', isAr ? 'ابدأ المقارنة المباشرة' : 'Start Comparing')}</span>
            </button>

            <button
              onClick={handlePrintReport}
              className="px-6 py-4 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 font-bold text-xs sm:text-sm uppercase tracking-wider border border-zinc-700 transition-all inline-flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-[#E60012]" />
              <span>{isAr ? 'طباعة / حفظ التقرير PDF' : 'Print / Export PDF'}</span>
            </button>
          </div>
        </motion.div>

        {/* Live Direct Comparison Matrix */}
        <section id="comparison-matrix" className="bg-zinc-950/75 backdrop-blur-2xl border border-zinc-800/90 rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl relative overflow-hidden print:bg-white print:border-none print:p-0 scroll-mt-24">
          {/* Subtle Accent Light */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#E60012]/10 rounded-full blur-3xl pointer-events-none print:hidden" />

          {/* Matrix Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80 print:border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#E60012]/10 text-[#E60012] border border-[#E60012]/30 print:hidden">
                <GitCompare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight print:text-black">
                  {isAr ? 'مقارنة مواصفات الموديلات رأس برأس' : 'Live Head-to-Head 3-Model Spec Matrix'}
                </h3>
                <p className="text-xs text-zinc-400 print:text-gray-600">
                  {isAr ? 'اختر أي 3 موديلات للمقارنة التفصيلية الشاملة للمواصفات والأداء' : 'Select up to 3 models for side-by-side technical specs comparison'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 print:hidden">
              <div className="text-xs font-bold text-zinc-300 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
                {isAr ? 'المحدد للمقارنة:' : 'Comparing:'} <span className="text-[#E60012] font-black">{selectedIds.length} / 3</span>
              </div>

              {/* Direct WhatsApp Inquiry for Selected Models */}
              {comparedProducts.length > 0 && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isAr ? 'استفسر عبر الواتساب' : 'Inquire via WhatsApp'}</span>
                </a>
              )}
            </div>
          </div>

          {/* Fast Category Filter Pills for Model Selector */}
          <div className="space-y-4 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800/80 print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#E60012]" />
                {isAr ? 'تصفية القائمة حسب سعة المحرك والفئة:' : 'Filter list by capacity & category:'}
              </span>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                {[
                  { id: 'ALL', label: isAr ? 'جميع الموديلات' : 'All Models' },
                  { id: '150CC', label: '125cc - 150cc' },
                  { id: '200CC', label: '178cc - 200cc' },
                  { id: 'MAXI', label: isAr ? 'ماكسي 300cc+' : 'Maxi 300cc+' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategoryFilter(tab.id)}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      activeCategoryFilter === tab.id
                        ? 'bg-[#E60012] text-white font-black shadow-md'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Model Selector Pills - Horizontal Scrollable on Mobile */}
            <div className="flex overflow-x-auto scrollbar-hide gap-2 pt-1 pb-1.5 touch-pan-x">
              {filteredProducts.map((p) => {
                const isSelected = selectedIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggleSelect(p.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#E60012] text-white shadow-md shadow-[#E60012]/30 scale-105 border border-red-400/30'
                        : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <Bike className="w-3.5 h-3.5" />
                    <span>{p.name}</span>
                    {isSelected && <Check className="w-3 h-3 mx-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Specs Table Matrix */}
          {comparedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 rounded-2xl border border-dashed border-zinc-800 text-center">
              <div className="p-4 rounded-2xl bg-[#E60012]/10 text-[#E60012] border border-[#E60012]/30">
                <Bike className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-wide">
                {isAr ? 'اختر موديلاتك بحرية' : 'Pick Your Models Freely'}
              </h4>
              <p className="text-xs text-zinc-400 max-w-sm">
                {isAr
                  ? 'اختر حتى 3 موديلات من القائمة أعلاه لبدء المقارنة المباشرة — الاختيار كله ليك.'
                  : 'Choose up to 3 models from the list above to start comparing — it\'s entirely up to you.'}
              </p>
            </div>
          ) : (
          <div className="overflow-x-auto rounded-2xl border border-zinc-800/90 shadow-xl print:border-gray-300">
              <table className="w-full text-start border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-zinc-950 border-b border-zinc-800 print:bg-gray-100 print:border-gray-300">
                    <th className="py-5 px-5 text-xs font-black text-zinc-400 uppercase w-1/4 print:text-black">
                      {isAr ? 'المواصفة / الموديل' : 'Specification / Model'}
                    </th>
                    {comparedProducts.map((p) => (
                      <th key={p.id} className="py-5 px-4 text-center w-1/4 relative">
                        <div className="flex flex-col items-center gap-2">
                          {/* Winner Badges for Max HP & Best Price */}
                          {p.id === maxHpId && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30 shadow-md">
                              <Trophy className="w-3 h-3" />
                              {isAr ? 'الأعلى قوة' : 'Max Horsepower'}
                            </span>
                          )}
                          {p.id === minPriceId && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 shadow-md">
                              <Tag className="w-3 h-3" />
                              {isAr ? 'أفضل سعر' : 'Best Price'}
                            </span>
                          )}

                          <div className="relative w-32 h-28 rounded-2xl bg-zinc-900/90 p-2 border border-zinc-800 flex items-center justify-center print:border-gray-300">
                            <Image src={p.image} alt={p.name} fill className="object-contain p-2" />
                          </div>
                          <span className="text-sm font-black text-white uppercase tracking-tight print:text-black">{p.name}</span>
                          <Link
                            href={`/scooter/${p.slug}`}
                            className="mt-1 px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-[#E60012] text-white text-[11px] font-bold transition-all flex items-center gap-1 shadow-md print:hidden"
                          >
                            <span>{isAr ? 'استكشف المواصفات' : 'View Specs'}</span>
                            <ArrowRight className={`w-3 h-3 ${isAr ? 'rotate-180' : ''}`} />
                          </Link>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-xs print:divide-gray-300">
                  {/* 1. Price */}
                  <tr className="hover:bg-zinc-900/30 transition-colors print:hover:bg-transparent">
                    <td className="py-4 px-5 font-bold text-zinc-300 bg-zinc-950/60 print:bg-gray-50 print:text-black">
                      <span className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#E60012]" />
                        {isAr ? 'السعر الرسمي' : 'Official Price'}
                      </span>
                    </td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className={`py-4 px-4 text-center font-black text-sm font-mono ${p.id === minPriceId ? 'text-emerald-400' : 'text-white print:text-black'}`}>
                        {formatPrice(p.price)}
                      </td>
                    ))}
                  </tr>

                  {/* 2. Category */}
                  <tr className="hover:bg-zinc-900/30 transition-colors print:hover:bg-transparent">
                    <td className="py-4 px-5 font-bold text-zinc-300 bg-zinc-950/60 print:bg-gray-50 print:text-black">
                      <span className="flex items-center gap-2">
                        <Bike className="w-4 h-4 text-[#E60012]" />
                        {isAr ? 'الفئة والتصنيف' : 'Category & Type'}
                      </span>
                    </td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="py-4 px-4 text-center font-bold text-white print:text-black">
                        <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] print:bg-gray-100 print:border-gray-300">
                          {formatSubCategory(p)}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* 3. Available Colors */}
                  <tr className="hover:bg-zinc-900/30 transition-colors print:hover:bg-transparent">
                    <td className="py-4 px-5 font-bold text-zinc-300 bg-zinc-950/60 print:bg-gray-50 print:text-black">
                      <span className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-[#E60012]" />
                        {isAr ? 'الألوان المتاحة' : 'Available Colors'}
                      </span>
                    </td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="py-4 px-4">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {(p.colors || []).map((hex, idx) => (
                            <span
                              key={idx}
                              title={hex}
                              className="w-5 h-5 rounded-full border border-white/20 shadow-sm print:border-gray-400"
                              style={{ backgroundColor: hex }}
                            />
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* 4. Displacement CC */}
                  <tr className="hover:bg-zinc-900/30 transition-colors print:hover:bg-transparent">
                    <td className="py-4 px-5 font-bold text-zinc-300 bg-zinc-950/60 print:bg-gray-50 print:text-black">
                      <span className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-[#E60012]" />
                        {isAr ? 'سعة المحرك (CC)' : 'Displacement (CC)'}
                      </span>
                    </td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className={`py-4 px-4 text-center font-black text-sm font-mono ${p.id === maxCcId ? 'text-[#E60012]' : 'text-white print:text-black'}`}>
                        {formatCapacity(p)}
                      </td>
                    ))}
                  </tr>

                  {/* 5. Max Power */}
                  <tr className="hover:bg-zinc-900/30 transition-colors print:hover:bg-transparent">
                    <td className="py-4 px-5 font-bold text-zinc-300 bg-zinc-950/60 print:bg-gray-50 print:text-black">
                      <span className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        {isAr ? 'القوة القصوى (حصان)' : 'Maximum Power (HP)'}
                      </span>
                    </td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className={`py-4 px-4 text-center font-bold ${p.id === maxHpId ? 'text-amber-400 font-extrabold' : 'text-white print:text-black'}`}>
                        {formatPower(p)}
                      </td>
                    ))}
                  </tr>

                  {/* 6. Top Speed */}
                  <tr className="hover:bg-zinc-900/30 transition-colors print:hover:bg-transparent">
                    <td className="py-4 px-5 font-bold text-zinc-300 bg-zinc-950/60 print:bg-gray-50 print:text-black">
                      <span className="flex items-center gap-2">
                        <Rocket className="w-4 h-4 text-orange-500" />
                        {isAr ? 'السرعة القصوى التقريبية' : 'Top Speed (Est.)'}
                      </span>
                    </td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="py-4 px-4 text-center font-bold text-white print:text-black">
                        {formatSpeed(p)}
                      </td>
                    ))}
                  </tr>

                  {/* 7. Cooling System */}
                  <tr className="hover:bg-zinc-900/30 transition-colors print:hover:bg-transparent">
                    <td className="py-4 px-5 font-bold text-zinc-300 bg-zinc-950/60 print:bg-gray-50 print:text-black">
                      <span className="flex items-center gap-2">
                        <Snowflake className="w-4 h-4 text-blue-400" />
                        {isAr ? 'نظام التبريد' : 'Cooling System'}
                      </span>
                    </td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="py-4 px-4 text-center font-bold text-white print:text-black">
                        {formatCooling(p)}
                      </td>
                    ))}
                  </tr>

                  {/* 8. Weight */}
                  <tr className="hover:bg-zinc-900/30 transition-colors print:hover:bg-transparent">
                    <td className="py-4 px-5 font-bold text-zinc-300 bg-zinc-950/60 print:bg-gray-50 print:text-black">
                      <span className="flex items-center gap-2">
                        <Weight className="w-4 h-4 text-violet-400" />
                        {isAr ? 'الوزن' : 'Weight'}
                      </span>
                    </td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="py-4 px-4 text-center font-bold text-white print:text-black">
                        {formatWeight(p)}
                      </td>
                    ))}
                  </tr>

                  {/* 9. Fuel Tank Capacity */}
                  <tr className="hover:bg-zinc-900/30 transition-colors print:hover:bg-transparent">
                    <td className="py-4 px-5 font-bold text-zinc-300 bg-zinc-950/60 print:bg-gray-50 print:text-black">
                      <span className="flex items-center gap-2">
                        <Fuel className="w-4 h-4 text-rose-500" />
                        {isAr ? 'سعة خزان الوقود' : 'Fuel Tank Capacity'}
                      </span>
                    </td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="py-4 px-4 text-center font-bold text-white print:text-black">
                        {formatFuelTank(p)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <Footer />
    </main>
  );
}
