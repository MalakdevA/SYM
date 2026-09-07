'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface RankedBarItem {
  label: string;
  value: number;
  color?: string;
}

interface RankedBarListProps {
  data: RankedBarItem[];
  formatValue?: (value: number) => string;
}

const DEFAULT_COLOR = '#E11D48';

export function RankedBarList({ data, formatValue }: RankedBarListProps) {
  const max = Math.max(1, ...data.map((d) => d.value));

  if (data.length === 0) {
    return <p className="text-[11px] text-slate-500 text-center py-6">—</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={item.label}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-300 truncate">{item.label}</span>
            <span className="text-[11px] font-black text-white tabular-nums shrink-0 ms-2">
              {formatValue ? formatValue(item.value) : item.value.toLocaleString('en-US')}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / max) * 100}%` }}
              transition={{ duration: 0.5, delay: i * 0.04, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: item.color ?? DEFAULT_COLOR }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
