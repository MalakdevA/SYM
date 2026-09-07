'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  Package,
  AlertTriangle,
  PackageX,
  Wallet,
  Plus,
  Minus,
  Pencil,
  Trash2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import { useAdmin } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import { AdminHeader } from '@/components/admin/layout/AdminHeader';
import { StatCard } from '@/components/admin/ui/StatCard';
import { DataTable, type DataTableColumn } from '@/components/admin/ui/DataTable';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { ActionModal } from '@/components/admin/ui/ActionModal';
import { TextField, SelectField } from '@/components/admin/ui/FormControls';
import type { SparePart, SparePartCategory } from '@/types/admin';
import { SPARE_PARTS } from '@/lib/data/spareParts';

// ---------- Constants ----------

// Mirrors the real 10-category keyword taxonomy in lib/data/sparePartsCategories.ts — the same
// classification the customer-facing spare parts catalog uses, so admin and storefront stay in sync.
const CATEGORY_VALUES: SparePartCategory[] = [
  'المحرك والكرتيرة',
  'الفرامل',
  'الهيكل والفيبر',
  'الكهربا والإضاءة',
  'التعليق والعجلات',
  'الفتيس والدبرياج',
  'الجادون والقيادة',
  'التبريد والزيت',
  'الشاسية والمسامير',
  'أكسسوار ومتفرقات',
];

const CATEGORY_OPTIONS = CATEGORY_VALUES.map((c) => ({ value: c, label: c }));

const CATEGORY_TONE: Record<SparePartCategory, 'emerald' | 'rose' | 'amber' | 'slate' | 'sky'> = {
  'المحرك والكرتيرة': 'rose',
  'الفرامل': 'amber',
  'الهيكل والفيبر': 'slate',
  'الكهربا والإضاءة': 'sky',
  'التعليق والعجلات': 'slate',
  'الفتيس والدبرياج': 'rose',
  'الجادون والقيادة': 'sky',
  'التبريد والزيت': 'emerald',
  'الشاسية والمسامير': 'slate',
  'أكسسوار ومتفرقات': 'emerald',
};

const LOW_STOCK_THRESHOLD = 5;

function generateLocalId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `local-${crypto.randomUUID()}`;
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Real, price-audited catalog entries (from lib/data/spareParts.ts) used as an offline preview
// fallback. Prices are copied verbatim from that file — none are invented.
const MOCK_PARTS: SparePart[] = [
  {
    id: SPARE_PARTS[0].id, // اشارة خلفي يمين
    sku: SPARE_PARTS[0].internalCode,
    name: SPARE_PARTS[0].name,
    category: 'الكهربا والإضاءة',
    price: SPARE_PARTS[0].price,
    stock: 18,
    compatible_model: SPARE_PARTS[0].model,
    brand: 'SYM',
    rack_location: 'A1-03',
    warranty_period: '3 أشهر',
    status: 'active',
  },
  {
    id: SPARE_PARTS[2].id, // مرايا يمين
    sku: SPARE_PARTS[2].internalCode,
    name: SPARE_PARTS[2].name,
    category: 'الجادون والقيادة',
    price: SPARE_PARTS[2].price,
    stock: 4,
    compatible_model: SPARE_PARTS[2].model,
    brand: 'SYM',
    rack_location: 'A1-07',
    warranty_period: '3 أشهر',
    status: 'active',
  },
  {
    id: SPARE_PARTS[4].id, // رشاش بنزين
    sku: SPARE_PARTS[4].internalCode,
    name: SPARE_PARTS[4].name,
    category: 'التبريد والزيت',
    price: SPARE_PARTS[4].price,
    stock: 9,
    compatible_model: SPARE_PARTS[4].model,
    brand: 'SYM',
    rack_location: 'B2-11',
    warranty_period: '6 أشهر',
    status: 'active',
  },
  {
    id: SPARE_PARTS[22]?.id ?? 'sp-23',
    sku: SPARE_PARTS[22]?.internalCode ?? '1210014',
    name: SPARE_PARTS[22]?.name ?? 'سلندر',
    category: 'المحرك والكرتيرة',
    price: SPARE_PARTS[22]?.price ?? 7119.23,
    stock: 0,
    compatible_model: SPARE_PARTS[22]?.model ?? 'cruisym 300',
    brand: 'SYM',
    rack_location: 'B2-14',
    warranty_period: '6 أشهر',
    status: 'active',
  },
  {
    id: SPARE_PARTS[23]?.id ?? 'sp-24',
    sku: SPARE_PARTS[23]?.internalCode ?? '1219114',
    name: SPARE_PARTS[23]?.name ?? 'جوان سلندر',
    category: 'المحرك والكرتيرة',
    price: SPARE_PARTS[23]?.price ?? 141.38,
    stock: 25,
    compatible_model: SPARE_PARTS[23]?.model ?? 'cruisym 300',
    brand: 'SYM',
    rack_location: 'C3-02',
    warranty_period: 'بدون ضمان',
    status: 'active',
  },
  {
    id: SPARE_PARTS[108]?.id ?? 'sp-109',
    sku: SPARE_PARTS[108]?.internalCode ?? '2310014',
    name: SPARE_PARTS[108]?.name ?? 'سير',
    category: 'الفتيس والدبرياج',
    price: SPARE_PARTS[108]?.price ?? 9082.63,
    stock: 12,
    compatible_model: SPARE_PARTS[108]?.model ?? 'cruisym 300',
    brand: 'SYM',
    rack_location: 'D1-05',
    warranty_period: '3 أشهر',
    status: 'active',
  },
];

