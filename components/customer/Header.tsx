'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import SearchBar from '@/components/customer/SearchBar';
import { Menu, X, ShieldCheck, Wrench, Scale, HelpCircle, Phone, ShoppingBag, Globe, Info } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const { language, dir, toggleLanguage, t } = useLanguage();
  const { count, setIsOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'ekickscooter' | 'product' | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('power-sport');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (menu: 'ekickscooter' | 'product') => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActiveMenu(menu);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 250);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      dir={dir}
      suppressHydrationWarning
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled || isMobileOpen
          ? 'rgba(0, 0, 0, 0.90)'
          : activeMenu !== null
            ? 'rgba(0, 0, 0, 0.85)'
            : 'transparent',
        backdropFilter: scrolled || activeMenu !== null || isMobileOpen ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled || activeMenu !== null || isMobileOpen ? 'blur(16px)' : 'none',
      }}
    >
      <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: '1440px' }}>
        <div className="flex items-center justify-between h-16">
          {/* Left Side: Logo + Navigation */}
          <div className="flex items-center gap-10 h-full">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/SymLogo-S-red.png"
                alt="SYM"
                width={90}
                height={36}
                style={{ height: 'auto' }}
                className="object-contain"
              />
            </Link>

            {/* Desktop Navigation Menu */}
            <nav className="hidden lg:flex items-center gap-8 h-full">
              {/* 1. eKickScooter Mega Menu */}
              <div
                className="relative flex items-center h-full"
                onMouseEnter={() => handleMouseEnter('ekickscooter')}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href="/products/scooter/all"
                  className={`text-sm font-bold tracking-tight transition-colors h-full flex items-center ${activeMenu === 'ekickscooter' ? 'text-red-500' : 'text-gray-200 hover:text-red-500'
                    }`}
                >
                  {t('nav.ekickscooter', 'Motorcycles')}
                </Link>

                {/* Full-width Mega Menu matching original site proportions */}
                {activeMenu === 'ekickscooter' && (
                  <div
                    className="fixed left-0 right-0 border-t border-neutral-900 bg-black text-white shadow-2xl"
                    style={{
                      top: '64px',
                      zIndex: 40,
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                    }}
                    onMouseEnter={() => handleMouseEnter('ekickscooter')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="mx-auto grid grid-cols-12 gap-0" style={{ maxWidth: '1440px', padding: '48px 60px 72px 60px' }}>
                      {/* Left Column - Categories */}
                      <div className="col-span-2 pr-4">
                        <ul className="space-y-4 pt-1">
                          <li>
                            <button
                              type="button"
                              onMouseEnter={() => setActiveCategory('power-sport')}
                              className={`text-sm block text-start w-full transition-colors ${activeCategory === 'power-sport' ? 'text-white font-bold' : 'text-gray-400 hover:text-white font-medium'
                                }`}
                            >
                              {t('common.sport', 'Power Sport')}
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              onMouseEnter={() => setActiveCategory('all-road')}
                              className={`text-sm block text-start w-full transition-colors ${activeCategory === 'all-road' ? 'text-white font-bold' : 'text-gray-400 hover:text-white font-medium'
                                }`}
                            >
                              {t('common.allRoad', 'All-Road')}
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              onMouseEnter={() => setActiveCategory('urban-daily')}
                              className={`text-sm block text-start w-full transition-colors ${activeCategory === 'urban-daily' ? 'text-white font-bold' : 'text-gray-400 hover:text-white font-medium'
                                }`}
                            >
                              {t('common.urban', 'Urban Daily')}
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              onMouseEnter={() => setActiveCategory('casual')}
                              className={`text-sm block text-start w-full transition-colors ${activeCategory === 'casual' ? 'text-white font-bold' : 'text-gray-400 hover:text-white font-medium'
                                }`}
                            >
                              {t('common.casual', 'Casual')}
                            </button>
                          </li>
                        </ul>
                      </div>

                      {/* Middle Column - Vehicle Showcase */}
                      <div className="col-span-6" style={{ paddingLeft: '16px', paddingRight: '100px' }}>
                        <div className="grid grid-cols-2 gap-8">
                          {/* Power Sport */}
                          {activeCategory === 'power-sport' && (
                            <>
                              <Link href="/products/husky-adv" className="group relative flex flex-col items-center">
                                <div className="relative w-full h-80 bg-transparent flex items-center justify-center overflow-visible">
                                  <span
                                    className="absolute top-3 right-3 bg-[#e31e24] text-white font-extrabold rounded-full z-10 shadow-md flex items-center justify-center"
                                    style={{ padding: '3px 12px', fontSize: '10px', lineHeight: '1.2', letterSpacing: '0.5px' }}
                                  >
                                    {t('nav.newBadge', 'NEW')}
                                  </span>
                                  <Image
                                    src="/Husky ADV.png"
                                    alt="Husky ADV"
                                    fill
                                    className="object-contain"
                                    style={{ padding: '15px' }}
                                  />
                                </div>
                                <h4 className="text-white text-sm font-bold tracking-wider uppercase mt-3 group-hover:text-red-500 transition-colors">
                                  HUSKY ADV
                                </h4>
                              </Link>

                              <Link href="/products/cruisym-400i" className="group relative flex flex-col items-center">
                                <div className="relative w-full h-80 bg-transparent flex items-center justify-center overflow-visible">
                                  <span
                                    className="absolute top-3 right-3 bg-[#e31e24] text-white font-extrabold rounded-full z-10 shadow-md flex items-center justify-center"
                                    style={{ padding: '3px 12px', fontSize: '10px', lineHeight: '1.2', letterSpacing: '0.5px' }}
                                  >
                                    NEW
                                  </span>
                                  <Image
                                    src="/Cruisym 400.png"
                                    alt="Cruisym 400"
                                    fill
                                    className="object-contain"
                                    style={{ padding: '15px' }}
                                  />
                                </div>
                                <h4 className="text-white text-sm font-bold tracking-wider uppercase mt-3 group-hover:text-red-500 transition-colors">
                                  CRUISYM 400
                                </h4>
                              </Link>
                            </>
                          )}

                          {/* All-Road */}
                          {activeCategory === 'all-road' && (
                            <>
                              <Link href="/scooter/nht-200" className="group relative flex flex-col items-center">
                                <div className="relative w-full h-80 bg-transparent flex items-center justify-center overflow-visible">
                                  <Image
                                    src="/NHT 200 copy 2.png"
                                    alt="NHT 200"
                                    fill
                                    className="object-contain scale-x-[-1] rotate-[-8deg]"
                                    style={{ padding: '15px' }}
                                  />
                                </div>
                                <h4 className="text-white text-sm font-bold tracking-wider uppercase mt-3 group-hover:text-red-500 transition-colors">
                                  NHT 200
                                </h4>
                              </Link>

                              <Link href="/scooter/nhx-200" className="group relative flex flex-col items-center">
                                <div className="relative w-full h-80 bg-transparent flex items-center justify-center overflow-visible">
                                  <Image
                                    src="/NHX 200 copy.png"
                                    alt="NHX 200"
                                    fill
                                    className="object-contain scale-x-[-1]"
                                    style={{ padding: '15px' }}
                                  />
                                </div>
                                <h4 className="text-white text-sm font-bold tracking-wider uppercase mt-3 group-hover:text-red-500 transition-colors">
                                  NHX 200
                                </h4>
                              </Link>
                            </>
                          )}

                          {/* Urban Daily */}
                          {activeCategory === 'urban-daily' && (
                            <>
                              <Link href="/scooter/symphony-st-new" className="group relative flex flex-col items-center">
                                <div className="relative w-full h-80 bg-transparent flex items-center justify-center overflow-visible">
                                  <Image
                                    src="/assets/products/symphony-st-new.png"
                                    alt="SYMPHONY ST"
                                    fill
                                    className="object-contain scale-x-[-1]"
                                    style={{ padding: '15px' }}
                                  />
                                </div>
                                <h4 className="text-white text-sm font-bold tracking-wider uppercase mt-3 group-hover:text-red-500 transition-colors">
                                  SYMPHONY ST
                                </h4>
                              </Link>

                              <Link href="/scooter/fiddle-4-150" className="group relative flex flex-col items-center">
                                <div className="relative w-full h-80 bg-transparent flex items-center justify-center overflow-visible">
                                  <Image
                                    src="/assets/products/fiddle-4-silver.png"
                                    alt="FIDDLE 4"
                                    fill
                                    className="object-contain scale-x-[-1]"
                                    style={{ padding: '15px' }}
                                  />
                                </div>
                                <h4 className="text-white text-sm font-bold tracking-wider uppercase mt-3 group-hover:text-red-500 transition-colors">
                                  FIDDLE 4
                                </h4>
                              </Link>
                            </>
                          )}

                          {/* Casual */}
                          {activeCategory === 'casual' && (
                            <>
                              <Link href="/scooter/jet-14-dd" className="group relative flex flex-col items-center">
                                <div className="relative w-full h-80 bg-transparent flex items-center justify-center overflow-visible">
                                  <Image
                                    src="/assets/products/jet14-dd-black-alt.png"
                                    alt="JET 14 DD"
                                    fill
                                    className="object-contain scale-x-[-1]"
                                    style={{ padding: '15px' }}
                                  />
                                </div>
                                <h4 className="text-white text-sm font-bold tracking-wider uppercase mt-3 group-hover:text-red-500 transition-colors">
                                  JET 14 DD
                                </h4>
                              </Link>

                              <Link href="/scooter/jet-x-200" className="group relative flex flex-col items-center">
                                <div className="relative w-full h-80 bg-transparent flex items-center justify-center overflow-visible">
                                  <Image
                                    src="/assets/products/jet-x-200-black.png"
                                    alt="JET X 200"
                                    fill
                                    className="object-contain scale-x-[-1]"
                                    style={{ padding: '15px' }}
                                  />
                                </div>
                                <h4 className="text-white text-sm font-bold tracking-wider uppercase mt-3 group-hover:text-red-500 transition-colors">
                                  JET X 200
                                </h4>
                              </Link>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right Column - Links with vertical line */}
                      <div className="col-span-4 flex flex-col justify-start relative" style={{ paddingLeft: '64px', paddingTop: '4px' }}>
                        {/* Vertical Line - Separate Element */}
                        <div
                          className="absolute left-0 top-0 bottom-0"
                          style={{
                            width: '2px',
                            backgroundColor: '#888888',
                            height: '100%'
                          }}
                        ></div>

                        <ul className="space-y-6">
                          <li>
                            <Link
                              href="/products/scooter/all"
                              className="group flex items-center text-white hover:text-red-500 font-bold text-xl tracking-tight transition-colors"
                            >
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="mr-3 rtl:ml-3 rtl:mr-0 text-white group-hover:text-red-500 transition-colors flex-shrink-0"
                              >
                                <path
                                  d="M7 17L17 7M17 7H7M17 7V17"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span>{t('nav.exploreScooters', 'Explore eKickScooter')}</span>
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/products/scooter/all"
                              className="group flex items-center text-white hover:text-red-500 font-bold text-xl tracking-tight transition-colors"
                            >
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="mr-3 rtl:ml-3 rtl:mr-0 text-white group-hover:text-red-500 transition-colors flex-shrink-0"
                              >
                                <path
                                  d="M7 17L17 7M17 7H7M17 7V17"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span>{t('nav.allScooters', 'All eKickScooters')}</span>
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/products/scooter/all"
                              className="group flex items-center text-white hover:text-red-500 font-bold text-xl tracking-tight transition-colors"
                            >
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="mr-3 rtl:ml-3 rtl:mr-0 text-white group-hover:text-red-500 transition-colors flex-shrink-0"
                              >
                                <path
                                  d="M7 17L17 7M17 7H7M17 7V17"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span>{t('nav.compare', 'Compare')}</span>
                            </Link>
                          </li>
                        </ul>

                        <div className="mt-10">
                          <Link
                            href="/products/scooter/all"
                            className="text-gray-300 hover:text-red-500 text-sm font-semibold transition-colors block"
                          >
                            {t('nav.shopNow', 'Shop eKickScooter')}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Product Dropdown Menu */}
              <div
                className="relative flex items-center h-full"
                onMouseEnter={() => handleMouseEnter('product')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => setActiveMenu(activeMenu === 'product' ? null : 'product')}
                  className={`text-sm font-semibold transition-colors flex items-center gap-1 h-full relative px-2 ${activeMenu === 'product' ? 'text-red-500' : 'text-gray-200 hover:text-red-500'
                    }`}
                >
                  <span>{t('nav.products', 'Products')}</span>
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="currentColor"
                    className={`transition-transform duration-200 ${activeMenu === 'product' ? 'rotate-180' : ''}`}
                  >
                    <path d="M5 6L0 0h10L5 6z" />
                  </svg>
                  {/* Red indicator line at bottom edge of header under Product */}
                  {activeMenu === 'product' && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#e31e24] z-50 rounded-t-sm" />
                  )}
                </button>

                {/* Glass Dropdown Menu for Product (Original Sleek Layout) */}
                {activeMenu === 'product' && (
                  <div
                    className={`absolute ${dir === 'rtl' ? 'right-0' : 'left-0'} rounded-b-2xl shadow-2xl overflow-hidden border border-zinc-800/80`}
                    style={{
                      top: '64px',
                      width: '420px',
                      zIndex: 45,
                      backgroundColor: 'rgba(10, 10, 10, 0.96)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.9)'
                    }}
                    onMouseEnter={() => handleMouseEnter('product')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div style={{ padding: '32px 36px' }}>
                      <div className="grid grid-cols-2 gap-8">
                        {/* SCOOTER Column */}
                        <div>
                          <div className="mb-4">
                            <Link
                              href="/all-models?category=SCOOTER&cc=ALL"
                              className="text-white font-bold text-sm tracking-wider uppercase inline-block border-b-2 border-white pb-1 hover:text-[#E60012] transition-colors"
                            >
                              {t('common.scooter', 'Scooters')}
                            </Link>
                          </div>
                          <ul className="space-y-3 text-xs text-gray-200 font-medium">
                            <li>
                              <Link href="/all-models?category=SCOOTER&cc=ALL" className="hover:text-[#E60012] transition-colors block font-semibold text-white">
                                {t('common.allModels', 'All Models')}
                              </Link>
                            </li>
                            <li>
                              <Link href="/all-models?category=SCOOTER&cc=MAXI_300" className="hover:text-[#E60012] transition-colors block">
                                300cc+
                              </Link>
                            </li>
                            <li>
                              <Link href="/all-models?category=SCOOTER&cc=MID_150_200" className="hover:text-[#E60012] transition-colors block">
                                150cc - 200cc
                              </Link>
                            </li>
                          </ul>
                        </div>

                        {/* BIKE Column */}
                        <div>
                          <div className="mb-4">
                            <Link
                              href="/all-models?category=BIKE&cc=ALL"
                              className="text-white font-bold text-sm tracking-wider uppercase inline-block border-b-2 border-white pb-1 hover:text-[#E60012] transition-colors"
                            >
                              {t('common.bike', 'Bikes')}
                            </Link>
                          </div>
                          <ul className="space-y-3 text-xs text-gray-200 font-medium">
                            <li>
                              <Link href="/all-models?category=BIKE&cc=ALL" className="hover:text-[#E60012] transition-colors block font-semibold text-white">
                                {t('common.allModels', 'All Models')}
                              </Link>
                            </li>
                            <li>
                              <Link href="/all-models?category=BIKE&cc=OVER_200" className="hover:text-[#E60012] transition-colors block">
                                Over 200cc
                              </Link>
                            </li>
                            <li>
                              <Link href="/all-models?category=BIKE&cc=MID_180_200" className="hover:text-[#E60012] transition-colors block">
                                180cc - 200cc
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Compare & Financing */}
              <Link
                href="/compare"
                className="text-sm font-semibold text-gray-200 hover:text-red-500 transition-colors py-5 flex items-center whitespace-nowrap"
              >
                {t('nav.compare', 'Compare & Financing')}
              </Link>

              {/* 4. Warranty */}
              <Link
                href="/warranty"
                className="text-sm font-semibold text-gray-200 hover:text-red-500 transition-colors py-5 flex items-center whitespace-nowrap"
              >
                {t('nav.warranty', 'Warranty')}
              </Link>

              {/* 5. Spare Parts */}
              <Link
                href="/spare-parts"
                suppressHydrationWarning
                className="text-sm font-semibold text-gray-200 hover:text-red-500 transition-colors py-5 flex items-center whitespace-nowrap"
              >
                {t('nav.spareParts', 'Spare Parts')}
              </Link>


              {/* 7. About Us */}
              <Link
                href="/about"
                suppressHydrationWarning
                className="text-sm font-semibold text-gray-200 hover:text-red-500 transition-colors py-5 flex items-center whitespace-nowrap"
              >
                {t('nav.about', 'About SYM Egypt')}
              </Link>
            </nav>
          </div>

          {/* Right Side: Search + Store Button + Language Toggle + Mobile Hamburger Toggle */}
          <div className="flex items-center gap-3 sm:gap-4">
            <SearchBar />

            {/* Cart Drawer Toggle Button */}
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="relative flex items-center justify-center p-2 rounded-full bg-zinc-900 border border-zinc-700 hover:border-[#E60012] text-zinc-200 hover:text-white transition-all shadow-sm group"
              title="سلة التسوق"
              aria-label="افتح سلة التسوق"
            >
              <ShoppingBag className="w-4 h-4 text-[#E60012] group-hover:scale-110 transition-transform" />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#E60012] text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {count}
                </span>
              )}
            </button>

            {/* Language Switcher Toggle Button */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-700 hover:border-[#E60012] text-xs font-bold text-zinc-200 hover:text-white transition-all shadow-sm"
              title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
            >
              <Globe className="w-3.5 h-3.5 text-[#E60012]" />
              <span className="font-mono">{language === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            <Link
              href="/products"
              style={{
                backgroundColor: '#e31e24',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '700',
                padding: '6px 18px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: '1',
              }}
              className="hover:bg-red-700 transition-all duration-300 whitespace-nowrap shadow-sm hidden sm:inline-flex"
            >
              {t('nav.store', 'Store')}
            </Link>

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Mobile Navigation Glass Slide-over Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 bg-black/95 backdrop-blur-2xl border-b border-zinc-800 text-white z-50 overflow-y-auto max-h-[calc(100vh-64px)] p-6 space-y-6 animate-in slide-in-from-top-4 duration-300">

          {/* Language Switcher Banner for Mobile */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
              <Globe className="w-4 h-4 text-[#E60012]" />
              <span>{t('nav.selectLanguage', 'Select Language')}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                toggleLanguage();
                setIsMobileOpen(false);
              }}
              className="px-4 py-1.5 rounded-full bg-[#E60012] text-white font-bold text-xs shadow-md"
            >
              {language === 'ar' ? 'English (EN)' : 'العربية (AR)'}
            </button>
          </div>

          <div className="space-y-2 pb-4 border-b border-zinc-800">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{t('nav.modelShowcase', 'Model Showcase')}</p>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/all-models?category=SCOOTER&cc=ALL"
                onClick={() => setIsMobileOpen(false)}
                className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-[#E60012] font-bold text-xs text-white flex items-center justify-between"
              >
                <span>{t('nav.symScooters', 'SYM Scooters')}</span>
                <span className="text-[10px] text-[#E60012] font-mono font-bold">ALL</span>
              </Link>
              <Link
                href="/all-models?category=BIKE&cc=ALL"
                onClick={() => setIsMobileOpen(false)}
                className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-[#E60012] font-bold text-xs text-white flex items-center justify-between"
              >
                <span>{t('nav.symBikes', 'SYM Bikes')}</span>
                <span className="text-[10px] text-[#E60012] font-mono font-bold">BIKE</span>
              </Link>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest pb-1">Navigation Links</p>
            <Link
              href="/about"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 font-bold text-sm text-zinc-200"
            >
              <Info className="w-4 h-4 text-[#E60012]" />
              <span>{t('nav.about', 'About SYM Egypt')}</span>
            </Link>
            <Link
              href="/compare"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 font-bold text-sm text-zinc-200"
            >
              <Scale className="w-4 h-4 text-[#E60012]" />
              <span>{t('nav.compare', 'Compare & Financing')}</span>
            </Link>
            <Link
              href="/warranty"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 font-bold text-sm text-zinc-200"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t('nav.warranty', 'Warranty')}</span>
            </Link>
            <Link
              href="/spare-parts"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 font-bold text-sm text-zinc-200"
            >
              <Wrench className="w-4 h-4 text-blue-400" />
              <span>{t('nav.spareParts', 'Spare Parts Catalog')}</span>
            </Link>
            <Link
              href="/dealers"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 font-bold text-sm text-zinc-200"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>{t('nav.dealers', 'Showrooms & Dealers')}</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-zinc-800 space-y-3">
            <a
              href="https://wa.me/201271384149"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#E60012]/10 border border-[#E60012]/30 text-white font-bold text-xs"
            >
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#E60012]" />
                <span>{t('nav.hotline', 'Customer Care')}</span>
              </div>
              <span className="font-mono text-[#E60012]">01271384149</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
