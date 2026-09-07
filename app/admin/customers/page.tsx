'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Users,
  Wallet,
  Gem,
  UserPlus,
  Pencil,
  Trash2,
  Bike,
  MessageSquare,
  Mail,
  MailOpen,
  MailCheck,
  MessageCircle,
  AlertTriangle,
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import { isOverdue } from '@/lib/utils';
import { useAdmin } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import { AdminHeader } from '@/components/admin/layout/AdminHeader';
import { StatCard } from '@/components/admin/ui/StatCard';
import { DataTable, type DataTableColumn } from '@/components/admin/ui/DataTable';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { ActionModal } from '@/components/admin/ui/ActionModal';
import { TextField, SelectField } from '@/components/admin/ui/FormControls';
import { DonutChart, type DonutChartSlice } from '@/components/admin/ui/DonutChart';
import type { Customer, CustomerTier, TestRide, ContactMessage } from '@/types/admin';

// ─────────────────────────── Shared tab switcher ───────────────────────────

type TabKey = 'customers' | 'testrides' | 'contact';

const TABS: { key: TabKey; i18nKey: string; label: string }[] = [
  { key: 'customers', i18nKey: 'admin.customers.tabCustomers', label: 'العملاء' },
  { key: 'testrides', i18nKey: 'admin.customers.tabTestRides', label: 'تجارب القيادة' },
  { key: 'contact', i18nKey: 'admin.customers.tabContact', label: 'رسائل التواصل' },
];

// ─────────────────────────────── Mock data ─────────────────────────────────

const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c-1', name: 'أحمد محمود عبد الرحمن', phone: '01012345678', email: 'ahmed.mahmoud@example.com', city: 'القاهرة', scooter: 'SYM Jet 14 EVO 200', total_spent: 185000, orders_count: 3, tier: 'عميل ماسي' },
  { id: 'c-2', name: 'مريم سامي فتحي', phone: '01123456789', email: 'mariam.samy@example.com', city: 'الجيزة', scooter: 'SYM Symphony ST 200', total_spent: 78900, orders_count: 1, tier: 'عميل ذهبي' },
  { id: 'c-3', name: 'كريم عادل حسين', phone: '01234567890', email: 'kareem.adel@example.com', city: 'الإسكندرية', scooter: 'SYM Cruisym 400', total_spent: 315000, orders_count: 2, tier: 'عميل ماسي' },
  { id: 'c-4', name: 'عمر حسن إبراهيم', phone: '01098765432', email: 'omar.hassan@example.com', city: 'المنصورة', scooter: 'SYM Husky ADV 150', total_spent: 45000, orders_count: 1, tier: 'عميل فضي' },
  { id: 'c-5', name: 'ياسمين فؤاد السيد', phone: '01187654321', email: 'yasmin.fouad@example.com', city: 'طنطا', scooter: 'SYM Fiddle III 125', total_spent: 12000, orders_count: 1, tier: 'عميل جديد' },
];

const MOCK_TEST_RIDES: TestRide[] = [
  { id: 't-1', name: 'محمد عبد الله سعيد', phone: '01011122233', email: 'mohamed.saeed@example.com', scooter_model: 'SYM Jet 14 EVO 200', showroom: 'فرع مدينة نصر', preferred_date: '2026-08-26', status: 'معلق', created_at: '2026-08-23 10:15' },
  { id: 't-2', name: 'سارة إبراهيم منصور', phone: '01144455566', scooter_model: 'SYM Cruisym 400', showroom: 'فرع الشيخ زايد', preferred_date: '2026-08-27', status: 'مؤكد', created_at: '2026-08-22 16:40' },
  { id: 't-3', name: 'أحمد ناصر جمال', phone: '01277788899', email: 'ahmed.nasser@example.com', scooter_model: 'SYM Husky ADV 150', showroom: 'فرع الإسكندرية', preferred_date: '2026-08-20', status: 'مكتمل', created_at: '2026-08-18 09:05' },
  { id: 't-4', name: 'نور الدين خالد', phone: '01555566677', scooter_model: 'SYM Symphony ST 200', showroom: 'فرع طنطا', preferred_date: '2026-08-19', status: 'ملغي', created_at: '2026-08-17 12:30' },
];

