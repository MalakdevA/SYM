import Header from '@/components/customer/Header';
import Footer from '@/components/customer/Footer';
import { WhereToBuyCatalog } from '@/components/scooters/WhereToBuyCatalog';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'أماكن وشبكة معارض وموزعي SYM المعتمدين في مصر',
  description: 'ابحث عن أقرب مركز صيانة معتمد ومعرض مبيعات اسكوتر SYM في القاهرة والمحافظات.',
};

export default function WhereToBuyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      <main className="flex-1 pt-16">
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
          <WhereToBuyCatalog />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
