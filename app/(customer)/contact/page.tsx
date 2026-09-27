import Header from '@/components/customer/Header';
import Footer from '@/components/customer/Footer';
import { SupportView } from '@/components/customer/SupportView';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'تواصل معنا واستفسارات المبيعات والصيانة',
  description: 'تواصل مباشرة مع خدمة عملاء SYM مصر عبر الهاتف أو واتساب 01279881123 للاستفسارات والخدمات.',
};

export default function ContactPage() {
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
