'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PRODUCTS, getActiveProducts, ProductItem } from '@/lib/data/products';
import { syncLiveProducts } from '@/lib/products-store';
import { shouldFlipImageToFaceLeft, getProductImageScale } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function AllModelsShowcase() {
  const { language, dir } = useLanguage();
  const searchParams = useSearchParams();
  const categoryParam = searchParams?.get('category')?.toUpperCase() || 'SCOOTER';
  const ccParam = searchParams?.get('cc')?.toUpperCase() as 'ALL' | 'OVER_125' | '125' | '50' || 'ALL';

  const [products, setProducts] = useState<ProductItem[]>(PRODUCTS);

  useEffect(() => {
    const update = () => {
      setProducts(getActiveProducts());
    };
    update();
    // Merge live backend products (admin-managed catalog), then re-read
    syncLiveProducts().then(update);
    window.addEventListener('storage', update);
    window.addEventListener('focus', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('focus', update);
    };
  }, []);

  const [activeTab, setActiveTab] = useState<'SCOOTER' | 'BIKE' | 'ALL'>(
    categoryParam === 'BIKE' ? 'BIKE' : 'SCOOTER'
  );
  const [displacementFilter, setDisplacementFilter] = useState<string>(
    ['ALL', 'MAXI_300', 'MID_150_200', 'ELECTRIC', 'OVER_200', 'MID_180_200', 'OVER_125', '125', '50'].includes(ccParam) ? ccParam : 'ALL'
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  // Keep state synchronized with URL parameters when clicking Header Mega-Menu links
  React.useEffect(() => {
    if (categoryParam === 'BIKE') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab('BIKE');
    } else if (categoryParam === 'SCOOTER') {
      setActiveTab('SCOOTER');
    } else if (categoryParam === 'ALL') {
      setActiveTab('ALL');
    }

    if (ccParam) {
      setDisplacementFilter(ccParam);
    }
    setCurrentPage(1);
  }, [categoryParam, ccParam]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter (SCOOTER vs BIKE vs ALL)
      let matchesCategory = true;
      if (activeTab === 'SCOOTER') matchesCategory = p.category === 'scooter';
      else if (activeTab === 'BIKE') matchesCategory = p.category === 'bike';
      else if (activeTab === 'ALL') matchesCategory = true;

      if (!matchesCategory) return false;

      // Displacement filter matching real SYM Egypt catalog
      if (displacementFilter === 'ALL') return true;

      const cc = parseInt(p.capacity || '0');
      const isElectric = p.id.includes('efiddle') || (p.capacity && p.capacity.toLowerCase().includes('electric'));

      if (displacementFilter === 'MAXI_300') return cc >= 250;
      if (displacementFilter === 'MID_150_200') return !isElectric && cc >= 140 && cc < 250;
      if (displacementFilter === 'ELECTRIC') return isElectric;

      if (displacementFilter === 'OVER_200') return cc > 200;
      if (displacementFilter === 'MID_180_200') return cc >= 180 && cc <= 200;

      // Legacy fallback filters
      if (displacementFilter === 'OVER_125') return true;
      if (displacementFilter === '125' || displacementFilter === '50') return false;

      return true;
    });
  }, [products, activeTab, displacementFilter]);

  // Paginated products (12 on Page 1, 7 on Page 2)
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-[#1c1c1e] text-gray-900 min-h-screen font-sans select-none relative" dir={dir}>

      {/* 1. Official Dark Top Banner Container */}
      <div className="relative w-full h-[360px] sm:h-[440px] md:h-[520px] bg-black overflow-hidden border-b border-zinc-800">
        <Image
          src="/top_banner2 copy.jpg"
          alt="SYM Egypt Hero Banner"
          fill
          priority
          quality={100}
          unoptimized
          className="object-cover object-[center_95%] brightness-105 contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30 pointer-events-none"></div>
      </div>

      {/* 2. Main Overlapping White Card Stage */}
      <div className={`relative z-20 w-full -mt-16 md:-mt-28 pb-24 ${dir === 'rtl' ? 'pr-0 md:pr-[14%] lg:pr-[18%] pl-0' : 'pl-0 md:pl-[14%] lg:pl-[18%] pr-0'}`}>

        <div className={`bg-white shadow-2xl p-6 md:p-12 space-y-8 min-h-[800px] flex flex-col justify-between rounded-none ${dir === 'rtl' ? 'md:pl-16 border-r border-gray-200' : 'md:pr-16 border-l border-gray-200'}`}>

          <div className="space-y-8">
            {/* Header Row & Tabs Bar matching official SYM Global layout */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-gray-100 pb-6">

              {/* Left Title & Breadcrumb */}
              <div className="space-y-1.5">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-wide text-[#E60012] uppercase">
                  {activeTab === 'SCOOTER' ? (language === 'ar' ? 'سكوترز SYM' : 'SYM SCOOTERS') : activeTab === 'BIKE' ? (language === 'ar' ? 'بايكات SYM' : 'SYM BIKES') : (language === 'ar' ? 'جميع المنتجات' : 'ALL PRODUCTS')}
                </h1>
                <p className="text-sm font-medium text-gray-400 tracking-wide font-sans">
                  {language === 'ar' ? 'الرئيسية' : 'Home'} / {language === 'ar' ? 'المنتجات' : 'Product'} / <span className="text-gray-400">{activeTab}</span>
                </p>
              </div>

              {/* Centered Category Sub-Nav */}
              <div className="flex-1 flex flex-wrap items-center justify-center gap-4 md:gap-6 w-full relative">
                {[
                  {
                    id: 'SCOOTER',
                    label: language === 'ar' ? 'سكوترز' : 'SCOOTER',
                    subItems: [
                      { label: language === 'ar' ? 'جميع الموديلات' : 'All Models', filter: 'ALL' },
                      { label: '300cc+', filter: 'MAXI_300' },
                      { label: '150cc - 200cc', filter: 'MID_150_200' },
                    ]
                  },
                  {
                    id: 'BIKE',
                    label: language === 'ar' ? 'بايكات' : 'BIKE',
                    subItems: [
                      { label: language === 'ar' ? 'جميع الموديلات' : 'All Models', filter: 'ALL' },
                      { label: language === 'ar' ? 'أكبر من 200cc' : 'Over 200cc (275cc)', filter: 'OVER_200' },
                      { label: '180cc - 200cc', filter: 'MID_180_200' },
                    ]
                  },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <div key={tab.id} className="relative group">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab(tab.id as 'SCOOTER' | 'BIKE' | 'ALL');
                          setDisplacementFilter('ALL');
                          setCurrentPage(1);
                        }}
                        className={`px-8 md:px-14 py-4 md:py-4.5 text-sm md:text-base font-black tracking-wider uppercase transition-all flex items-center gap-2.5 border-b-4 ${isActive
                          ? 'bg-white text-[#E60012] border-[#E60012] shadow-md'
                          : 'bg-[#f0f0f0] text-gray-700 border-transparent hover:bg-gray-200 hover:text-black'
                          }`}
                      >
                        <span>{tab.label}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform group-hover:rotate-180 ${isActive ? 'text-[#E60012]' : 'text-gray-500'}`} />
                      </button>

                      {/* Dropdown Sub-Menu */}
                      <div className={`absolute top-full hidden group-hover:block z-40 bg-white border border-gray-200 shadow-2xl rounded-b-xl py-2 min-w-[200px] ${dir === 'rtl' ? 'right-0' : 'left-0'}`}>
                        {tab.subItems.map((sub, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => {
                              setActiveTab(tab.id as 'SCOOTER' | 'BIKE' | 'ALL');
                              setDisplacementFilter(sub.filter);
                              setCurrentPage(1);
                            }}
                            className={`w-full px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-red-50 hover:text-[#E60012] transition-colors block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* 3-Column Minimalist Clean Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-10 pt-6">
              {paginatedProducts.map((product) => {
                const isFlipped = shouldFlipImageToFaceLeft(product.image);
                return (
                  <Link
                    key={product.id}
                    href={`/scooter/${product.slug}`}
                    className="product-list-wrap group flex flex-col items-center text-center p-3 transition-all duration-300"
                  >
                    {/* Scooter Image Stage */}
                    <div
                      className="relative w-full h-48 sm:h-56 md:h-64 max-w-[380px] mx-auto overflow-visible flex items-center justify-center p-3"
                      style={{ transform: isFlipped ? 'scaleX(-1)' : 'none' }}
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-0 transition-transform duration-500 ease-out filter drop-shadow-md mix-blend-multiply group-hover:scale-110"
                      />
                    </div>

                    {/* Product Name & CC Capacity */}
                    <div className="mt-4 space-y-1 text-center">
                      <h3 className="text-lg md:text-xl font-black tracking-tight text-gray-900 group-hover:text-[#E60012] transition-colors uppercase">
                        {product.name}
                      </h3>
                      <p className="text-xs sm:text-sm font-medium text-gray-400 font-sans tracking-wide">
                        {product.capacity || product.specifications?.capacity || '150 cc'}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Pagination Controls matching exact user design */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-12 border-t border-gray-100 mt-12">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage((prev) => Math.max(prev - 1, 1));
                  scrollToTop();
                }}
                className="w-10 h-10 rounded-full border border-gray-200 hover:border-gray-400 text-gray-500 font-bold text-xs flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none"
                aria-label="Previous Page"
              >
                &lt;&lt;
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => {
                    setCurrentPage(pageNum);
                    scrollToTop();
                  }}
                  className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center transition-all ${currentPage === pageNum
                    ? 'bg-[#E60012] text-white shadow-md'
                    : 'border border-gray-200 text-gray-700 hover:border-gray-400'
                    }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => {
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                  scrollToTop();
                }}
                className="w-10 h-10 rounded-full border border-gray-200 hover:border-gray-400 text-gray-500 font-bold text-xs flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none"
                aria-label="Next Page"
              >
                &gt;&gt;
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
