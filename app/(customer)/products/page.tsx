import Header from '@/components/customer/Header';
import Footer from '@/components/customer/Footer';
import { AllModelsShowcase } from '@/components/scooters/AllModelsShowcase';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'جميع منتجات وسكوترات SYM في مصر',
  description: 'تصفح قائمة منتجات واسعار اسكوترات ودراجات SYM في مصر بمختلف الفئات والصيانة.',
};

export default function ProductsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      <main className="flex-1 pt-16">
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
          <AllModelsShowcase />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
