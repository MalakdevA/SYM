'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  side?: 'start' | 'end';
  widthClass?: string;
  /** True only for the mobile sidebar off-canvas, which has a separate persistent desktop <aside>. General-purpose drawers (detail panels, etc.) must stay false so they work at every breakpoint. */
  mobileOnly?: boolean;
  children: React.ReactNode;
}

export function Drawer({ isOpen, onClose, title, side = 'start', widthClass = 'w-80', mobileOnly = false, children }: DrawerProps) {
  const isStart = side === 'start';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-0 z-[110] ${mobileOnly ? 'md:hidden' : ''}`}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: isStart ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isStart ? '-100%' : '100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            className={`absolute top-0 bottom-0 ${isStart ? 'left-0' : 'right-0'} ${widthClass} bg-[#0F172A] border-white/10 ${isStart ? 'border-e' : 'border-s'} overflow-y-auto`}
          >
            {title && (
              <div className="flex items-center justify-between px-4 py-4 border-b border-white/10" dir="rtl">
                <h2 className="text-sm font-black text-white">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
