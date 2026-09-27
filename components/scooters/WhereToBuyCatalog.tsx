'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { DEALERS, DealerItem } from '@/lib/data/dealers';
import { WhereToBuyBackgroundFX } from '@/components/scooters/WhereToBuyBackgroundFX';
import {
  MapPin,
  Search,
  Filter,
  PhoneCall,
  MessageSquare,
  Clock,
  CheckCircle2,
  Wrench,
  Building2,
  RefreshCcw,
  Truck,
  CreditCard,
  Info,
  Navigation
} from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';
import { useLanguage } from '@/context/LanguageContext';
import { fetchApiCached } from '@/lib/api';

interface RawCustomShowroom {
  id: string;
  name: string;
  city: string;
  address: string;
  phone?: string;
  hasServiceCenter?: boolean;
  workingHours?: string;
  hasTestRide?: boolean;
}

export const GOVERNORATES = [
  { id: 'Cairo', nameAr: 'القاهرة', nameEn: 'Cairo' },
  { id: 'Giza', nameAr: 'الجيزة', nameEn: 'Giza' },
  { id: 'Alexandria', nameAr: 'الإسكندرية', nameEn: 'Alexandria' },
  { id: 'Port Said', nameAr: 'بورسعيد', nameEn: 'Port Said' },
  { id: 'Ismailia', nameAr: 'الإسماعيلية', nameEn: 'Ismailia' },
  { id: 'Suez', nameAr: 'السويس', nameEn: 'Suez' },
  { id: 'Gharbia', nameAr: 'الغربية', nameEn: 'Gharbia' },
  { id: 'Menofia', nameAr: 'المنوفية', nameEn: 'Menofia' },
  { id: 'Damietta', nameAr: 'دمياط', nameEn: 'Damietta' },
  { id: 'Fayoum', nameAr: 'الفيوم', nameEn: 'Fayoum' },
  { id: 'Beni Suef', nameAr: 'بني سويف', nameEn: 'Beni Suef' },
];

