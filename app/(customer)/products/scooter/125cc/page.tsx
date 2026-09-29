import Header from '@/components/customer/Header';
import Footer from '@/components/customer/Footer';
import { AllModelsShowcase } from '@/components/scooters/AllModelsShowcase';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'سكوترات SYM فئة 125cc - 200cc في مصر',
  description: 'استكشف كافة موديلات واسعار اسكوترات SYM بمواصفاتها الكاملة مع الضمان.',
};

export default function Scooter125ccPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      <main className="flex-1 pt-0">
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
          <AllModelsShowcase initialCategory="SCOOTER" initialFilter="MID_150_200" />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}