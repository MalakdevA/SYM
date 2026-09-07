'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface DonutChartSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartSlice[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string | number;
}

const RADIUS_BASE = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS_BASE;

export function DonutChart({ data, size = 176, strokeWidth = 14, centerLabel, centerValue }: DonutChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total <= 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="w-full h-full rounded-full border-[14px] border-white/5" />
      </div>
    );
  }

  type Arc = DonutChartSlice & { dashArray: string; dashOffset: number; index: number; pct: number };
  const { arcs } = data.reduce<{ cumulative: number; arcs: Arc[] }>(
    (acc, slice, i) => {
      const fraction = slice.value / total;
      const dashArray = `${fraction * CIRCUMFERENCE} ${CIRCUMFERENCE}`;
      const dashOffset = -acc.cumulative * CIRCUMFERENCE;
      return {
        cumulative: acc.cumulative + fraction,
        arcs: [...acc.arcs, { ...slice, dashArray, dashOffset, index: i, pct: fraction * 100 }],
      };
    },
    { cumulative: 0, arcs: [] }
  );

  const activeSlice = hovered !== null ? arcs[hovered] : null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
          <circle cx="50" cy="50" r={RADIUS_BASE} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
          {arcs.map((arc) => (
            <motion.circle
              key={arc.label}
              cx="50"
              cy="50"
              r={RADIUS_BASE}
              fill="none"
              stroke={arc.color}
              strokeWidth={hovered === arc.index ? strokeWidth + 3 : strokeWidth}
              strokeDasharray={arc.dashArray}
              strokeDashoffset={arc.dashOffset}
              strokeLinecap="butt"
              initial={{ opacity: 0 }}
              animate={{ opacity: hovered === null || hovered === arc.index ? 1 : 0.35 }}
              transition={{ duration: 0.2 }}
              onMouseEnter={() => setHovered(arc.index)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-lg font-black text-white tabular-nums">{activeSlice ? `${Math.round(activeSlice.pct)}%` : centerValue}</p>
          <p className="text-[10px] font-bold text-slate-500 text-center px-3 truncate max-w-full">{activeSlice ? activeSlice.label : centerLabel}</p>
        </div>
      </div>

      <div className="w-full grid grid-cols-2 gap-x-3 gap-y-1.5">
        {arcs.map((arc) => (
          <button
            key={arc.label}
            type="button"
            onMouseEnter={() => setHovered(arc.index)}
            onMouseLeave={() => setHovered(null)}
            className={`flex items-center gap-1.5 text-start transition-opacity ${hovered !== null && hovered !== arc.index ? 'opacity-40' : ''}`}
          >
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: arc.color }} />
            <span className="text-[10px] font-bold text-slate-400 truncate">{arc.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