export function WhereToBuyCatalog() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [onlyShipping, setOnlyShipping] = useState<boolean>(false);
  const [dealersList, setDealersList] = useState<DealerItem[]>(DEALERS);

  React.useEffect(() => {
    const sync = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('sym_showrooms_custom');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const customMapped: DealerItem[] = parsed.map((s: RawCustomShowroom) => ({
                id: s.id,
                nameAr: s.name,
                nameEn: s.name,
                cityAr: s.city,
                cityEn: s.city,
                areaAr: s.city,
                areaEn: s.city,
                addressAr: s.address,
                addressEn: s.address,
                phone: s.phone || '19088',
                whatsapp: s.phone || '01279881123',
                type: s.hasServiceCenter ? 'authorized' : 'flagship',
                typeLabelAr: s.hasServiceCenter ? 'معرض ومركز خدمة معتمد' : 'معرض رئيسي',
                typeLabelEn: s.hasServiceCenter ? 'Showroom & Service Center' : 'Flagship Showroom',
                workingHoursAr: s.workingHours || '9:00 ص - 10:00 م',
                workingHoursEn: s.workingHours || '9:00 AM - 10:00 PM',
                hasTestRide: !!s.hasTestRide,
                hasMaintenance: !!s.hasServiceCenter,
                hasSpareParts: true,
                hasShipping: true,
              }));
              setDealersList(customMapped);
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

  // Merge in real backend-managed showrooms (added/edited via the admin panel) — the admin now
  // controls the full card, not just name/city/address/phone/hours.
  React.useEffect(() => {
    type DbShowroomType = 'flagship' | 'authorized' | 'service' | 'parts';
    interface DbShowroom {
      id: string;
      name: string;
      city: string;
      address: string;
      phone?: string;
      working_hours?: string;
      status?: string;
      type?: DbShowroomType;
      whatsapp?: string;
      google_maps_url?: string;
      has_test_ride?: boolean;
      has_maintenance?: boolean;
      has_spare_parts?: boolean;
      has_shipping?: boolean;
      installment_options?: string[];
      notes?: string;
      name_en?: string;
      address_en?: string;
      working_hours_en?: string;
    }

    const TYPE_LABELS: Record<DbShowroomType, { ar: string; en: string }> = {
      flagship: { ar: 'معرض رئيسي', en: 'Flagship Showroom' },
      authorized: { ar: 'معرض ومركز خدمة معتمد', en: 'Showroom & Service Center' },
      service: { ar: 'مركز صيانة', en: 'Service Center' },
      parts: { ar: 'قطع غيار فقط', en: 'Spare Parts Only' },
    };

    fetchApiCached<DbShowroom[]>('/showrooms/index.php').then((res) => {
      if (!res.success || !Array.isArray(res.data) || res.data.length === 0) return;

      setDealersList((prev) => {
        const byId = new Map(prev.map((d) => [d.id, d]));
        const newEntries: DealerItem[] = [];

        for (const s of res.data!.filter((s) => s.status !== 'inactive')) {
          const type = s.type ?? 'authorized';
          const typeLabel = TYPE_LABELS[type];
          const existing = byId.get(s.id);

          // English priority: the admin's own English field (real, editable, most current) →
          // the static bundle's original translation (real, but frozen) → the Arabic value as a
          // last resort so the English UI is never blank — never the DB's Arabic value overwriting
          // a perfectly good existing English translation.
          const dbFields: Partial<DealerItem> = {
            nameAr: s.name,
            nameEn: s.name_en || existing?.nameEn || s.name,
            cityAr: s.city,
            cityEn: existing?.cityEn ?? s.city,
            addressAr: s.address,
            addressEn: s.address_en || existing?.addressEn || s.address,
            phone: s.phone || existing?.phone || '19088',
            whatsapp: s.whatsapp || s.phone || existing?.whatsapp || '01279881123',
            type,
            typeLabelAr: typeLabel.ar,
            typeLabelEn: typeLabel.en,
            workingHoursAr: s.working_hours || existing?.workingHoursAr,
            workingHoursEn: s.working_hours_en || existing?.workingHoursEn || s.working_hours,
            googleMapsUrl: s.google_maps_url || existing?.googleMapsUrl,
            hasTestRide: s.has_test_ride ?? existing?.hasTestRide ?? true,
            hasMaintenance: s.has_maintenance ?? existing?.hasMaintenance ?? true,
            hasSpareParts: s.has_spare_parts ?? existing?.hasSpareParts ?? true,
            hasShipping: s.has_shipping ?? existing?.hasShipping ?? false,
            installmentOptionsAr: s.installment_options?.length ? s.installment_options : existing?.installmentOptionsAr,
            installmentOptionsEn: existing?.installmentOptionsEn ?? (s.installment_options?.length ? s.installment_options : undefined),
            notesAr: s.notes || existing?.notesAr,
            notesEn: existing?.notesEn ?? s.notes,
          };

          if (existing) {
            byId.set(s.id, { ...existing, ...dbFields });
          } else {
            newEntries.push({
              id: s.id,
              areaAr: s.city,
              areaEn: s.city,
              ...dbFields,
            } as DealerItem);
          }
        }

        return [...newEntries, ...prev.map((d) => byId.get(d.id) ?? d)];
      });
    }).catch(() => {
      // Backend unreachable — keep serving the bundled static dealer list
    });
  }, []);

  // Shipping Hubs count
  const shippingHubsCount = useMemo(() => {
    return dealersList.filter((d) => d.hasShipping).length;
  }, [dealersList]);

  // Filter dealers intelligently across governorates & search query
  const filteredDealers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return dealersList.filter((dealer) => {
      // Shipping Filter
      if (onlyShipping && !dealer.hasShipping) {
        return false;
      }

      // Governorate filter
      if (selectedCity !== 'ALL') {
        const govObj = GOVERNORATES.find(g => g.id.toLowerCase() === selectedCity.toLowerCase());
        const govNameEn = selectedCity.toLowerCase();
        const govNameAr = govObj ? govObj.nameAr : '';

        const matchCityEn = dealer.cityEn.toLowerCase() === govNameEn;
        const matchCityAr = govNameAr ? dealer.cityAr.includes(govNameAr) : false;
        const matchAreaEn = (dealer.areaEn || '').toLowerCase().includes(govNameEn);
        const matchAreaAr = govNameAr ? (dealer.areaAr || '').includes(govNameAr) : false;
        const matchAddressAr = govNameAr ? dealer.addressAr.includes(govNameAr) : false;
        const matchNotesAr = govNameAr ? (dealer.notesAr || '').includes(govNameAr) : false;

        const isGovMatch = matchCityEn || matchCityAr || matchAreaEn || matchAreaAr || matchAddressAr || matchNotesAr;
        if (!isGovMatch) return false;
      }

      // Facility Type filter
      if (selectedType !== 'ALL' && dealer.type !== selectedType) {
        return false;
      }

      // Search query filter
      if (query) {
        const matchName = dealer.nameEn.toLowerCase().includes(query) || dealer.nameAr.toLowerCase().includes(query);
        const matchArea = (dealer.areaEn || '').toLowerCase().includes(query) || (dealer.areaAr || '').toLowerCase().includes(query);
        const matchCity = dealer.cityEn.toLowerCase().includes(query) || dealer.cityAr.toLowerCase().includes(query);
        const matchAddress = dealer.addressEn.toLowerCase().includes(query) || dealer.addressAr.toLowerCase().includes(query);
        const matchInstallment = (dealer.installmentOptionsAr || []).some(i => i.toLowerCase().includes(query)) ||
          (dealer.installmentOptionsEn || []).some(i => i.toLowerCase().includes(query));
        return matchName || matchArea || matchCity || matchAddress || matchInstallment;
      }

      return true;
    });
  }, [dealersList, searchTerm, selectedCity, selectedType, onlyShipping]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCity('ALL');
    setSelectedType('ALL');
    setOnlyShipping(false);
  };

  const handleWhatsAppContact = (dealer: DealerItem) => {
    const text = isAr
      ? `مرحباً بك في ${dealer.nameAr}، أود الاستفسار عن أسعار وموديلات سكوترز SYM وأنظمة التقسيط المتاحة.`
      : `Hello ${dealer.nameEn}, I would like to inquire about SYM scooters available at your showroom.`;

    // Extract raw digits from dealer's own whatsapp or phone number
    const rawNum = (dealer.whatsapp || dealer.phone || '').replace(/[^0-9]/g, '');

    // Convert local zero prefix to country code 20 (e.g. 011... -> 2011...)
    let targetPhone = rawNum;
    if (rawNum.startsWith('0')) {
      targetPhone = '20' + rawNum.substring(1);
    }

    const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <section className="w-full bg-[#050505] text-white min-h-screen pb-24 font-sans relative overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ── 0. World-Class Interactive Canvas Particle Engine ── */}
      <WhereToBuyBackgroundFX />

      {/* ── 1. Hero Banner (World-Class Redesign) ── */}
      <div className="relative w-full bg-gradient-to-b from-neutral-950 via-black to-[#050505] border-b border-neutral-900 pt-28 pb-20 px-6 sm:px-12 overflow-hidden">

        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-red-900/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          {/* Left Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: isAr ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-2xl text-start"
          >

            {/* Top Pill Badge */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2.5 bg-neutral-900/90 border border-red-800/50 text-neutral-200 px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-widest mb-6 shadow-xl shadow-red-950/30 backdrop-blur-md"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
              </span>
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span className="text-neutral-300">
                {isAr ? 'شبكة الموزعين المعتمدين الرسمية في مصر' : 'Official SYM Egypt Authorized Network'}
              </span>
            </motion.div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-5 leading-[1.1]">
              {isAr ? (
                <>معارض وموزعو <span className="bg-gradient-to-r from-red-500 via-red-600 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(230,0,18,0.4)]">SYM</span> المعتمدون</>
              ) : (
                <>Where to Buy <span className="bg-gradient-to-r from-red-500 via-red-600 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(230,0,18,0.4)]">SYM</span> in Egypt</>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-neutral-400 text-base sm:text-lg max-w-xl leading-relaxed mb-10 font-sans">
              {isAr
                ? 'استكشف الفروع والمعارض الرسمية المعتمَدة لسكوترز SYM بمختلف المحافظات الـ 11، مع مراكز الصيانة، الشحن للمحافظات، وأنظمة التقسيط المتعددة.'
                : 'Find official SYM flagship showrooms, authorized dealers, shipping hubs, and certified service workshops across Egypt.'}
            </p>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-4 max-w-lg">
              <motion.div
                whileHover={{ y: -5, scale: 1.03 }}
                className="bg-neutral-900/90 border border-neutral-800/90 hover:border-red-600/60 rounded-3xl p-4 sm:p-5 text-center transition-all duration-300 hover:shadow-2xl hover:shadow-red-950/40 backdrop-blur-md group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="block text-2xl sm:text-3xl font-black text-white group-hover:text-red-500 transition-colors">{DEALERS.length}</span>
                <span className="text-[11px] sm:text-xs text-neutral-400 font-semibold">{isAr ? 'معرضاً وموزعاً' : 'Official Outlets'}</span>
              </motion.div>
              <motion.div
                whileHover={{ y: -5, scale: 1.03 }}
                className="bg-neutral-900/90 border border-neutral-800/90 hover:border-red-600/60 rounded-3xl p-4 sm:p-5 text-center transition-all duration-300 hover:shadow-2xl hover:shadow-red-950/40 backdrop-blur-md group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="block text-2xl sm:text-3xl font-black text-red-500">{GOVERNORATES.length}</span>
                <span className="text-[11px] sm:text-xs text-neutral-400 font-semibold">{isAr ? 'محافظة تغطية' : 'Governorates'}</span>
              </motion.div>
              <motion.div
                whileHover={{ y: -5, scale: 1.03 }}
                className="bg-neutral-900/90 border border-neutral-800/90 hover:border-amber-500/60 rounded-3xl p-4 sm:p-5 text-center transition-all duration-300 hover:shadow-2xl hover:shadow-amber-950/40 backdrop-blur-md group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="block text-2xl sm:text-3xl font-black text-amber-400">{shippingHubsCount}</span>
                <span className="text-[11px] sm:text-xs text-neutral-400 font-semibold">{isAr ? 'معارض شحن' : 'Shipping Hubs'}</span>
              </motion.div>
            </div>

          </motion.div>

          {/* Right Widescreen Hero Image Stage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full lg:w-1/2 aspect-[16/10] rounded-3xl overflow-hidden border border-neutral-800/90 shadow-2xl shadow-red-950/40 bg-neutral-900 group"
          >
            <Image
              src="/where.webp"
              alt="Find SYM Egypt Showrooms & Authorized Dealers"
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />

            {/* Glassmorphic Overlay Badge */}
            <div className="absolute bottom-5 left-5 right-5 bg-neutral-950/85 backdrop-blur-xl p-4 rounded-2xl border border-neutral-800/90 flex items-center justify-between shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600/15 border border-red-500/30 rounded-xl text-red-500">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    {isAr ? 'الشبكة المعتمدة لـ SYM Egypt 2026' : 'SYM Authorized Network 2026'}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-medium block">
                    {isAr ? 'تغطية شاملة ومضمونة بجميع المحافظات' : 'Verified & Guaranteed Nationwide Outlets'}
                  </span>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 bg-red-950/70 border border-red-800/50 text-red-400 px-3 py-1.5 rounded-xl text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                <span>{isAr ? 'ضمان رسمي' : 'Certified'}</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ── 2. Shipping Policy Alert Banner (شروط وإرشادات الشحن) ── */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="bg-neutral-900/90 border border-amber-500/30 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md shadow-2xl">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-red-500 to-amber-500" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400 shrink-0 mt-1 md:mt-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-xs">
                    {isAr ? 'ضوابط الشحن الرسمية' : 'Official Shipping Guidelines'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {isAr ? 'خدمة الشحن للمحافظات متاحة لدى معارض محددة فقط' : 'Governorate Express Shipping Policy'}
                </h3>
                <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed max-w-4xl">
                  {isAr ? (
                    <>
                      خدمة الشحن للمحافظات <strong className="text-white">ليست متاحة عند كل الموزعين</strong>. الخدمة متاحة حصرية وحصرياً لدى المعارض التالية:
                      <span className="text-amber-300 font-bold"> معرض اليارا (القاهرة)، معرض بودي ستوري (الجيزة ودمياط)، معرض أبو الحمايل (دمياط)، ومعرض أنجلو فوزي (الفيوم وبني سويف)</span>. باقي الموزعين يكون الاستلام من مقر المعرض الخاص بهم فقط.
                    </>
                  ) : (
                    <>
                      Express shipping to other governorates is <strong className="text-white">exclusively available</strong> at select authorized hubs:
                      <span className="text-amber-300 font-bold"> El Yara (Cairo), Body Story (Giza & Damietta), El Hamayel (Damietta), and Angelo Fawzy (Fayoum & Beni Suef)</span>. All other outlets provide in-store pickup only.
                    </>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={() => setOnlyShipping(!onlyShipping)}
              className={`shrink-0 px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border ${onlyShipping
                ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20'
                : 'bg-neutral-950 hover:bg-neutral-800 text-amber-400 border-amber-500/40'
                }`}
            >
              <Truck className="w-4 h-4" />
              <span>
                {onlyShipping
                  ? (isAr ? 'إظهار كافة المعارض' : 'Show All Dealers')
                  : (isAr ? 'تصفية معارض الشحن فقط (4 معارض)' : 'Filter Express Shipping Dealers (4)')}
              </span>
            </button>

          </div>
        </div>
      </div>

      {/* ── 3. Search & Filter Bar ── */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-5 sm:p-6 mb-8 backdrop-blur-md shadow-xl">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">

            {/* Search Input */}
            <div className="relative w-full lg:w-1/2">
              <Search className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isAr ? 'ابحث بالمحافظة، المنطقة، اسم المعرض، أو التقسيط (فاليو، أمان...)' : 'Search by governorate, area, dealer name, or installment...'}
                className={`w-full ${isAr ? 'pr-12 pl-12' : 'pl-12 pr-12'} py-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-red-600 transition-all font-sans`}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className={`absolute ${isAr ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white bg-neutral-800 px-2.5 py-1 rounded-lg`}
                >
                  {isAr ? 'مسح' : 'Clear'}
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">

              {/* Governorates Selector (المحافظات الـ 11 الرسمية) */}
              <div className="relative flex-1 sm:flex-initial">
                <Filter className={`absolute ${isAr ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none`} />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className={`w-full sm:w-56 ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl text-white text-sm focus:outline-none focus:border-red-600 appearance-none font-sans cursor-pointer`}
                >
                  <option value="ALL">
                    {isAr ? `كل المحافظات (${GOVERNORATES.length})` : `All Governorates (${GOVERNORATES.length})`}
                  </option>
                  {GOVERNORATES.map((g) => (
                    <option key={g.id} value={g.id}>
                      {isAr ? g.nameAr : g.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shipping Filter Button */}
              <button
                onClick={() => setOnlyShipping(!onlyShipping)}
                className={`px-4 py-3.5 rounded-2xl text-xs font-bold transition-colors flex items-center gap-2 border ${onlyShipping
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                  : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                  }`}
              >
                <Truck className="w-4 h-4" />
                <span>{isAr ? 'معارض الشحن' : 'Shipping Hubs'}</span>
              </button>

              {(searchTerm || selectedCity !== 'ALL' || selectedType !== 'ALL' || onlyShipping) && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-2 px-4 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-medium rounded-2xl transition-colors"
                >
                  <RefreshCcw className="w-4 h-4" />
                  <span>{isAr ? 'إعادة ضبط' : 'Reset'}</span>
                </button>
              )}

            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6 px-2 text-sm text-neutral-400 font-sans">
          <div>
            {isAr ? (
              <>تم العثور على <span className="text-white font-bold">{filteredDealers.length}</span> معرض وموزع معتمد</>
            ) : (
              <>Found <span className="text-white font-bold">{filteredDealers.length}</span> official SYM outlets</>
            )}
          </div>
        </div>

        {/* ── 4. Dealers Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDealers.length > 0 ? (
            filteredDealers.map((dealer) => (
              <div
                key={dealer.id}
                className={`bg-neutral-900/70 border ${dealer.hasShipping ? 'border-amber-500/40 hover:border-amber-500' : 'border-neutral-800/90 hover:border-red-600/60'
                  } rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 group hover:shadow-2xl hover:shadow-red-950/20 backdrop-blur-sm relative overflow-hidden`}
              >
                {dealer.hasShipping && (
                  <div className="absolute top-0 right-0 left-0 h-1 bg-amber-500" />
                )}

                <div>
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${dealer.type === 'flagship'
                        ? 'bg-red-950/60 border border-red-800/40 text-red-400'
                        : 'bg-neutral-800 text-neutral-300'
                        }`}>
                        {isAr ? dealer.typeLabelAr : dealer.typeLabelEn}
                      </span>

                      {dealer.hasShipping && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          <span>{isAr ? 'يوفر الشحن للمحافظات' : 'Shipping Available'}</span>
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-bold text-neutral-300 bg-neutral-950 px-3 py-1 rounded-xl border border-neutral-800">
                      {isAr ? dealer.cityAr : dealer.cityEn}{dealer.areaAr ? ` • ${isAr ? dealer.areaAr : dealer.areaEn}` : ''}
                    </span>
                  </div>

                  {/* Dealer Name */}
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2 group-hover:text-red-500 transition-colors">
                    {isAr ? dealer.nameAr : dealer.nameEn}
                  </h3>

                  {/* Address */}
                  <div className="flex items-start gap-2.5 text-neutral-300 text-sm mb-4 bg-neutral-950/60 p-3.5 rounded-2xl border border-neutral-800/80">
                    <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-1" />
                    <span className="leading-relaxed">{isAr ? dealer.addressAr : dealer.addressEn}</span>
                  </div>

                  {/* Installment Options */}
                  {dealer.installmentOptionsAr && dealer.installmentOptionsAr.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-2">
                        <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isAr ? 'أنظمة التقسيط المتاحة:' : 'Installment Options:'}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(isAr ? dealer.installmentOptionsAr : dealer.installmentOptionsEn || dealer.installmentOptionsAr).map((opt) => (
                          <span
                            key={opt}
                            className="text-[11px] font-semibold bg-neutral-950 text-neutral-200 border border-neutral-800 px-2.5 py-1 rounded-lg"
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes / Special Instructions */}
                  {dealer.notesAr && (
                    <div className="flex items-center gap-2 text-xs text-neutral-400 mb-4 bg-neutral-950/40 p-2.5 rounded-xl border border-neutral-800/50">
                      <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{isAr ? dealer.notesAr : dealer.notesEn || dealer.notesAr}</span>
                    </div>
                  )}

                  {/* Feature Badges */}
                  <div className="flex flex-wrap gap-2 mb-6 pt-3 border-t border-neutral-800/60">
                    {dealer.hasTestRide && (
                      <span className="inline-flex items-center gap-1.5 text-xs bg-neutral-950 border border-neutral-800 text-neutral-300 px-3 py-1 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5 text-red-500" /> {isAr ? 'تجربة قيادة متاحة' : 'Test Rides'}
                      </span>
                    )}
                    {dealer.hasMaintenance && (
                      <span className="inline-flex items-center gap-1.5 text-xs bg-neutral-950 border border-neutral-800 text-neutral-300 px-3 py-1 rounded-xl">
                        <Wrench className="w-3.5 h-3.5 text-blue-400" /> {isAr ? 'مركز صيانة' : 'Service Center'}
                      </span>
                    )}
                    {dealer.hasSpareParts && (
                      <span className="inline-flex items-center gap-1.5 text-xs bg-neutral-950 border border-neutral-800 text-neutral-300 px-3 py-1 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5 text-red-400" /> {isAr ? 'قطع غيار أصلي' : 'Genuine Parts'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Direct Action Buttons: Call, WhatsApp & Google Maps */}
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <a
                    href={`tel:${dealer.phone.replace(/[^0-9+]/g, '')}`}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-red-400" />
                    <span>{isAr ? 'اتصال' : 'Call'}</span>
                  </a>

                  <button
                    onClick={() => handleWhatsAppContact(dealer)}
                    className="bg-gradient-to-r from-[#E60012] via-red-600 to-rose-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-xs py-3.5 rounded-2xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-red-950/40 border border-red-500/30"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{isAr ? 'واتساب' : 'WhatsApp'}</span>
                  </button>

                  <a
                    href={dealer.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dealer.nameAr + ' ' + dealer.addressAr)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-neutral-800 hover:bg-red-600 text-white font-bold text-xs py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-1.5 group/map"
                  >
                    <Navigation className="w-3.5 h-3.5 text-blue-400 group-hover/map:text-white" />
                    <span>{isAr ? 'الخريطة' : 'Map'}</span>
                  </a>
                </div>

              </div>
            ))
          ) : (
            <div className="col-span-2 bg-neutral-900/60 border border-neutral-800 rounded-3xl p-12 text-center text-neutral-400">
              <MapPin className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">
                {isAr ? 'لم يتم العثور على معارض مطابقة' : 'No outlets found'}
              </h3>
              <p className="text-sm text-neutral-400 mb-4">
                {isAr ? 'جرّب إعادة ضبط الفلاتر أو البحث باسم محافظة أخرى.' : 'Try clearing your filters or search for another city.'}
              </p>
              <button
                onClick={handleClearFilters}
                className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-colors"
              >
                {isAr ? 'إعادة ضبط البحث' : 'Reset Search'}
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
