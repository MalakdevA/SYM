'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Printer,
  ArrowRight,
  Truck,
  MapPin,
  ShieldCheck,
  Building2,
  Phone,
  Calendar,
  CreditCard,
  QrCode,
  Download,
  Share2,
  MessageCircle,
} from 'lucide-react';
import Header from '@/components/customer/Header';
import Footer from '@/components/customer/Footer';

interface OrderDetail {
  id: string;
  order_no: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  address: string;
  scooter_model: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
}

export function OrderSuccessClient({ orderNo }: { orderNo: string }) {
  const searchParams = useSearchParams();
  const rawFawryRef = searchParams.get('fawryRef') || '9824108291';
  const rawChannel = searchParams.get('channel') || 'فوري إكسبريس';
  const isPaid = searchParams.get('paid') === 'true';

  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await fetch(`/api/orders/index.php?order_no=${encodeURIComponent(orderNo)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
            setOrder(data.data as OrderDetail);
          }
        }
      } catch {
        // Ignore
      }
    };

    if (orderNo) {
      fetchOrderDetails();
    }
  }, [orderNo]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const invoiceDate = order?.created_at
    ? new Date(order.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  const totalAmount = order ? Number(order.amount) : 85000;
  const subtotalBeforeVat = Math.round((totalAmount / 1.14) * 100) / 100;
  const vatAmount = Math.round((totalAmount - subtotalBeforeVat) * 100) / 100;

  const whatsappMessage = encodeURIComponent(
    `مرحباً SYM Egypt، لقد قمت بإتمام وسداد طلبي رقم ${orderNo} بنجاح عبر فوري بمبلغ ${totalAmount.toLocaleString('ar-EG')} ج.م. برجاء تأكيد موعد الشحن والتسليم.`
  );

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans antialiased flex flex-col justify-between selection:bg-[#E60012] selection:text-white" dir="rtl">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16">
        
        {/* Top Success Banner */}
        <div className="text-center space-y-3 mb-8">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl flex items-center justify-center text-emerald-400 mx-auto shadow-2xl shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>PAYMENT COMPLETED & VERIFIED VIA FAWRY PAY</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            تم استلام وسداد طلبك بنجاح!
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
            شكراً لثقتك بالوكيل الرسمي <span className="text-white font-bold">SYM Egypt</span>. تم توثيق المعاملة وإصدار الفاتورة الضريبية الرسمية لطلبك.
          </p>
        </div>

        {/* Printable Official Tax Invoice Container */}
        <div id="printable-invoice" className="bg-[#0A0A0E] border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden text-white print:bg-white print:text-black print:p-0 print:border-none">
          
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-zinc-800 pb-6 print:border-black">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-2xl bg-[#E60012] flex items-center justify-center shadow-lg shadow-[#E60012]/30 shrink-0">
                <Image
                  src="/SymLogo-S-red.png"
                  alt="SYM"
                  width={30}
                  height={30}
                  className="brightness-[3] contrast-150 object-contain"
                />
              </div>
              <div>
                <h2 className="text-lg font-black text-white print:text-black">شركة SYM Motors Egypt</h2>
                <p className="text-[11px] text-zinc-400 print:text-zinc-600">الوكيل الرسمي والموزع المعتمد للدراجات والسكوترز بمصر</p>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5 print:text-zinc-700">
                  سجل تجاري: 184920 | بطاقة ضريبية: 719-842-104 (مصلحة الضرائب المصرية)
                </p>
              </div>
            </div>

            <div className="text-left bg-zinc-950 p-4 rounded-2xl border border-zinc-800 print:bg-zinc-100 print:border-zinc-300">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block print:text-zinc-600">فاتورة ضريبية رسمية</span>
              <span className="font-mono font-black text-sm text-[#E60012] block mt-0.5">{orderNo}</span>
              <span className="text-[10px] text-zinc-400 font-mono block mt-0.5 print:text-zinc-600">{invoiceDate}</span>
            </div>
          </div>

          {/* Fawry Payment Badge */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-950 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs print:bg-zinc-100 print:border-zinc-400">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white block print:text-black">حالة السداد: مكتمل ومسدد بالكامل (PAID)</span>
                <span className="text-[11px] text-emerald-400 block font-mono">
                  بواسطة فوري Fawry Pay | الرقم المرجعي: {rawFawryRef}
                </span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500 text-zinc-950 font-black text-[11px]">
              معاملة موثقة 100%
            </span>
          </div>

          {/* Customer & Delivery Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-zinc-950 p-5 rounded-2xl border border-zinc-800/80 print:bg-zinc-50 print:border-zinc-300">
            <div className="space-y-1">
              <span className="text-zinc-500 print:text-zinc-600">بيانات العميل المشتري:</span>
              <p className="font-bold text-white text-sm print:text-black">{order?.customer_name || 'عميل SYM المحترم'}</p>
              <p className="text-zinc-400 font-mono dir-ltr text-right print:text-zinc-700">{order?.customer_phone || '010XXXXXXXX'}</p>
            </div>

            <div className="space-y-1">
              <span className="text-zinc-500 print:text-zinc-600">عنوان التوصيل والشحن:</span>
              <p className="font-semibold text-zinc-200 print:text-black flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E60012]" />
                <span>{order?.address || 'القاهرة - عنوان العميل المسجل'}</span>
              </p>
              <p className="text-[11px] text-emerald-400 font-bold print:text-emerald-700">شحن سريع معتمد من الوكيل</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-zinc-800 rounded-2xl overflow-hidden print:border-zinc-300">
            <table className="w-full text-right text-xs">
              <thead className="bg-zinc-950 text-zinc-400 font-bold border-b border-zinc-800 print:bg-zinc-200 print:text-black print:border-zinc-300">
                <tr>
                  <th className="p-3.5">البند / البيان</th>
                  <th className="p-3.5 text-center">الكمية</th>
                  <th className="p-3.5 text-left">السعر قبل الضريبة</th>
                  <th className="p-3.5 text-left">ضريبة القيمة المضافة (14%)</th>
                  <th className="p-3.5 text-left">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 print:divide-zinc-300">
                <tr>
                  <td className="p-3.5 font-bold text-white print:text-black">
                    {order?.scooter_model || 'سكوتر SYM المعتمد'}
                    <span className="block text-[10px] text-zinc-500 font-normal">ضمان رسمي سنتين أو 20,000 كم من الوكيل</span>
                  </td>
                  <td className="p-3.5 text-center font-bold font-mono">1</td>
                  <td className="p-3.5 text-left font-mono">{subtotalBeforeVat.toLocaleString('ar-EG')} ج.م</td>
                  <td className="p-3.5 text-left font-mono text-zinc-400 print:text-zinc-600">{vatAmount.toLocaleString('ar-EG')} ج.م</td>
                  <td className="p-3.5 text-left font-bold font-mono text-white print:text-black">{totalAmount.toLocaleString('ar-EG')} ج.م</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Totals */}
          <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-2 text-xs print:bg-zinc-50 print:border-zinc-300">
            <div className="flex justify-between text-zinc-400 print:text-zinc-700">
              <span>المجموع قبل الضريبة:</span>
              <span className="font-mono">{subtotalBeforeVat.toLocaleString('ar-EG')} ج.م</span>
            </div>
            <div className="flex justify-between text-zinc-400 print:text-zinc-700">
              <span>ضريبة القيمة المضافة (14% VAT):</span>
              <span className="font-mono">{vatAmount.toLocaleString('ar-EG')} ج.م</span>
            </div>
            <div className="flex justify-between text-zinc-400 print:text-zinc-700">
              <span>مصاريف الشحن والتوصيل:</span>
              <span className="font-bold text-emerald-400 print:text-emerald-700">توصيل معتمد مجاناً</span>
            </div>
            <div className="border-t border-zinc-800 pt-3 flex justify-between text-sm sm:text-base font-black text-white print:text-black print:border-zinc-300">
              <span>المبلغ الإجمالي المسدد بالكامل:</span>
              <span className="text-[#E60012] font-mono print:text-black">{totalAmount.toLocaleString('ar-EG')} ج.م</span>
            </div>
          </div>

          {/* Official Stamp & Sign Off */}
          <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500 print:border-zinc-300 print:text-zinc-700">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>هذه الفاتورة ضريبية رسمية معتمدة ومسجلة إلكترونياً لدى شركة SYM Motors Egypt.</span>
            </div>
            <div className="text-center p-2 rounded-xl border border-dashed border-zinc-800 print:border-zinc-400">
              <span className="text-[10px] font-bold text-zinc-400 block">ختم الاعتماد الرسمي</span>
              <span className="text-xs font-black text-[#E60012] block">SYM EGYPT OFFICIAL STAMP</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-8 print:hidden">
          <button
            onClick={handlePrint}
            className="px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold rounded-2xl text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>طباعة الفاتورة الضريبية الرسمية (A4)</span>
          </button>

          <a
            href={`https://wa.me/201271384149?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>تأكيد موعد الاستلام عبر واتساب</span>
          </a>

          <Link
            href="/"
            className="px-6 py-3.5 bg-[#E60012] hover:bg-[#C4000F] text-white font-black rounded-2xl text-xs transition-all shadow-lg shadow-[#E60012]/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>العودة للرئيسية</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