const MOCK_CONTACT_MESSAGES: ContactMessage[] = [
  { id: 'm-1', name: 'هبة الله يوسف', phone: '01099988877', email: 'heba.youssef@example.com', subject: 'استفسار عن الأسعار', message: 'عايزة أعرف سعر SYM Jet 14 EVO 200 موديل 2026 وهل فيه نظام تقسيط متاح على فترات طويلة؟', status: 'unread', created_at: '2026-08-24 08:20' },
  { id: 'm-2', name: 'محمود السيد طه', phone: '01166677788', subject: 'شكوى بخصوص التوصيل', message: 'الطلب اتأخر عن الميعاد المحدد بثلاثة أيام وحابب أعرف السبب ومتى هيوصل بالظبط.', status: 'read', created_at: '2026-08-23 14:05' },
  { id: 'm-3', name: 'داليا رمزي', phone: '01233344455', email: 'dalia.ramzy@example.com', subject: 'طلب صيانة دورية', message: 'محتاجة أحجز ميعاد صيانة دورية للسكوتر بتاعي SYM Husky ADV 150 في أقرب فرع من مدينتي.', status: 'replied', created_at: '2026-08-21 11:50' },
  { id: 'm-4', name: 'يوسف عماد فرغلي', phone: '01522233344', subject: 'استفسار عن الضمان', message: 'هل الضمان بيغطي أعطال الموتور بعد سنة من الشراء ولا محدود بمدة أقل من كده؟', status: 'unread', created_at: '2026-08-20 17:10' },
];

// ───────────────────────────────── Page ─────────────────────────────────────

export default function AdminCustomersPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabKey>('customers');

  return (
    <div>
      <AdminHeader
        title={t('admin.customers.pageTitle', 'العملاء وطلبات التواصل')}
        subtitle={t('admin.customers.pageSubtitle', 'إدارة العملاء، تجارب القيادة، ورسائل التواصل')}
      />

      <div className="p-4 md:p-6 space-y-6">
        <div className="inline-flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors ${
                activeTab === tab.key
                  ? 'bg-[#E11D48] text-white shadow-lg shadow-[#E11D48]/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {t(tab.i18nKey, tab.label)}
            </button>
          ))}
        </div>

        {activeTab === 'customers' && <CustomersTab />}
        {activeTab === 'testrides' && <TestRidesTab />}
        {activeTab === 'contact' && <ContactTab />}
      </div>
    </div>
  );
}

// ────────────────────────────── Tab 1: Customers ─────────────────────────────

const TIER_OPTIONS: { value: CustomerTier; label: string }[] = [
  { value: 'عميل ماسي', label: 'عميل ماسي' },
  { value: 'عميل ذهبي', label: 'عميل ذهبي' },
  { value: 'عميل فضي', label: 'عميل فضي' },
  { value: 'عميل جديد', label: 'عميل جديد' },
];

const TIER_COLORS: Record<CustomerTier, string> = {
  'عميل ماسي': '#38BDF8',
  'عميل ذهبي': '#F59E0B',
  'عميل فضي': '#94A3B8',
  'عميل جديد': '#A78BFA',
};

const customerSchema = z.object({
  name: z.string().trim().min(2, 'الاسم مطلوب'),
  phone: z.string().trim().min(8, 'رقم الهاتف مطلوب'),
  email: z.string().trim().email('بريد إلكتروني غير صالح').optional().or(z.literal('')),
  city: z.string().trim().min(2, 'المدينة مطلوبة'),
  scooter: z.string().trim().optional().or(z.literal('')),
  total_spent: z.number({ message: 'يجب إدخال رقم' }).min(0, 'يجب أن يكون رقمًا موجبًا'),
  tier: z.enum(['عميل ماسي', 'عميل ذهبي', 'عميل فضي', 'عميل جديد']),
});

type CustomerFormData = z.infer<typeof customerSchema>;

function tierTone(tier: CustomerTier): 'emerald' | 'rose' | 'amber' | 'slate' | 'sky' {
  switch (tier) {
    case 'عميل ماسي':
      return 'sky';
    case 'عميل ذهبي':
      return 'amber';
    case 'عميل فضي':
      return 'slate';
    default:
      return 'emerald';
  }
}

