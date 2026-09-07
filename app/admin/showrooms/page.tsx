'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Store,
  CheckCircle2,
  Wrench,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Phone,
  Clock,
  AlertTriangle,
  AlertCircle,
  Tag,
  MessageCircle,
  Navigation,
  Bike,
  Package,
  Truck,
  CreditCard,
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import { useAdmin } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import { AdminHeader } from '@/components/admin/layout/AdminHeader';
import { StatCard } from '@/components/admin/ui/StatCard';
import { DataTable, type DataTableColumn } from '@/components/admin/ui/DataTable';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { ActionModal } from '@/components/admin/ui/ActionModal';
import { TextField, SelectField, TextareaField, ToggleField } from '@/components/admin/ui/FormControls';
import { DonutChart, type DonutChartSlice } from '@/components/admin/ui/DonutChart';
import type { Showroom, ShowroomStatus, ShowroomType } from '@/types/admin';
import { DEALERS } from '@/lib/data/dealers';

const TYPE_COLORS = ['#E11D48', '#38BDF8', '#F59E0B', '#A78BFA'];

// The `value` stored/submitted is always the real Arabic governorate name (matches the live
// database); the `label` shown to staff can be translated since these are well-known, standard
// place names — Cairo, Giza, Alexandria etc. — not free-text business data.
const CITY_OPTIONS: { value: string; label: string; i18nKey: string }[] = [
  { value: 'القاهرة', label: 'القاهرة', i18nKey: 'admin.showrooms.cityCairo' },
  { value: 'الجيزة', label: 'الجيزة', i18nKey: 'admin.showrooms.cityGiza' },
  { value: 'الإسكندرية', label: 'الإسكندرية', i18nKey: 'admin.showrooms.cityAlexandria' },
  { value: 'الدقهلية', label: 'الدقهلية', i18nKey: 'admin.showrooms.cityDakahlia' },
  { value: 'الغربية', label: 'الغربية', i18nKey: 'admin.showrooms.cityGharbia' },
  { value: 'الشرقية', label: 'الشرقية', i18nKey: 'admin.showrooms.citySharqia' },
  { value: 'أسيوط', label: 'أسيوط', i18nKey: 'admin.showrooms.cityAssiut' },
];

const STATUS_OPTIONS: { value: ShowroomStatus; label: string; i18nKey: string }[] = [
  { value: 'active', label: 'نشط', i18nKey: 'admin.showrooms.statusActive' },
  { value: 'maintenance', label: 'تحت الصيانة', i18nKey: 'admin.showrooms.statusMaintenance' },
  { value: 'coming_soon', label: 'قريباً', i18nKey: 'admin.showrooms.statusComingSoon' },
];

const TYPE_OPTIONS: { value: ShowroomType; label: string; i18nKey: string }[] = [
  { value: 'flagship', label: 'معرض رئيسي', i18nKey: 'admin.showrooms.typeFlagship' },
  { value: 'authorized', label: 'معرض ومركز خدمة معتمد', i18nKey: 'admin.showrooms.typeAuthorized' },
  { value: 'service', label: 'مركز صيانة', i18nKey: 'admin.showrooms.typeService' },
  { value: 'parts', label: 'قطع غيار فقط', i18nKey: 'admin.showrooms.typeParts' },
];

// Real dealer network slice used as offline fallback data — never fabricated showroom names,
// and carries the full real field set (badge type, WhatsApp, map link, service tags, plans).
const MOCK_SHOWROOMS: Showroom[] = DEALERS.slice(0, 6).map((d) => ({
  id: d.id,
  name: d.nameAr,
  city: d.cityAr,
  address: d.addressAr,
  phone: d.phone,
  working_hours: d.workingHoursAr,
  status: 'active' as const,
  type: d.type,
  whatsapp: d.whatsapp,
  google_maps_url: d.googleMapsUrl,
  has_test_ride: d.hasTestRide,
  has_maintenance: d.hasMaintenance,
  has_spare_parts: d.hasSpareParts,
  has_shipping: d.hasShipping,
  installment_options: d.installmentOptionsAr ?? [],
  notes: d.notesAr,
  name_en: d.nameEn,
  address_en: d.addressEn,
  working_hours_en: d.workingHoursEn,
}));

