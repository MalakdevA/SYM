'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle2,
  Phone,
  MapPin,
  CreditCard,
  Hash,
  Receipt,
  Bike,
  CalendarDays,
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import { useAdmin } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import { AdminHeader } from '@/components/admin/layout/AdminHeader';
import { StatCard } from '@/components/admin/ui/StatCard';
import { DataTable, type DataTableColumn } from '@/components/admin/ui/DataTable';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { Drawer } from '@/components/admin/ui/Drawer';
import { SelectField } from '@/components/admin/ui/FormControls';
import { DonutChart, type DonutChartSlice } from '@/components/admin/ui/DonutChart';
import type { Order, OrderStatus } from '@/types/admin';

const LOCAL_BACKUP_KEY = 'sym_orders_backup';

const ORDER_STATUSES: OrderStatus[] = ['قيد المعالجة', 'في الطريق', 'تم التسليم', 'معلق', 'ملغي'];

const STATUS_COLORS: Record<OrderStatus, string> = {
  'قيد المعالجة': '#F59E0B',
  'في الطريق': '#38BDF8',
  'تم التسليم': '#10B981',
  'معلق': '#A78BFA',
  'ملغي': '#E11D48',
};

const STATUS_OPTIONS = ORDER_STATUSES.map((s) => ({ value: s, label: s }));

const MOCK_ORDERS: Order[] = [
  {
    id: 'o-1',
    order_no: 'SYM-30291',
    customer_name: 'أحمد محمود عبد الله',
    customer_phone: '01012345678',
    address: 'شارع مصطفى النحاس، مدينة نصر، القاهرة',
    scooter_model: 'SYM Jet 14 EVO 200',
    amount: 92500,
    created_at: '2026-08-22 14:10',
    payment_method: 'فوري',
    status: 'قيد المعالجة',
    chassis_no: 'JET14-2026-0512',
    fawry_ref_number: '9002214487',
  },
  {
    id: 'o-2',
    order_no: 'SYM-30288',
    customer_name: 'مريم سامي فتحي',
    customer_phone: '01123456789',
    address: 'محور 26 يوليو، الشيخ زايد، الجيزة',
    scooter_model: 'SYM Symphony ST 200',
    amount: 78900,
    created_at: '2026-08-21 11:42',
    payment_method: 'تحويل بنكي',
    status: 'تم التسليم',
    chassis_no: 'SYST200-2026-0398',
  },
  {
    id: 'o-3',
    order_no: 'SYM-30281',
    customer_name: 'كريم عادل حسين',
    customer_phone: '01234567890',
    address: 'شارع فوزي معاذ، سموحة، الإسكندرية',
    scooter_model: 'SYM Cruisym 400',
    amount: 315000,
    created_at: '2026-08-20 09:05',
    payment_method: 'تقسيط',
    status: 'في الطريق',
    chassis_no: 'CRZ400-2026-0071',
  },
  {
    id: 'o-4',
    order_no: 'SYM-30274',
    customer_name: 'نور الهدى إبراهيم',
    customer_phone: '01555667788',
    address: 'شارع 9، المعادي، القاهرة',
    scooter_model: 'SYM Husky ADV 150',
    amount: 118500,
    created_at: '2026-08-19 16:20',
    payment_method: 'فوري',
    status: 'معلق',
    chassis_no: 'HSK150-2026-0129',
    fawry_ref_number: '9002209911',
  },
  {
    id: 'o-5',
    order_no: 'SYM-30260',
    customer_name: 'محمد طارق الشناوي',
    customer_phone: '01098877665',
    address: 'شارع طلعت حرب، وسط البلد، القاهرة',
    scooter_model: 'SYM Jet 14 EVO 200',
    amount: 95000,
    created_at: '2026-08-17 10:00',
    payment_method: 'فوري',
    status: 'ملغي',
    chassis_no: 'JET14-2026-0488',
  },
];

function readLocalBackup(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_BACKUP_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Order[]) : [];
  } catch {
    return [];
  }
}

