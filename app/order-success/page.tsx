'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { OrderSuccessClient } from '@/components/customer/OrderSuccessClient';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const rawOrderNo = searchParams.get('orderNo') || 'SYM-2026-ORDER';
  const orderNo = decodeURIComponent(rawOrderNo);

  return <OrderSuccessClient orderNo={orderNo} />;
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white p-8 flex items-center justify-center font-bold">جاري تحميل الفاتورة...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
