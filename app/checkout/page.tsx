'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Truck,
  AlertCircle,
  Phone,
  User,
  MapPin,
  Mail,
  CreditCard,
  Lock,
  Sparkles,
  Zap,
  Clock,
  Check,
  QrCode,
  Smartphone,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Header from '@/components/customer/Header';
import Footer from '@/components/customer/Footer';
import { initiateFawryPaymentApi } from '@/lib/api';

const EGYPT_CITIES = [
  { name: 'مدينة نصر', time: 'خلال 72 ساعة من تأكيد الطلب' },
  { name: 'مصر الجديدة', time: 'خلال 72 ساعة من تأكيد الطلب' },
  { name: 'المعادي', time: 'خلال 72 ساعة من تأكيد الطلب' },
  { name: 'حلوان', time: 'خلال 72 ساعة من تأكيد الطلب' },
  { name: 'عين شمس', time: 'خلال 72 ساعة من تأكيد الطلب' },
  { name: 'السلام', time: 'خلال 72 ساعة من تأكيد الطلب' },
  { name: 'القاهرة الجديدة', time: 'خلال 72 ساعة من تأكيد الطلب' },
  { name: 'التجمع', time: 'خلال 72 ساعة من تأكيد الطلب' },
  { name: 'الشروق', time: 'خلال 72 ساعة من تأكيد الطلب' },
  { name: 'العبور', time: 'خلال 72 ساعة من تأكيد الطلب' },
  { name: 'مدينتي', time: 'خلال 72 ساعة من تأكيد الطلب' },
  { name: 'العاصمة الإدارية', time: 'خلال 72 ساعة من تأكيد الطلب' },
  { name: 'مدينة المستقبل', time: 'خلال 72 ساعة من تأكيد الطلب' },
];

