'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Cairo } from 'next/font/google';
import { AdminProvider, useAdmin } from '@/context/AdminContext';
import { AdminGuard } from '@/components/admin/layout/AdminGuard';
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { sidebarCollapsed } = useAdmin();
  const isLoginRoute = pathname === '/admin/login';

  if (isLoginRoute) {
    return <div className={cairo.variable}>{children}</div>;
  }

  return (
    <div className={`${cairo.variable} min-h-screen relative bg-[#080C16] text-white font-[family-name:var(--font-cairo)]`}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -end-40 w-[560px] h-[560px] rounded-full bg-[#E11D48]/[0.09] blur-[130px]" />
        <div className="absolute top-1/3 -start-48 w-[520px] h-[520px] rounded-full bg-violet-600/[0.07] blur-[140px]" />
        <div className="absolute bottom-0 end-1/4 w-[420px] h-[420px] rounded-full bg-emerald-500/[0.05] blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '34px 34px' }}
        />
        <div className="admin-noise absolute inset-0" />
      </div>
      <AdminSidebar />
      <div className={`relative transition-[padding] duration-200 ${sidebarCollapsed ? 'md:ps-[76px]' : 'md:ps-64'}`}>
        {children}
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminGuard>
        <AdminShell>{children}</AdminShell>
      </AdminGuard>
    </AdminProvider>
  );
}
