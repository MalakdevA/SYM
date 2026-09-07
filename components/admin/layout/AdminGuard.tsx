'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import { canAccessPage, pageKeyForPath } from '@/lib/adminPermissions';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAdmin();
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginRoute = pathname === '/admin/login';

  const pageKey = pathname ? pageKeyForPath(pathname) : null;
  const hasPermission = !pageKey || canAccessPage(user?.role, pageKey);

  useEffect(() => {
    if (!isLoading && !user && !isLoginRoute) {
      router.replace('/admin/login');
    }
  }, [isLoading, user, isLoginRoute, router]);

  if (isLoginRoute) return <>{children}</>;

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <Loader2 className="w-6 h-6 animate-spin text-[#E11D48]" />
      </div>
    );
  }

  // Blocks direct navigation to a page this role can't reach — the sidebar already hides the
  // link, but a typed/bookmarked URL must be stopped here too, not just visually hidden.
  if (!hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4" dir="rtl">
        <div className="max-w-sm text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E11D48]/10 border border-[#E11D48]/30 flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6 text-[#E11D48]" />
          </div>
          <h1 className="text-base font-black text-white mb-1.5">
            {t('admin.guard.deniedTitle', 'لا تملك صلاحية الوصول لهذه الصفحة')}
          </h1>
          <p className="text-xs text-slate-500 mb-5">
            {t('admin.guard.deniedSubtitle', 'صلاحية حسابك الحالية لا تسمح بعرض هذا القسم. تواصل مع المدير العام إذا كنت تحتاج وصولاً إضافياً.')}
          </p>
          <button
            type="button"
            onClick={() => router.replace('/admin')}
            className="px-4 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-extrabold transition-colors"
          >
            {t('admin.guard.backToOverview', 'العودة للنظرة العامة')}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
