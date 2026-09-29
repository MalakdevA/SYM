import Header from '@/components/customer/Header';
import Footer from '@/components/customer/Footer';
import { AllModelsShowcase } from '@/components/scooters/AllModelsShowcase';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'دراجات SYM أكبر من 125cc في مصر',
  description: 'استكشف كافة موديلات واسعار دراجات SYM بمواصفاتها الكاملة مع الضمان.',
};

export default function BikeOver125ccPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      <main className="flex-1 pt-0">
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
          <AllModelsShowcase initialCategory="BIKE" initialFilter="OVER_200" />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}