// ---------- Form schema ----------

const sparePartSchema = z.object({
  name: z.string().min(2, 'اسم القطعة مطلوب'),
  sku: z.string().min(2, 'رمز القطعة (SKU) مطلوب'),
  category: z.enum(CATEGORY_VALUES as [SparePartCategory, ...SparePartCategory[]]),
  price: z.coerce.number().min(1, 'السعر مطلوب ويجب أن يكون أكبر من صفر'),
  cost_price: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? undefined : v),
    z.coerce.number().min(0, 'سعر التكلفة لا يمكن أن يكون سالبًا').optional()
  ),
  stock: z.coerce.number().int('الكمية يجب أن تكون رقمًا صحيحًا').min(0, 'الكمية لا يمكن أن تكون سالبة'),
  compatible_model: z.string().min(1, 'الموديل المتوافق مطلوب'),
  brand: z.string().optional(),
  rack_location: z.string().optional(),
  warranty_period: z.string().optional(),
});

type SparePartFormInput = z.input<typeof sparePartSchema>;
type SparePartFormValues = z.output<typeof sparePartSchema>;

const EMPTY_FORM_VALUES: SparePartFormInput = {
  name: '',
  sku: '',
  category: CATEGORY_VALUES[0],
  price: 0,
  cost_price: undefined,
  stock: 0,
  compatible_model: '',
  brand: '',
  rack_location: '',
  warranty_period: '',
};

function partToFormValues(part: SparePart): SparePartFormInput {
  return {
    name: part.name,
    sku: part.sku,
    category: part.category,
    price: part.price,
    cost_price: part.cost_price,
    stock: part.stock,
    compatible_model: part.compatible_model,
    brand: part.brand ?? '',
    rack_location: part.rack_location ?? '',
    warranty_period: part.warranty_period ?? '',
  };
}

function normalizePart(raw: Record<string, unknown>): SparePart {
  const category = raw.category as SparePartCategory;
  return {
    id: String(raw.id ?? ''),
    sku: String(raw.sku ?? ''),
    name: String(raw.name ?? ''),
    category: CATEGORY_VALUES.includes(category) ? category : CATEGORY_VALUES[0],
    price: Number(raw.price) || 0,
    cost_price: raw.cost_price !== undefined && raw.cost_price !== null ? Number(raw.cost_price) : undefined,
    stock: Number(raw.stock) || 0,
    compatible_model: String(raw.compatible_model ?? ''),
    brand: raw.brand ? String(raw.brand) : undefined,
    rack_location: raw.rack_location ? String(raw.rack_location) : undefined,
    warranty_period: raw.warranty_period ? String(raw.warranty_period) : undefined,
    status: raw.status === 'inactive' ? 'inactive' : 'active',
  };
}

// ---------- Page ----------

