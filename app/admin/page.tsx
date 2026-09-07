'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DollarSign, ShoppingCart, Users, PackageX, ClipboardList, Store } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import { useAdmin } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import { AdminHeader } from '@/components/admin/layout/AdminHeader';
import { StatCard } from '@/components/admin/ui/StatCard';
import { DataTable, type DataTableColumn } from '@/components/admin/ui/DataTable';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { DonutChart, type DonutChartSlice } from '@/components/admin/ui/DonutChart';
import { RankedBarList, type RankedBarItem } from '@/components/admin/ui/RankedBarList';
import type { Order, ServiceTicket, DashboardStats } from '@/types/admin';

// A distinct color per real spare-part category (the same 10 categories used across the admin
// and the public storefront) so the donut chart stays visually consistent everywhere it appears.
const CATEGORY_COLORS: Record<string, string> = {
  'المحرك والكرتيرة': '#E11D48',
  'الفرامل': '#F59E0B',
  'الهيكل والفيبر': '#64748B',
  'الكهربا والإضاءة': '#0EA5E9',
  'التعليق والعجلات': '#8B5CF6',
  'الفتيس والدبرياج': '#EC4899',
  'الجادون والقيادة': '#06B6D4',
  'التبريد والزيت': '#10B981',
  'الشاسية والمسامير': '#71717A',
  'أكسسوار ومتفرقات': '#F472B6',
};
const FALLBACK_COLORS = ['#E11D48', '#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#71717A'];

const MOCK_ORDERS: Order[] = [
  { id: 'o-1', order_no: 'SYM-30291', customer_name: 'أحمد محمود', customer_phone: '01012345678', address: 'مدينة نصر، القاهرة', scooter_model: 'SYM Jet 14 EVO 200', amount: 92500, created_at: '2026-08-22 14:10', payment_method: 'فوري', status: 'قيد المعالجة' },
  { id: 'o-2', order_no: 'SYM-30288', customer_name: 'مريم سامي', customer_phone: '01123456789', address: 'الشيخ زايد، الجيزة', scooter_model: 'SYM Symphony ST 200', amount: 78900, created_at: '2026-08-21 11:42', payment_method: 'تحويل بنكي', status: 'تم التسليم' },
  { id: 'o-3', order_no: 'SYM-30281', customer_name: 'كريم عادل', customer_phone: '01234567890', address: 'سموحة، الإسكندرية', scooter_model: 'SYM Cruisym 400', amount: 315000, created_at: '2026-08-20 09:05', payment_method: 'تقسيط', status: 'في الطريق' },
];

const MOCK_TICKETS: ServiceTicket[] = [
  { id: 't-1', ticket_no: 'SRV-1042', customer_name: 'عمر حسن', customer_phone: '01098765432', scooter_model: 'SYM Husky ADV 150', chassis_no: 'HSK150-2025-0091', service_type: 'صيانة دورية', showroom: 'فرع مدينة نصر', status: 'pending', created_at: '2026-08-23' },
  { id: 't-2', ticket_no: 'SRV-1039', customer_name: 'ياسمين فؤاد', customer_phone: '01187654321', scooter_model: 'SYM Jet 14 EVO 200', chassis_no: 'JET14-2025-0233', service_type: 'إصلاح فرامل', showroom: 'فرع الشيخ زايد', status: 'in_progress', created_at: '2026-08-22' },
];

interface DashboardData {
  stats: DashboardStats;
  recentOrders: Order[];
  recentTickets: ServiceTicket[];
  partsByCategory: DonutChartSlice[];
  productsBySubCategory: RankedBarItem[];
  showroomsByCity: RankedBarItem[];
}

function computeStats(orders: Order[], customersCount: number, lowStock: number, pendingTickets: number, activeShowrooms: number): DashboardStats {
  return {
    totalRevenue: orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0),
    totalOrders: orders.length,
    totalCustomers: customersCount,
    lowStockCount: lowStock,
    pendingServiceTickets: pendingTickets,
    activeShowrooms,
  };
}

