'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Clock,
  Wrench,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import { useAdmin } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import { AdminHeader } from '@/components/admin/layout/AdminHeader';
import { StatCard } from '@/components/admin/ui/StatCard';
import { DataTable, type DataTableColumn } from '@/components/admin/ui/DataTable';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { ActionModal } from '@/components/admin/ui/ActionModal';
import { TextField, TextareaField, SelectField } from '@/components/admin/ui/FormControls';
import { DonutChart, type DonutChartSlice } from '@/components/admin/ui/DonutChart';
import type { ServiceTicket, ServiceTicketStatus, WarrantyItem, WarrantyStatus } from '@/types/admin';

// ─────────────────────────── Mock fallback data ───────────────────────────

const MOCK_TICKETS: ServiceTicket[] = [
  { id: 't-1', ticket_no: 'SRV-1042', customer_name: 'عمر حسن', customer_phone: '01098765432', scooter_model: 'SYM Husky ADV 150', chassis_no: 'HSK150-2025-0091', service_type: 'صيانة دورية', showroom: 'فرع مدينة نصر', status: 'pending', notes: 'العميل طلب فحص الفرامل', mileage: 4200, cost: 850, delivery_time: '2026-08-26', created_at: '2026-08-23' },
  { id: 't-2', ticket_no: 'SRV-1039', customer_name: 'ياسمين فؤاد', customer_phone: '01187654321', scooter_model: 'SYM Jet 14 EVO 200', chassis_no: 'JET14-2025-0233', service_type: 'إصلاح فرامل', showroom: 'فرع الشيخ زايد', status: 'in_progress', notes: 'استبدال تيل الفرامل الخلفي', mileage: 12800, cost: 1450, delivery_time: '2026-08-25', created_at: '2026-08-22' },
  { id: 't-3', ticket_no: 'SRV-1031', customer_name: 'محمد سيد', customer_phone: '01234567891', scooter_model: 'SYM Symphony ST 200', chassis_no: 'SYM200-2024-0817', service_type: 'تغيير زيت', showroom: 'فرع سموحة', status: 'completed', notes: 'تم تغيير الزيت والفلتر', mileage: 7600, cost: 420, delivery_time: '2026-08-20', created_at: '2026-08-19' },
  { id: 't-4', ticket_no: 'SRV-1025', customer_name: 'نور الدين طارق', customer_phone: '01011122233', scooter_model: 'SYM Cruisym 400', chassis_no: 'CRZ400-2025-0055', service_type: 'صيانة عامة', showroom: 'فرع مدينة نصر', status: 'cancelled', notes: 'ألغى العميل الموعد', created_at: '2026-08-15' },
];

const MOCK_WARRANTIES: WarrantyItem[] = [
  { id: 'w-1', chassis_no: 'HSK150-2025-0091', engine_no: 'ENG-9910-A', customer_name: 'عمر حسن', customer_phone: '01098765432', customer_email: 'omar.hassan@example.com', scooter_model: 'SYM Husky ADV 150', scooter_color: 'أسود مطفي', purchase_date: '2025-11-02', warranty_expiry: '2027-11-02', warranty_years: 2, showroom: 'فرع مدينة نصر', last_service_date: '2026-08-23', next_service_date: '2026-11-23', service_count: 2, mileage_km: 4200, status: 'فعّال', notes: 'ضمان ساري بدون ملاحظات' },
  { id: 'w-2', chassis_no: 'JET14-2025-0233', engine_no: 'ENG-4471-B', customer_name: 'ياسمين فؤاد', customer_phone: '01187654321', customer_email: 'yasmin.fouad@example.com', scooter_model: 'SYM Jet 14 EVO 200', scooter_color: 'أحمر', purchase_date: '2025-09-10', warranty_expiry: '2026-09-10', warranty_years: 1, showroom: 'فرع الشيخ زايد', last_service_date: '2026-08-22', next_service_date: '2026-09-01', service_count: 4, mileage_km: 12800, status: 'قارب على الانتهاء', notes: 'يحتاج تجديد قريبًا' },
  { id: 'w-3', chassis_no: 'SYM200-2024-0817', engine_no: 'ENG-1120-C', customer_name: 'محمد سيد', customer_phone: '01234567891', scooter_model: 'SYM Symphony ST 200', scooter_color: 'أبيض', purchase_date: '2024-06-15', warranty_expiry: '2025-06-15', warranty_years: 1, showroom: 'فرع سموحة', last_service_date: '2026-08-19', service_count: 5, mileage_km: 7600, status: 'منتهي', notes: undefined },
  { id: 'w-4', chassis_no: 'CRZ400-2025-0055', customer_name: 'نور الدين طارق', customer_phone: '01011122233', scooter_model: 'SYM Cruisym 400', scooter_color: 'أزرق', purchase_date: '2025-01-20', warranty_expiry: '2028-01-20', warranty_years: 3, showroom: 'فرع مدينة نصر', service_count: 0, mileage_km: 1100, status: 'ملغي', notes: 'تم إلغاء الضمان لاستخدام قطع غير أصلية' },
];

// ─────────────────────────── Tabs ───────────────────────────

