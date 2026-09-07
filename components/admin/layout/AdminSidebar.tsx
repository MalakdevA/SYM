'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bike,
  Wrench,
  ShoppingCart,
  Users,
  ClipboardList,
  Store,
  BarChart3,
  UserCog,
  Settings,
  ChevronsLeft,
  LogOut,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import { Drawer } from '@/components/admin/ui/Drawer';
import { canAccessPage, type AdminPageKey } from '@/lib/adminPermissions';

interface NavItem {
  href: string;
  icon: LucideIcon;
  labelAr: string;
  labelEn: string;
  pageKey: AdminPageKey;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', icon: LayoutDashboard, labelAr: 'نظرة عامة', labelEn: 'Overview', pageKey: 'overview' },
  { href: '/admin/inventory', icon: Bike, labelAr: 'المخزون والموديلات', labelEn: 'Inventory', pageKey: 'inventory' },
  { href: '/admin/spare-parts', icon: Wrench, labelAr: 'قطع الغيار', labelEn: 'Spare Parts', pageKey: 'spareParts' },
  { href: '/admin/orders', icon: ShoppingCart, labelAr: 'الطلبات', labelEn: 'Orders', pageKey: 'orders' },
  { href: '/admin/customers', icon: Users, labelAr: 'العملاء', labelEn: 'Customers', pageKey: 'customers' },
  { href: '/admin/service', icon: ClipboardList, labelAr: 'الصيانة والضمان', labelEn: 'Service & Warranty', pageKey: 'service' },
  { href: '/admin/showrooms', icon: Store, labelAr: 'المعارض', labelEn: 'Showrooms', pageKey: 'showrooms' },
  { href: '/admin/analytics', icon: BarChart3, labelAr: 'التحليلات', labelEn: 'Analytics', pageKey: 'analytics' },
  { href: '/admin/users', icon: UserCog, labelAr: 'مستخدمو النظام', labelEn: 'Admin Users', pageKey: 'users' },
  { href: '/admin/settings', icon: Settings, labelAr: 'الإعدادات', labelEn: 'Settings', pageKey: 'settings' },
];

function NavList({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const { user } = useAdmin();
  const visibleItems = NAV_ITEMS.filter((item) => canAccessPage(user?.role, item.pageKey));

  return (
    <nav className="flex-1 overflow-y-auto scrollbar-hide px-2.5 py-3 space-y-1">
      {visibleItems.map((item) => {
        const isActive = item.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(item.href);
        const label = language === 'ar' ? item.labelAr : item.labelEn;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-[#E11D48]/20 via-[#E11D48]/10 to-transparent text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            {isActive && (
              <span className="absolute inset-y-1.5 start-0 w-[3px] rounded-full bg-gradient-to-b from-[#FB7185] to-[#BE123C] shadow-[0_0_12px_2px_rgba(225,29,72,0.55)]" />
            )}
            <item.icon className={`w-[18px] h-[18px] shrink-0 transition-colors ${isActive ? 'text-[#FB7185]' : 'group-hover:text-slate-200'}`} />
            {!collapsed && <span className="truncate">{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/[0.08]">
      <div className="shrink-0 relative w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FB7185] via-[#E11D48] to-[#7F1D3E] flex items-center justify-center font-black text-white text-base shadow-[0_8px_24px_-6px_rgba(225,29,72,0.6)] ring-1 ring-inset ring-white/25">
        <span className="relative z-10">S</span>
        <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/25 to-transparent opacity-60" />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p className="text-sm font-black text-white tracking-tight truncate">SYM Egypt</p>
          <p className="text-[10px] font-bold text-slate-500 truncate">لوحة التحكم الإدارية</p>
        </div>
      )}
    </div>
  );
}

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  const { user, logout } = useAdmin();
  return (
    <div className="border-t border-white/[0.08] p-3">
      <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
        <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#E11D48]/30 to-[#E11D48]/10 ring-1 ring-inset ring-[#E11D48]/30 text-[#FB7185] flex items-center justify-center text-xs font-black">
          {user?.name?.charAt(0) ?? 'A'}
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{user?.name ?? 'مدير النظام'}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.role ?? ''}</p>
          </div>
        )}
        <button
          type="button"
          onClick={logout}
          title="تسجيل الخروج"
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-[#E11D48] hover:bg-[#E11D48]/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, closeMobileSidebar } = useAdmin();

  return (
    <>
      {/* Desktop */}
      <aside
        className={`hidden md:flex flex-col fixed top-0 bottom-0 start-0 z-30 border-e border-white/[0.08] bg-[#0B111F]/90 backdrop-blur-2xl shadow-[inset_-1px_0_0_rgba(255,255,255,0.03)] transition-[width] duration-200 ${
          sidebarCollapsed ? 'w-[76px]' : 'w-64'
        }`}
      >
        <SidebarBrand collapsed={sidebarCollapsed} />
        <NavList collapsed={sidebarCollapsed} />
        <SidebarFooter collapsed={sidebarCollapsed} />
        <button
          type="button"
          onClick={toggleSidebar}
          className="absolute top-6 -end-3 w-6 h-6 rounded-full bg-[#0F172A] border border-white/10 shadow-lg shadow-black/40 flex items-center justify-center text-slate-400 hover:text-white hover:border-[#E11D48]/40 transition-colors"
        >
          <ChevronsLeft className={`w-3.5 h-3.5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* Mobile */}
      <Drawer isOpen={mobileSidebarOpen} onClose={closeMobileSidebar} side="start" widthClass="w-72" mobileOnly>
        <div className="flex flex-col h-full">
          <SidebarBrand collapsed={false} />
          <NavList collapsed={false} onNavigate={closeMobileSidebar} />
          <SidebarFooter collapsed={false} />
        </div>
      </Drawer>
    </>
  );
}
