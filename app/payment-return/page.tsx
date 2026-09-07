'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import Header from '@/components/customer/Header';
import Footer from '@/components/customer/Footer';
import { verifyFawryPaymentApi } from '@/lib/api';

/**
 * Fawry hosted-page return URL (FAWRY_RETURN_URL).
 * Fawry redirects the customer's browser here after a CARD/MWALLET payment
 * attempt. We verify the real status server-side before trusting anything.
 */
function PaymentReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const merchantRefNum = searchParams.get('merchantRefNum') || '';

  const [status, setStatus] = useState<'checking' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkStatus = React.useCallback(async () => {
    if (!merchantRefNum) {
      setStatus('error');
      setErrorMessage('رابط العودة من فوري غير مكتمل: رقم العملية المرجعي مفقود.');
      return;
    }

    setStatus('checking');
    setErrorMessage(null);

    try {
      const result = await verifyFawryPaymentApi(merchantRefNum);

      if (result.success && result.data?.payment_status === 'paid') {
        router.replace(
          `/order-success?orderNo=${encodeURIComponent(result.data.order_no)}&amount=${result.data.amount}&fawryRef=${encodeURIComponent(
            result.data.fawry_ref_number || ''
          )}`
        );
        return;
      }

      if (result.success && result.data) {
        setStatus('error');
        setErrorMessage(
          result.data.payment_status === 'failed' || result.data.payment_status === 'cancelled'
            ? 'لم تكتمل عملية السداد عبر فوري. يمكنك إعادة المحاولة من صفحة إتمام الشراء.'
            : 'السداد قيد المراجعة حالياً لدى فوري. سيتم تأكيد طلبك فور رصد السداد بنجاح.'
        );
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'تعذر التحقق من حالة السداد حالياً.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('حدث خطأ في الاتصال أثناء التحقق من حالة السداد.');
    }
  }, [merchantRefNum, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkStatus();
  }, [checkStatus]);

  return (
    <div className="min-h-screen bg-[#050507] text-white font-sans antialiased flex flex-col justify-between selection:bg-[#E60012] selection:text-white" dir="rtl">
      <Header />

      <main className="flex-1 max-w-lg w-full mx-auto px-4 sm:px-6 py-16 flex items-center">
        <div className="w-full bg-[#0A0A0E] border border-zinc-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          {status === 'checking' ? (
            <>
              <Loader2 className="w-10 h-10 text-amber-400 animate-spin mx-auto" />
              <h1 className="text-lg font-black text-white">جاري التحقق من حالة السداد لدى فوري...</h1>
              <p className="text-xs text-zinc-400">يرجى الانتظار، لا تغلق هذه الصفحة.</p>
            </>
          ) : (
            <>
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <h1 className="text-lg font-black text-white">حالة السداد غير مؤكدة بعد</h1>
              <p className="text-xs text-zinc-400 leading-relaxed">{errorMessage}</p>
              <button
                onClick={checkStatus}
                className="mt-2 mx-auto px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة التحقق من حالة السداد</span>
              </button>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white p-8 flex items-center justify-center font-bold">جاري التحميل...</div>}>
      <PaymentReturnContent />
    </Suspense>
  );
}
