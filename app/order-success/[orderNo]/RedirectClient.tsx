'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function RedirectClient({ orderNo }: { orderNo: string }) {
  const router = useRouter();

  useEffect(() => {
    const cleanOrderNo = decodeURIComponent(orderNo || '');
    router.replace(`/order-success?orderNo=${encodeURIComponent(cleanOrderNo)}`);
  }, [orderNo, router]);

  return (
    <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#E60012] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-zinc-400">جاري تحميل الفاتورة...</p>
      </div>
    </div>
  );
}