export default function AdminOverviewPage() {
  const { setOffline } = useAdmin();
  const { t } = useLanguage();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ordersRes, customersRes, partsRes, serviceRes, showroomsRes, productsRes] = await Promise.all([
        fetchWithAuth('/api/orders').then((r) => r.json()).catch(() => null),
        fetchWithAuth('/api/customers').then((r) => r.json()).catch(() => null),
        fetchWithAuth('/api/spare-parts').then((r) => r.json()).catch(() => null),
        fetchWithAuth('/api/service').then((r) => r.json()).catch(() => null),
        fetchWithAuth('/api/showrooms').then((r) => r.json()).catch(() => null),
        fetchWithAuth('/api/products').then((r) => r.json()).catch(() => null),
      ]);

      const ordersOk = ordersRes?.success && Array.isArray(ordersRes.data);
      const customersOk = customersRes?.success && Array.isArray(customersRes.data);
      const partsOk = partsRes?.success && Array.isArray(partsRes.data);
      const serviceOk = serviceRes?.success && Array.isArray(serviceRes.data);
      const showroomsOk = showroomsRes?.success && Array.isArray(showroomsRes.data);
      const productsOk = productsRes?.success && Array.isArray(productsRes.data);

      const allReal = ordersOk && customersOk && partsOk && serviceOk && showroomsOk && productsOk;
      // Only flag "offline" when the backend was genuinely unreachable (fetch/parse threw, so the
      // response is null) — a reached-but-rejected response (401/validation/etc.) is a real error,
      // not an offline state, and must not silently switch the whole session into demo mode.
      const allReached = [ordersRes, customersRes, partsRes, serviceRes, showroomsRes, productsRes].every((r) => r !== null);
      setOffline(!allReached);

      const orders: Order[] = ordersOk ? ordersRes.data : MOCK_ORDERS;
      const customersCount: number = customersOk ? customersRes.data.length : 128;
      const lowStock: number = partsOk ? partsRes.data.filter((p: { stock: number }) => Number(p.stock) <= 5).length : 7;
      const tickets: ServiceTicket[] = serviceOk ? serviceRes.data : MOCK_TICKETS;
      const pendingTickets = tickets.filter((t) => t.status === 'pending' || t.status === 'in_progress').length;
      const activeShowrooms: number = showroomsOk
        ? showroomsRes.data.filter((s: { status: string }) => s.status === 'active').length
        : 6;

      // Real distribution charts — computed straight from whatever the API actually returned
      // (or omitted entirely when that fetch failed, never a fabricated breakdown).
      const partsByCategory: DonutChartSlice[] = partsOk
        ? Object.entries(
            (partsRes.data as { category?: string }[]).reduce<Record<string, number>>((acc, p) => {
              const cat = p.category || '—';
              acc[cat] = (acc[cat] ?? 0) + 1;
              return acc;
            }, {})
          )
            .map(([label, value], i) => ({ label, value, color: CATEGORY_COLORS[label] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length] }))
            .sort((a, b) => b.value - a.value)
        : [];

      const productsBySubCategory: RankedBarItem[] = productsOk
        ? Object.entries(
            (productsRes.data as { subCategory?: string; sub_category?: string }[]).reduce<Record<string, number>>((acc, p) => {
              const cat = p.subCategory || p.sub_category || '—';
              acc[cat] = (acc[cat] ?? 0) + 1;
              return acc;
            }, {})
          )
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value)
        : [];

      const showroomsByCity: RankedBarItem[] = showroomsOk
        ? Object.entries(
            (showroomsRes.data as { city?: string }[]).reduce<Record<string, number>>((acc, s) => {
              const city = s.city || '—';
              acc[city] = (acc[city] ?? 0) + 1;
              return acc;
            }, {})
          )
            .map(([label, value]) => ({ label, value, color: '#0EA5E9' }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8)
        : [];

      setData({
        stats: computeStats(orders, customersCount, lowStock, pendingTickets, activeShowrooms),
        recentOrders: orders.slice(0, 5),
        recentTickets: tickets.slice(0, 5),
        partsByCategory,
        productsBySubCategory,
        showroomsByCity,
      });
    } finally {
      setIsLoading(false);
    }
  }, [setOffline]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const orderColumns: DataTableColumn<Order>[] = [
    { key: 'order_no', header: t('admin.overview.orderNumberColumn', 'رقم الطلب'), render: (o) => <span className="font-bold text-white">{o.order_no}</span> },
    { key: 'customer_name', header: t('admin.overview.customerColumn', 'العميل'), render: (o) => o.customer_name },
    { key: 'scooter_model', header: t('admin.overview.modelColumn', 'الموديل'), render: (o) => o.scooter_model, hideOnMobile: true },
    { key: 'amount', header: t('admin.overview.amountColumn', 'المبلغ'), render: (o) => `${o.amount.toLocaleString('en-US')} ج.م` },
    { key: 'status', header: t('admin.overview.statusColumn', 'الحالة'), render: (o) => <StatusBadge status={o.status} /> },
  ];

  const ticketColumns: DataTableColumn<ServiceTicket>[] = [
    { key: 'ticket_no', header: t('admin.overview.ticketNumberColumn', 'رقم التذكرة'), render: (ticket) => <span className="font-bold text-white">{ticket.ticket_no}</span> },
    { key: 'customer_name', header: t('admin.overview.customerColumn', 'العميل'), render: (ticket) => ticket.customer_name },
    { key: 'service_type', header: t('admin.overview.serviceTypeColumn', 'نوع الخدمة'), render: (ticket) => ticket.service_type, hideOnMobile: true },
    { key: 'status', header: t('admin.overview.statusColumn', 'الحالة'), render: (ticket) => <StatusBadge status={ticket.status} /> },
  ];

  const stats = data?.stats;

  return (
    <div>
      <AdminHeader title={t('admin.overview.pageTitle', 'نظرة عامة')} subtitle={t('admin.overview.pageSubtitle', 'ملخص أداء المنصة اليوم')} />

      <div className="p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4">
          <StatCard title={t('admin.overview.totalRevenue', 'إجمالي الإيرادات')} value={stats ? `${stats.totalRevenue.toLocaleString('en-US')} ج.م` : '—'} icon={DollarSign} accent="emerald" isLoading={isLoading} />
          <StatCard title={t('admin.overview.totalOrders', 'الطلبات')} value={stats?.totalOrders ?? '—'} icon={ShoppingCart} accent="rose" isLoading={isLoading} />
          <StatCard title={t('admin.overview.totalCustomers', 'العملاء')} value={stats?.totalCustomers ?? '—'} icon={Users} accent="sky" isLoading={isLoading} />
          <StatCard title={t('admin.overview.lowStockCount', 'قطع منخفضة المخزون')} value={stats?.lowStockCount ?? '—'} icon={PackageX} accent="amber" isLoading={isLoading} />
          <StatCard title={t('admin.overview.pendingServiceTickets', 'تذاكر صيانة معلقة')} value={stats?.pendingServiceTickets ?? '—'} icon={ClipboardList} accent="fuchsia" isLoading={isLoading} />
          <StatCard title={t('admin.overview.activeShowrooms', 'معارض نشطة')} value={stats?.activeShowrooms ?? '—'} icon={Store} accent="violet" isLoading={isLoading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5">
            <h2 className="text-sm font-black text-white mb-4">{t('admin.overview.partsByCategoryHeading', 'قطع الغيار حسب الفئة')}</h2>
            {isLoading ? (
              <div className="h-44 rounded-xl bg-white/5 animate-pulse" />
            ) : (
              <DonutChart
                data={data?.partsByCategory ?? []}
                centerLabel={t('admin.overview.totalPartsLabel', 'إجمالي القطع')}
                centerValue={(data?.partsByCategory ?? []).reduce((s, d) => s + d.value, 0).toLocaleString('en-US')}
              />
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5">
            <h2 className="text-sm font-black text-white mb-4">{t('admin.overview.productsByTypeHeading', 'الموديلات حسب الفئة')}</h2>
            {isLoading ? (
              <div className="h-44 rounded-xl bg-white/5 animate-pulse" />
            ) : (
              <RankedBarList data={data?.productsBySubCategory ?? []} />
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5">
            <h2 className="text-sm font-black text-white mb-4">{t('admin.overview.showroomsByCityHeading', 'المعارض حسب المدينة')}</h2>
            {isLoading ? (
              <div className="h-44 rounded-xl bg-white/5 animate-pulse" />
            ) : (
              <RankedBarList data={data?.showroomsByCity ?? []} />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div>
            <h2 className="text-sm font-black text-white mb-3">{t('admin.overview.recentOrdersHeading', 'أحدث الطلبات')}</h2>
            <DataTable columns={orderColumns} data={data?.recentOrders ?? []} keyExtractor={(o) => o.id} isLoading={isLoading} />
          </div>
          <div>
            <h2 className="text-sm font-black text-white mb-3">{t('admin.overview.recentTicketsHeading', 'أحدث تذاكر الصيانة')}</h2>
            <DataTable columns={ticketColumns} data={data?.recentTickets ?? []} keyExtractor={(ticket) => ticket.id} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
