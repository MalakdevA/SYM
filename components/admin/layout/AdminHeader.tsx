'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Search, Languages, WifiOff, Bell, Loader2 } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
}

function NotificationBell() {
  const { notifications, notificationsLoading } = useAdmin();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalCount = notifications.reduce((sum, n) => sum + n.count, 0);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="relative shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:bg-white/10 transition-colors"
        title={t('admin.notifications.bellTitle', 'التنبيهات')}
      >
        <Bell className="w-[18px] h-[18px]" />
        {totalCount > 0 && (
          <span className="absolute top-1 end-1 min-w-[16px] h-4 px-1 rounded-full bg-[#E11D48] text-white text-[9px] font-black flex items-center justify-center">
            {totalCount > 99 ? '99+' : totalCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute top-full mt-2 end-0 w-72 rounded-xl border border-white/10 bg-[#0F172A] shadow-2xl shadow-black/50 overflow-hidden z-30"
          dir="rtl"
        >
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-xs font-black text-white">{t('admin.notifications.title', 'التنبيهات')}</p>
          </div>

          {notificationsLoading && notifications.length === 0 ? (
            <div className="py-8 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-[11px] text-slate-500">
              {t('admin.notifications.empty', 'لا توجد تنبيهات جديدة الآن')}
            </p>
          ) : (
            <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                >
                  <span className="text-xs font-bold text-slate-200">{t(n.labelKey, n.labelFallback)}</span>
                  <span className="shrink-0 min-w-[22px] h-[22px] px-1.5 rounded-full bg-[#E11D48]/15 text-[#E11D48] text-[11px] font-black flex items-center justify-center">
                    {n.count}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AdminHeader({ title, subtitle, searchValue, onSearchChange, searchPlaceholder, actions }: AdminHeaderProps) {
  const { openMobileSidebar, isOffline } = useAdmin();
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-[#0B111F]/75 backdrop-blur-2xl">
      <div className="h-px bg-gradient-to-r from-transparent via-[#E11D48]/40 to-transparent" />
      <div className="flex items-center gap-3 px-4 md:px-6 py-3.5">
        <button
          type="button"
          onClick={openMobileSidebar}
          className="md:hidden shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:bg-white/10 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="text-base md:text-lg font-black text-white truncate">{title}</h1>
          {subtitle && <p className="text-[11px] text-slate-500 truncate hidden sm:block">{subtitle}</p>}
        </div>

        {onSearchChange && (
          <div className="relative hidden md:block w-64">
            <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-500" />
            <input
              value={searchValue ?? ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder ?? t('admin.header.searchPlaceholder', 'بحث...')}
              className="w-full ps-9 pe-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 transition-shadow focus:outline-none focus:border-[#E11D48]/60 focus:shadow-[0_0_0_3px_rgba(225,29,72,0.15)]"
            />
          </div>
        )}

        {isOffline && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
            <WifiOff className="w-3.5 h-3.5" />
            {t('admin.header.offlineBanner', 'بيانات تجريبية - غير متصل بالخادم')}
          </span>
        )}

        {actions}

        <NotificationBell />

        <button
          type="button"
          onClick={toggleLanguage}
          className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:bg-white/10 transition-colors"
          title={language === 'ar' ? 'English' : 'العربية'}
        >
          <Languages className="w-[18px] h-[18px]" />
        </button>
      </div>
    </header>
  );
}
