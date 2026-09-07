'use client';

import React from 'react';
import { SparePartCategory } from '@/lib/data/sparePartsCategories';

interface CategoryCardProps {
  category: SparePartCategory;
  count: number;
  isActive: boolean;
  onClick: () => void;
  language: 'ar' | 'en';
}

// Professional SVG icons per category
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  engine: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M12 6V4m0 2a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m-6 8a2 2 0 1 0 0-4m0 4a2 2 0 1 1 0-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 1 0 0-4m0 4a2 2 0 1 1 0-4m0 4v2m0-6V4" />
    </svg>
  ),
  brakes: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="M5.636 5.636l2.828 2.828M15.536 15.536l2.828 2.828M5.636 18.364l2.828-2.828M15.536 8.464l2.828-2.828" />
    </svg>
  ),
  body: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M3 12c0-1 .5-2 1.5-2.5L7 8l3-3h4l3 3 2.5 1.5c1 .5 1.5 1.5 1.5 2.5v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2z" />
      <circle cx="7" cy="15" r="2" />
      <circle cx="17" cy="15" r="2" />
    </svg>
  ),
  electrical: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  suspension: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
    </svg>
  ),
  transmission: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  ),
  steering: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 9V2M5.636 5.636 9.17 9.17M14.83 14.83l3.534 3.534M9 12H2M22 12h-7" />
    </svg>
  ),
  cooling: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </svg>
  ),
  chassis: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <circle cx="12" cy="12" r="4" />
      <path d="m15.5 8.5 3-3M5.5 5.5l3 3m7 7 3 3M5.5 18.5l3-3" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </svg>
  ),
  accessories: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z" />
    </svg>
  ),
};

const ICON_COLORS: Record<string, string> = {
  engine: 'text-orange-400',
  brakes: 'text-red-400',
  body: 'text-slate-300',
  electrical: 'text-amber-400',
  suspension: 'text-blue-400',
  transmission: 'text-violet-400',
  steering: 'text-rose-400',
  cooling: 'text-sky-400',
  chassis: 'text-stone-400',
  accessories: 'text-pink-400',
};

export function CategoryCard({ category, count, isActive, onClick, language }: CategoryCardProps) {
  const isAr = language === 'ar';
  const icon = CATEGORY_ICONS[category.id] ?? CATEGORY_ICONS.accessories;
  const iconColor = ICON_COLORS[category.id] ?? 'text-zinc-400';

  return (
    <button
      onClick={onClick}
      className={`
        group relative flex-shrink-0 w-36 sm:w-44 rounded-2xl p-4 text-start border transition-all duration-200
        cursor-pointer select-none
        ${isActive
          ? 'border-[#E60012]/70 bg-[#E60012]/10'
          : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
        }
      `}
    >
      <div className="flex flex-col gap-3">
        {/* Icon Container */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${isActive ? 'bg-white/10' : 'bg-zinc-900 group-hover:bg-zinc-800'}`}>
          <span className={iconColor}>{icon}</span>
        </div>

        {/* Labels */}
        <div>
          <p className={`text-xs font-black tracking-wide leading-snug ${isActive ? 'text-[#E60012]' : 'text-white'}`}>
            {isAr ? category.nameAr : category.nameEn}
          </p>
          <p className="text-[10px] mt-0.5 font-medium text-zinc-500">
            {isAr ? category.nameEn : category.nameAr}
          </p>
        </div>

        {/* Count Badge */}
        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold w-fit border ${
          isActive
            ? 'bg-white/10 border-[#E60012]/40 text-[#E60012]'
            : 'bg-zinc-900 border-zinc-800 text-zinc-300'
        }`}>
          <span>{count.toLocaleString('en-US')}</span>
          <span className="font-semibold text-zinc-500">{isAr ? 'قطعة' : 'parts'}</span>
        </div>
      </div>
    </button>
  );
}
