import Header from '@/components/customer/Header';
import Footer from '@/components/customer/Footer';
import { SparePartsCatalog } from '@/components/scooters/SparePartsCatalog';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'كتالوج واسعار قطع غيار SYM الأصلية في مصر',
  description: 'استعلم عن قائمة اسعار قطع غيار اسكوتر SYM الأصلية في مصر بالاسم والكود لمختلف الموديلات.',
};

export default function SparePartsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#030306]">
      <Header />
      <main className="flex-1 pt-16">
        <Suspense fallback={<div className="min-h-screen bg-[#030306]" />}>
          <SparePartsCatalog />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
