'use client';

import React from 'react';

type BadgeTone = 'emerald' | 'rose' | 'amber' | 'slate' | 'sky';

const STATUS_TONE: Record<string, BadgeTone> = {
  // Orders
  'قيد المعالجة': 'amber',
  'في الطريق': 'sky',
  'تم التسليم': 'emerald',
  'معلق': 'slate',
  'ملغي': 'rose',
  // Generic active/inactive
  active: 'emerald',
  inactive: 'slate',
  maintenance: 'amber',
  coming_soon: 'sky',
  // Service tickets
  pending: 'amber',
  in_progress: 'sky',
  completed: 'emerald',
  cancelled: 'rose',
  confirmed: 'sky',
  // Warranty
  expiring_soon: 'amber',
  expired: 'rose',
  void: 'slate',
  // Contact messages
  new: 'sky',
  read: 'slate',
  replied: 'emerald',
  // Stock
  inStock: 'emerald',
  outOfStock: 'rose',
};

const TONE_CLASSES: Record<BadgeTone, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  rose: 'bg-[#E11D48]/10 text-[#E11D48] border-[#E11D48]/30',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  slate: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  sky: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  tone?: BadgeTone;
  className?: string;
}

export function StatusBadge({ status, label, tone, className = '' }: StatusBadgeProps) {
  const resolvedTone = tone ?? STATUS_TONE[status] ?? 'slate';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold whitespace-nowrap ${TONE_CLASSES[resolvedTone]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${TONE_CLASSES[resolvedTone].split(' ')[1].replace('text-', 'bg-')}`} />
      {label ?? status}
    </span>
  );
}