// Spare parts ship nationwide via courier, so orders made up of spare parts
// only can pick from every governorate — not just the Greater Cairo dealership
// network area used for scooter/bike delivery.
const EGYPT_GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر', 'البحيرة',
  'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية', 'المنيا', 'القليوبية',
  'الوادي الجديد', 'السويس', 'أسوان', 'أسيوط', 'بني سويف', 'بورسعيد',
  'دمياط', 'الشرقية', 'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر',
  'قنا', 'شمال سيناء', 'سوهاج',
].map((name) => ({ name, time: 'خلال 3-5 أيام عمل من تأكيد الطلب' }));

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, sessionId, clearCart } = useCart();

  const hasScooter = items.some((i) => i.item_type === 'scooter' || i.price >= 40000);
  const hasSpareParts = items.some((i) => i.item_type === 'spare_part' || i.price < 40000);

  const [selectedCityIndex, setSelectedCityIndex] = useState(0);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    street: '',
    building: '',
    apartment: '',
    landmark: '',
    notes: '',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ─── STRICT VALIDATION RULES ───
  const validateName = (name: string): string | null => {
    const trimmed = name.trim();
    if (!trimmed) return 'الاسم الكامل مطلوب';
    const words = trimmed.split(/\s+/).filter((w) => w.length >= 2);
    if (words.length < 3) return 'يرجى كتابة الاسم ثلاثياً بالكامل (مثال: أحمد محمد عبد العزيز)';
    if (trimmed.length < 8) return 'الاسم قصير جداً، يرجى كتابة الاسم الثلاثي بالكامل';
    if (!/^[\u0600-\u06FFa-zA-Z\s.'-]+$/.test(trimmed)) return 'الاسم يجب أن يحتوي على أحرف هجائية صحيحة فقط';
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    const clean = phone.replace(/[^0-9]/g, '');
    if (!clean) return 'رقم الموبايل والواتساب مطلوب';
    if (!/^01[0125][0-9]{8}$/.test(clean)) {
      return 'رقم الموبايل غير صحيح (يجب أن يكون 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015)';
    }
    return null;
  };

  const validateEmail = (email: string): string | null => {
    const trimmed = email.trim();
    if (!trimmed) return null; // optional
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
      return 'صيغة البريد الإلكتروني غير صحيحة (مثال: name@example.com)';
    }
    return null;
  };

  const validateStreet = (s: string): string | null => {
    const trimmed = s.trim();
    if (!trimmed) return 'اسم الشارع والحي مطلوب بدقة';
    if (trimmed.length < 5) return 'اسم الشارع قصير جداً، يرجى كتابة اسم الشارع والحي بالتفصيل';
    const dummy = [
      'cairo', 'القاهرة', 'شارع', 'test', 'aaa', 'asd', 'مصر', 'عنوان',
      'shubra', 'shubra el khima', 'شبرا', 'شبرا الخيمة', 'الشارع', 'شارعي'
    ];
    if (dummy.includes(trimmed.toLowerCase())) {
      return 'يرجى كتابة اسم شارع وحي حقيقي بالتفصيل (مثال: شارع مصطفى النحاس - متفرع من عباس العقاد)';
    }
    return null;
  };

  const validateBuilding = (b: string, street: string): string | null => {
    const trimmed = b.trim();
    if (!trimmed) return 'رقم العمارة / المبنى مطلوب بالأرقام';
    const hasDigits = /[0-9\u0660-\u0669]/.test(trimmed);
    const isVillaOrTower = /^(فيلا|برج|عمارة|مبنى|قطعة|بلوك|مجاورة|villa|tower|building|block)\s+[0-9\u0660-\u0669\w]/i.test(trimmed);
    if (!hasDigits && !isVillaOrTower) {
      return 'رقم العمارة غير صحيح، يجب أن يحتوي على رقم (مثال: 14 أو عمارة 14 أو فيلا 5)';
    }
    if (street && trimmed.toLowerCase() === street.trim().toLowerCase()) {
      return 'رقم العمارة لا يمكن أن يكون مطابقاً لاسم الشارع';
    }
    return null;
  };

  const validateApartment = (a: string, building: string, street: string): string | null => {
    const trimmed = a.trim();
    if (!trimmed) return 'رقم الشقة والدور مطلوب';
    const hasDigits = /[0-9\u0660-\u0669]/.test(trimmed);
    const isGroundOrVilla = /^(أرضي|ارضي|دور ارضي|دور أرضي|ground|villa|كامل|الفيلا بالكامل|الدور بالكامل)/i.test(trimmed);
    if (!hasDigits && !isGroundOrVilla) {
      return 'رقم الشقة والدور غير صحيح، يجب أن يحتوي على أرقام (مثال: الدور الرابع - شقة 8 أو دور أرضي)';
    }
    if (building && trimmed.toLowerCase() === building.trim().toLowerCase()) {
      return 'رقم الشقة والدور لا يمكن أن يكون مكرراً لرقم العمارة';
    }
    if (street && trimmed.toLowerCase() === street.trim().toLowerCase()) {
      return 'رقم الشقة والدور لا يمكن أن يكون مكرراً لاسم الشارع';
    }
    return null;
  };

  const validateLandmark = (l: string, street: string): string | null => {
    const trimmed = l.trim();
    if (!trimmed) return 'العلامة المميزة مطلوبة لتسهيل وصول المندوب';
    if (trimmed.length < 4) return 'يرجى كتابة علامة مميزة واضحة (مثال: بجوار صيدلية العزبي / أمام بنك مصر)';
    if (street && trimmed.toLowerCase() === street.trim().toLowerCase()) {
      return 'العلامة المميزة يجب أن تكون مكاناً معروفاً مختلفاً عن اسم الشارع';
    }
    return null;
  };

  const errors = {
    customer_name: validateName(formData.customer_name),
    customer_phone: validatePhone(formData.customer_phone),
    customer_email: validateEmail(formData.customer_email),
    street: validateStreet(formData.street),
    building: validateBuilding(formData.building, formData.street),
    apartment: validateApartment(formData.apartment, formData.building, formData.street),
    landmark: validateLandmark(formData.landmark, formData.street),
  };

  const isAddressComplete = !errors.street && !errors.building && !errors.apartment && !errors.landmark && formData.street && formData.building && formData.apartment && formData.landmark;
  const isAddressTouched = touched.street || touched.building || touched.apartment || touched.landmark;
  const hasAddressError = errors.street || errors.building || errors.apartment || errors.landmark;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isSparePartsOnlyOrder = hasSpareParts && !hasScooter;
  const locationOptions = isSparePartsOnlyOrder ? EGYPT_GOVERNORATES : EGYPT_CITIES;
  const currentCity = locationOptions[selectedCityIndex] || locationOptions[0];

  // Reset the selection when switching between the Cairo-only list and the
  // nationwide governorate list so a stale index doesn't silently point at
  // the wrong entry in the other list. Intentional: the same numeric index
  // means a different place in each list, so this can't be computed as a
  // plain derivation from isSparePartsOnlyOrder alone — the reset has to
  // happen only on the transition, not on every render.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedCityIndex(0);
  }, [isSparePartsOnlyOrder]);
  const vatRate = 0.14;
  const vatAmount = subtotal * vatRate;
  const grandTotal = subtotal + vatAmount;

  const fullStructuredAddress = `${currentCity.name} - شارع: ${formData.street.trim()}، عمارة: ${formData.building.trim()}، دور/شقة: ${formData.apartment.trim()}، علامة مميزة: ${formData.landmark.trim()}`;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    setTouched({
      customer_name: true,
      customer_phone: true,
      customer_email: true,
      street: true,
      building: true,
      apartment: true,
      landmark: true,
    });

    if (errors.customer_name) {
      setErrorMessage(errors.customer_name);
      return;
    }

    const cleanPhone = formData.customer_phone.replace(/[^0-9]/g, '');
    if (errors.customer_phone) {
      setErrorMessage(errors.customer_phone);
      return;
    }

    if (errors.customer_email) {
      setErrorMessage(errors.customer_email);
      return;
    }

    if (errors.street || errors.building || errors.apartment || errors.landmark) {
      setErrorMessage('يرجى استكمال جميع بيانات العنوان الأربعة (اسم الشارع، رقم العمارة، رقم الشقة/الدور، والعلامة المميزة) للمتابعة للدفع.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('سلة التسوق فارغة حالياً. قم بإضافة سكوتر أو قطع غيار للشراء أولاً.');
      return;
    }

    setLoading(true);

    try {
      const result = await initiateFawryPaymentApi({
        session_id: sessionId,
        customer_name: formData.customer_name.trim(),
        customer_phone: cleanPhone,
        customer_email: formData.customer_email.trim(),
        city: currentCity.name,
        address: fullStructuredAddress,
        payment_method: 'CARD',
        items: items.map((i) => ({
          product_id: i.product_id,
          product_name: i.product_name,
          quantity: i.quantity,
          image: i.image,
        })),
      });

      if (!result.success || !result.data?.order_no || !result.data?.merchant_ref_num) {
        setErrorMessage(result.error || 'تعذَّر الاتصال ببوابة الدفع فوري حالياً. يرجى المحاولة لاحقاً أو التواصل مع خدمة العملاء.');
        setLoading(false);
        return;
      }

      const { order_no, merchant_ref_num, fawry_ref_number, redirect_url, amount } = result.data;

      await clearCart();

      // Fawry returned a hosted payment page (CARD / MWALLET) — send the browser there directly
      if (redirect_url) {
        window.location.href = redirect_url;
        return;
      }

      // Otherwise (e.g. PAYATFAWRY reference code) show our reference-code confirmation screen
      const scooterName = items[0]?.product_name || 'سكوتر SYM';
      router.push(
        `/payment/fawry?orderNo=${encodeURIComponent(order_no)}&merchantRefNum=${encodeURIComponent(merchant_ref_num)}&amount=${amount}&fawryRef=${encodeURIComponent(fawry_ref_number || '')}&name=${encodeURIComponent(
          formData.customer_name.trim()
        )}&phone=${encodeURIComponent(cleanPhone)}&model=${encodeURIComponent(scooterName)}`
      );
    } catch {
      setErrorMessage('حدث خطأ أثناء الاتصال ببوابة الدفع، يرجى التحقق من اتصال الإنترنت وإعادة المحاولة.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans antialiased flex flex-col justify-between selection:bg-[#E60012] selection:text-white" dir="rtl">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-8">
          <Link href="/" className="hover:text-white transition-colors">الرئيسية</Link>
          <span>/</span>
          <Link href="/all-models" className="hover:text-white transition-colors">السكوترز والمنتجات</Link>
          <span>/</span>
          <span className="text-[#E60012] font-semibold">إتمام الشراء وبوابة فوري</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="flex-1 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold mb-2">
                <Lock className="w-3.5 h-3.5" />
                <span>FAWRY SECURE ONLINE CHECKOUT</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">إتمام طلب الشراء والدفع عبر فوري</h1>
              <p className="text-sm text-zinc-400 mt-1">قم باستيفاء بياناتك وعنوانك المفصل بدقة للانتقال لبوابة فوري وسداد قيمة الطلب وتأكيد الشحن</p>
            </div>

            {errorMessage && (
              <div className="p-4 bg-red-950/60 border border-red-500/80 rounded-2xl flex items-start gap-3 text-sm text-red-200 shadow-xl shadow-red-950/40">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block text-red-100">يرجى تصحيح البيانات التالية للمتابعة:</span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Section 1: Personal Info */}
              <div className="p-6 bg-[#0A0A0A] border border-zinc-800/80 rounded-2xl space-y-4 shadow-xl">
                <h3 className="text-base font-bold text-white flex items-center justify-between border-b border-zinc-800/60 pb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-[#E60012]" />
                    <span>1. البيانات الشخصية وبيانات التواصل</span>
                  </div>
                  <span className="text-[11px] text-zinc-500 font-mono">خطوة 1 من 2</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                      <span>الاسم بالكامل (الثلاثي) <span className="text-[#E60012]">*</span></span>
                      {touched.customer_name && !errors.customer_name && (
                        <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> تم التحقق
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('customer_name')}
                        placeholder="مثال: أحمد محمد عبد العزيز"
                        className={`w-full bg-zinc-950 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-colors ${
                          touched.customer_name && errors.customer_name
                            ? 'border-red-500 bg-red-950/10 focus:border-red-500'
                            : touched.customer_name && !errors.customer_name
                            ? 'border-emerald-500/70 focus:border-emerald-500'
                            : 'border-zinc-800 focus:border-[#E60012]'
                        }`}
                      />
                    </div>
                    {touched.customer_name && errors.customer_name && (
                      <p className="text-[11px] text-red-400 font-bold flex items-center gap-1.5 pt-0.5">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{errors.customer_name}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                      <span>رقم الموبايل والواتساب <span className="text-[#E60012]">*</span></span>
                      {touched.customer_phone && !errors.customer_phone && (
                        <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> رقم صالح
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        maxLength={11}
                        name="customer_phone"
                        value={formData.customer_phone}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('customer_phone')}
                        placeholder="010XXXXXXXX"
                        className={`w-full bg-zinc-950 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-colors dir-ltr text-right font-mono ${
                          touched.customer_phone && errors.customer_phone
                            ? 'border-red-500 bg-red-950/10 focus:border-red-500'
                            : touched.customer_phone && !errors.customer_phone
                            ? 'border-emerald-500/70 focus:border-emerald-500'
                            : 'border-zinc-800 focus:border-[#E60012]'
                        }`}
                      />
                    </div>
                    {touched.customer_phone && errors.customer_phone && (
                      <p className="text-[11px] text-red-400 font-bold flex items-center gap-1.5 pt-0.5">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{errors.customer_phone}</span>
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                      <span>البريد الإلكتروني لاستلام الفاتورة الضريبية (اختياري)</span>
                      {formData.customer_email && !errors.customer_email && (
                        <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> صيغة صحيحة
                        </span>
                      )}
                    </label>
                    <input
                      type="email"
                      name="customer_email"
                      value={formData.customer_email}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('customer_email')}
                      placeholder="name@example.com"
                      className={`w-full bg-zinc-950 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-colors font-mono dir-ltr text-right ${
                        touched.customer_email && errors.customer_email
                          ? 'border-red-500 bg-red-950/10 focus:border-red-500'
                          : 'border-zinc-800 focus:border-[#E60012]'
                      }`}
                    />
                    {touched.customer_email && errors.customer_email && (
                      <p className="text-[11px] text-red-400 font-bold flex items-center gap-1.5 pt-0.5">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{errors.customer_email}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Unified Detailed Address Box */}
              <div className="p-6 bg-[#0A0A0A] border border-zinc-800/80 rounded-2xl space-y-4 shadow-xl">
                <h3 className="text-base font-bold text-white flex items-center justify-between border-b border-zinc-800/60 pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#E60012]" />
                    <span>2. عنوان التوصيل والاستلام المفصل</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>التوصيل خلال 72 ساعة من تأكيد الطلب</span>
                  </span>
                </h3>

                <div className="space-y-4 pt-1">
                  {/* Area Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">
                      {isSparePartsOnlyOrder ? 'المحافظة (توصيل لكل محافظات مصر)' : 'المنطقة / الحي المعتمد'} <span className="text-[#E60012]">*</span>
                    </label>
                    <select
                      value={selectedCityIndex}
                      onChange={(e) => setSelectedCityIndex(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#E60012] transition-colors font-bold cursor-pointer"
                    >
                      {locationOptions.map((c, idx) => (
                        <option key={idx} value={idx} className="bg-zinc-900 text-white py-1">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Unified Address Container Box */}
                  <div className={`p-4 rounded-2xl border transition-all space-y-3.5 ${
                    isAddressComplete
                      ? 'bg-zinc-950 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.08)]'
                      : isAddressTouched && hasAddressError
                      ? 'bg-zinc-950 border-red-500/60'
                      : 'bg-zinc-950 border-zinc-800'
                  }`}>
                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#E60012]" />
                        <span>بيانات العنوان الدقيق بالكامل</span>
                        <span className="text-[#E60012] font-black">*</span>
                      </span>
                      {isAddressComplete ? (
                        <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                          <Check className="w-3 h-3" /> تم اكتمال بيانات العنوان 100%
                        </span>
                      ) : (
                        <span className="text-amber-400 text-[10px] font-bold flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
                          <AlertCircle className="w-3 h-3" /> استوفِ الحقول الأربعة
                        </span>
                      )}
                    </div>

                    {/* Street */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-300 flex items-center justify-between">
                        <span>1. اسم الشارع والحي بالتفصيل <span className="text-[#E60012]">*</span></span>
                        {touched.street && !errors.street && (
                          <span className="text-emerald-400 text-[10px] font-bold">✓ تم الإدخال</span>
                        )}
                      </label>
                      <input
                        type="text"
                        required
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('street')}
                        placeholder="مثال: شارع مصطفى النحاس - متفرع من عباس العقاد"
                        className={`w-full bg-zinc-900 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors ${
                          touched.street && errors.street
                            ? 'border-red-500 bg-red-950/20'
                            : touched.street && !errors.street
                            ? 'border-emerald-500/60'
                            : 'border-zinc-800 focus:border-[#E60012]'
                        }`}
                      />
                      {touched.street && errors.street && (
                        <p className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          <span>{errors.street}</span>
                        </p>
                      )}
                    </div>

                    {/* Building & Apartment Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-300 flex items-center justify-between">
                          <span>2. رقم العمارة / المبنى (أرقام) <span className="text-[#E60012]">*</span></span>
                          {touched.building && !errors.building && (
                            <span className="text-emerald-400 text-[10px] font-bold">✓ مكتمل</span>
                          )}
                        </label>
                        <input
                          type="text"
                          required
                          name="building"
                          value={formData.building}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur('building')}
                          placeholder="مثال: 14 أو عمارة 14 أو فيلا 5"
                          className={`w-full bg-zinc-900 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors ${
                            touched.building && errors.building
                              ? 'border-red-500 bg-red-950/20'
                              : touched.building && !errors.building
                              ? 'border-emerald-500/60'
                              : 'border-zinc-800 focus:border-[#E60012]'
                          }`}
                        />
                        {touched.building && errors.building && (
                          <p className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" />
                            <span>{errors.building}</span>
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-300 flex items-center justify-between">
                          <span>3. رقم الشقة والدور (أرقام) <span className="text-[#E60012]">*</span></span>
                          {touched.apartment && !errors.apartment && (
                            <span className="text-emerald-400 text-[10px] font-bold">✓ مكتمل</span>
                          )}
                        </label>
                        <input
                          type="text"
                          required
                          name="apartment"
                          value={formData.apartment}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur('apartment')}
                          placeholder="مثال: شقة 8 - الدور الرابع أو دور أرضي"
                          className={`w-full bg-zinc-900 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors ${
                            touched.apartment && errors.apartment
                              ? 'border-red-500 bg-red-950/20'
                              : touched.apartment && !errors.apartment
                              ? 'border-emerald-500/60'
                              : 'border-zinc-800 focus:border-[#E60012]'
                          }`}
                        />
                        {touched.apartment && errors.apartment && (
                          <p className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" />
                            <span>{errors.apartment}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Landmark */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-300 flex items-center justify-between">
                        <span>4. أقرب علامة مميزة لتسهيل الوصول <span className="text-[#E60012]">*</span></span>
                        {touched.landmark && !errors.landmark && (
                          <span className="text-emerald-400 text-[10px] font-bold">✓ مكتمل</span>
                        )}
                      </label>
                      <input
                        type="text"
                        required
                        name="landmark"
                        value={formData.landmark}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('landmark')}
                        placeholder="مثال: بجوار صيدلية العزبي / أمام بنك مصر"
                        className={`w-full bg-zinc-900 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors ${
                          touched.landmark && errors.landmark
                            ? 'border-red-500 bg-red-950/20'
                            : touched.landmark && !errors.landmark
                            ? 'border-emerald-500/60'
                            : 'border-zinc-800 focus:border-[#E60012]'
                        }`}
                      />
                      {touched.landmark && errors.landmark && (
                        <p className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          <span>{errors.landmark}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Address Summary Preview Badge */}
                  {isAddressComplete && (
                    <div className="p-3.5 bg-zinc-950 border border-emerald-500/30 rounded-xl text-xs space-y-1 shadow-md">
                      <span className="text-[10px] font-bold text-emerald-400 block flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> العنوان المعتمد على بوليصة الشحن والفاتورة:
                      </span>
                      <p className="text-white font-medium">
                        <span className="text-[#E60012] font-bold">{currentCity.name}</span> — شارع {formData.street}، عمارة {formData.building}، شقة/دور {formData.apartment} (علامة مميزة: {formData.landmark})
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Official Fawry Gateway Banner */}
              <div className="p-6 bg-gradient-to-br from-zinc-900 via-[#0C0C10] to-zinc-950 border border-amber-500/40 rounded-2xl space-y-4 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-500 text-zinc-950 font-black text-xs">
                      FAWRY PAY
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">بوابة الدفع الإلكتروني المعتمدة (Fawry Pay Online)</h4>
                      <p className="text-[10px] text-zinc-400">سداد إلكتروني معتمد 100% — لا يوجد دفع عند الاستلام</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    SSL Encrypted
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                    <QrCode className="w-4 h-4 text-amber-400" />
                    <h5 className="text-[11px] font-bold text-white">كود دفع فوري المرجعي</h5>
                    <p className="text-[9px] text-zinc-500">للسداد في أي ماكينة أو فرع فوري بلس</p>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                    <CreditCard className="w-4 h-4 text-[#E60012]" />
                    <h5 className="text-[11px] font-bold text-white">البطاقات البنكية</h5>
                    <p className="text-[9px] text-zinc-500">فيزا، ماستركارد، وميزة الوطنية</p>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <h5 className="text-[11px] font-bold text-white">المحافظ وإنستاباي</h5>
                    <p className="text-[9px] text-zinc-500">فودافون كاش و InstaPay</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black text-base py-4 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-3 group cursor-pointer"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-5 h-5 text-zinc-950" />
                    <span>الانتقال لبوابة فوري وتأكيد الدفع ({grandTotal.toLocaleString('ar-EG')} ج.م)</span>
                    <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1.5 transition-transform text-zinc-950" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Summary Right Sidebar */}
          <div className="w-full lg:w-96 space-y-6">
            <div className="p-6 bg-[#0A0A0A] border border-zinc-800/80 rounded-2xl space-y-5 sticky top-24 shadow-2xl">
              <h3 className="text-base font-bold text-white border-b border-zinc-800/60 pb-3 flex items-center justify-between">
                <span>ملخص سلة الشراء</span>
                <span className="text-xs text-zinc-400">({items.length}) منتجات</span>
              </h3>

              {/* Items List */}
              <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
                {items.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-4">السلة فارغة حالياً</p>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center text-xs">
                      <div className="relative w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <Image src={item.image || '/Husky ADV.png'} alt={item.product_name} fill className="object-contain p-1" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-zinc-200 truncate">{item.product_name}</h4>
                        <p className="text-zinc-500 mt-0.5">الكمية: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-white font-mono">{(item.price * item.quantity).toLocaleString('ar-EG')} ج.م</span>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-zinc-800/80 pt-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>المجموع الفرعي:</span>
                  <span className="text-zinc-200 font-semibold font-mono">{subtotal.toLocaleString('ar-EG')} ج.م</span>
                </div>

                {hasScooter && (
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>شحن السكوتر / البايك:</span>
                    <span className="text-amber-400 font-bold text-[11px] text-end">
                      تحدد مع خدمة العملاء
                      <span className="block text-[10px] text-zinc-400 font-normal">(تنسيق مباشر عبر الواتساب)</span>
                    </span>
                  </div>
                )}

                {hasSpareParts && (
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>شحن قطع الغيار ({currentCity.name}):</span>
                    <span className="text-amber-400 font-bold text-[11px] text-end">
                      تحدد مع خدمة العملاء
                      <span className="block text-[10px] text-zinc-400 font-normal">(تنسيق مباشر عبر الواتساب)</span>
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-zinc-400">
                  <span>موعد التسليم:</span>
                  <span className="text-emerald-400 font-bold">خلال 72 ساعة من تأكيد الطلب</span>
                </div>

                <div className="flex items-center justify-between text-zinc-400">
                  <span>ضريبة القيمة المضافة (14% VAT):</span>
                  <span className="text-zinc-300 font-semibold font-mono">{vatAmount.toLocaleString('ar-EG', { maximumFractionDigits: 0 })} ج.م</span>
                </div>

                <div className="border-t border-zinc-800/60 pt-3 flex items-center justify-between text-sm font-black text-white">
                  <span>الإجمالي للدفع الآن (شامل الضريبة):</span>
                  <span className="text-lg text-amber-400 font-mono">{grandTotal.toLocaleString('ar-EG', { maximumFractionDigits: 0 })} ج.م</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl flex items-start gap-2.5 text-[11px] text-emerald-300">
                <svg className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>
                  يتم التنسيق وتحديد مصاريف الشحن لجميع المنتجات مع خدمة العملاء عبر الواتساب فور استكمال الطلب والتأكيد.
                </span>
              </div>

              <div className="p-3.5 bg-zinc-950 border border-zinc-800/60 rounded-xl flex items-center gap-2.5 text-[11px] text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>ضمان الوكيل الرسمي المعتمد SYM مصر مع استلام الفاتورة الضريبية الرسمية فور السداد.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
