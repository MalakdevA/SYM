'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SOCIAL_MEDIA, CONTACT_INFO } from '@/lib/constants';
import { ArrowUp, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useSiteTheme } from '@/lib/context/site-theme';

export default function Footer() {
  const { dir, language, toggleLanguage, t } = useLanguage();
  const { content } = useSiteTheme();

  const phone = content.contactPhone || CONTACT_INFO.phone;
  const email = content.contactEmail || CONTACT_INFO.email;
  const whatsappNumber = phone.replace(/[^0-9]/g, '');

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="relative bg-[#0d0d0f] text-white font-sans overflow-hidden select-none" dir={dir}>
      
      {/* Real Carbon Fiber Twill Weave Pattern Layer */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-45 z-0"
        style={{
          backgroundColor: '#0c0c0e',
          backgroundImage: `
            repeating-linear-gradient(45deg, #282830 0, #282830 2px, transparent 0, transparent 10px),
            repeating-linear-gradient(-45deg, #1c1c22 0, #1c1c22 2px, #09090b 0, #09090b 10px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Main Container */}
      <div className="relative z-10 mx-auto px-6 md:px-16 py-14 max-w-[1440px]">
        
        {/* Top Logo & Breadcrumb Bar */}
        <div className="flex items-center gap-3 mb-10 pb-2">
          <Link href="/" className="relative w-28 h-8 block hover:opacity-80 transition-opacity" title="Go to Homepage">
            <Image
              src="/assets/brand/sym-logo-red.png"
              alt="SYM Egypt"
              fill
              className="object-contain object-left"
              priority
            />
          </Link>
          <span className="text-zinc-600 text-sm font-medium">&gt;</span>
          <Link href="/" className="text-zinc-300 hover:text-red-500 transition-colors text-sm font-medium cursor-pointer">
            {t('nav.home', 'Home')}
          </Link>
        </div>

        {/* 5 Columns Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-14">
          
          {/* Column 1: Product Categories */}
          <div>
            <h4 className="text-white font-bold mb-4 text-base tracking-wide">{t('footer.products', 'Product Categories')}</h4>
            <ul className="space-y-2.5 text-zinc-400 text-sm font-normal">
              <li><Link href="/all-models" className="hover:text-white transition-colors">{t('common.maxi', 'Maxi Scooter')}</Link></li>
              <li><Link href="/all-models" className="hover:text-white transition-colors">{t('common.urban', 'Urban Scooter')}</Link></li>
              <li><Link href="/all-models" className="hover:text-white transition-colors">{t('common.sport', 'Sport Scooter')}</Link></li>
              <li><Link href="/all-models" className="hover:text-white transition-colors">{t('common.classic', 'Classic Scooter')}</Link></li>
              <li><Link href="/all-models" className="hover:text-white transition-colors">{language === 'ar' ? 'سكوتر تين' : 'Underbone'}</Link></li>
            </ul>
          </div>

          {/* Column 2: More Series */}
          <div>
            <h4 className="text-white font-bold mb-4 text-base tracking-wide">{t('nav.modelShowcase', 'More Series')}</h4>
            <ul className="space-y-2.5 text-zinc-400 text-sm font-normal">
              <li><Link href="/scooter/cruisym-400i" className="hover:text-white transition-colors">{language === 'ar' ? 'سلسلة CRUiSYM' : 'CRUiSYM Series'}</Link></li>
              <li><Link href="/scooter/husky-adv" className="hover:text-white transition-colors">Husky ADV</Link></li>
              <li><Link href="/scooter/jet-x-200" className="hover:text-white transition-colors">{language === 'ar' ? 'سلسلة Jet' : 'Jet Series'}</Link></li>
              <li><Link href="/all-models" className="hover:text-white transition-colors">{language === 'ar' ? 'سلسلة Symphony' : 'Symphony Series'}</Link></li>
              <li><Link href="/all-models" className="hover:text-white transition-colors">{language === 'ar' ? 'سلسلة Fiddle' : 'Fiddle Series'}</Link></li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h4 className="text-white font-bold mb-4 text-base tracking-wide">{t('footer.support', 'Support')}</h4>
            <ul className="space-y-2.5 text-zinc-400 text-sm font-normal">
              <li><Link href="/support" className="hover:text-white transition-colors">{t('nav.support', 'Service & Support')}</Link></li>
              <li><Link href="/support#contact-form" className="hover:text-white transition-colors font-medium">{t('common.contactUs', 'Send Inquiry')}</Link></li>
              <li><Link href="/warranty" className="hover:text-white transition-colors">{t('nav.warranty', 'Warranty Policy')}</Link></li>
              <li><Link href="/spare-parts" className="hover:text-white transition-colors">{t('nav.spareParts', 'Spare Parts Price List')}</Link></li>
            </ul>
          </div>

          {/* Column 4: About */}
          <div>
            <h4 className="text-white font-bold mb-4 text-base tracking-wide">{t('footer.company', 'About')}</h4>
            <ul className="space-y-2.5 text-zinc-400 text-sm font-normal">
              <li><Link href="/about" className="hover:text-white transition-colors">{t('nav.about', 'About Us')}</Link></li>
              <li><Link href="/where-to-buy" className="hover:text-white transition-colors">{t('nav.dealers', 'Showrooms')}</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">{t('common.contactUs', 'Contact Us')}</Link></li>
              <li><Link href="/where-to-buy" className="hover:text-white transition-colors">{t('home.whereToBuy', 'Where to Buy')}</Link></li>
            </ul>
          </div>

          {/* Column 5: Contact Us */}
          <div>
            <h4 className="text-white font-bold mb-4 text-base tracking-wide">{t('common.contactUs', 'Contact Us')}</h4>
            <p className="text-zinc-400 text-sm mb-2.5 hover:text-white transition-colors">
              <a href={`mailto:${email}`}>{email}</a>
            </p>
            <p className="text-zinc-400 text-sm font-normal">
              {t('nav.hotline', 'Phone / WhatsApp')}: <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="text-white font-semibold hover:text-[#E60012] transition-colors">{phone}</a>
            </p>
          </div>

        </div>

        {/* Middle Policy Links & Social Icons */}
        <div className="flex flex-col md:flex-row items-center justify-end pt-4 pb-6 gap-4 text-sm">

          {/* Social Media SVG Icons */}
          <div className="flex items-center gap-5 text-zinc-400">
            <a href={SOCIAL_MEDIA.facebook} target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="Facebook">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href={SOCIAL_MEDIA.instagram} target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="Instagram">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href={SOCIAL_MEDIA.tiktok} target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="TikTok">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.56-1.36 1.56-1.32 2.57.01.8.43 1.58 1.1 2.02.79.52 1.83.58 2.66.19.89-.41 1.5-1.31 1.56-2.29.04-3.13.01-6.27.02-9.4 0-1.54 0-3.08-.01-4.62z"/></svg>
            </a>
          </div>

        </div>

        {/* Copyright & Country Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span className="uppercase tracking-wider font-medium">
              {t('common.copyright', 'COPYRIGHT © 2026 SYM EGYPT INC. ALL RIGHTS RESERVED.')}
            </span>
            <span className="hidden sm:inline text-zinc-700">|</span>
            <a 
              href="https://www.linkedin.com/in/malak-ashraf-089218373?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-zinc-300 hover:text-red-500 transition-colors font-semibold tracking-wide hover:underline"
            >
              {t('common.developedBy', 'Developed by Malak Ashraf')}
            </a>
          </div>

          <button 
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <Globe className="w-4 h-4 text-[#E60012]" />
            <span className="text-xs font-medium">{t('common.countryLang', 'Egypt / English')}</span>
          </button>

        </div>

        {/* Disclaimer Text */}
        <p className="mt-6 text-[11px] leading-relaxed text-zinc-500 text-justify font-normal">
          {t('common.disclaimer', 'SYM Egypt, official distributor of Sanyang Motor Co., Ltd. Data source: SYM International Limited; measured based on scooter and motorcycle sales value in Egypt. All specifications, prices and models are subject to change without prior notice.')}
        </p>

      </div>

      {/* Red Scroll to Top Floating Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-[#E60012] hover:bg-red-700 text-white flex items-center justify-center transition-all duration-300 shadow-xl hover:scale-110 active:scale-95 border border-white/20"
        title="Scroll to Top"
        aria-label="Scroll to Top"
      >
        <ArrowUp className="w-5 h-5 stroke-[2.5]" />
      </button>

    </footer>
  );
}
