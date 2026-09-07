'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/customer/Header';
import Footer from '@/components/customer/Footer';
import { checkWarrantyApi } from '@/lib/api';
import {
  ShieldCheck, Search, CheckCircle2, AlertTriangle, XCircle,
  Phone, Calendar, Wrench, Gauge, User, Mail,
  Bike, FileText, Loader2, Hash, Palette, Building2,
  CalendarCheck, CalendarClock, Activity, Download,
  ArrowRight, ArrowLeft, Check, Sparkles, Award, ShieldAlert, KeyRound
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

// ━━━━━━━━━━━━━━━━━━━━━━ Interfaces ━━━━━━━━━━━━━━━━━━━━━━
interface WarrantyRecord {
  id: string;
  chassis_no: string;
  engine_no: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  national_id: string | null;
  scooter_model: string;
  scooter_color: string;
  purchase_date: string;
  warranty_expiry: string;
  warranty_years: number;
  showroom: string;
  last_service_date: string | null;
  next_service_date: string | null;
  service_count: number;
  mileage_km: number;
  status_en: 'Active' | 'Expiring Soon' | 'Expired' | 'Voided';
  status_raw: string;
  notes: string | null;
  remaining_days: number;
  remaining_months: number;
  progress_percent: number;
  is_expired: boolean;
  total_warranty_days: number;
}

// Form steps
type Step = 1 | 2 | 3;

// ━━━━━━━━━━━━━━━ Circular Telemetry Progress ━━━━━━━━━━━━━━━
function WarrantyRing({ percent, status, remainingMonths, remainingDays, isAr, t }: {
  percent: number; status: string; remainingMonths: number; remainingDays: number; isAr: boolean; t: (key: string, fallback?: string) => string;
}) {
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const usedPercent = Math.min(percent, 100);
  const offset = circumference - (usedPercent / 100) * circumference;

  const statusConfig = {
    'Active': { color: '#22C55E', glow: 'rgba(34,197,94,0.35)', badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', label: t('warranty.activeStatus', 'OFFICIAL WARRANTY ACTIVE') },
    'Expiring Soon': { color: '#F59E0B', glow: 'rgba(245,158,11,0.35)', badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400', label: t('warranty.expiringStatus', 'EXPIRING SOON') },
    'Expired': { color: '#EF4444', glow: 'rgba(239,68,68,0.35)', badgeBg: 'bg-red-500/10 border-red-500/30 text-red-400', label: t('warranty.expiredStatus', 'WARRANTY EXPIRED') },
    'Voided': { color: '#6B7280', glow: 'rgba(107,114,128,0.35)', badgeBg: 'bg-zinc-800 border-zinc-700 text-zinc-400', label: t('warranty.voidedStatus', 'WARRANTY VOIDED') },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Active'];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-48 h-48">
        <div 
          className="absolute inset-4 rounded-full blur-2xl opacity-30 transition-all"
          style={{ backgroundColor: config.color }}
        />
        <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 170 170">
          <circle cx="85" cy="85" r={radius} fill="none" stroke="#18181B" strokeWidth="10" />
          <motion.circle
            cx="85" cy="85" r={radius} fill="none"
            stroke={config.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 10px ${config.glow})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
          <motion.span
            className="text-4xl font-black font-mono tracking-tight"
            style={{ color: config.color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            {status === 'Expired' ? '0' : remainingMonths}
          </motion.span>
          <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">{t('warranty.monthsLeft', 'Months Left')}</span>
          <span className="text-[10px] text-zinc-500 font-mono">({remainingDays} {t('warranty.days', 'Days')})</span>
        </div>
      </div>
      
      <div className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase border flex items-center gap-2 ${config.badgeBg}`}>
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: config.color }} />
        {config.label}
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━ Component: Detail Item ━━━━━━━━━━━━━━━━
function DetailBox({ icon: Icon, label, value, highlight = false, mono = false }: {
  icon: React.ElementType; label: string; value: string | number | null; highlight?: boolean; mono?: boolean;
}) {
  if (!value && value !== 0) return null;
  return (
    <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/60 hover:border-zinc-700/80 transition-all flex items-center gap-3.5">
      <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-zinc-400" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">{label}</span>
        <p className={`text-xs font-bold mt-0.5 truncate ${highlight ? 'text-[#E60012]' : 'text-zinc-100'} ${mono ? 'font-mono' : ''}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━ MAIN PAGE COMPONENT ━━━━━━━━━━━━━━━━
export default function WarrantyPage() {
  const { language, dir, t } = useLanguage();
  const isAr = language === 'ar';
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Form State
  const [chassisNo, setChassisNo] = useState('');
  const [phone, setPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');

  // Execution State
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<WarrantyRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Step Validation
  const validateStep1 = () => {
    return chassisNo.trim().length >= 5;
  };

  const validateStep2 = () => {
    return phone.trim().length >= 8 && customerName.trim().length >= 2;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleFinalVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await checkWarrantyApi(chassisNo.trim(), phone.trim());

      if (response.success && response.data) {
        setResult(response.data as WarrantyRecord);
      } else {
        setError(response.error || (isAr ? 'لم يتم العثور على سجل ضمان مطبق لرقم الشاسيه ورقم الهاتف المدخلين في قاعدة البيانات.' : 'No matching official SYM warranty record found in database for provided VIN and Mobile.'));
      }
    } catch {
      setError(isAr ? 'فشل الاتصال بالخادم. يرجى التأكد من اتصال الإنترنت.' : 'Connection to server failed. Please ensure backend services are active.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setChassisNo('');
    setPhone('');
    setCustomerName('');
    setEmail('');
    setResult(null);
    setError(null);
  };

  const formatDate = (d: string | null) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#000000] text-white font-sans select-none" dir={dir}>
      <Header />

      <main className="flex-1 pt-28 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#E60012]/10 blur-[150px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto space-y-10 relative z-10">

          {/* ════════════════ HERO TITLE ════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E60012]/10 border border-[#E60012]/30 text-[#E60012] text-xs font-black tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>{t('warranty.badge', 'OFFICIAL SYM EGYPT WARRANTY VERIFICATION')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white">
              {isAr ? 'بوابة فحص وتتبع ' : 'Scooter '}
              <span className="text-[#E60012]">{isAr ? 'ضمان السكوتر' : 'Warranty Telemetry'}</span>
              {isAr ? ' الرسمي' : ' Portal'}
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
              {t('warranty.subtitle', 'Complete the guided verification process to fetch live factory warranty status, mileage metrics, and official service history directly from database records.')}
            </p>
          </motion.div>

          {/* ════════════════ STEPPER PROGRESS BAR ════════════════ */}
          {!result && (
            <div className="max-w-2xl mx-auto px-4">
              <div className="flex items-center justify-between relative">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-800 -translate-y-1/2 z-0" />
                <div 
                  className="absolute top-1/2 left-0 h-0.5 bg-[#E60012] -translate-y-1/2 z-0 transition-all duration-500"
                  style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
                />

                {/* Step 1 Circle */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${currentStep >= 1 ? 'bg-[#E60012] text-white shadow-lg shadow-[#E60012]/40 ring-4 ring-black' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}>
                    {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${currentStep >= 1 ? 'text-white' : 'text-zinc-500'}`}>
                    {isAr ? 'رقم الشاسيه' : 'Vehicle VIN'}
                  </span>
                </div>

                {/* Step 2 Circle */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${currentStep >= 2 ? 'bg-[#E60012] text-white shadow-lg shadow-[#E60012]/40 ring-4 ring-black' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}>
                    {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${currentStep >= 2 ? 'text-white' : 'text-zinc-500'}`}>
                    {isAr ? 'بيانات المالك' : 'Owner Details'}
                  </span>
                </div>

                {/* Step 3 Circle */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${currentStep === 3 ? 'bg-[#E60012] text-white shadow-lg shadow-[#E60012]/40 ring-4 ring-black' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}>
                    3
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${currentStep === 3 ? 'text-white' : 'text-zinc-500'}`}>
                    {isAr ? 'فحص الضمان' : 'Verification'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════ MULTI-STEP FORM ════════════════ */}
          {!result && (
            <motion.div
              layout
              className="bg-[#0A0A0A] border border-zinc-800/90 rounded-3xl p-6 sm:p-10 shadow-2xl max-w-2xl mx-auto relative"
            >
              <AnimatePresence mode="wait">
                
                {/* STEP 1: VEHICLE VIN */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: isAr ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isAr ? -20 : 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="border-b border-zinc-900 pb-4">
                      <h3 className="text-xl font-black text-white flex items-center gap-2">
                        <Bike className="w-5 h-5 text-[#E60012]" />
                        {t('warranty.step1Title', 'Step 1: Enter Chassis VIN Number')}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1">
                        {t('warranty.step1Desc', 'Input the official Chassis VIN engraved on your SYM scooter or vehicle license documentation.')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Hash className="w-4 h-4 text-[#E60012]" />
                        {t('warranty.vinLabel', 'Chassis VIN Number *')}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={t('warranty.vinPlaceholder', 'e.g. SYM-CH-2025-94021')}
                        value={chassisNo}
                        onChange={(e) => setChassisNo(e.target.value)}
                        className="w-full px-4 py-4 rounded-xl bg-black border border-zinc-800 text-base text-white placeholder-zinc-600 focus:outline-none focus:border-[#E60012] font-mono font-bold uppercase transition-all"
                      />
                    </div>

                    {/* Pre-fill Quick Selection */}
                    <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#E60012]" />
                        {t('warranty.quickSamples', 'Quick Test Sample VIN Records:')}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setChassisNo('SYM-CH-2025-94021');
                            setPhone('01001234567');
                            setCustomerName('Ahmed Mohamed');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 hover:border-[#E60012] hover:text-white transition-all"
                        >
                          SYM-CH-2025-94021 (Jet 14 EVO)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setChassisNo('SYM-CH-2024-71093');
                            setPhone('01223456789');
                            setCustomerName('Mohamed Kareem');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 hover:border-[#E60012] hover:text-white transition-all"
                        >
                          SYM-CH-2024-71093 (Husky ADV)
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        type="button"
                        disabled={!validateStep1()}
                        onClick={handleNextStep}
                        className="py-3.5 px-8 rounded-xl bg-[#E60012] hover:bg-[#C4000F] disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#E60012]/30 transition-all flex items-center gap-2"
                      >
                        <span>{t('warranty.nextOwner', 'Next: Owner Details')}</span>
                        <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: OWNER DETAILS */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: isAr ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isAr ? 20 : -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="border-b border-zinc-900 pb-4">
                      <h3 className="text-xl font-black text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-[#E60012]" />
                        {t('warranty.step2Title', 'Step 2: Registered Owner Identification')}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1">
                        {t('warranty.step2Desc', 'Provide the owner name and registered phone number used during vehicle purchase.')}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                          <User className="w-4 h-4 text-[#E60012]" />
                          {t('warranty.ownerName', 'Customer / Owner Name *')}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={t('warranty.ownerPlaceholder', 'Full Owner Name')}
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full px-4 py-3.5 rounded-xl bg-black border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#E60012] font-bold transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Phone className="w-4 h-4 text-[#E60012]" />
                          {t('warranty.phone', 'Registered Phone Number *')}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={t('warranty.phonePlaceholder', 'e.g. 01001234567')}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-3.5 rounded-xl bg-black border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#E60012] font-mono font-bold transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Mail className="w-4 h-4 text-zinc-500" />
                          {t('warranty.email', 'Email Address (Optional)')}
                        </label>
                        <input
                          type="email"
                          placeholder={t('warranty.emailPlaceholder', 'owner@example.com')}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3.5 rounded-xl bg-black border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#E60012] font-medium transition-all"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="py-3.5 px-6 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider border border-zinc-800 transition-all flex items-center gap-2"
                      >
                        <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                        <span>{t('warranty.back', 'Back')}</span>
                      </button>

                      <button
                        type="button"
                        disabled={!validateStep2()}
                        onClick={handleNextStep}
                        className="py-3.5 px-8 rounded-xl bg-[#E60012] hover:bg-[#C4000F] disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#E60012]/30 transition-all flex items-center gap-2"
                      >
                        <span>{t('warranty.nextVerify', 'Next: Review & Verify')}</span>
                        <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: REVIEW & EXECUTE VERIFICATION */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: isAr ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isAr ? 20 : -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="border-b border-zinc-900 pb-4">
                      <h3 className="text-xl font-black text-white flex items-center gap-2">
                        <KeyRound className="w-5 h-5 text-[#E60012]" />
                        {t('warranty.step3Title', 'Step 3: Review Telemetry Verification Request')}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1">
                        {t('warranty.step3Desc', 'Confirm details before querying official SYM Egypt database records.')}
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-zinc-500 font-bold uppercase text-[10px]">{t('warranty.chassisNo', 'Chassis VIN')}:</span>
                          <p className="font-mono font-bold text-white text-sm mt-0.5">{chassisNo.toUpperCase()}</p>
                        </div>
                        <div>
                          <span className="text-zinc-500 font-bold uppercase text-[10px]">{t('warranty.registeredOwner', 'Owner Name')}:</span>
                          <p className="font-bold text-white text-sm mt-0.5">{customerName}</p>
                        </div>
                        <div>
                          <span className="text-zinc-500 font-bold uppercase text-[10px]">{t('warranty.phoneNumber', 'Phone Number')}:</span>
                          <p className="font-mono font-bold text-white mt-0.5">{phone}</p>
                        </div>
                        <div>
                          <span className="text-zinc-500 font-bold uppercase text-[10px]">{t('warranty.emailAddr', 'Email Address')}:</span>
                          <p className="font-medium text-zinc-300 mt-0.5">{email || (isAr ? 'غير محدد' : 'Not specified')}</p>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-xs">
                        <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="pt-4 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="py-3.5 px-6 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider border border-zinc-800 transition-all flex items-center gap-2"
                      >
                        <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                        <span>{t('warranty.back', 'Back')}</span>
                      </button>

                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={handleFinalVerification}
                        className="py-4 px-10 rounded-xl bg-[#E60012] hover:bg-[#C4000F] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#E60012]/40 transition-all flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{t('warranty.querying', 'Querying Database...')}</span>
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4" />
                            <span>{t('warranty.runVerify', 'Run Verification')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          )}

          {/* ════════════════ VERIFIED DASHBOARD RESULT ════════════════ */}
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0A0A0A] border border-zinc-800 p-6 rounded-3xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">{t('warranty.matchTitle', 'Official Warranty Telemetry Match')}</h2>
                    <p className="text-xs text-zinc-400">{t('warranty.recordId', 'Database Record ID:')} {result.id}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white hover:border-zinc-700 transition-all"
                >
                  {t('warranty.verifyAnother', 'Verify Another VIN')}
                </button>
              </div>

              {/* Row 1: Circular Progress + Passport */}
              <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">

                {/* Progress Ring Card */}
                <div className="bg-[#0A0A0A] border border-zinc-800/90 rounded-3xl p-7 flex flex-col items-center justify-between shadow-xl">
                  <WarrantyRing
                    percent={result.progress_percent}
                    status={result.status_en}
                    remainingMonths={result.remaining_months}
                    remainingDays={result.remaining_days}
                    isAr={isAr}
                    t={t}
                  />

                  <div className="w-full mt-6 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      <span>{isAr ? 'تاريخ الشراء' : 'Purchase'}</span>
                      <span>{isAr ? 'تاريخ الانتهاء' : 'Expiry'}</span>
                    </div>
                    <div className="h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: result.status_en === 'Active' ? '#22C55E' :
                            result.status_en === 'Expiring Soon' ? '#F59E0B' : '#EF4444'
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(result.progress_percent, 100)}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                      <span>{result.purchase_date}</span>
                      <span>{result.warranty_expiry}</span>
                    </div>
                  </div>
                </div>

                {/* Scooter Passport */}
                <div className="bg-[#0A0A0A] border border-zinc-800/90 rounded-3xl p-7 space-y-6 shadow-xl">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#E60012]/10 border border-[#E60012]/30 flex items-center justify-center">
                        <Bike className="w-6 h-6 text-[#E60012]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white tracking-tight">{result.scooter_model}</h3>
                        <p className="text-xs text-zinc-400">{isAr ? 'سجل رسمي معتمد من المصنع' : 'Official Factory Certified Record'}</p>
                      </div>
                    </div>
                    <span className="px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono font-bold text-zinc-300">
                      {result.warranty_years} {isAr ? 'سنوات ضمان مصنعي' : 'Years Factory Warranty'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <DetailBox icon={Hash} label={t('warranty.chassisNo', 'Chassis VIN')} value={result.chassis_no} mono />
                    <DetailBox icon={Hash} label={t('warranty.engineNo', 'Engine Number')} value={result.engine_no} mono />
                    <DetailBox icon={Palette} label={t('warranty.scooterColor', 'Scooter Color')} value={result.scooter_color} />
                    <DetailBox icon={Gauge} label={t('warranty.odometer', 'Recorded Odometer')} value={`${result.mileage_km.toLocaleString()} KM`} />
                    <DetailBox icon={User} label={t('warranty.registeredOwner', 'Registered Owner')} value={result.customer_name} />
                    <DetailBox icon={Phone} label={t('warranty.phoneNumber', 'Phone Number')} value={result.customer_phone} mono />
                    <DetailBox icon={Mail} label={t('warranty.emailAddr', 'Email Address')} value={result.customer_email} />
                    <DetailBox icon={Building2} label={t('warranty.dealer', 'Authorized Dealer')} value={result.showroom} />
                    <DetailBox icon={Calendar} label={t('warranty.expiryDate', 'Warranty Expiry')} value={formatDate(result.warranty_expiry)} highlight={result.is_expired} />
                  </div>
                </div>

              </div>

              {/* Row 2: Service History & Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

                {/* Service History */}
                <div className="bg-[#0A0A0A] border border-zinc-800/90 rounded-3xl p-7 space-y-6 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">{t('warranty.inspectionLog', 'Maintenance Inspection Log')}</h3>
                      <p className="text-xs text-zinc-400">{t('warranty.dbRecords', 'Database Inspection Records')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl p-4 text-center">
                      <p className="text-3xl font-black font-mono text-white">{result.service_count}</p>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{t('warranty.completedServices', 'Completed Services')}</span>
                    </div>
                    <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl p-4 text-center">
                      <p className="text-3xl font-black font-mono text-white">{result.mileage_km.toLocaleString()}</p>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{t('warranty.totalMileage', 'Total Mileage (KM)')}</span>
                    </div>
                    <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl p-4 text-center">
                      <p className="text-2xl font-black font-mono text-amber-400">
                        {result.next_service_date ? formatDate(result.next_service_date) : (isAr ? 'مجدول' : 'Scheduled')}
                      </p>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{t('warranty.nextInspection', 'Next Inspection')}</span>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                        <CalendarCheck className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{t('warranty.deliveryActivation', 'Vehicle Delivery & Warranty Activation')}</p>
                        <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{formatDate(result.purchase_date)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/40 flex items-center justify-center flex-shrink-0">
                        <Wrench className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{t('warranty.lastLoggedService', 'Last Logged Maintenance Service')}</p>
                        <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{result.last_service_date ? formatDate(result.last_service_date) : t('warranty.noServiceLogged', 'No service logged yet')}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
                        <CalendarClock className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{t('warranty.nextScheduled', 'Next Scheduled Inspection Due')}</p>
                        <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{result.next_service_date ? formatDate(result.next_service_date) : t('warranty.contactDealer', 'Contact dealer to schedule')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-[#0A0A0A] border border-zinc-800/90 rounded-3xl p-7 space-y-4 shadow-xl">
                  <h3 className="text-lg font-black text-white">{isAr ? 'الإجراءات السريعة' : 'Actions'}</h3>

                  <a
                    href="https://wa.me/201271384149"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-[#E60012] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-[#E60012]" />
                      <div>
                        <p className="text-xs font-bold text-white">{t('warranty.customerSupport', 'Customer Support')}</p>
                        <span className="text-[10px] text-zinc-400">{isAr ? 'اتصال/واتساب 01271384149' : 'Call/WhatsApp 01271384149'}</span>
                      </div>
                    </div>
                  </a>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-blue-500 transition-all group text-start"
                  >
                    <div className="flex items-center gap-3">
                      <Download className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-xs font-bold text-white">{t('warranty.downloadCert', 'Download Digital Certificate')}</p>
                        <span className="text-[10px] text-zinc-400">{isAr ? 'طباعة PDF' : 'PDF Print'}</span>
                      </div>
                    </div>
                  </button>
                </div>

              </div>
            </motion.div>
          )}

          {/* ════════════════ WARRANTY COVERAGE INFO ════════════════ */}
          {!result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[#0A0A0A] border border-zinc-800/90 rounded-3xl p-8 space-y-6 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-[#E60012]" />
                <h2 className="text-xl font-black text-white tracking-tight uppercase">
                  {isAr ? 'سياسة وشروط الضمان الرسمي لـ SYM مصر' : 'SYM Official Warranty Coverage Policy'}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: isAr ? 'ضمان المصنع المعتمد لمدة سنتين' : 'Standard 2-Year Factory Warranty',
                    desc: isAr ? 'جميع سكوترات SYM الرسمية المشتراة من الموزعين المعتمدين تتمتع بضمان سنتين كاملتين على المحرك وناقل الحركة.' : 'All official SYM scooters purchased from authorized dealers feature 2 full years of factory engine and transmission coverage.'
                  },
                  {
                    title: isAr ? 'سجل الصيانة المعتمد' : 'Authorized Inspection Log',
                    desc: isAr ? 'يظل الضمان سارياً ومفعلاً عند تسجيل صيانات الفحص الدورية بمراكز خدمة SYM المعتمدة.' : 'Warranty remains fully active when regular service inspections are logged at authorized SYM service centers.'
                  },
                  {
                    title: isAr ? 'قطع غيار أصيلة معتمدة' : 'Genuine Certified Parts',
                    desc: isAr ? 'يتم استخدام قطع غيار SYM الأصلية فقط أثناء عمليات الصيانة لضمان التوافق التام مع الشروط.' : 'Only authentic SYM original replacement components are used during maintenance to ensure full warranty compliance.'
                  },
                  {
                    title: isAr ? 'قابلية نقل شهادة الضمان' : 'VIN Certificate Transferability',
                    desc: isAr ? 'الضمان الرسمي مرتبط مباشرة برقم الشاسيه (VIN) وينتقل تلقائياً للمالك الجديد.' : 'Official factory warranty is linked directly to vehicle Chassis VIN and seamlessly transfers to subsequent owners.'
                  },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/50 space-y-1.5">
                    <p className="text-xs font-bold text-white">{item.title}</p>
                    <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
