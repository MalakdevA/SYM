'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

type Accent = 'rose' | 'emerald' | 'slate' | 'amber' | 'sky' | 'violet' | 'fuchsia' | 'cyan';

const ACCENT_STYLES: Record<Accent, { glow: string; icon: string; ring: string; bar: string }> = {
  rose: { glow: 'from-[#E11D48]/25', icon: 'text-[#FB7185] bg-[#E11D48]/10 ring-1 ring-inset ring-[#E11D48]/20', ring: 'group-hover:border-[#E11D48]/40', bar: 'bg-gradient-to-r from-[#FB7185] to-[#BE123C]' },
  emerald: { glow: 'from-emerald-500/25', icon: 'text-emerald-400 bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/20', ring: 'group-hover:border-emerald-500/40', bar: 'bg-gradient-to-r from-emerald-400 to-emerald-600' },
  slate: { glow: 'from-slate-400/15', icon: 'text-slate-300 bg-slate-500/10 ring-1 ring-inset ring-slate-400/20', ring: 'group-hover:border-slate-400/40', bar: 'bg-gradient-to-r from-slate-300 to-slate-500' },
  amber: { glow: 'from-amber-500/25', icon: 'text-amber-400 bg-amber-500/10 ring-1 ring-inset ring-amber-500/20', ring: 'group-hover:border-amber-500/40', bar: 'bg-gradient-to-r from-amber-300 to-amber-600' },
  sky: { glow: 'from-sky-500/25', icon: 'text-sky-400 bg-sky-500/10 ring-1 ring-inset ring-sky-500/20', ring: 'group-hover:border-sky-500/40', bar: 'bg-gradient-to-r from-sky-300 to-sky-600' },
  violet: { glow: 'from-violet-500/25', icon: 'text-violet-400 bg-violet-500/10 ring-1 ring-inset ring-violet-500/20', ring: 'group-hover:border-violet-500/40', bar: 'bg-gradient-to-r from-violet-300 to-violet-600' },
  fuchsia: { glow: 'from-fuchsia-500/25', icon: 'text-fuchsia-400 bg-fuchsia-500/10 ring-1 ring-inset ring-fuchsia-500/20', ring: 'group-hover:border-fuchsia-500/40', bar: 'bg-gradient-to-r from-fuchsia-300 to-fuchsia-600' },
  cyan: { glow: 'from-cyan-500/25', icon: 'text-cyan-400 bg-cyan-500/10 ring-1 ring-inset ring-cyan-500/20', ring: 'group-hover:border-cyan-500/40', bar: 'bg-gradient-to-r from-cyan-300 to-cyan-600' },
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  accent?: Accent;
  trend?: { value: number; label?: string };
  isLoading?: boolean;
}

export function StatCard({ title, value, icon: Icon, accent = 'rose', trend, isLoading }: StatCardProps) {
  const styles = ACCENT_STYLES[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_12px_28px_-14px_rgba(0,0,0,0.6)] transition-colors ${styles.ring}`}
    >
      <span className={`absolute top-0 inset-x-0 h-[2.5px] ${styles.bar} opacity-80`} />
      <div className={`pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${styles.glow} to-transparent blur-2xl`} />

      <div className="relative flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-400 truncate">{title}</p>
          {isLoading ? (
            <div className="h-7 w-24 mt-2 rounded-md bg-white/10 animate-pulse" />
          ) : (
            <p className="mt-1.5 text-2xl font-black text-white tabular-nums truncate">{value}</p>
          )}
          {trend && !isLoading && (
            <div className={`mt-2 inline-flex items-center gap-1 text-[11px] font-bold ${trend.value >= 0 ? 'text-emerald-400' : 'text-[#E11D48]'}`}>
              {trend.value >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {Math.abs(trend.value)}% {trend.label ?? ''}
            </div>
          )}
        </div>
        <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center shadow-inner ${styles.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}
