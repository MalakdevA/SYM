import Header from '@/components/customer/Header';
import Footer from '@/components/customer/Footer';
import { AllModelsShowcase } from '@/components/scooters/AllModelsShowcase';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'أحدث موديلات واسعار اسكوتر SYM في مصر 2026',
  description: 'استكشف كافة موديلات واسعار اسكوترات واسعار اس واي ام SYM في مصر بمواصفاتها الكاملة مع الضمان.',
};

export default function AllModelsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      <main className="flex-1 pt-0">
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
          <AllModelsShowcase />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
