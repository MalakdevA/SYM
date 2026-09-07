'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { recordPageView } from '@/lib/analytics';

export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    
    // Auto title generation based on path
    let title = 'SYM Egypt';
    if (pathname === '/') title = 'الصفحة الرئيسية - SYM Egypt';
    else if (pathname === '/all-models') title = 'كتالوج جميع الموديلات والأسعار';
    else if (pathname.startsWith('/products/')) title = `تفاصيل الموديل - ${pathname.replace('/products/', '')}`;
    else if (pathname.startsWith('/admin')) title = `لوحة التحكم - ${pathname}`;

    recordPageView(pathname, title);
  }, [pathname]);

  return null;
}
