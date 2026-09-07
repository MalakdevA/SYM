import Header from '@/components/customer/Header';
import Footer from '@/components/customer/Footer';
import { SupportView } from '@/components/customer/SupportView';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'خدمات الصيانة والضمان المعتمد لاسكوتر SYM',
  description: 'خدمات الصيانة والجدول الدوري وفحص دراجات واسكوترات SYM في مصر. اتصل بنا على 01271384149.',
};

export default function ServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
          <SupportView />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
