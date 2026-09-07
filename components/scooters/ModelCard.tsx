'use client';

import React from 'react';
import { Wrench, ArrowRight, BadgeCheck } from 'lucide-react';
import type { ModelGroup } from '@/lib/data/sparePartsModelMap';
import { shouldFlipImageToFaceLeft } from '@/lib/utils';

interface ModelCardProps {
  group: ModelGroup;
  count: number;
  onClick: () => void;
  language: 'ar' | 'en';
}

export function ModelCard({ group, count, onClick, language }: ModelCardProps) {
  const isAr = language === 'ar';
  const name = isAr ? group.nameAr : group.nameEn;
  const isFlipped = shouldFlipImageToFaceLeft(group.image || '');

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-3 text-center cursor-pointer"
    >
      {/* Circular photo stage */}
      <div className={`relative aspect-square w-full rounded-full overflow-hidden border transition-all duration-300 ${
        group.isCurrentLineup ? 'border-zinc-800 group-hover:border-[#E60012]' : 'border-zinc-800/70 group-hover:border-zinc-600'
      }`}>
        {group.image ? (
          // Flip lives on this wrapper (static) so it never fights the hover-zoom transform
          // that Tailwind applies to the <img> itself below.
          <div className="absolute inset-0" style={{ transform: isFlipped ? 'scaleX(-1)' : undefined }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={group.image}
              alt={name}
              className="h-full w-full object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-110"
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
            <Wrench className="w-10 h-10 text-zinc-700 transition-colors group-hover:text-[#E60012]/60" />
          </div>
        )}

        {group.isCurrentLineup && (
          <span className="absolute bottom-1.5 right-1.5 rtl:left-1.5 rtl:right-auto rounded-full bg-[#E60012] p-1 shadow-sm ring-2 ring-black">
            <BadgeCheck className="w-3.5 h-3.5 text-white" />
          </span>
        )}

        {/* Hover reveal — CTA over the circle */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 opacity-0 backdrop-blur-[1px] transition-opacity duration-300 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#E60012] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white shadow-lg shadow-[#E60012]/30">
            {isAr ? 'عرض القطع' : 'View Parts'}
            <ArrowRight className="w-3 h-3 rtl:rotate-180" />
          </span>
        </div>
      </div>

      {/* Label */}
      <div>
        <h3 className="text-sm font-black text-white leading-snug group-hover:text-[#E60012] transition-colors">{name}</h3>
        <p className="text-[11px] font-medium text-zinc-500">
          {count.toLocaleString('en-US')} {isAr ? 'قطعة غيار' : 'spare parts'}
        </p>
      </div>
    </button>
  );
}