/** Dedupe by id — the local resilience cache first, then the API copy overwrites it (API wins on conflict). */
function mergeOrders(apiOrders: Order[], localOrders: Order[]): Order[] {
  const map = new Map<string, Order>();
  for (const o of localOrders) {
    if (o?.id) map.set(String(o.id), o);
  }
  for (const o of apiOrders) {
    if (o?.id) map.set(String(o.id), o);
  }
  return Array.from(map.values());
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-b-0">
      <div className="shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-slate-500">{label}</p>
        <p className="text-sm font-bold text-white break-words">{value}</p>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const { setOffline } = useAdmin();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    const json = await fetchWithAuth('/api/orders/index.php')
      .then((r) => r.json())
      .catch(() => null);
    // Offline mode reflects genuine unreachability (json === null), not a reached-but-rejected response.
    setOffline(json === null);
    const apiOk = json?.success && Array.isArray(json.data);
    if (apiOk) {
      const merged = mergeOrders(json.data as Order[], readLocalBackup());
      setOrders(merged);
      setIsMock(false);
    } else {
      setOrders(MOCK_ORDERS);
      setIsMock(true);
    }
    setIsLoading(false);
  }, [setOffline]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesSearch =
        !q ||
        o.order_no?.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.customer_phone?.includes(q);
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: orders.length,
      revenue: orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0),
      pending: orders.filter((o) => o.status === 'قيد المعالجة').length,
      delivered: orders.filter((o) => o.status === 'تم التسليم').length,
    }),
    [orders]
  );

  const statusBreakdown: DonutChartSlice[] = useMemo(
    () =>
      ORDER_STATUSES.map((status) => ({
        label: status,
        value: orders.filter((o) => o.status === status).length,
        color: STATUS_COLORS[status],
      })).filter((s) => s.value > 0),
    [orders]
  );

  const handleStatusChange = useCallback(
    async (order: Order, newStatus: OrderStatus) => {
      if (newStatus === order.status) return;
      const previousOrders = orders;

      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o)));
      setSelectedOrder((prev) => (prev && prev.id === order.id ? { ...prev, status: newStatus } : prev));

      if (isMock) return;

      setIsUpdating(true);
      try {
        const res = await fetchWithAuth('/api/orders/index.php', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: order.id, status: newStatus }),
        });
        const json = await res.json();
        if (!json?.success) throw new Error('status update failed');
      } catch {
        setOrders(previousOrders);
        setSelectedOrder((prev) => (prev && prev.id === order.id ? { ...prev, status: order.status } : prev));
      } finally {
        setIsUpdating(false);
      }
    },
    [orders, isMock]
  );

  const columns: DataTableColumn<Order>[] = [
    {
      key: 'order_no',
      header: t('admin.orders.orderNoColumn', 'رقم الطلب'),
      render: (o) => <span className="font-bold text-white">{o.order_no}</span>,
    },
    {
      key: 'customer_name',
      header: t('admin.orders.customerColumn', 'العميل'),
      render: (o) => (
        <div className="min-w-0">
          <p className="font-bold text-white truncate">{o.customer_name}</p>
          <p className="text-[11px] text-slate-500">{o.customer_phone}</p>
        </div>
      ),
    },
    {
      key: 'scooter_model',
      header: t('admin.orders.modelColumn', 'الموديل'),
      render: (o) => <span className="text-slate-300">{o.scooter_model}</span>,
      hideOnMobile: true,
    },
    {
      key: 'amount',
      header: t('admin.orders.amountColumn', 'المبلغ'),
      render: (o) => <span className="font-bold text-white tabular-nums">{Number(o.amount).toLocaleString('en-US')} ج.م</span>,
    },
    {
      key: 'created_at',
      header: t('admin.orders.dateColumn', 'التاريخ'),
      render: (o) => <span className="text-slate-400 text-xs">{o.created_at}</span>,
      hideOnMobile: true,
    },
    {
      key: 'status',
      header: t('admin.orders.statusColumn', 'الحالة'),
      render: (o) => <StatusBadge status={o.status} />,
    },
  ];

  return (
    <div>
      <AdminHeader
        title={t('admin.orders.pageTitle', 'الطلبات')}
        subtitle={t('admin.orders.pageSubtitle', 'متابعة وإدارة كل طلبات الشراء الواردة')}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('admin.orders.searchPlaceholder', 'ابحث برقم الطلب، اسم العميل أو الهاتف')}
      />

      <div className="p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title={t('admin.orders.statTotalOrders', 'إجمالي الطلبات')} value={stats.total} icon={ShoppingCart} accent="rose" isLoading={isLoading} />
          <StatCard
            title={t('admin.orders.statTotalRevenue', 'إجمالي الإيرادات')}
            value={`${stats.revenue.toLocaleString('en-US')} ج.م`}
            icon={DollarSign}
            accent="emerald"
            isLoading={isLoading}
          />
          <StatCard title={t('admin.orders.statPending', 'قيد المعالجة')} value={stats.pending} icon={Clock} accent="amber" isLoading={isLoading} />
          <StatCard title={t('admin.orders.statDelivered', 'تم التسليم')} value={stats.delivered} icon={CheckCircle2} accent="sky" isLoading={isLoading} />
        </div>

        {!isLoading && statusBreakdown.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5">
            <p className="text-xs font-black text-white mb-4">{t('admin.orders.statusBreakdownHeading', 'توزيع الطلبات حسب الحالة')}</p>
            <div className="max-w-xs mx-auto sm:mx-0">
              <DonutChart data={statusBreakdown} centerLabel={t('admin.orders.totalOrdersLabel', 'إجمالي الطلبات')} centerValue={stats.total} />
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 sm:hidden">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('admin.orders.searchPlaceholder', 'ابحث برقم الطلب، اسم العميل أو الهاتف')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#E11D48]/60"
            />
          </div>
          <div className="w-full sm:w-56">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | OrderStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-sm text-white focus:outline-none focus:border-[#E11D48]/60"
            >
              <option value="all">{t('admin.orders.allStatusesOption', 'كل الحالات')}</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredOrders}
          keyExtractor={(o) => o.id}
          isLoading={isLoading}
          emptyMessage={t('admin.orders.emptyMessage', 'لا توجد طلبات مطابقة')}
          onRowClick={(o) => setSelectedOrder(o)}
        />
      </div>

      <Drawer isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={selectedOrder?.order_no} side="end" widthClass="w-full sm:w-80">
        {selectedOrder && (
          <div className="p-4 space-y-5" dir="rtl">
            <div className="flex items-center justify-between">
              <StatusBadge status={selectedOrder.status} />
              <span className="text-lg font-black text-white tabular-nums">
                {Number(selectedOrder.amount).toLocaleString('en-US')} ج.م
              </span>
            </div>

            <div>
              <DetailRow icon={ShoppingCart} label={t('admin.orders.customerNameLabel', 'اسم العميل')} value={selectedOrder.customer_name} />
              <DetailRow icon={Phone} label={t('admin.orders.phoneLabel', 'رقم الهاتف')} value={selectedOrder.customer_phone} />
              <DetailRow icon={MapPin} label={t('admin.orders.addressLabel', 'العنوان')} value={selectedOrder.address} />
              <DetailRow icon={Bike} label={t('admin.orders.modelLabel', 'الموديل')} value={selectedOrder.scooter_model} />
              <DetailRow icon={CalendarDays} label={t('admin.orders.orderDateLabel', 'تاريخ الطلب')} value={selectedOrder.created_at} />
              <DetailRow icon={CreditCard} label={t('admin.orders.paymentMethodLabel', 'طريقة الدفع')} value={selectedOrder.payment_method} />
              <DetailRow icon={Hash} label={t('admin.orders.chassisNoLabel', 'رقم الشاسيه')} value={selectedOrder.chassis_no} />
              <DetailRow icon={Receipt} label={t('admin.orders.fawryRefLabel', 'مرجع فوري')} value={selectedOrder.fawry_ref_number} />
            </div>

            <SelectField
              label={t('admin.orders.changeStatusLabel', 'تغيير حالة الطلب')}
              options={STATUS_OPTIONS}
              value={selectedOrder.status}
              disabled={isUpdating}
              onChange={(e) => handleStatusChange(selectedOrder, e.target.value as OrderStatus)}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}