export default function SparePartsPage() {
  const { t } = useLanguage();
  const { isOffline, setOffline } = useAdmin();
  const [parts, setParts] = useState<SparePart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SparePartCategory | 'all'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<SparePart | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth('/api/spare-parts/index.php')
        .then((r) => r.json())
        .catch(() => null);

      const ok = res?.success && Array.isArray(res.data);
      // Offline mode reflects genuine unreachability (res === null), not a reached-but-rejected response.
      setOffline(res === null);
      if (ok) {
        setParts((res.data as Record<string, unknown>[]).map(normalizePart));
      } else {
        setParts(MOCK_PARTS);
      }
    } finally {
      setIsLoading(false);
    }
  }, [setOffline]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const filteredParts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return parts.filter((p) => {
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.compatible_model.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [parts, search, categoryFilter]);

  // The real catalog runs into the thousands of rows — DataTable renders plain <tr>s with no
  // virtualization, so the visible page must stay small or the browser tab chokes on mount.
  const PAGE_SIZE = 50;
  const [page, setPage] = useState(1);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [search, categoryFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredParts.length / PAGE_SIZE));
  const pagedParts = useMemo(
    () => filteredParts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredParts, page]
  );

  const stats = useMemo(() => {
    const totalParts = parts.length;
    const lowStock = parts.filter((p) => p.stock <= LOW_STOCK_THRESHOLD).length;
    const outOfStock = parts.filter((p) => p.stock === 0).length;
    const totalValue = parts.reduce((sum, p) => sum + p.price * p.stock, 0);
    return { totalParts, lowStock, outOfStock, totalValue };
  }, [parts]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SparePartFormInput, unknown, SparePartFormValues>({
    resolver: zodResolver(sparePartSchema),
    defaultValues: EMPTY_FORM_VALUES,
  });

  const openAddModal = () => {
    setEditingPart(null);
    setSubmitError(null);
    reset(EMPTY_FORM_VALUES);
    setIsModalOpen(true);
  };

  const openEditModal = (part: SparePart) => {
    setEditingPart(part);
    setSubmitError(null);
    reset(partToFormValues(part));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPart(null);
    setSubmitError(null);
  };

  const onSubmit = async (values: SparePartFormValues) => {
    setSubmitError(null);

    if (isOffline) {
      if (editingPart) {
        setParts((prev) => prev.map((p) => (p.id === editingPart.id ? { ...p, ...values } : p)));
      } else {
        const newPart: SparePart = { id: generateLocalId(), ...values, status: 'active' };
        setParts((prev) => [newPart, ...prev]);
      }
      closeModal();
      return;
    }

    setIsSaving(true);
    try {
      const method = editingPart ? 'PUT' : 'POST';
      const body = editingPart ? { id: editingPart.id, ...values } : values;
      const res = await fetchWithAuth('/api/spare-parts/index.php', {
        method,
        body: JSON.stringify(body),
      })
        .then((r) => r.json())
        .catch(() => null);

      if (res?.success) {
        await load();
        closeModal();
      } else {
        setSubmitError(
          res?.error ||
            res?.message ||
            t('admin.spareParts.saveErrorFallback', 'تعذر حفظ القطعة، يرجى المحاولة مرة أخرى')
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    if (isOffline) {
      setParts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetchWithAuth(`/api/spare-parts/index.php?id=${encodeURIComponent(deleteTarget.id)}`, {
        method: 'DELETE',
      })
        .then((r) => r.json())
        .catch(() => null);

      if (res?.success) {
        setParts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      }
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const adjustStock = async (part: SparePart, delta: number) => {
    const nextStock = Math.max(0, part.stock + delta);
    if (nextStock === part.stock) return;

    setParts((prev) => prev.map((p) => (p.id === part.id ? { ...p, stock: nextStock } : p)));

    if (isOffline) return;

    try {
      const res = await fetchWithAuth('/api/spare-parts/index.php', {
        method: 'PUT',
        body: JSON.stringify({ id: part.id, stock: nextStock }),
      })
        .then((r) => r.json())
        .catch(() => null);

      if (!res?.success) {
        setParts((prev) => prev.map((p) => (p.id === part.id ? { ...p, stock: part.stock } : p)));
      }
    } catch {
      setParts((prev) => prev.map((p) => (p.id === part.id ? { ...p, stock: part.stock } : p)));
    }
  };

  const columns: DataTableColumn<SparePart>[] = [
    {
      key: 'sku',
      header: t('admin.spareParts.colSku', 'SKU'),
      render: (p) => (
        <span dir="ltr" className="font-mono text-[11px] text-slate-300 tracking-wide">
          {p.sku}
        </span>
      ),
    },
    {
      key: 'name',
      header: t('admin.spareParts.colName', 'اسم القطعة'),
      render: (p) => (
        <div className="min-w-0">
          <p className="font-bold text-white truncate">{p.name}</p>
          <p className="text-[11px] text-slate-500 truncate">{p.compatible_model}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: t('admin.spareParts.colCategory', 'الفئة'),
      render: (p) => <StatusBadge status={p.category} tone={CATEGORY_TONE[p.category]} />,
      hideOnMobile: true,
    },
    {
      key: 'price',
      header: t('admin.spareParts.colPrice', 'السعر'),
      render: (p) => <span className="font-bold text-white tabular-nums">{p.price.toLocaleString('en-US')} ج.م</span>,
    },
    {
      key: 'stock',
      header: t('admin.spareParts.colStock', 'المخزون'),
      render: (p) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => adjustStock(p, -1)}
            disabled={p.stock <= 0}
            className="w-6 h-6 rounded-md flex items-center justify-center bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className={`w-7 text-center text-xs font-black tabular-nums ${p.stock === 0 ? 'text-[#E11D48]' : p.stock <= LOW_STOCK_THRESHOLD ? 'text-amber-400' : 'text-white'}`}>
            {p.stock}
          </span>
          <button
            type="button"
            onClick={() => adjustStock(p, 1)}
            className="w-6 h-6 rounded-md flex items-center justify-center bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      ),
    },
    {
      key: 'status',
      header: t('admin.spareParts.colStatus', 'الحالة'),
      render: (p) => (
        <StatusBadge
          status={p.stock === 0 ? 'outOfStock' : (p.status ?? 'active')}
          label={
            p.stock === 0
              ? t('admin.spareParts.statusOutOfStock', 'نفذ المخزون')
              : p.status === 'inactive'
                ? t('admin.spareParts.statusInactive', 'غير نشطة')
                : t('admin.spareParts.statusActive', 'نشطة')
          }
        />
      ),
      hideOnMobile: true,
    },
    {
      key: 'actions',
      header: t('admin.spareParts.colActions', 'الإجراءات'),
      render: (p) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => openEditModal(p)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title={t('admin.spareParts.editTooltip', 'تعديل')}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(p)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#E11D48] hover:bg-[#E11D48]/10 transition-colors"
            title={t('admin.spareParts.deleteTooltip', 'حذف')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminHeader
        title={t('admin.spareParts.pageTitle', 'قطع الغيار')}
        subtitle={t('admin.spareParts.pageSubtitle', 'إدارة مخزون قطع الغيار والأسعار')}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('admin.spareParts.searchPlaceholder', 'ابحث بالاسم أو SKU أو الموديل...')}
        actions={
          <button
            type="button"
            onClick={openAddModal}
            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E11D48] text-white text-xs font-bold hover:bg-[#E11D48]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('admin.spareParts.addButton', 'إضافة قطعة')}</span>
          </button>
        }
      />

      <div className="p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title={t('admin.spareParts.statTotalParts', 'إجمالي القطع')} value={stats.totalParts} icon={Package} accent="violet" isLoading={isLoading} />
          <StatCard title={t('admin.spareParts.statLowStock', 'مخزون منخفض')} value={stats.lowStock} icon={AlertTriangle} accent="amber" isLoading={isLoading} />
          <StatCard title={t('admin.spareParts.statOutOfStock', 'نفذ من المخزون')} value={stats.outOfStock} icon={PackageX} accent="rose" isLoading={isLoading} />
          <StatCard
            title={t('admin.spareParts.statTotalValue', 'قيمة المخزون الإجمالية')}
            value={`${stats.totalValue.toLocaleString('en-US')} ج.م`}
            icon={Wallet}
            accent="emerald"
            isLoading={isLoading}
          />
        </div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-64">
            <SelectField
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as SparePartCategory | 'all')}
              options={[{ value: 'all', label: t('admin.spareParts.allCategories', 'كل الفئات') }, ...CATEGORY_OPTIONS]}
            />
          </div>
          <div className="sm:hidden flex-1 min-w-[180px]">
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('admin.spareParts.searchPlaceholder', 'ابحث بالاسم أو SKU أو الموديل...')}
            />
          </div>
        </motion.div>

        <DataTable
          columns={columns}
          data={pagedParts}
          keyExtractor={(p) => p.id}
          isLoading={isLoading}
          emptyMessage={t('admin.spareParts.emptyMessage', 'لا توجد قطع غيار مطابقة')}
        />

        {!isLoading && filteredParts.length > 0 && (
          <div className="flex items-center justify-between gap-3 flex-wrap" dir="rtl">
            <p className="text-[11px] text-slate-500">
              {t('admin.spareParts.paginationSummary', 'عرض {from}–{to} من {total} قطعة')
                .replace('{from}', String((page - 1) * PAGE_SIZE + 1))
                .replace('{to}', String(Math.min(page * PAGE_SIZE, filteredParts.length)))
                .replace('{total}', filteredParts.length.toLocaleString('en-US'))}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 text-slate-300 hover:bg-white/5 transition-colors disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="px-3 py-1.5 rounded-lg bg-white/5 text-xs font-bold text-slate-300 tabular-nums">
                {page} / {pageCount.toLocaleString('en-US')}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={page >= pageCount}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 text-slate-300 hover:bg-white/5 transition-colors disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ActionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingPart ? t('admin.spareParts.editModalTitle', 'تعديل قطعة الغيار') : t('admin.spareParts.addModalTitle', 'إضافة قطعة غيار جديدة')}
        subtitle={editingPart ? editingPart.sku : t('admin.spareParts.addModalSubtitle', 'أدخل بيانات القطعة الجديدة')}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label={t('admin.spareParts.nameLabel', 'اسم القطعة')} required error={errors.name?.message} {...register('name')} />
            <TextField label={t('admin.spareParts.skuLabel', 'رمز القطعة (SKU)')} required dir="ltr" className="font-mono" error={errors.sku?.message} {...register('sku')} />
            <SelectField label={t('admin.spareParts.categoryLabel', 'الفئة')} required options={CATEGORY_OPTIONS} error={errors.category?.message} {...register('category')} />
            <TextField label={t('admin.spareParts.compatibleModelLabel', 'الموديل المتوافق')} required error={errors.compatible_model?.message} {...register('compatible_model')} />
            <TextField label={t('admin.spareParts.priceLabel', 'السعر (ج.م)')} type="number" step="0.01" required error={errors.price?.message} {...register('price')} />
            <TextField label={t('admin.spareParts.costPriceLabel', 'سعر التكلفة (ج.م)')} type="number" step="0.01" error={errors.cost_price?.message} {...register('cost_price')} />
            <TextField label={t('admin.spareParts.stockLabel', 'الكمية بالمخزون')} type="number" required error={errors.stock?.message} {...register('stock')} />
            <TextField label={t('admin.spareParts.brandLabel', 'الماركة')} error={errors.brand?.message} {...register('brand')} />
            <TextField label={t('admin.spareParts.rackLocationLabel', 'موقع الرف')} error={errors.rack_location?.message} {...register('rack_location')} />
            <TextField label={t('admin.spareParts.warrantyPeriodLabel', 'مدة الضمان')} placeholder={t('admin.spareParts.warrantyPeriodPlaceholder', 'مثال: 6 أشهر')} error={errors.warranty_period?.message} {...register('warranty_period')} />
          </div>

          {submitError && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#E11D48]/10 border border-[#E11D48]/30 text-[#E11D48] text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {submitError}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 rounded-xl bg-[#E11D48] text-white text-sm font-bold hover:bg-[#E11D48]/90 disabled:opacity-50 transition-colors"
            >
              {isSaving
                ? t('admin.spareParts.savingText', 'جارٍ الحفظ...')
                : editingPart
                  ? t('admin.spareParts.saveEditsButton', 'حفظ التعديلات')
                  : t('admin.spareParts.addPartButton', 'إضافة القطعة')}
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-bold hover:bg-white/10 transition-colors"
            >
              {t('admin.spareParts.cancelButton', 'إلغاء')}
            </button>
          </div>
        </form>
      </ActionModal>

      <ActionModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={t('admin.spareParts.deleteModalTitle', 'تأكيد الحذف')}
        subtitle={deleteTarget?.name}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-[#E11D48]/10 border border-[#E11D48]/30 text-[#E11D48] text-xs font-bold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {t('admin.spareParts.deleteConfirmText', 'هل أنت متأكد من حذف هذه القطعة؟ لا يمكن التراجع عن هذا الإجراء.')}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl bg-[#E11D48] text-white text-sm font-bold hover:bg-[#E11D48]/90 disabled:opacity-50 transition-colors"
            >
              {isDeleting ? t('admin.spareParts.deletingText', 'جارٍ الحذف...') : t('admin.spareParts.deleteButton', 'حذف نهائي')}
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-bold hover:bg-white/10 transition-colors"
            >
              {t('admin.spareParts.cancelButton', 'إلغاء')}
            </button>
          </div>
        </div>
      </ActionModal>
    </div>
  );
}
