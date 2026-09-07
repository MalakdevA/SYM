'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  Smartphone,
  Copy,
  Clock,
  ArrowRight,
  AlertCircle,
  QrCode,
  Barcode,
  Building2,
  Sparkles,
  Check,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import Header from '@/components/customer/Header';
import Footer from '@/components/customer/Footer';
import { verifyFawryPaymentApi } from '@/lib/api';

function FawryTerminalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderNo = searchParams.get('orderNo') || '#SYM-2026-ORDER';
  const merchantRefNum = searchParams.get('merchantRefNum') || '';
  const rawAmount = searchParams.get('amount') || '85000';
  const customerName = searchParams.get('name') || 'عميل SYM المحترم';
  const customerPhone = searchParams.get('phone') || '010XXXXXXXX';
  const scooterModel = searchParams.get('model') || 'سكوتر SYM المعتمد';

  const amount = parseFloat(rawAmount);

  const [activeChannel, setActiveChannel] = useState<'ref' | 'card' | 'wallet'>('ref');
  // Real Fawry reference number returned by /api/fawry/initiate (never fabricated client-side)
  const [fawryRefNumber] = useState(searchParams.get('fawryRef') || '');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const copyRefCode = () => {
    navigator.clipboard.writeText(fawryRefNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCheckPaymentStatus = async () => {
    if (!merchantRefNum) {
      setStatusMessage('تعذر التحقق من حالة السداد: رقم العملية المرجعي غير موجود.');
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const result = await verifyFawryPaymentApi(merchantRefNum);

      if (result.success && result.data?.payment_status === 'paid') {
        router.push(
          `/order-success?orderNo=${encodeURIComponent(orderNo)}&amount=${amount}&fawryRef=${encodeURIComponent(
            result.data.fawry_ref_number || fawryRefNumber
          )}`
        );
        return;
      }

      if (result.success) {
        setStatusMessage(
          'لم يتم رصد السداد بعد. برجاء إتمام الدفع عبر القناة المختارة أعلاه، ثم الضغط على "تحديث حالة السداد" مرة أخرى.'
        );
      } else {
        setStatusMessage(result.error || 'تعذر التحقق من حالة السداد حالياً. يرجى المحاولة بعد قليل.');
      }
    } catch {
      setStatusMessage('حدث خطأ في الاتصال أثناء التحقق من حالة السداد. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white font-sans antialiased flex flex-col justify-between selection:bg-[#E60012] selection:text-white" dir="rtl">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Fawry Terminal Frame */}
        <div className="bg-[#0A0A0E] border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
          
          {/* Ambient Glows */}
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#E60012]/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Top Brand Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-800/80 pb-6 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-zinc-950 font-black shadow-lg shadow-yellow-500/20 flex items-center justify-center">
                <span className="text-sm tracking-tighter">FAWRY</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black text-white">بوابة فوري للدفع الإلكتروني المعتمد</h1>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    اتصال آمن 256-Bit SSL
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">Fawry Express Checkout — تأكيد وحماية مدفوعات SYM Egypt</p>
              </div>
            </div>

            <div className="text-left bg-zinc-950 px-4 py-2.5 rounded-2xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block font-bold">إجمالي المبلغ المطلوب سداده:</span>
              <span className="text-lg sm:text-xl font-black text-amber-400 font-mono" dir="ltr">
                {amount.toLocaleString('ar-EG')} EGP
              </span>
            </div>
          </div>

          {/* Order Details Mini Banner */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs relative z-10">
            <div>
              <span className="text-zinc-500 block">رقم طلب الشراء:</span>
              <span className="font-mono font-bold text-white mt-0.5 block">{orderNo}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">اسم المشتري:</span>
              <span className="font-bold text-zinc-200 mt-0.5 block">{customerName}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">طراز السكوتر / المنتج:</span>
              <span className="font-bold text-[#E60012] mt-0.5 block truncate">{scooterModel}</span>
            </div>
          </div>

          {statusMessage && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 flex items-start gap-3 text-xs text-amber-200 relative z-10">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Payment Channels Navigation */}
          <div className="flex items-center gap-2 p-1.5 bg-zinc-950 rounded-2xl border border-zinc-800 overflow-x-auto relative z-10">
            <button
              onClick={() => setActiveChannel('ref')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
                activeChannel === 'ref'
                  ? 'bg-amber-500 text-zinc-950 font-black shadow-lg shadow-amber-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <QrCode className="w-4 h-4" /> 1. كود دفع فوري (Fawry Ref Code)
            </button>

            <button
              onClick={() => setActiveChannel('card')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
                activeChannel === 'card'
                  ? 'bg-[#E60012] text-white font-black shadow-lg shadow-[#E60012]/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" /> 2. بطاقة بنكية (Visa/Mastercard/ميزة)
            </button>

            <button
              onClick={() => setActiveChannel('wallet')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
                activeChannel === 'wallet'
                  ? 'bg-[#E60012] text-white font-black shadow-lg shadow-[#E60012]/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" /> 3. المحافظ الإلكترونية وإنستاباي
            </button>
          </div>

          {/* CHANNEL 1: FAWRY REFERENCE CODE */}
          {activeChannel === 'ref' && (
            <div className="space-y-6 relative z-10">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-amber-500/30 text-center space-y-4 shadow-xl">
                <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider">
                  كود الدفع في أي ماكينة أو فرع فوري بلس بمصر
                </span>

                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl sm:text-5xl font-black font-mono tracking-widest text-white py-2 px-6 rounded-2xl bg-black border border-zinc-800 shadow-inner" dir="ltr">
                    {fawryRefNumber}
                  </span>
                  <button
                    onClick={copyRefCode}
                    className="p-3 rounded-2xl bg-zinc-800 hover:bg-amber-500 hover:text-black transition-colors text-zinc-300"
                    title="نسخ الكود"
                  >
                    {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>الكود صالح للسداد لمدة <strong>48 ساعة</strong> من الآن</span>
                </div>

                {/* Steps to Pay */}
                <div className="pt-4 border-t border-zinc-800/80 text-right space-y-2 max-w-lg mx-auto text-xs text-zinc-300">
                  <p className="font-bold text-white">خطوات السداد عبر ماكينات فوري:</p>
                  <ol className="list-decimal list-inside space-y-1 text-zinc-400">
                    <li>توجه لأي منفذ فوري أو فرع فوري بلس أو تطبيق فوري باي.</li>
                    <li>اختر <strong>مدفوعات فوري إكسبريس (كود الخدمة 788)</strong>.</li>
                    <li>أدخل رقم فوري المرجعي الظاهر أعلاه <strong className="text-amber-400 font-mono">{fawryRefNumber}</strong>.</li>
                    <li>قم بسداد المبلغ واستلم إيصال السداد فوراً.</li>
                  </ol>
                </div>
              </div>

              <button
                onClick={handleCheckPaymentStatus}
                disabled={isProcessing}
                className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm tracking-wide shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>جاري التحقق من حالة السداد لدى فوري...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    <span>تحديث حالة السداد بعد إتمام الدفع</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* CHANNEL 2: CREDIT / DEBIT CARDS */}
          {activeChannel === 'card' && (
            <div className="space-y-6 relative z-10">
              <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#E60012]" /> السداد بالبطاقة البنكية (Visa / Mastercard / ميزة)
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-lg border border-zinc-800">256-BIT SSL ENCRYPTED</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-zinc-300">
                  <p className="leading-relaxed">
                    يمكنك سداد قيمة الطلب <strong className="text-white font-mono">{amount.toLocaleString('ar-EG')} ج.م</strong> بالبطاقة البنكية عبر الطرق الآمنة التالية:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-zinc-400 pr-2">
                    <li><strong className="text-white">ماكينات نقاط البيع (POS):</strong> السداد بالبطاقة مباشرة عند استلام السكوتر أو بفرع المعرض.</li>
                    <li><strong className="text-white">فروع فوري بلس:</strong> الدفع بالفيزا أو الماستركارد في أكثر من 300 فرع فوري بلس باستخدام كود الدفع <strong className="text-amber-400 font-mono">{fawryRefNumber}</strong>.</li>
                    <li><strong className="text-white">تطبيق Fawry / البنك الخاص بك:</strong> إدخال كود الخدمة (788) وسداد الفاتورة إلكترونياً.</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={handleCheckPaymentStatus}
                disabled={isProcessing}
                className="w-full py-4 px-6 rounded-2xl bg-[#E60012] hover:bg-[#C4000F] text-white font-black text-sm tracking-wide shadow-xl shadow-[#E60012]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>جاري التحقق من حالة السداد لدى فوري...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    <span>تحديث حالة السداد بعد إتمام الدفع بالبطاقة</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* CHANNEL 3: MOBILE WALLETS */}
          {activeChannel === 'wallet' && (
            <div className="space-y-6 relative z-10">
              <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#E60012]" /> الدفع عبر المحافظ الإلكترونية وإنستاباي (InstaPay)
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">فوري تحويل مباشر</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-zinc-300">
                  <p className="leading-relaxed">
                    طريقة السداد عبر المحفظة الإلكترونية (فودافون كاش / أورنج كاش / اتصالات كاش / WE Pay / إنستاباي):
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-zinc-400 pr-2">
                    <li>افتح تطبيق محفظتك الإلكترونية أو تطبيق <strong>InstaPay</strong>.</li>
                    <li>اختر <strong>سداد الفواتير / مدفوعات فوري إكسبريس (كود 788)</strong>.</li>
                    <li>أدخل الرقم المرجعي لفوري: <strong className="text-amber-400 font-mono">{fawryRefNumber}</strong>.</li>
                    <li>أدخل الرقم السري لتأكيد التحويل واستلم رسالة التأكيد الفورية.</li>
                  </ol>
                </div>
              </div>

              <button
                onClick={handleCheckPaymentStatus}
                disabled={isProcessing}
                className="w-full py-4 px-6 rounded-2xl bg-[#E60012] hover:bg-[#C4000F] text-white font-black text-sm tracking-wide shadow-xl shadow-[#E60012]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>جاري التحقق من حالة السداد لدى فوري...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    <span>تحديث حالة السداد بعد إتمام الدفع عبر المحفظة</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Security Footer Note */}
          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 relative z-10">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ضمان ومعاملة موثقة برقم مرجعي لشركة SYM Motors Egypt
            </span>
            <span className="font-mono">FAWRY ECOMMERCE V2</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function FawryTerminalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white p-8 flex items-center justify-center font-bold">جاري تحميل بوابة فوري...</div>}>
      <FawryTerminalContent />
    </Suspense>
  );
}
