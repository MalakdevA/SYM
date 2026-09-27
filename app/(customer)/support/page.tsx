import Header from '@/components/customer/Header';
import Footer from '@/components/customer/Footer';
import { SupportView } from '@/components/customer/SupportView';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'مركز الدعم الفني وخدمة العملاء والضمان',
  description: 'مركز خدمة عملاء SYM مصر الرسمي. تواصل معنا عبر الهاتف 01279881123 أو واتساب للاستفسارات والخدمات.',
};

export default function SupportPage() {
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