type TabKey = 'tickets' | 'warranty';

const TABS: { key: TabKey; i18nKey: string; label: string }[] = [
  { key: 'tickets', i18nKey: 'admin.service.tabTickets', label: 'تذاكر الصيانة' },
  { key: 'warranty', i18nKey: 'admin.service.tabWarranty', label: 'سجلات الضمان' },
];

const TICKET_STATUS_OPTIONS: { value: ServiceTicketStatus; label: string; i18nKey: string }[] = [
  { value: 'pending', label: 'قيد الانتظار', i18nKey: 'admin.service.statusPending' },
  { value: 'in_progress', label: 'جاري العمل', i18nKey: 'admin.service.statusInProgress' },
  { value: 'completed', label: 'مكتمل', i18nKey: 'admin.service.statusCompleted' },
  { value: 'cancelled', label: 'ملغي', i18nKey: 'admin.service.statusCancelled' },
];

const WARRANTY_STATUS_OPTIONS: { value: WarrantyStatus; label: string; i18nKey: string }[] = [
  { value: 'فعّال', label: 'ساري', i18nKey: 'admin.service.statusActive' },
  { value: 'قارب على الانتهاء', label: 'قارب على الانتهاء', i18nKey: 'admin.service.statusExpiringSoon' },
  { value: 'منتهي', label: 'منتهي', i18nKey: 'admin.service.statusExpired' },
  { value: 'ملغي', label: 'ملغي', i18nKey: 'admin.service.statusVoid' },
];

const TICKET_STATUS_COLORS: Record<ServiceTicketStatus, string> = {
  pending: '#F59E0B',
  in_progress: '#94A3B8',
  completed: '#10B981',
  cancelled: '#E11D48',
};

const WARRANTY_STATUS_COLORS: Record<WarrantyStatus, string> = {
  'فعّال': '#10B981',
  'قارب على الانتهاء': '#F59E0B',
  'منتهي': '#94A3B8',
  'ملغي': '#E11D48',
};

type TFn = (path: string, fallback?: string) => string;

function translateTicketStatusOptions(t: TFn) {
  return TICKET_STATUS_OPTIONS.map((o) => ({ ...o, label: t(o.i18nKey, o.label) }));
}

function translateWarrantyStatusOptions(t: TFn) {
  return WARRANTY_STATUS_OPTIONS.map((o) => ({ ...o, label: t(o.i18nKey, o.label) }));
}

// ─────────────────────────── Validation schemas ───────────────────────────

const optionalNumber = z.preprocess(
  (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
  z.number().nonnegative().optional()
);

const ticketSchema = z.object({
  customer_name: z.string().min(2, 'اسم العميل مطلوب'),
  customer_phone: z.string().min(8, 'رقم الهاتف مطلوب'),
  scooter_model: z.string().min(2, 'موديل الدراجة مطلوب'),
  chassis_no: z.string().min(2, 'رقم الشاسيه مطلوب'),
  service_type: z.string().min(2, 'نوع الخدمة مطلوب'),
  showroom: z.string().min(2, 'المعرض مطلوب'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  notes: z.string().optional(),
  mileage: optionalNumber,
  cost: optionalNumber,
  delivery_time: z.string().optional(),
});
type TicketFormInput = z.input<typeof ticketSchema>;
type TicketFormData = z.infer<typeof ticketSchema>;

const warrantyCreateSchema = z.object({
  chassis_no: z.string().min(2, 'رقم الشاسيه مطلوب'),
  engine_no: z.string().optional(),
  customer_name: z.string().min(2, 'اسم العميل مطلوب'),
  customer_phone: z.string().min(8, 'رقم الهاتف مطلوب'),
  customer_email: z.string().email('بريد إلكتروني غير صالح').optional().or(z.literal('')),
  scooter_model: z.string().min(2, 'موديل الدراجة مطلوب'),
  scooter_color: z.string().optional(),
  purchase_date: z.string().min(1, 'تاريخ الشراء مطلوب'),
  warranty_expiry: z.string().min(1, 'تاريخ انتهاء الضمان مطلوب'),
  warranty_years: z.coerce.number().min(1, 'مدة الضمان مطلوبة'),
  showroom: z.string().min(2, 'المعرض مطلوب'),
  status: z.enum(['فعّال', 'قارب على الانتهاء', 'منتهي', 'ملغي']),
  mileage_km: optionalNumber,
  notes: z.string().optional(),
});
type WarrantyCreateFormInput = z.input<typeof warrantyCreateSchema>;
type WarrantyCreateFormData = z.infer<typeof warrantyCreateSchema>;

const warrantyEditSchema = z.object({
  status: z.enum(['فعّال', 'قارب على الانتهاء', 'منتهي', 'ملغي']),
  mileage_km: optionalNumber,
  notes: z.string().optional(),
});
type WarrantyEditFormInput = z.input<typeof warrantyEditSchema>;
type WarrantyEditFormData = z.infer<typeof warrantyEditSchema>;

// ─────────────────────────── Page ───────────────────────────

export default function ServicePage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<TabKey>('tickets');
  const [search, setSearch] = useState('');

  return (
    <div>
      <AdminHeader
        title={t('admin.service.pageTitle', 'الصيانة والضمان')}
        subtitle={t('admin.service.pageSubtitle', 'إدارة تذاكر الصيانة وسجلات ضمان الشاسيه')}
        searchValue={tab === 'warranty' ? search : undefined}
        onSearchChange={tab === 'warranty' ? setSearch : undefined}
        searchPlaceholder={t('admin.service.searchPlaceholder', 'بحث برقم الشاسيه أو اسم العميل...')}
      />

      <div className="p-4 md:p-6 space-y-6">
        <div className="inline-flex items-center gap-1 p-1 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
          {TABS.map((tabItem) => (
            <button
              key={tabItem.key}
              type="button"
              onClick={() => setTab(tabItem.key)}
              className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                tab === tabItem.key ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === tabItem.key && (
                <motion.span
                  layoutId="service-tab-pill"
                  className="absolute inset-0 rounded-xl bg-[#E11D48]"
                  transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
                />
              )}
              <span className="relative">{t(tabItem.i18nKey, tabItem.label)}</span>
            </button>
          ))}
        </div>

        {tab === 'warranty' && (
          <div className="relative sm:hidden">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('admin.service.searchPlaceholder', 'بحث برقم الشاسيه أو اسم العميل...')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#E11D48]/60"
            />
          </div>
        )}

        {tab === 'tickets' ? <TicketsTab /> : <WarrantyTab search={search} />}
      </div>
    </div>
  );
}