const showroomSchema = z.object({
  name: z.string().min(3, 'اسم المعرض مطلوب (٣ أحرف على الأقل)'),
  city: z.string().min(1, 'اختر المدينة'),
  address: z.string().min(5, 'العنوان مطلوب'),
  phone: z.string().min(8, 'رقم هاتف صحيح مطلوب'),
  working_hours: z.string().min(2, 'مواعيد العمل مطلوبة'),
  status: z.enum(['active', 'maintenance', 'coming_soon']),
  type: z.enum(['flagship', 'authorized', 'service', 'parts']),
  whatsapp: z.string().optional(),
  google_maps_url: z.string().optional(),
  has_test_ride: z.boolean(),
  has_maintenance: z.boolean(),
  has_spare_parts: z.boolean(),
  has_shipping: z.boolean(),
  installment_options: z.string().optional(),
  notes: z.string().optional(),
  name_en: z.string().optional(),
  address_en: z.string().optional(),
  working_hours_en: z.string().optional(),
});

type ShowroomFormValues = z.infer<typeof showroomSchema>;

const DEFAULT_FORM_VALUES: ShowroomFormValues = {
  name: '',
  city: CITY_OPTIONS[0].value,
  address: '',
  phone: '',
  working_hours: '',
  status: 'active',
  type: 'authorized',
  whatsapp: '',
  google_maps_url: '',
  has_test_ride: true,
  has_maintenance: true,
  has_spare_parts: true,
  has_shipping: false,
  installment_options: '',
  notes: '',
  name_en: '',
  address_en: '',
  working_hours_en: '',
};

function showroomToFormValues(showroom: Showroom): ShowroomFormValues {
  return {
    name: showroom.name,
    city: showroom.city,
    address: showroom.address,
    phone: showroom.phone,
    working_hours: showroom.working_hours,
    status: showroom.status,
    type: showroom.type,
    whatsapp: showroom.whatsapp ?? '',
    google_maps_url: showroom.google_maps_url ?? '',
    has_test_ride: showroom.has_test_ride,
    has_maintenance: showroom.has_maintenance,
    has_spare_parts: showroom.has_spare_parts,
    has_shipping: showroom.has_shipping,
    installment_options: (showroom.installment_options ?? []).join('، '),
    notes: showroom.notes ?? '',
    name_en: showroom.name_en ?? '',
    address_en: showroom.address_en ?? '',
    working_hours_en: showroom.working_hours_en ?? '',
  };
}