function CustomersTab() {
  const { t } = useLanguage();
  const { setOffline } = useAdmin();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: '', phone: '', email: '', city: '', scooter: '', total_spent: 0, tier: 'عميل جديد' },
  });

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth('/api/customers/index.php').then((r) => r.json()).catch(() => null);
      const ok = res?.success && Array.isArray(res.data);
      // Offline mode reflects genuine unreachability (res === null), not a reached-but-rejected response.
      setOffline(res === null);
      setCustomers(ok ? res.data : MOCK_CUSTOMERS);
    } finally {
      setIsLoading(false);
    }
  }, [setOffline]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const openAddModal = () => {
    setEditing(null);
    reset({ name: '', phone: '', email: '', city: '', scooter: '', total_spent: 0, tier: 'عميل جديد' });
    setModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditing(customer);
    reset({
      name: customer.name,
      phone: customer.phone,
      email: customer.email ?? '',
      city: customer.city,
      scooter: customer.scooter ?? '',
      total_spent: customer.total_spent,
      tier: customer.tier,
    });
    setModalOpen(true);
  };

  const onSubmit = async (values: CustomerFormData) => {
    setIsSaving(true);
    try {
      const payload = { ...values, ...(editing ? { id: editing.id } : {}) };
      const res = await fetchWithAuth('/api/customers/index.php', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((r) => r.json())
        .catch(() => null);

      if (res?.success) {
        await load();
        setModalOpen(false);
      } else if (editing) {
        setCustomers((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...values } : c)));
        setModalOpen(false);
      } else {
        setCustomers((prev) => [{ id: `local-${Date.now()}`, ...values, orders_count: 0 }, ...prev]);
        setModalOpen(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (customer: Customer) => {
    if (!window.confirm(t('admin.customers.deleteCustomerConfirm', 'هل تريد حذف العميل "{name}"؟').replace('{name}', customer.name))) return;
    const res = await fetchWithAuth(`/api/customers/index.php?id=${encodeURIComponent(customer.id)}`, { method: 'DELETE' })
      .then((r) => r.json())
      .catch(() => null);
    if (res?.success) {
      await load();
    } else {
      setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
    }
  };

  const totalSpend = customers.reduce((sum, c) => sum + (Number(c.total_spent) || 0), 0);
  const premiumCount = customers.filter((c) => c.tier === 'عميل ماسي' || c.tier === 'عميل ذهبي').length;
  const newCount = customers.filter((c) => c.tier === 'عميل جديد').length;
  const tierBreakdown: DonutChartSlice[] = TIER_OPTIONS.map((opt) => ({
    label: opt.label,
    value: customers.filter((c) => c.tier === opt.value).length,
    color: TIER_COLORS[opt.value],
  })).filter((s) => s.value > 0);

  const columns: DataTableColumn<Customer>[] = [
    { key: 'name', header: t('admin.customers.nameColumn', 'الاسم'), render: (c) => <span className="font-bold text-white">{c.name}</span> },
    { key: 'phone', header: t('admin.customers.phoneColumn', 'الهاتف'), render: (c) => c.phone },
    { key: 'city', header: t('admin.customers.cityColumn', 'المدينة'), render: (c) => c.city, hideOnMobile: true },
    { key: 'scooter', header: t('admin.customers.modelColumn', 'الموديل'), render: (c) => c.scooter || '—', hideOnMobile: true },
    { key: 'total_spent', header: t('admin.customers.totalSpentColumn', 'إجمالي الإنفاق'), render: (c) => `${c.total_spent.toLocaleString('en-US')} ج.م` },
    { key: 'tier', header: t('admin.customers.tierColumn', 'الفئة'), render: (c) => <StatusBadge status={c.tier} tone={tierTone(c.tier)} /> },
    {
      key: 'actions',
      header: '',
      render: (c) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(c);
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(c);
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#E11D48] hover:bg-[#E11D48]/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-black text-white">{t('admin.customers.listHeading', 'قائمة العملاء')}</h2>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E11D48] hover:bg-[#E11D48]/90 text-white text-xs font-extrabold transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          {t('admin.customers.addCustomerButton', 'إضافة عميل')}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('admin.customers.totalCustomersStat', 'إجمالي العملاء')} value={customers.length} icon={Users} accent="rose" isLoading={isLoading} />
        <StatCard title={t('admin.customers.totalSpendStat', 'إجمالي الإنفاق')} value={`${totalSpend.toLocaleString('en-US')} ج.م`} icon={Wallet} accent="emerald" isLoading={isLoading} />
        <StatCard title={t('admin.customers.premiumCustomersStat', 'عملاء ماسي وذهبي')} value={premiumCount} icon={Gem} accent="amber" isLoading={isLoading} />
        <StatCard title={t('admin.customers.newCustomersStat', 'عملاء جدد')} value={newCount} icon={UserPlus} accent="violet" isLoading={isLoading} />
      </div>

      {!isLoading && tierBreakdown.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5">
          <p className="text-xs font-black text-white mb-4">{t('admin.customers.tierBreakdownHeading', 'توزيع العملاء حسب الفئة')}</p>
          <div className="max-w-xs mx-auto sm:mx-0">
            <DonutChart data={tierBreakdown} centerLabel={t('admin.customers.totalCustomersLabel', 'إجمالي العملاء')} centerValue={customers.length} />
          </div>
        </div>
      )}

      <DataTable columns={columns} data={customers} keyExtractor={(c) => c.id} isLoading={isLoading} emptyMessage={t('admin.customers.emptyCustomers', 'لا يوجد عملاء لعرضهم')} />

      <ActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? t('admin.customers.editCustomerTitle', 'تعديل بيانات العميل') : t('admin.customers.addCustomerTitle', 'إضافة عميل جديد')}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <TextField label={t('admin.customers.nameField', 'الاسم')} required error={errors.name?.message} {...register('name')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label={t('admin.customers.phoneField', 'رقم الهاتف')} required error={errors.phone?.message} {...register('phone')} />
            <TextField label={t('admin.customers.emailField', 'البريد الإلكتروني')} type="email" error={errors.email?.message} {...register('email')} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label={t('admin.customers.cityField', 'المدينة')} required error={errors.city?.message} {...register('city')} />
            <TextField label={t('admin.customers.scooterModelField', 'موديل السكوتر')} error={errors.scooter?.message} {...register('scooter')} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label={t('admin.customers.totalSpentField', 'إجمالي الإنفاق (ج.م)')}
              type="number"
              step="0.01"
              required
              error={errors.total_spent?.message}
              {...register('total_spent', { valueAsNumber: true })}
            />
            <SelectField label={t('admin.customers.tierField', 'فئة العميل')} options={TIER_OPTIONS} required error={errors.tier?.message} {...register('tier')} />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 text-xs font-extrabold hover:bg-white/5 transition-colors"
            >
              {t('admin.customers.cancelButton', 'إلغاء')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#E11D48]/90 disabled:opacity-60 text-white text-xs font-extrabold transition-colors"
            >
              {isSaving
                ? t('admin.customers.savingButton', 'جاري الحفظ...')
                : editing
                  ? t('admin.customers.saveChangesButton', 'حفظ التعديلات')
                  : t('admin.customers.addCustomerSubmitButton', 'إضافة العميل')}
            </button>
          </div>
        </form>
      </ActionModal>
    </div>
  );
}

// ───────────────────────────── Tab 2: Test Rides ─────────────────────────────

const RIDE_STATUS_KEYS: { value: TestRide['status']; i18nKey: string; label: string }[] = [
  { value: 'معلق', i18nKey: 'admin.customers.rideStatusPending', label: 'قيد الانتظار' },
  { value: 'مؤكد', i18nKey: 'admin.customers.rideStatusConfirmed', label: 'مؤكد' },
  { value: 'مكتمل', i18nKey: 'admin.customers.rideStatusCompleted', label: 'مكتمل' },
  { value: 'ملغي', i18nKey: 'admin.customers.rideStatusCancelled', label: 'ملغي' },
];

function TestRidesTab() {
  const { t } = useLanguage();
  const { setOffline } = useAdmin();
  const [rides, setRides] = useState<TestRide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const RIDE_STATUS_OPTIONS = RIDE_STATUS_KEYS.map((opt) => ({ value: opt.value, label: t(opt.i18nKey, opt.label) }));
  const RIDE_STATUS_LABELS = RIDE_STATUS_OPTIONS.reduce(
    (acc, opt) => ({ ...acc, [opt.value]: opt.label }),
    {} as Record<TestRide['status'], string>
  );

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth('/api/test-ride/index.php').then((r) => r.json()).catch(() => null);
      const ok = res?.success && Array.isArray(res.data);
      const ridesData: TestRide[] = ok ? res.data : Array.isArray(res) ? res : null;
      const finalOk = ok || Array.isArray(res);
      // Offline mode reflects genuine unreachability (res === null), not a reached-but-rejected response.
      setOffline(res === null);
      setRides(finalOk && ridesData ? ridesData : MOCK_TEST_RIDES);
    } finally {
      setIsLoading(false);
    }
  }, [setOffline]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const handleStatusChange = async (ride: TestRide, status: TestRide['status']) => {
    setRides((prev) => prev.map((r) => (r.id === ride.id ? { ...r, status } : r)));
    const res = await fetchWithAuth('/api/test-ride/index.php', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: ride.id, status }),
    })
      .then((r) => r.json())
      .catch(() => null);
    if (!res?.success) {
      // keep optimistic update — backend may be mocked/offline
    }
  };

  const handleDelete = async (ride: TestRide) => {
    if (!window.confirm(t('admin.customers.deleteRideConfirm', 'هل تريد حذف طلب تجربة القيادة الخاص بـ "{name}"؟').replace('{name}', ride.name))) return;
    const res = await fetchWithAuth(`/api/test-ride/index.php?id=${encodeURIComponent(ride.id)}`, { method: 'DELETE' })
      .then((r) => r.json())
      .catch(() => null);
    if (res?.success) {
      await load();
    } else {
      setRides((prev) => prev.filter((r) => r.id !== ride.id));
    }
  };

  const pendingCount = rides.filter((r) => r.status === 'معلق').length;
  const confirmedCount = rides.filter((r) => r.status === 'مؤكد').length;
  const completedCount = rides.filter((r) => r.status === 'مكتمل').length;

  const columns: DataTableColumn<TestRide>[] = [
    { key: 'name', header: t('admin.customers.nameColumn', 'الاسم'), render: (r) => <span className="font-bold text-white">{r.name}</span> },
    { key: 'phone', header: t('admin.customers.phoneColumn', 'الهاتف'), render: (r) => r.phone },
    { key: 'scooter_model', header: t('admin.customers.modelColumn', 'الموديل'), render: (r) => r.scooter_model, hideOnMobile: true },
    { key: 'showroom', header: t('admin.customers.showroomColumn', 'المعرض'), render: (r) => r.showroom, hideOnMobile: true },
    { key: 'preferred_date', header: t('admin.customers.preferredDateColumn', 'التاريخ المفضل'), render: (r) => r.preferred_date },
    {
      key: 'status',
      header: t('admin.customers.statusColumn', 'الحالة'),
      render: (r) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={r.status} label={RIDE_STATUS_LABELS[r.status]} />
          <select
            value={r.status}
            onChange={(e) => handleStatusChange(r, e.target.value as TestRide['status'])}
            onClick={(e) => e.stopPropagation()}
            className="px-2 py-1 rounded-lg bg-[#0F172A] border border-white/10 text-[11px] text-slate-300 focus:outline-none focus:border-[#E11D48]/60"
          >
            {RIDE_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(r);
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#E11D48] hover:bg-[#E11D48]/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-sm font-black text-white">{t('admin.customers.testRidesHeading', 'طلبات تجربة القيادة')}</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('admin.customers.totalRidesStat', 'إجمالي الطلبات')} value={rides.length} icon={Bike} accent="rose" isLoading={isLoading} />
        <StatCard title={t('admin.customers.pendingRidesStat', 'قيد الانتظار')} value={pendingCount} icon={Bike} accent="amber" isLoading={isLoading} />
        <StatCard title={t('admin.customers.confirmedRidesStat', 'مؤكدة')} value={confirmedCount} icon={Bike} accent="sky" isLoading={isLoading} />
        <StatCard title={t('admin.customers.completedRidesStat', 'مكتملة')} value={completedCount} icon={Bike} accent="emerald" isLoading={isLoading} />
      </div>

      <DataTable columns={columns} data={rides} keyExtractor={(r) => r.id} isLoading={isLoading} emptyMessage={t('admin.customers.emptyRides', 'لا توجد طلبات تجربة قيادة')} />
    </div>
  );
}

// ───────────────────────────── Tab 3: Contact Messages ───────────────────────

const MESSAGE_STATUS_KEYS: { value: ContactMessage['status']; i18nKey: string; label: string }[] = [
  { value: 'unread', i18nKey: 'admin.customers.messageStatusNew', label: 'جديدة' },
  { value: 'read', i18nKey: 'admin.customers.messageStatusRead', label: 'مقروءة' },
  { value: 'replied', i18nKey: 'admin.customers.messageStatusReplied', label: 'تم الرد' },
];

function truncate(text: string, max = 50): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/** Deep-links to a wa.me chat with this specific customer (not the business's own WhatsApp) — no WhatsApp Business API/credentials needed, just opens the chat for whoever clicks it to reply from. */
function buildCustomerWhatsAppUrl(message: ContactMessage): string {
  const rawNum = message.phone.replace(/[^0-9]/g, '');
  const targetPhone = rawNum.startsWith('0') ? `20${rawNum.substring(1)}` : rawNum;
  const greeting = `مرحباً ${message.name}، بخصوص استفسارك عن "${message.subject}":\n\n${message.message}\n\n`;
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(greeting)}`;
}

/** A message still sitting un-replied more than a day after arriving — surfaced so stalled inquiries don't hide inside a status label. */
function isMessageOverdue(message: ContactMessage): boolean {
  return message.status !== 'replied' && isOverdue(message.created_at);
}

function ContactTab() {
  const { t } = useLanguage();
  const { setOffline } = useAdmin();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const MESSAGE_STATUS_LABELS = MESSAGE_STATUS_KEYS.reduce(
    (acc, opt) => ({ ...acc, [opt.value]: t(opt.i18nKey, opt.label) }),
    {} as Record<ContactMessage['status'], string>
  );

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth('/api/contact/index.php').then((r) => r.json()).catch(() => null);
      const ok = res?.success && Array.isArray(res.data);
      const messagesData: ContactMessage[] = ok ? res.data : Array.isArray(res) ? res : null;
      const finalOk = ok || Array.isArray(res);
      // Offline mode reflects genuine unreachability (res === null), not a reached-but-rejected response.
      setOffline(res === null);
      setMessages(finalOk && messagesData ? messagesData : MOCK_CONTACT_MESSAGES);
    } finally {
      setIsLoading(false);
    }
  }, [setOffline]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const updateStatus = async (message: ContactMessage, status: ContactMessage['status']) => {
    setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, status } : m)));
    setSelected((prev) => (prev && prev.id === message.id ? { ...prev, status } : prev));
    const res = await fetchWithAuth('/api/contact/index.php', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: message.id, status }),
    })
      .then((r) => r.json())
      .catch(() => null);
    if (!res?.success) {
      // keep optimistic update — backend may be mocked/offline
    }
  };

  const handleDelete = async (message: ContactMessage) => {
    if (!window.confirm(t('admin.customers.deleteMessageConfirm', 'هل تريد حذف الرسالة من "{name}"؟').replace('{name}', message.name))) return;
    const res = await fetchWithAuth(`/api/contact/index.php?id=${encodeURIComponent(message.id)}`, { method: 'DELETE' })
      .then((r) => r.json())
      .catch(() => null);
    if (res?.success) {
      setSelected(null);
      await load();
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== message.id));
      setSelected(null);
    }
  };

  const newCount = messages.filter((m) => m.status === 'unread').length;
  const readCount = messages.filter((m) => m.status === 'read').length;
  const repliedCount = messages.filter((m) => m.status === 'replied').length;
  const overdueCount = messages.filter(isMessageOverdue).length;

  const columns: DataTableColumn<ContactMessage>[] = [
    { key: 'name', header: t('admin.customers.nameColumn', 'الاسم'), render: (m) => <span className="font-bold text-white">{m.name}</span> },
    { key: 'subject', header: t('admin.customers.subjectColumn', 'الموضوع'), render: (m) => m.subject },
    { key: 'message', header: t('admin.customers.messageColumn', 'الرسالة'), render: (m) => <span className="text-slate-400">{truncate(m.message)}</span>, hideOnMobile: true },
    {
      key: 'status',
      header: t('admin.customers.statusColumn', 'الحالة'),
      render: (m) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <StatusBadge status={m.status} label={MESSAGE_STATUS_LABELS[m.status]} />
          {isMessageOverdue(m) && (
            <span
              title={t('admin.customers.overdueMessageHint', 'مرّ أكثر من 24 ساعة بدون رد')}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold"
            >
              <AlertTriangle className="w-3 h-3" />
              {t('admin.customers.overdueMessageBadge', 'متأخرة')}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (m) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              window.open(buildCustomerWhatsAppUrl(m), '_blank');
            }}
            title={t('admin.customers.replyOnWhatsAppButton', 'الرد عبر واتساب')}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(m);
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#E11D48] hover:bg-[#E11D48]/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-sm font-black text-white">{t('admin.customers.contactHeading', 'رسائل التواصل')}</h2>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title={t('admin.customers.totalMessagesStat', 'إجمالي الرسائل')} value={messages.length} icon={MessageSquare} accent="rose" isLoading={isLoading} />
        <StatCard title={t('admin.customers.newMessagesStat', 'رسائل جديدة')} value={newCount} icon={Mail} accent="amber" isLoading={isLoading} />
        <StatCard title={t('admin.customers.readMessagesStat', 'مقروءة')} value={readCount} icon={MailOpen} accent="slate" isLoading={isLoading} />
        <StatCard title={t('admin.customers.repliedMessagesStat', 'تم الرد عليها')} value={repliedCount} icon={MailCheck} accent="emerald" isLoading={isLoading} />
        <StatCard title={t('admin.customers.overdueMessagesStat', 'متأخرة (+24 ساعة)')} value={overdueCount} icon={AlertTriangle} accent="fuchsia" isLoading={isLoading} />
      </div>

      <DataTable
        columns={columns}
        data={messages}
        keyExtractor={(m) => m.id}
        isLoading={isLoading}
        emptyMessage={t('admin.customers.emptyMessages', 'لا توجد رسائل تواصل')}
        onRowClick={(m) => setSelected(m)}
      />

      <ActionModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.subject ?? ''}
        subtitle={selected ? `${selected.name} · ${selected.phone}` : undefined}
        maxWidth="lg"
      >
        {selected && (
          <div className="space-y-5">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              {selected.email && <span>{selected.email}</span>}
              <span>{selected.created_at}</span>
              <StatusBadge status={selected.status} label={MESSAGE_STATUS_LABELS[selected.status]} />
              {isMessageOverdue(selected) && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                  <AlertTriangle className="w-3 h-3" />
                  {t('admin.customers.overdueMessageBadge', 'متأخرة')}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleDelete(selected)}
                className="px-4 py-2.5 rounded-xl border border-[#E11D48]/30 text-[#E11D48] text-xs font-extrabold hover:bg-[#E11D48]/10 transition-colors"
              >
                {t('admin.customers.deleteMessageButton', 'حذف الرسالة')}
              </button>
              <button
                type="button"
                onClick={() => updateStatus(selected, 'read')}
                disabled={selected.status === 'read'}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 text-xs font-extrabold hover:bg-white/5 disabled:opacity-40 transition-colors"
              >
                {t('admin.customers.markReadButton', 'تحديد كمقروءة')}
              </button>
              <button
                type="button"
                onClick={() => window.open(buildCustomerWhatsAppUrl(selected), '_blank')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-emerald-500/30 text-emerald-400 text-xs font-extrabold hover:bg-emerald-500/10 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                {t('admin.customers.replyOnWhatsAppButton', 'الرد عبر واتساب')}
              </button>
              <button
                type="button"
                onClick={() => updateStatus(selected, 'replied')}
                disabled={selected.status === 'replied'}
                className="px-5 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#E11D48]/90 disabled:opacity-40 text-white text-xs font-extrabold transition-colors"
              >
                {t('admin.customers.markRepliedButton', 'تحديد كتم الرد')}
              </button>
            </div>
          </div>
        )}
      </ActionModal>
    </div>
  );
}