// ─────────────────────────── Tab 1: Service Tickets ───────────────────────────

function TicketsTab() {
  const { t } = useLanguage();
  const { isOffline, setOffline } = useAdmin();
  const ticketStatusOptions = translateTicketStatusOptions(t);
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceTicket | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceTicket | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth('/api/service/index.php').then((r) => r.json()).catch(() => null);
      const ok = res?.success && Array.isArray(res.data);
      // Offline mode reflects genuine unreachability (res === null), not a reached-but-rejected response.
      setOffline(res === null);
      setTickets(ok ? res.data : MOCK_TICKETS);
    } finally {
      setIsLoading(false);
    }
  }, [setOffline]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      pending: tickets.filter((t) => t.status === 'pending').length,
      inProgress: tickets.filter((t) => t.status === 'in_progress').length,
      completed: tickets.filter((t) => t.status === 'completed').length,
    };
  }, [tickets]);

  const ticketBreakdown: DonutChartSlice[] = useMemo(
    () =>
      ticketStatusOptions
        .map((opt) => ({
          label: opt.label,
          value: tickets.filter((row) => row.status === opt.value).length,
          color: TICKET_STATUS_COLORS[opt.value],
        }))
        .filter((s) => s.value > 0),
    [tickets, ticketStatusOptions]
  );

  const openCreate = () => {
    setEditing(null);
    setSaveError(null);
    setModalOpen(true);
  };

  const openEdit = (ticket: ServiceTicket) => {
    setEditing(ticket);
    setSaveError(null);
    setModalOpen(true);
  };

  const handleQuickStatus = async (ticket: ServiceTicket, status: ServiceTicketStatus) => {
    const prev = tickets;
    setTickets((cur) => cur.map((t) => (t.id === ticket.id ? { ...t, status } : t)));
    try {
      const res = await fetchWithAuth('/api/service/index.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ticket.id, status }),
      }).then((r) => r.json()).catch(() => null);
      if (!res?.success) setTickets(prev);
    } catch {
      setTickets(prev);
    }
  };

  const handleSave = async (data: TicketFormData) => {
    setSaveError(null);

    if (isOffline) {
      if (editing) {
        setTickets((cur) => cur.map((t) => (t.id === editing.id ? { ...t, ...data } : t)));
      } else {
        const created: ServiceTicket = {
          id: `local-${Date.now()}`,
          ticket_no: `SRV-${Math.floor(1000 + Math.random() * 9000)}`,
          created_at: new Date().toISOString().slice(0, 10),
          ...data,
        };
        setTickets((cur) => [created, ...cur]);
      }
      setModalOpen(false);
      setEditing(null);
      return;
    }

    setIsSaving(true);
    try {
      const payload = editing ? { id: editing.id, ...data } : data;
      const res = await fetchWithAuth('/api/service/index.php', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then((r) => r.json()).catch(() => null);

      if (res?.success) {
        if (editing) {
          setTickets((cur) => cur.map((t) => (t.id === editing.id ? { ...t, ...data } : t)));
        } else {
          const created: ServiceTicket = {
            id: res.data?.id ?? `local-${Date.now()}`,
            ticket_no: res.data?.ticket_no ?? `SRV-${Math.floor(1000 + Math.random() * 9000)}`,
            created_at: new Date().toISOString().slice(0, 10),
            ...data,
          };
          setTickets((cur) => [created, ...cur]);
        }
        setModalOpen(false);
        setEditing(null);
      } else {
        setSaveError(res?.error || res?.message || t('admin.service.ticketSaveErrorFallback', 'تعذر حفظ التذكرة، يرجى المحاولة مرة أخرى'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    const prev = tickets;
    setTickets((cur) => cur.filter((t) => t.id !== id));
    try {
      const res = await fetchWithAuth(`/api/service/index.php?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
        .then((r) => r.json())
        .catch(() => null);
      if (!res?.success) {
        // keep optimistic delete for the demo/offline experience
      }
    } catch {
      void prev;
    }
  };

  const columns: DataTableColumn<ServiceTicket>[] = [
    { key: 'ticket_no', header: t('admin.service.colTicketNo', 'رقم التذكرة'), render: (row) => <span className="font-bold text-white whitespace-nowrap">{row.ticket_no}</span> },
    { key: 'customer_name', header: t('admin.service.colCustomer', 'العميل'), render: (row) => (
      <div>
        <p className="text-white font-bold">{row.customer_name}</p>
        <p className="text-[11px] text-slate-500 ltr-nums" dir="ltr">{row.customer_phone}</p>
      </div>
    ) },
    { key: 'scooter_model', header: t('admin.service.colModel', 'الموديل'), render: (row) => row.scooter_model, hideOnMobile: true },
    { key: 'service_type', header: t('admin.service.colServiceType', 'نوع الخدمة'), render: (row) => row.service_type, hideOnMobile: true },
    { key: 'showroom', header: t('admin.service.showroomLabel', 'المعرض'), render: (row) => row.showroom, hideOnMobile: true },
    {
      key: 'status',
      header: t('admin.service.statusLabel', 'الحالة'),
      render: (row) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={row.status} label={ticketStatusOptions.find((o) => o.value === row.status)?.label} />
          <select
            value={row.status}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => handleQuickStatus(row, e.target.value as ServiceTicketStatus)}
            className="hidden md:block text-[11px] rounded-lg bg-[#0F172A] border border-white/10 text-slate-300 px-1.5 py-1 focus:outline-none focus:border-[#E11D48]/60"
          >
            {ticketStatusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); openEdit(row); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#E11D48] hover:bg-[#E11D48]/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('admin.service.statTotalTickets', 'إجمالي التذاكر')} value={stats.total} icon={ClipboardList} accent="rose" isLoading={isLoading} />
        <StatCard title={t('admin.service.statusPending', 'قيد الانتظار')} value={stats.pending} icon={Clock} accent="amber" isLoading={isLoading} />
        <StatCard title={t('admin.service.statusInProgress', 'جاري العمل')} value={stats.inProgress} icon={Wrench} accent="sky" isLoading={isLoading} />
        <StatCard title={t('admin.service.statCompleted', 'مكتملة')} value={stats.completed} icon={CheckCircle2} accent="emerald" isLoading={isLoading} />
      </div>

      {!isLoading && ticketBreakdown.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5">
          <p className="text-xs font-black text-white mb-4">{t('admin.service.ticketBreakdownHeading', 'توزيع التذاكر حسب الحالة')}</p>
          <div className="max-w-xs mx-auto sm:mx-0">
            <DonutChart data={ticketBreakdown} centerLabel={t('admin.service.statTotalTickets', 'إجمالي التذاكر')} centerValue={stats.total} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-white">{t('admin.service.tabTickets', 'تذاكر الصيانة')}</h2>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E11D48] text-white text-xs font-bold hover:bg-[#E11D48]/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('admin.service.newTicketButton', 'تذكرة جديدة')}
        </button>
      </div>

      <DataTable columns={columns} data={tickets} keyExtractor={(row) => row.id} isLoading={isLoading} emptyMessage={t('admin.service.noTicketsEmpty', 'لا توجد تذاكر صيانة')} />

      <TicketModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
        isSaving={isSaving}
        editing={editing}
        saveError={saveError}
      />

      <ActionModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={t('admin.service.deleteTicketTitle', 'حذف تذكرة الصيانة')}
        subtitle={deleteTarget ? `${deleteTarget.ticket_no} — ${deleteTarget.customer_name}` : undefined}
        maxWidth="sm"
      >
        <p className="text-sm text-slate-300">{t('admin.service.deleteTicketConfirm', 'هل أنت متأكد من حذف هذه التذكرة؟ لا يمكن التراجع عن هذا الإجراء.')}</p>
        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={handleDelete}
            className="flex-1 py-2.5 rounded-xl bg-[#E11D48] text-white text-xs font-bold hover:bg-[#E11D48]/90 transition-colors"
          >
            {t('admin.service.deleteButton', 'حذف')}
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(null)}
            className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-bold hover:bg-white/10 transition-colors"
          >
            {t('admin.service.cancelButton', 'إلغاء')}
          </button>
        </div>
      </ActionModal>
    </div>
  );
}

function TicketModal({
  isOpen,
  onClose,
  onSave,
  isSaving,
  editing,
  saveError,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TicketFormData) => void;
  isSaving: boolean;
  editing: ServiceTicket | null;
  saveError: string | null;
}) {
  const { t } = useLanguage();
  const ticketStatusOptions = translateTicketStatusOptions(t);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketFormInput, unknown, TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      customer_name: '',
      customer_phone: '',
      scooter_model: '',
      chassis_no: '',
      service_type: '',
      showroom: '',
      status: 'pending',
      notes: '',
      delivery_time: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset(
        editing
          ? {
              customer_name: editing.customer_name,
              customer_phone: editing.customer_phone,
              scooter_model: editing.scooter_model,
              chassis_no: editing.chassis_no,
              service_type: editing.service_type,
              showroom: editing.showroom,
              status: editing.status,
              notes: editing.notes ?? '',
              mileage: editing.mileage,
              cost: editing.cost,
              delivery_time: editing.delivery_time ?? '',
            }
          : {
              customer_name: '',
              customer_phone: '',
              scooter_model: '',
              chassis_no: '',
              service_type: '',
              showroom: '',
              status: 'pending',
              notes: '',
              delivery_time: '',
            }
      );
    }
  }, [isOpen, editing, reset]);

  return (
    <ActionModal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? t('admin.service.editTicketTitle', 'تعديل تذكرة الصيانة') : t('admin.service.newTicketTitle', 'تذكرة صيانة جديدة')}
      subtitle={editing?.ticket_no}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit(onSave)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label={t('admin.service.customerNameLabel', 'اسم العميل')} required {...register('customer_name')} error={errors.customer_name?.message} />
          <TextField label={t('admin.service.customerPhoneLabel', 'رقم الهاتف')} required dir="ltr" {...register('customer_phone')} error={errors.customer_phone?.message} />
          <TextField label={t('admin.service.scooterModelLabel', 'موديل الدراجة')} required {...register('scooter_model')} error={errors.scooter_model?.message} />
          <TextField label={t('admin.service.chassisNoLabel', 'رقم الشاسيه')} required dir="ltr" {...register('chassis_no')} error={errors.chassis_no?.message} />
          <TextField label={t('admin.service.serviceTypeLabel', 'نوع الخدمة')} required {...register('service_type')} error={errors.service_type?.message} />
          <TextField label={t('admin.service.showroomLabel', 'المعرض')} required {...register('showroom')} error={errors.showroom?.message} />
          <SelectField label={t('admin.service.statusLabel', 'الحالة')} required options={ticketStatusOptions} {...register('status')} error={errors.status?.message} />
          <TextField label={t('admin.service.deliveryTimeLabel', 'تاريخ التسليم')} type="date" {...register('delivery_time')} error={errors.delivery_time?.message} />
          <TextField label={t('admin.service.mileageLabel', 'المسافة المقطوعة (كم)')} type="number" {...register('mileage')} error={errors.mileage?.message as string | undefined} />
          <TextField label={t('admin.service.costLabel', 'التكلفة (ج.م)')} type="number" {...register('cost')} error={errors.cost?.message as string | undefined} />
        </div>
        <TextareaField label={t('admin.service.notesLabel', 'ملاحظات')} {...register('notes')} error={errors.notes?.message} />

        {saveError && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#E11D48]/10 border border-[#E11D48]/30 text-[#E11D48] text-xs font-bold">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            {saveError}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 py-2.5 rounded-xl bg-[#E11D48] text-white text-xs font-bold hover:bg-[#E11D48]/90 transition-colors disabled:opacity-60"
          >
            {isSaving ? t('admin.service.savingButton', 'جارٍ الحفظ...') : editing ? t('admin.service.saveChangesButton', 'حفظ التعديلات') : t('admin.service.createTicketButton', 'إنشاء التذكرة')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-bold hover:bg-white/10 transition-colors"
          >
            {t('admin.service.cancelButton', 'إلغاء')}
          </button>
        </div>
      </form>
    </ActionModal>
  );
}

// ─────────────────────────── Tab 2: Warranty Registry ───────────────────────────

function WarrantyTab({ search }: { search: string }) {
  const { t } = useLanguage();
  const { isOffline, setOffline } = useAdmin();
  const warrantyStatusOptions = translateWarrantyStatusOptions(t);
  const [warranties, setWarranties] = useState<WarrantyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<WarrantyItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WarrantyItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth('/api/warranty/index.php').then((r) => r.json()).catch(() => null);
      const ok = res?.success && Array.isArray(res.data);
      // Offline mode reflects genuine unreachability (res === null), not a reached-but-rejected response.
      setOffline(res === null);
      setWarranties(ok ? res.data : MOCK_WARRANTIES);
    } finally {
      setIsLoading(false);
    }
  }, [setOffline]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const stats = useMemo(() => {
    return {
      total: warranties.length,
      active: warranties.filter((w) => w.status === 'فعّال').length,
      expiringSoon: warranties.filter((w) => w.status === 'قارب على الانتهاء').length,
      expired: warranties.filter((w) => w.status === 'منتهي').length,
    };
  }, [warranties]);

  const warrantyBreakdown: DonutChartSlice[] = useMemo(
    () =>
      WARRANTY_STATUS_OPTIONS.map((opt) => ({
        label: opt.label,
        value: warranties.filter((w) => w.status === opt.value).length,
        color: WARRANTY_STATUS_COLORS[opt.value],
      })).filter((s) => s.value > 0),
    [warranties]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return warranties;
    return warranties.filter(
      (w) => w.chassis_no.toLowerCase().includes(q) || w.customer_name.toLowerCase().includes(q)
    );
  }, [warranties, search]);

  const handleCreate = async (data: WarrantyCreateFormData) => {
    setFormError(null);
    const payload = { ...data, customer_email: data.customer_email || undefined };

    if (isOffline) {
      setWarranties((cur) => [{ id: `local-${Date.now()}`, ...payload }, ...cur]);
      setCreateOpen(false);
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetchWithAuth('/api/warranty/index.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then((r) => r.json()).catch(() => null);

      if (res?.success) {
        setWarranties((cur) => [{ id: res.data?.id ?? `local-${Date.now()}`, ...payload }, ...cur]);
        setCreateOpen(false);
      } else {
        setFormError(res?.error || res?.message || t('admin.service.warrantySaveErrorFallback', 'تعذر تسجيل الضمان، يرجى المحاولة مرة أخرى'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSave = async (data: WarrantyEditFormData) => {
    if (!editing) return;
    setFormError(null);

    if (isOffline) {
      setWarranties((cur) =>
        cur.map((w) => (w.id === editing.id ? { ...w, status: data.status, mileage_km: data.mileage_km, notes: data.notes } : w))
      );
      setEditing(null);
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetchWithAuth('/api/warranty/index.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing.id, status: data.status, mileage_km: data.mileage_km, notes: data.notes }),
      }).then((r) => r.json()).catch(() => null);

      if (res?.success) {
        setWarranties((cur) =>
          cur.map((w) => (w.id === editing.id ? { ...w, status: data.status, mileage_km: data.mileage_km, notes: data.notes } : w))
        );
        setEditing(null);
      } else {
        setFormError(res?.error || res?.message || t('admin.service.warrantySaveErrorFallback', 'تعذر تسجيل الضمان، يرجى المحاولة مرة أخرى'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    setWarranties((cur) => cur.filter((w) => w.id !== id));
    try {
      await fetchWithAuth(`/api/warranty/index.php?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
        .then((r) => r.json())
        .catch(() => null);
    } catch {
      // optimistic delete stands for the demo/offline experience
    }
  };

  const columns: DataTableColumn<WarrantyItem>[] = [
    { key: 'chassis_no', header: t('admin.service.chassisNoLabel', 'رقم الشاسيه'), render: (w) => <span className="font-bold text-white whitespace-nowrap ltr-nums" dir="ltr">{w.chassis_no}</span> },
    { key: 'customer_name', header: t('admin.service.colCustomer', 'العميل'), render: (w) => (
      <div>
        <p className="text-white font-bold">{w.customer_name}</p>
        <p className="text-[11px] text-slate-500 ltr-nums" dir="ltr">{w.customer_phone}</p>
      </div>
    ) },
    { key: 'scooter_model', header: t('admin.service.colModel', 'الموديل'), render: (w) => w.scooter_model, hideOnMobile: true },
    { key: 'warranty_expiry', header: t('admin.service.colWarrantyExpiry', 'انتهاء الضمان'), render: (w) => <span dir="ltr">{w.warranty_expiry}</span>, hideOnMobile: true },
    {
      key: 'status',
      header: t('admin.service.statusLabel', 'الحالة'),
      render: (w) => <StatusBadge status={w.status} label={warrantyStatusOptions.find((o) => o.value === w.status)?.label} />,
    },
    {
      key: 'actions',
      header: '',
      render: (w) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setFormError(null); setEditing(w); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(w); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#E11D48] hover:bg-[#E11D48]/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('admin.service.statTotalWarranties', 'إجمالي سجلات الضمان')} value={stats.total} icon={ShieldCheck} accent="rose" isLoading={isLoading} />
        <StatCard title={t('admin.service.statusActive', 'ساري')} value={stats.active} icon={ShieldCheck} accent="emerald" isLoading={isLoading} />
        <StatCard title={t('admin.service.statusExpiringSoon', 'قارب على الانتهاء')} value={stats.expiringSoon} icon={ShieldAlert} accent="amber" isLoading={isLoading} />
        <StatCard title={t('admin.service.statusExpired', 'منتهي')} value={stats.expired} icon={ShieldX} accent="slate" isLoading={isLoading} />
      </div>

      {!isLoading && warrantyBreakdown.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5">
          <p className="text-xs font-black text-white mb-4">{t('admin.service.warrantyBreakdownHeading', 'توزيع سجلات الضمان حسب الحالة')}</p>
          <div className="max-w-xs mx-auto sm:mx-0">
            <DonutChart data={warrantyBreakdown} centerLabel={t('admin.service.statTotalWarranties', 'إجمالي سجلات الضمان')} centerValue={stats.total} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-white">{t('admin.service.tabWarranty', 'سجلات الضمان')}</h2>
        <button
          type="button"
          onClick={() => { setFormError(null); setCreateOpen(true); }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E11D48] text-white text-xs font-bold hover:bg-[#E11D48]/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('admin.service.newWarrantyButton', 'تسجيل ضمان جديد')}
        </button>
      </div>

      <DataTable columns={columns} data={filtered} keyExtractor={(w) => w.id} isLoading={isLoading} emptyMessage={t('admin.service.noWarrantiesEmpty', 'لا توجد سجلات ضمان')} />

      <WarrantyCreateModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onSave={handleCreate} isSaving={isSaving} saveError={formError} />

      <WarrantyEditModal
        item={editing}
        onClose={() => setEditing(null)}
        onSave={handleEditSave}
        isSaving={isSaving}
        saveError={formError}
      />

      <ActionModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={t('admin.service.deleteWarrantyTitle', 'حذف سجل الضمان')}
        subtitle={deleteTarget ? `${deleteTarget.chassis_no} — ${deleteTarget.customer_name}` : undefined}
        maxWidth="sm"
      >
        <p className="text-sm text-slate-300">{t('admin.service.deleteWarrantyConfirm', 'هل أنت متأكد من حذف سجل الضمان هذا؟ لا يمكن التراجع عن هذا الإجراء.')}</p>
        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={handleDelete}
            className="flex-1 py-2.5 rounded-xl bg-[#E11D48] text-white text-xs font-bold hover:bg-[#E11D48]/90 transition-colors"
          >
            {t('admin.service.deleteButton', 'حذف')}
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(null)}
            className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-bold hover:bg-white/10 transition-colors"
          >
            {t('admin.service.cancelButton', 'إلغاء')}
          </button>
        </div>
      </ActionModal>
    </div>
  );
}

function WarrantyCreateModal({
  isOpen,
  onClose,
  onSave,
  isSaving,
  saveError,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: WarrantyCreateFormData) => void;
  isSaving: boolean;
  saveError: string | null;
}) {
  const { t } = useLanguage();
  const warrantyStatusOptions = translateWarrantyStatusOptions(t);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WarrantyCreateFormInput, unknown, WarrantyCreateFormData>({
    resolver: zodResolver(warrantyCreateSchema),
    defaultValues: {
      chassis_no: '',
      engine_no: '',
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      scooter_model: '',
      scooter_color: '',
      purchase_date: '',
      warranty_expiry: '',
      warranty_years: 1,
      showroom: '',
      status: 'فعّال',
      notes: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        chassis_no: '',
        engine_no: '',
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        scooter_model: '',
        scooter_color: '',
        purchase_date: '',
        warranty_expiry: '',
        warranty_years: 1,
        showroom: '',
        status: 'فعّال',
        notes: '',
      });
    }
  }, [isOpen, reset]);

  return (
    <ActionModal isOpen={isOpen} onClose={onClose} title={t('admin.service.newWarrantyButton', 'تسجيل ضمان جديد')} maxWidth="2xl">
      <form onSubmit={handleSubmit(onSave)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label={t('admin.service.chassisNoLabel', 'رقم الشاسيه')} required dir="ltr" {...register('chassis_no')} error={errors.chassis_no?.message} />
          <TextField label={t('admin.service.engineNoLabel', 'رقم المحرك')} dir="ltr" {...register('engine_no')} error={errors.engine_no?.message} />
          <TextField label={t('admin.service.customerNameLabel', 'اسم العميل')} required {...register('customer_name')} error={errors.customer_name?.message} />
          <TextField label={t('admin.service.customerPhoneLabel', 'رقم الهاتف')} required dir="ltr" {...register('customer_phone')} error={errors.customer_phone?.message} />
          <TextField label={t('admin.service.emailLabel', 'البريد الإلكتروني')} type="email" dir="ltr" {...register('customer_email')} error={errors.customer_email?.message} />
          <TextField label={t('admin.service.scooterModelLabel', 'موديل الدراجة')} required {...register('scooter_model')} error={errors.scooter_model?.message} />
          <TextField label={t('admin.service.scooterColorLabel', 'لون الدراجة')} {...register('scooter_color')} error={errors.scooter_color?.message} />
          <TextField label={t('admin.service.showroomLabel', 'المعرض')} required {...register('showroom')} error={errors.showroom?.message} />
          <TextField label={t('admin.service.purchaseDateLabel', 'تاريخ الشراء')} type="date" required {...register('purchase_date')} error={errors.purchase_date?.message} />
          <TextField label={t('admin.service.warrantyExpiryLabel', 'تاريخ انتهاء الضمان')} type="date" required {...register('warranty_expiry')} error={errors.warranty_expiry?.message} />
          <TextField label={t('admin.service.warrantyYearsLabel', 'مدة الضمان (سنوات)')} type="number" required {...register('warranty_years')} error={errors.warranty_years?.message} />
          <SelectField label={t('admin.service.statusLabel', 'الحالة')} required options={warrantyStatusOptions} {...register('status')} error={errors.status?.message} />
          <TextField label={t('admin.service.mileageLabel', 'المسافة المقطوعة (كم)')} type="number" {...register('mileage_km')} error={errors.mileage_km?.message as string | undefined} />
        </div>
        <TextareaField label={t('admin.service.notesLabel', 'ملاحظات')} {...register('notes')} error={errors.notes?.message} />

        {saveError && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#E11D48]/10 border border-[#E11D48]/30 text-[#E11D48] text-xs font-bold">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            {saveError}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 py-2.5 rounded-xl bg-[#E11D48] text-white text-xs font-bold hover:bg-[#E11D48]/90 transition-colors disabled:opacity-60"
          >
            {isSaving ? t('admin.service.savingButton', 'جارٍ الحفظ...') : t('admin.service.registerWarrantyButton', 'تسجيل الضمان')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-bold hover:bg-white/10 transition-colors"
          >
            {t('admin.service.cancelButton', 'إلغاء')}
          </button>
        </div>
      </form>
    </ActionModal>
  );
}

function ReadOnlyField({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-[11px] font-extrabold text-slate-500 mb-1">{label}</p>
      <p className="text-sm text-slate-200 font-bold">{value || value === 0 ? value : '—'}</p>
    </div>
  );
}

function WarrantyEditModal({
  item,
  onClose,
  onSave,
  isSaving,
  saveError,
}: {
  item: WarrantyItem | null;
  onClose: () => void;
  onSave: (data: WarrantyEditFormData) => void;
  isSaving: boolean;
  saveError: string | null;
}) {
  const { t } = useLanguage();
  const warrantyStatusOptions = translateWarrantyStatusOptions(t);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WarrantyEditFormInput, unknown, WarrantyEditFormData>({
    resolver: zodResolver(warrantyEditSchema),
    defaultValues: { status: 'فعّال', notes: '' },
  });

  useEffect(() => {
    if (item) {
      reset({ status: item.status, mileage_km: item.mileage_km, notes: item.notes ?? '' });
    }
  }, [item, reset]);

  return (
    <ActionModal
      isOpen={!!item}
      onClose={onClose}
      title={t('admin.service.editWarrantyTitle', 'تعديل سجل الضمان')}
      subtitle={item ? `${item.chassis_no} — ${t('admin.service.warrantyEditHint', 'يمكن تعديل الحالة والمسافة والملاحظات فقط')}` : undefined}
      maxWidth="2xl"
    >
      {item && (
        <div className="space-y-5">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ReadOnlyField label={t('admin.service.chassisNoLabel', 'رقم الشاسيه')} value={item.chassis_no} />
            <ReadOnlyField label={t('admin.service.engineNoLabel', 'رقم المحرك')} value={item.engine_no} />
            <ReadOnlyField label={t('admin.service.customerNameLabel', 'اسم العميل')} value={item.customer_name} />
            <ReadOnlyField label={t('admin.service.customerPhoneLabel', 'رقم الهاتف')} value={item.customer_phone} />
            <ReadOnlyField label={t('admin.service.emailLabel', 'البريد الإلكتروني')} value={item.customer_email} />
            <ReadOnlyField label={t('admin.service.scooterModelLabel', 'موديل الدراجة')} value={item.scooter_model} />
            <ReadOnlyField label={t('admin.service.scooterColorLabel', 'لون الدراجة')} value={item.scooter_color} />
            <ReadOnlyField label={t('admin.service.showroomLabel', 'المعرض')} value={item.showroom} />
            <ReadOnlyField label={t('admin.service.purchaseDateLabel', 'تاريخ الشراء')} value={item.purchase_date} />
            <ReadOnlyField label={t('admin.service.warrantyExpiryLabel', 'تاريخ انتهاء الضمان')} value={item.warranty_expiry} />
            <ReadOnlyField label={t('admin.service.warrantyYearsLabel', 'مدة الضمان (سنوات)')} value={item.warranty_years} />
            <ReadOnlyField label={t('admin.service.lastServiceDateLabel', 'آخر صيانة')} value={item.last_service_date} />
            <ReadOnlyField label={t('admin.service.nextServiceDateLabel', 'الصيانة القادمة')} value={item.next_service_date} />
            <ReadOnlyField label={t('admin.service.serviceCountLabel', 'عدد مرات الصيانة')} value={item.service_count} />
          </div>

          <form onSubmit={handleSubmit(onSave)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField label={t('admin.service.statusLabel', 'الحالة')} required options={warrantyStatusOptions} {...register('status')} error={errors.status?.message} />
              <TextField label={t('admin.service.mileageLabel', 'المسافة المقطوعة (كم)')} type="number" {...register('mileage_km')} error={errors.mileage_km?.message as string | undefined} />
            </div>
            <TextareaField label={t('admin.service.notesLabel', 'ملاحظات')} {...register('notes')} error={errors.notes?.message} />

            {saveError && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#E11D48]/10 border border-[#E11D48]/30 text-[#E11D48] text-xs font-bold">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                {saveError}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-2.5 rounded-xl bg-[#E11D48] text-white text-xs font-bold hover:bg-[#E11D48]/90 transition-colors disabled:opacity-60"
              >
                {isSaving ? t('admin.service.savingButton', 'جارٍ الحفظ...') : t('admin.service.saveChangesButton', 'حفظ التعديلات')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-bold hover:bg-white/10 transition-colors"
              >
                {t('admin.service.cancelButton', 'إلغاء')}
              </button>
            </div>
          </form>
        </div>
      )}
    </ActionModal>
  );
}