function parseInstallmentOptions(value?: string): string[] {
  return (value ?? '')
    .split(/[،,]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

export default function AdminShowroomsPage() {
  const { isOffline, setOffline } = useAdmin();
  const { t, language } = useLanguage();
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShowroom, setEditingShowroom] = useState<Showroom | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Showroom | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ShowroomFormValues>({
    resolver: zodResolver(showroomSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth('/api/showrooms/index.php')
        .then((r) => r.json())
        .catch(() => null);
      const list = res?.data;
      const ok = res?.success && Array.isArray(list);
      // Offline mode reflects genuine unreachability (res === null), not a reached-but-rejected response.
      setOffline(res === null);
      setShowrooms(ok ? list : MOCK_SHOWROOMS);
    } finally {
      setIsLoading(false);
    }
  }, [setOffline]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const filteredShowrooms = useMemo(() => {
    const q = searchValue.trim();
    if (!q) return showrooms;
    return showrooms.filter((s) => s.name.includes(q) || s.city.includes(q) || s.phone.includes(q));
  }, [showrooms, searchValue]);

  const stats = useMemo(
    () => ({
      total: showrooms.length,
      active: showrooms.filter((s) => s.status === 'active').length,
      maintenance: showrooms.filter((s) => s.status === 'maintenance').length,
    }),
    [showrooms]
  );

  const typeBreakdown: DonutChartSlice[] = useMemo(
    () =>
      TYPE_OPTIONS.map((opt, i) => ({
        label: t(opt.i18nKey, opt.label),
        value: showrooms.filter((s) => s.type === opt.value).length,
        color: TYPE_COLORS[i % TYPE_COLORS.length],
      })).filter((s) => s.value > 0),
    [showrooms, t]
  );

  function openAddModal() {
    setEditingShowroom(null);
    setSubmitError(null);
    reset(DEFAULT_FORM_VALUES);
    setIsModalOpen(true);
  }

  function openEditModal(showroom: Showroom) {
    setEditingShowroom(showroom);
    setSubmitError(null);
    reset(showroomToFormValues(showroom));
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingShowroom(null);
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    const { installment_options: installmentOptionsRaw, ...rest } = values;
    const installment_options = parseInstallmentOptions(installmentOptionsRaw);
    const showroomValues = { ...rest, installment_options };

    if (isOffline) {
      // Genuinely offline: mutate local state only, no persistence.
      setShowrooms((prev) =>
        editingShowroom
          ? prev.map((s) => (s.id === editingShowroom.id ? { ...s, ...showroomValues } : s))
          : [{ id: `local-${Date.now()}`, ...showroomValues }, ...prev]
      );
      closeModal();
      return;
    }

    setIsSaving(true);
    try {
      const apiPayload = { ...rest, installment_options };
      const payload = editingShowroom ? { id: editingShowroom.id, ...apiPayload } : apiPayload;
      const res = await fetchWithAuth('/api/showrooms/index.php', {
        method: editingShowroom ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((r) => r.json())
        .catch(() => null);

      if (res?.success) {
        setShowrooms((prev) =>
          editingShowroom
            ? prev.map((s) => (s.id === editingShowroom.id ? { ...s, ...showroomValues } : s))
            : [{ id: String(res?.data?.id ?? `srv-${Date.now()}`), ...showroomValues }, ...prev]
        );
        closeModal();
      } else {
        setSubmitError(
          res?.error || res?.message || t('admin.showrooms.saveErrorFallback', 'تعذر حفظ المعرض، يرجى المحاولة مرة أخرى')
        );
      }
    } finally {
      setIsSaving(false);
    }
  });

  async function confirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (!isOffline) {
        const res = await fetchWithAuth(`/api/showrooms/index.php?id=${encodeURIComponent(deleteTarget.id)}`, {
          method: 'DELETE',
        })
          .then((r) => r.json())
          .catch(() => null);
        if (!res?.success) {
          setIsDeleting(false);
          return;
        }
      }
      setShowrooms((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }

  const columns: DataTableColumn<Showroom>[] = [
    {
      key: 'name',
      header: t('admin.showrooms.columnName', 'اسم المعرض'),
      render: (s) => {
        const typeOption = TYPE_OPTIONS.find((opt) => opt.value === s.type);
        // Real English translations, when the admin has entered them for this showroom — falls
        // back to Arabic (never blank) if no English text was set.
        const displayName = language === 'en' && s.name_en ? s.name_en : s.name;
        const displayAddress = language === 'en' && s.address_en ? s.address_en : s.address;
        return (
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-white">{displayName}</p>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-slate-400">
                <Tag className="w-2.5 h-2.5" />
                {typeOption ? t(typeOption.i18nKey, typeOption.label) : ''}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">{displayAddress}</p>
          </div>
        );
      },
    },
    {
      key: 'city',
      header: t('admin.showrooms.columnCity', 'المدينة'),
      render: (s) => {
        const cityOption = CITY_OPTIONS.find((c) => c.value === s.city);
        return cityOption ? t(cityOption.i18nKey, cityOption.label) : s.city;
      },
      hideOnMobile: true,
    },
    {
      key: 'phone',
      header: t('admin.showrooms.columnPhone', 'الهاتف'),
      render: (s) => (
        <span dir="ltr" className="text-slate-300">
          {s.phone}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: 'status',
      header: t('admin.showrooms.columnStatus', 'الحالة'),
      render: (s) => {
        const statusOption = STATUS_OPTIONS.find((o) => o.value === s.status);
        return <StatusBadge status={s.status} label={statusOption ? t(statusOption.i18nKey, statusOption.label) : undefined} />;
      },
    },
    {
      key: 'actions',
      header: '',
      render: (s) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(s);
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(s);
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#E11D48] hover:bg-[#E11D48]/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminHeader
        title={t('admin.showrooms.pageTitle', 'المعارض')}
        subtitle={t('admin.showrooms.pageSubtitle', 'إدارة شبكة معارض SYM المعتمدة')}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder={t('admin.showrooms.searchPlaceholder', 'ابحث بالاسم أو المدينة أو الهاتف...')}
        actions={
          <button
            type="button"
            onClick={openAddModal}
            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E11D48] hover:bg-[#E11D48]/90 text-white text-xs font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('admin.showrooms.addShowroomButton', 'إضافة معرض')}</span>
          </button>
        }
      />

      <div className="p-4 md:p-6 space-y-6">
        <div className="relative sm:hidden">
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={t('admin.showrooms.searchPlaceholder', 'ابحث بالاسم أو المدينة أو الهاتف...')}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#E11D48]/60"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title={t('admin.showrooms.statTotalShowrooms', 'إجمالي المعارض')} value={stats.total} icon={Store} accent="rose" isLoading={isLoading} />
          <StatCard title={t('admin.showrooms.statActiveShowrooms', 'معارض نشطة')} value={stats.active} icon={CheckCircle2} accent="emerald" isLoading={isLoading} />
          <StatCard title={t('admin.showrooms.statUnderMaintenance', 'تحت الصيانة')} value={stats.maintenance} icon={Wrench} accent="amber" isLoading={isLoading} />
        </div>

        {!isLoading && typeBreakdown.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5">
            <p className="text-xs font-black text-white mb-4">{t('admin.showrooms.typeBreakdownHeading', 'توزيع المعارض حسب النوع')}</p>
            <div className="max-w-xs mx-auto sm:mx-0">
              <DonutChart data={typeBreakdown} centerLabel={t('admin.showrooms.statTotalShowrooms', 'إجمالي المعارض')} centerValue={stats.total} />
            </div>
          </div>
        )}

        <DataTable
          columns={columns}
          data={filteredShowrooms}
          keyExtractor={(s) => s.id}
          isLoading={isLoading}
          emptyMessage={t('admin.showrooms.emptyMessage', 'لا توجد معارض مطابقة للبحث')}
          onRowClick={openEditModal}
        />
      </div>

      <ActionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingShowroom ? t('admin.showrooms.modalTitleEdit', 'تعديل بيانات المعرض') : t('admin.showrooms.modalTitleAdd', 'إضافة معرض جديد')}
        subtitle={
          editingShowroom
            ? language === 'en' && editingShowroom.name_en
              ? editingShowroom.name_en
              : editingShowroom.name
            : t('admin.showrooms.modalSubtitleAdd', 'أدخل بيانات المعرض الجديد')
        }
        maxWidth="lg"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <TextField
            label={t('admin.showrooms.fieldNameLabel', 'اسم المعرض')}
            required
            placeholder={t('admin.showrooms.fieldNamePlaceholder', 'مثال: معرض السلام بايك - مدينة نصر')}
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label={t('admin.showrooms.fieldCityLabel', 'المدينة')}
              required
              options={CITY_OPTIONS.map((c) => ({ value: c.value, label: t(c.i18nKey, c.label) }))}
              error={errors.city?.message}
              {...register('city')}
            />
            <SelectField
              label={t('admin.showrooms.fieldStatusLabel', 'الحالة')}
              required
              options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: t(o.i18nKey, o.label) }))}
              error={errors.status?.message}
              {...register('status')}
            />
          </div>

          <TextField
            label={t('admin.showrooms.fieldAddressLabel', 'العنوان')}
            required
            placeholder={t('admin.showrooms.fieldAddressPlaceholder', 'العنوان بالتفصيل')}
            icon={MapPin}
            error={errors.address?.message}
            {...register('address')}
          />

          <TextField
            label={t('admin.showrooms.fieldPhoneLabel', 'رقم الهاتف')}
            required
            dir="ltr"
            placeholder="0100XXXXXXX"
            icon={Phone}
            error={errors.phone?.message}
            {...register('phone')}
          />

          <TextField
            label={t('admin.showrooms.fieldWorkingHoursLabel', 'مواعيد العمل')}
            required
            placeholder={t('admin.showrooms.fieldWorkingHoursPlaceholder', 'يومياً: 10:00 صباحاً – 10:00 مساءً')}
            icon={Clock}
            error={errors.working_hours?.message}
            {...register('working_hours')}
          />

          <div className="pt-2 border-t border-white/10">
            <p className="text-xs font-black text-white mb-1">{t('admin.showrooms.sectionEnglishTranslation', 'الترجمة الإنجليزية (اختياري)')}</p>
            <p className="text-[11px] text-slate-500 mb-3">
              {t('admin.showrooms.sectionEnglishTranslationHint', 'تُعرض هذه النصوص بدلاً من العربية عند تحويل لوحة التحكم للإنجليزية — اتركها فارغة لإبقاء الاسم والعنوان بالعربية دائماً')}
            </p>

            <div className="space-y-4">
              <TextField
                label={t('admin.showrooms.fieldNameEnLabel', 'اسم المعرض (بالإنجليزية)')}
                dir="ltr"
                placeholder="e.g. Al Salam Bike - Nasr City"
                error={errors.name_en?.message}
                {...register('name_en')}
              />
              <TextField
                label={t('admin.showrooms.fieldAddressEnLabel', 'العنوان (بالإنجليزية)')}
                dir="ltr"
                placeholder="e.g. 63 Zakir Hussein St, Nasr City"
                error={errors.address_en?.message}
                {...register('address_en')}
              />
              <TextField
                label={t('admin.showrooms.fieldWorkingHoursEnLabel', 'مواعيد العمل (بالإنجليزية)')}
                dir="ltr"
                placeholder="e.g. Daily: 10:00 AM – 10:00 PM"
                error={errors.working_hours_en?.message}
                {...register('working_hours_en')}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <p className="text-xs font-black text-white mb-3">{t('admin.showrooms.sectionCardDetails', 'تفاصيل بطاقة المعرض على الموقع')}</p>

            <div className="space-y-4">
              <SelectField
                label={t('admin.showrooms.fieldTypeLabel', 'نوع المعرض')}
                required
                options={TYPE_OPTIONS.map((o) => ({ value: o.value, label: t(o.i18nKey, o.label) }))}
                error={errors.type?.message}
                {...register('type')}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  label={t('admin.showrooms.fieldWhatsappLabel', 'رقم الواتساب')}
                  dir="ltr"
                  placeholder="20100XXXXXXX"
                  icon={MessageCircle}
                  hint={t('admin.showrooms.fieldWhatsappHint', 'اتركه فارغاً لاستخدام رقم الهاتف نفسه')}
                  error={errors.whatsapp?.message}
                  {...register('whatsapp')}
                />
                <TextField
                  label={t('admin.showrooms.fieldMapsUrlLabel', 'رابط خرائط جوجل')}
                  dir="ltr"
                  placeholder="https://maps.google.com/..."
                  icon={Navigation}
                  error={errors.google_maps_url?.message}
                  {...register('google_maps_url')}
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 mb-1.5">{t('admin.showrooms.fieldServicesLabel', 'الخدمات المتاحة')}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <ToggleField
                    label={t('admin.showrooms.toggleTestRide', 'تجربة قيادة')}
                    icon={Bike}
                    checked={watch('has_test_ride')}
                    onChange={(v) => setValue('has_test_ride', v)}
                  />
                  <ToggleField
                    label={t('admin.showrooms.toggleMaintenance', 'مركز صيانة')}
                    icon={Wrench}
                    checked={watch('has_maintenance')}
                    onChange={(v) => setValue('has_maintenance', v)}
                  />
                  <ToggleField
                    label={t('admin.showrooms.toggleSpareParts', 'قطع غيار أصلية')}
                    icon={Package}
                    checked={watch('has_spare_parts')}
                    onChange={(v) => setValue('has_spare_parts', v)}
                  />
                  <ToggleField
                    label={t('admin.showrooms.toggleShipping', 'شحن للمحافظات')}
                    icon={Truck}
                    checked={watch('has_shipping')}
                    onChange={(v) => setValue('has_shipping', v)}
                  />
                </div>
              </div>

              <TextField
                label={t('admin.showrooms.fieldInstallmentLabel', 'خطط التقسيط المتاحة')}
                icon={CreditCard}
                placeholder="فرصة، كونتكت، أمان، فاليو"
                hint={t('admin.showrooms.fieldInstallmentHint', 'افصل بين كل خطة وأخرى بفاصلة — اتركه فارغاً إن لم يتوفر تقسيط')}
                error={errors.installment_options?.message}
                {...register('installment_options')}
              />

              <TextareaField
                label={t('admin.showrooms.fieldNotesLabel', 'ملاحظات إضافية (اختياري)')}
                rows={2}
                placeholder={t('admin.showrooms.fieldNotesPlaceholder', 'أي تفاصيل أخرى تظهر في بطاقة المعرض')}
                error={errors.notes?.message}
                {...register('notes')}
              />
            </div>
          </div>

          {submitError && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#E11D48]/10 border border-[#E11D48]/30 text-[#E11D48] text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {submitError}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 text-sm font-bold hover:bg-white/5 transition-colors"
            >
              {t('admin.showrooms.cancelButton', 'إلغاء')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#E11D48]/90 disabled:opacity-60 text-white text-sm font-bold transition-colors"
            >
              {isSaving
                ? t('admin.showrooms.savingLabel', 'جارِ الحفظ...')
                : editingShowroom
                  ? t('admin.showrooms.saveChangesLabel', 'حفظ التعديلات')
                  : t('admin.showrooms.submitAddLabel', 'إضافة المعرض')}
            </button>
          </div>
        </form>
      </ActionModal>

      <ActionModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={t('admin.showrooms.deleteModalTitle', 'تأكيد حذف المعرض')} maxWidth="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#E11D48]/10 border border-[#E11D48]/30">
            <AlertTriangle className="w-5 h-5 text-[#E11D48] shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              {t('admin.showrooms.deleteConfirmPrefix', 'هل أنت متأكد من حذف معرض')} <span className="font-bold text-white">{deleteTarget?.name}</span>
              {t('admin.showrooms.deleteConfirmSuffix', '؟ لا يمكن التراجع عن هذا الإجراء.')}
            </p>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 text-sm font-bold hover:bg-white/5 transition-colors"
            >
              {t('admin.showrooms.cancelButton', 'إلغاء')}
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#E11D48]/90 disabled:opacity-60 text-white text-sm font-bold transition-colors"
            >
              {isDeleting ? t('admin.showrooms.deletingLabel', 'جارِ الحذف...') : t('admin.showrooms.deleteButtonLabel', 'حذف المعرض')}
            </button>
          </div>
        </div>
      </ActionModal>
    </div>
  );
}
