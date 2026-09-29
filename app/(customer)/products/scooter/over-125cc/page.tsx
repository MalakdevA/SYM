import Header from '@/components/customer/Header';
import Footer from '@/components/customer/Footer';
import { AllModelsShowcase } from '@/components/scooters/AllModelsShowcase';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'سكوترات SYM أكبر من 125cc في مصر',
  description: 'استكشف كافة موديلات واسعار اسكوترات SYM أكبر من 125cc بمواصفاتها الكاملة مع الضمان.',
};

export default function ScooterOver125ccPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      <main className="flex-1 pt-0">
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
          <AllModelsShowcase initialCategory="SCOOTER" initialFilter="MAXI_300" />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
