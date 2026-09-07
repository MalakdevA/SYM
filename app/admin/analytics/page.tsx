'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Eye, Users, FileText } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import { useAdmin } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import { AdminHeader } from '@/components/admin/layout/AdminHeader';
import { StatCard } from '@/components/admin/ui/StatCard';
import { DataTable, type DataTableColumn } from '@/components/admin/ui/DataTable';
import type { PageViewRecord } from '@/types/admin';

const MOCK_PAGE_VIEWS: PageViewRecord[] = [
  { path: '/', title: 'الصفحة الرئيسية', views_count: 18420, unique_visitors: 9310 },
  { path: '/scooter/jet-14-evo-200', title: 'SYM Jet 14 EVO 200', views_count: 7215, unique_visitors: 4102 },
  { path: '/all-models', title: 'كل الموديلات', views_count: 5860, unique_visitors: 3340 },
  { path: '/scooter/cruisym-400', title: 'SYM Cruisym 400', views_count: 4390, unique_visitors: 2517 },
  { path: '/compare', title: 'مقارنة الموديلات', views_count: 2140, unique_visitors: 1489 },
  { path: '/warranty', title: 'الضمان', views_count: 1325, unique_visitors: 980 },
];

export default function AdminAnalyticsPage() {
  const { setOffline } = useAdmin();
  const { t } = useLanguage();
  const [pages, setPages] = useState<PageViewRecord[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth('/api/analytics').then((r) => r.json()).catch(() => null);
      const ok = res?.success && Array.isArray(res.data);

      // Offline mode reflects genuine unreachability (res === null), not a reached-but-rejected response.
      setOffline(res === null);
      setPages(ok ? (res.data as PageViewRecord[]) : MOCK_PAGE_VIEWS);
    } finally {
      setIsLoading(false);
    }
  }, [setOffline]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const sortedPages = useMemo(() => {
    return [...(pages ?? [])].sort((a, b) => b.views_count - a.views_count);
  }, [pages]);

  const filteredPages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sortedPages;
    return sortedPages.filter((p) => p.path.toLowerCase().includes(q) || p.title.toLowerCase().includes(q));
  }, [sortedPages, search]);

  const totals = useMemo(() => {
    const list = pages ?? [];
    return {
      totalViews: list.reduce((sum, p) => sum + (Number(p.views_count) || 0), 0),
      totalUniqueVisitors: list.reduce((sum, p) => sum + (Number(p.unique_visitors) || 0), 0),
      trackedPages: list.length,
    };
  }, [pages]);

  const maxViews = sortedPages.length > 0 ? sortedPages[0].views_count : 0;

  const columns: DataTableColumn<PageViewRecord>[] = [
    {
      key: 'path',
      header: t('admin.analytics.colPath', 'المسار'),
      render: (p) => (
        <span dir="ltr" className="font-mono text-xs text-slate-300 block text-left">
          {p.path}
        </span>
      ),
    },
    { key: 'title', header: t('admin.analytics.colTitle', 'العنوان'), render: (p) => <span className="text-white font-bold">{p.title}</span> },
    {
      key: 'views_count',
      header: t('admin.analytics.colViews', 'المشاهدات'),
      render: (p) => <span className="tabular-nums text-slate-200">{p.views_count.toLocaleString('en-US')}</span>,
      hideOnMobile: true,
    },
    {
      key: 'unique_visitors',
      header: t('admin.analytics.colUniqueVisitors', 'الزوار الفريدون'),
      render: (p) => <span className="tabular-nums text-slate-200">{p.unique_visitors.toLocaleString('en-US')}</span>,
      hideOnMobile: true,
    },
    {
      key: 'rank_bar',
      header: t('admin.analytics.colRank', 'الترتيب'),
      render: (p) => {
        const pct = maxViews > 0 ? Math.max(4, Math.round((p.views_count / maxViews) * 100)) : 0;
        return (
          <div className="w-24 md:w-32 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-[#E11D48]" style={{ width: `${pct}%` }} />
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <AdminHeader
        title={t('admin.analytics.pageTitle', 'التحليلات وتقارير الزيارات')}
        subtitle={t('admin.analytics.pageSubtitle', 'أداء صفحات الموقع بناءً على بيانات الزيارات الفعلية')}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('admin.analytics.searchPlaceholder', 'بحث بالمسار أو العنوان...')}
      />

      <div className="p-4 md:p-6 space-y-6">
        <div className="relative sm:hidden">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.analytics.searchPlaceholder', 'بحث بالمسار أو العنوان...')}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#E11D48]/60"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title={t('admin.analytics.totalViews', 'إجمالي المشاهدات')}
            value={totals.totalViews.toLocaleString('en-US')}
            icon={Eye}
            accent="rose"
            isLoading={isLoading}
          />
          <StatCard
            title={t('admin.analytics.totalUniqueVisitors', 'إجمالي الزوار الفريدين')}
            value={totals.totalUniqueVisitors.toLocaleString('en-US')}
            icon={Users}
            accent="sky"
            isLoading={isLoading}
          />
          <StatCard
            title={t('admin.analytics.trackedPages', 'الصفحات المتتبعة')}
            value={totals.trackedPages}
            icon={FileText}
            accent="violet"
            isLoading={isLoading}
          />
        </div>

        <div>
          <h2 className="text-sm font-black text-white mb-3">{t('admin.analytics.topPagesHeading', 'الصفحات الأكثر مشاهدة')}</h2>
          <DataTable
            columns={columns}
            data={filteredPages}
            keyExtractor={(p) => p.path}
            isLoading={isLoading}
            emptyMessage={t('admin.analytics.emptyMessage', 'لا توجد بيانات زيارات لعرضها')}
          />
        </div>
      </div>
    </div>
  );
}
