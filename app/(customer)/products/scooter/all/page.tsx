import Header from '@/components/customer/Header';
import Footer from '@/components/customer/Footer';
import { AllModelsShowcase } from '@/components/scooters/AllModelsShowcase';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'سكوترات وموديلات SYM في مصر 2026',
  description: 'استكشف كافة موديلات واسعار اسكوترات SYM في مصر بمواصفاتها الكاملة مع الضمان.',
};

export default function ScooterAllPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      <main className="flex-1 pt-0">
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
          <AllModelsShowcase initialCategory="SCOOTER" initialFilter="ALL" />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}