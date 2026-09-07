'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Package,
  PackageCheck,
  PackageX,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Eye,
  ImagePlus,
  Upload,
  Loader2,
  AlertTriangle,
  AlertCircle,
  ChevronDown,
  Check,
  Gauge,
  Palette,
  FileText,
  Video,
  X,
  RotateCw,
  Link2,
} from 'lucide-react';
import { fetchWithAuth, uploadImageApi } from '@/lib/api';
import { useAdmin } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import { AdminHeader } from '@/components/admin/layout/AdminHeader';
import { StatCard } from '@/components/admin/ui/StatCard';
import { DataTable, type DataTableColumn } from '@/components/admin/ui/DataTable';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { ActionModal } from '@/components/admin/ui/ActionModal';
import { Drawer } from '@/components/admin/ui/Drawer';
import { TextField, TextareaField, SelectField, ToggleField } from '@/components/admin/ui/FormControls';
import type { ProductItem, ProductSpecifications } from '@/types/admin';
import { PRODUCTS as CATALOG_PRODUCTS, type ProductItem as CatalogProductItem } from '@/lib/data/products';

// ---------- Static lookups derived from the real product catalog ----------

const CATEGORY_OPTIONS = [
  { value: 'scooter', label: 'سكوتر' },
  { value: 'bike', label: 'دراجة نارية' },
] as const;

const CAPACITY_OPTIONS = ['125 cc', '150 cc', '200 cc', '250 cc', '300 cc', '400 cc'].map((c) => ({
  value: c,
  label: c,
}));

const SUB_CATEGORY_OPTIONS = Array.from(
  new Set(CATALOG_PRODUCTS.map((p) => p.subCategory).filter((v): v is string => Boolean(v)))
).map((v) => ({ value: v, label: v }));

const PRESET_IMAGES = Array.from(
  new Set(CATALOG_PRODUCTS.flatMap((p) => [p.image, ...(p.images ?? [])]).filter(Boolean))
);

// ---------- Helpers ----------

function slugify(input: string): string {
  const slug = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'product';
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface RawApiProduct {
  id: string | number;
  name?: string;
  slug?: string;
  category?: string;
  sub_category?: string;
  subCategory?: string;
  price?: number | string;
  image?: string;
  images?: string[];
  colors?: string[];
  images360?: string[];
  description?: string;
  inStock?: boolean;
  isNew?: boolean;
  power?: string;
  speed?: string;
  cooling?: string;
  capacity?: string;
  catalogPdf?: string;
  catalog_pdf?: string;
  videoUrl?: string;
  video_url?: string;
  specifications?: Partial<ProductSpecifications>;
}

function mapApiProduct(raw: RawApiProduct): ProductItem {
  const spec = raw.specifications ?? {};
  return {
    id: String(raw.id),
    name: raw.name ?? '',
    slug: raw.slug ?? slugify(raw.name ?? ''),
    category: raw.category === 'bike' ? 'bike' : 'scooter',
    subCategory: raw.sub_category ?? raw.subCategory ?? '',
    price: Number(raw.price) || 0,
    image: raw.image ?? '',
    images: Array.isArray(raw.images) ? raw.images : [],
    colors: Array.isArray(raw.colors) ? raw.colors : [],
    images360: Array.isArray(raw.images360) ? raw.images360 : [],
    description: raw.description ?? '',
    capacity: raw.capacity ?? spec.capacity ?? '',
    power: raw.power ?? spec.power ?? '',
    speed: raw.speed ?? spec.maxSpeed ?? '',
    cooling: raw.cooling ?? spec.cooling ?? '',
    catalogPdf: raw.catalogPdf ?? raw.catalog_pdf,
    videoUrl: raw.videoUrl ?? raw.video_url,
    // Preserve every real field the backend already has — only fall back to the legacy
    // top-level raw.capacity/power/cooling when the specifications object itself is missing them.
    specifications: {
      ...spec,
      capacity: spec.capacity ?? raw.capacity ?? '',
      power: spec.power ?? raw.power ?? '',
      cooling: spec.cooling ?? raw.cooling ?? '',
    },
    inStock: Boolean(raw.inStock),
    isNew: Boolean(raw.isNew),
  };
}

/** Adapts the real site catalog (lib/data/products.ts) into the admin ProductItem shape for offline/mock use. */
function mapCatalogProduct(item: CatalogProductItem): ProductItem {
  const spec = item.specifications ?? {};
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    category: item.category,
    subCategory: item.subCategory ?? '',
    price: item.price,
    image: item.image,
    images: item.images && item.images.length > 0 ? item.images : [item.image],
    colors: item.colors ?? [],
    images360: item.images360 ?? [],
    description: item.description ?? '',
    capacity: item.capacity ?? spec.capacity ?? '',
    power: item.power ?? spec.power ?? '',
    speed: item.speed ?? spec.maxSpeed ?? '',
    cooling: item.cooling ?? spec.cooling ?? '',
    catalogPdf: item.catalogPdf,
    videoUrl: item.videoUrl,
    // The real catalog's specifications object already carries the full ~40-field real shape
    // (wheelBase, frontSuspension, frontBrakes, engine, torque, battery, etc.) — copy it verbatim.
    specifications: {
      ...spec,
      capacity: spec.capacity ?? item.capacity ?? '',
      power: spec.power ?? item.power ?? '',
      cooling: spec.cooling ?? item.cooling ?? '',
    },
    inStock: item.inStock,
    isNew: item.isNew ?? false,
  };
}

// ---------- Form schema ----------

const specificationsSchema = z.object({
  // Chassis & Dimensions
  dimensions: z.string().optional(),
  wheelBase: z.string().optional(),
  weight: z.string().optional(),
  frontSuspension: z.string().optional(),
  rearSuspension: z.string().optional(),
  rimMaterial: z.string().optional(),
  frontTire: z.string().optional(),
  rearTire: z.string().optional(),
  tirePressure: z.string().optional(),
  frontBrakes: z.string().optional(),
  rearBrakes: z.string().optional(),
  fuelTank: z.string().optional(),
  seatHeight: z.string().optional(),
  // Engine
  emissionsStandard: z.string().optional(),
  engine: z.string().optional(),
  capacity: z.string().optional(),
  boreStroke: z.string().optional(),
  compressionRatio: z.string().optional(),
  idlingSpeed: z.string().optional(),
  fuelSystem: z.string().optional(),
  power: z.string().optional(),
  torque: z.string().optional(),
  clutchType: z.string().optional(),
  valveTrain: z.string().optional(),
  tensioner: z.string().optional(),
  engineOilCapacity: z.string().optional(),
  maxSpeed: z.string().optional(),
  cooling: z.string().optional(),
  transmission: z.string().optional(),
  // Electrical
  startingSystem: z.string().optional(),
  headlightSpec: z.string().optional(),
  taillightSpec: z.string().optional(),
  frontPositionLamp: z.string().optional(),
  turningSignalLight: z.string().optional(),
  ignitionSystem: z.string().optional(),
  alternator: z.string().optional(),
  battery: z.string().optional(),
  licenseLight: z.string().optional(),
  fuseSpec: z.string().optional(),
  sparkPlug: z.string().optional(),
});

const productSchema = z.object({
  name: z.string().trim().min(2, 'اسم الموديل مطلوب (حرفين على الأقل)'),
  category: z.enum(['scooter', 'bike']),
  subCategory: z.string().trim().min(1, 'الفئة الفرعية مطلوبة'),
  price: z.number().positive('السعر يجب أن يكون أكبر من صفر'),
  capacity: z.string().trim().min(1, 'اختر سعة المحرك'),
  description: z.string().trim().min(5, 'الوصف مطلوب (5 أحرف على الأقل)'),
  videoUrl: z.string().trim().optional(),
  catalogPdf: z.string().trim().optional(),
  specifications: specificationsSchema,
});

type ProductFormValues = z.infer<typeof productSchema>;

function defaultsFromProduct(product: ProductItem | null): ProductFormValues {
  const spec = product?.specifications ?? {};
  return {
    name: product?.name ?? '',
    category: product?.category ?? 'scooter',
    subCategory: product?.subCategory ?? '',
    price: product?.price ?? 0,
    capacity: product?.capacity ?? spec.capacity ?? '',
    description: product?.description ?? '',
    videoUrl: product?.videoUrl ?? '',
    catalogPdf: product?.catalogPdf ?? '',
    specifications: {
      dimensions: spec.dimensions ?? '',
      wheelBase: spec.wheelBase ?? '',
      weight: spec.weight ?? '',
      frontSuspension: spec.frontSuspension ?? '',
      rearSuspension: spec.rearSuspension ?? '',
      rimMaterial: spec.rimMaterial ?? '',
      frontTire: spec.frontTire ?? '',
      rearTire: spec.rearTire ?? '',
      tirePressure: spec.tirePressure ?? '',
      frontBrakes: spec.frontBrakes ?? '',
      rearBrakes: spec.rearBrakes ?? '',
      fuelTank: spec.fuelTank ?? '',
      seatHeight: spec.seatHeight ?? '',
      emissionsStandard: spec.emissionsStandard ?? '',
      engine: spec.engine ?? '',
      capacity: spec.capacity ?? product?.capacity ?? '',
      boreStroke: spec.boreStroke ?? '',
      compressionRatio: spec.compressionRatio ?? '',
      idlingSpeed: spec.idlingSpeed ?? '',
      fuelSystem: spec.fuelSystem ?? '',
      power: spec.power ?? product?.power ?? '',
      torque: spec.torque ?? '',
      clutchType: spec.clutchType ?? '',
      valveTrain: spec.valveTrain ?? '',
      tensioner: spec.tensioner ?? '',
      engineOilCapacity: spec.engineOilCapacity ?? '',
      maxSpeed: spec.maxSpeed ?? '',
      cooling: spec.cooling ?? product?.cooling ?? '',
      transmission: spec.transmission ?? '',
      startingSystem: spec.startingSystem ?? '',
      headlightSpec: spec.headlightSpec ?? '',
      taillightSpec: spec.taillightSpec ?? '',
      frontPositionLamp: spec.frontPositionLamp ?? '',
      turningSignalLight: spec.turningSignalLight ?? '',
      ignitionSystem: spec.ignitionSystem ?? '',
      alternator: spec.alternator ?? '',
      battery: spec.battery ?? '',
      licenseLight: spec.licenseLight ?? '',
      fuseSpec: spec.fuseSpec ?? '',
      sparkPlug: spec.sparkPlug ?? '',
    },
  };
}

// ---------- Specification field groups ----------
// Field names, grouping, and Arabic labels below are copied verbatim from the real product
// detail page (components/scooters/ScooterDetailView.tsx) so the admin form edits exactly what
// customers actually see — not a guessed or invented subset.

interface SpecFieldDef {
  key: keyof z.infer<typeof specificationsSchema>;
  labelKey: string;
  labelFallback: string;
  placeholder?: string;
}

const CHASSIS_SPEC_FIELDS: SpecFieldDef[] = [
  { key: 'dimensions', labelKey: 'admin.inventory.spec.dimensions', labelFallback: 'الطول × العرض × الارتفاع (مم)', placeholder: '2230 x 820 x 1360 mm' },
  { key: 'wheelBase', labelKey: 'admin.inventory.spec.wheelBase', labelFallback: 'قاعدة العجلات (مم)', placeholder: '1552 mm' },
  { key: 'weight', labelKey: 'admin.inventory.spec.weight', labelFallback: 'الوزن الصافي (كجم)', placeholder: '194 kg' },
  { key: 'frontSuspension', labelKey: 'admin.inventory.spec.frontSuspension', labelFallback: 'المساعدين الأمامية', placeholder: 'Telescopic Fork' },
  { key: 'rearSuspension', labelKey: 'admin.inventory.spec.rearSuspension', labelFallback: 'المساعدين الخلفية', placeholder: 'Dual Shock' },
  { key: 'rimMaterial', labelKey: 'admin.inventory.spec.rimMaterial', labelFallback: 'مادة الجنوط', placeholder: 'Aluminum Alloy' },
  { key: 'frontTire', labelKey: 'admin.inventory.spec.frontTire', labelFallback: 'مقاس الإطار الأمامي', placeholder: '120/70-15' },
  { key: 'rearTire', labelKey: 'admin.inventory.spec.rearTire', labelFallback: 'مقاس الإطار الخلفي', placeholder: '160/60-14' },
  { key: 'tirePressure', labelKey: 'admin.inventory.spec.tirePressure', labelFallback: 'ضغط الإطارات', placeholder: '28 / 32 psi' },
  { key: 'frontBrakes', labelKey: 'admin.inventory.spec.frontBrakes', labelFallback: 'فرامل أمامي', placeholder: 'Disc Ø 288 mm + ABS' },
  { key: 'rearBrakes', labelKey: 'admin.inventory.spec.rearBrakes', labelFallback: 'فرامل خلفي', placeholder: 'Disc Ø 275 mm + ABS' },
  { key: 'fuelTank', labelKey: 'admin.inventory.spec.fuelTank', labelFallback: 'سعة خزان الوقود', placeholder: '14.5 L' },
  { key: 'seatHeight', labelKey: 'admin.inventory.spec.seatHeight', labelFallback: 'ارتفاع المقعد (مم)', placeholder: '780 mm' },
];

const ENGINE_SPEC_FIELDS: SpecFieldDef[] = [
  { key: 'emissionsStandard', labelKey: 'admin.inventory.spec.emissionsStandard', labelFallback: 'معيار الانبعاثات', placeholder: 'Euro 5' },
  { key: 'engine', labelKey: 'admin.inventory.spec.engine', labelFallback: 'نوع المحرك', placeholder: '4-stroke, single cylinder' },
  { key: 'capacity', labelKey: 'admin.inventory.spec.capacityFull', labelFallback: 'السعة اللترية (سي سي)', placeholder: '400 c.c.' },
  { key: 'boreStroke', labelKey: 'admin.inventory.spec.boreStroke', labelFallback: 'القطر × الشوط (مم)', placeholder: '85 x 69.6 mm' },
  { key: 'compressionRatio', labelKey: 'admin.inventory.spec.compressionRatio', labelFallback: 'نسبة الانضغاط', placeholder: '11.4 : 1' },
  { key: 'idlingSpeed', labelKey: 'admin.inventory.spec.idlingSpeed', labelFallback: 'سرعة السلانسيه', placeholder: '1600±100 rpm' },
  { key: 'fuelSystem', labelKey: 'admin.inventory.spec.fuelSystem', labelFallback: 'نظام الوقود', placeholder: 'E.F.I.' },
  { key: 'power', labelKey: 'admin.inventory.spec.power', labelFallback: 'القوة القصوى', placeholder: '25 kW / 6,750 rpm' },
  { key: 'torque', labelKey: 'admin.inventory.spec.torque', labelFallback: 'العزم الأقصى', placeholder: '37 Nm / 5,000 rpm' },
  { key: 'clutchType', labelKey: 'admin.inventory.spec.clutchType', labelFallback: 'نوع الدبرياج', placeholder: 'Dry, Automatic Centrifugal' },
  { key: 'valveTrain', labelKey: 'admin.inventory.spec.valveTrain', labelFallback: 'نظام الكامة والصمامات', placeholder: 'SOHC 4-Valve' },
  { key: 'tensioner', labelKey: 'admin.inventory.spec.tensioner', labelFallback: 'شداد السلسلة', placeholder: 'Automatic' },
  { key: 'engineOilCapacity', labelKey: 'admin.inventory.spec.engineOilCapacity', labelFallback: 'سعة زيت المحرك', placeholder: '1.0 L' },
  { key: 'maxSpeed', labelKey: 'admin.inventory.spec.maxSpeed', labelFallback: 'السرعة القصوى', placeholder: '145 km/h' },
  { key: 'cooling', labelKey: 'admin.inventory.spec.cooling', labelFallback: 'نظام التبريد', placeholder: 'Liquid Cooled' },
  { key: 'transmission', labelKey: 'admin.inventory.spec.transmission', labelFallback: 'ناقل الحركة', placeholder: 'C.V.T.' },
];

const ELECTRICAL_SPEC_FIELDS: SpecFieldDef[] = [
  { key: 'startingSystem', labelKey: 'admin.inventory.spec.startingSystem', labelFallback: 'نظام التشغيل', placeholder: 'Electric Starter' },
  { key: 'headlightSpec', labelKey: 'admin.inventory.spec.headlightSpec', labelFallback: 'المصباح الأمامي', placeholder: 'Full LED' },
  { key: 'taillightSpec', labelKey: 'admin.inventory.spec.taillightSpec', labelFallback: 'المصباح الخلفي', placeholder: 'LED' },
  { key: 'frontPositionLamp', labelKey: 'admin.inventory.spec.frontPositionLamp', labelFallback: 'إضاءة المواضع', placeholder: 'LED' },
  { key: 'turningSignalLight', labelKey: 'admin.inventory.spec.turningSignalLight', labelFallback: 'إشارات الانعطاف', placeholder: 'LED' },
  { key: 'ignitionSystem', labelKey: 'admin.inventory.spec.ignitionSystem', labelFallback: 'نظام الإشعال', placeholder: 'C.D.I.' },
  { key: 'alternator', labelKey: 'admin.inventory.spec.alternator', labelFallback: 'قدرة المولد والدينامو', placeholder: '12V / 220W' },
  { key: 'battery', labelKey: 'admin.inventory.spec.battery', labelFallback: 'سعة البطارية', placeholder: '12V 9Ah' },
  { key: 'licenseLight', labelKey: 'admin.inventory.spec.licenseLight', labelFallback: 'إضاءة اللوحة', placeholder: 'LED' },
  { key: 'fuseSpec', labelKey: 'admin.inventory.spec.fuseSpec', labelFallback: 'الفيوزات', placeholder: '10A / 15A / 20A' },
  { key: 'sparkPlug', labelKey: 'admin.inventory.spec.sparkPlug', labelFallback: 'شمعة الإشعال (البوجيه)', placeholder: 'NGK CR7E' },
];

const ALL_SPEC_FIELDS: SpecFieldDef[] = [...CHASSIS_SPEC_FIELDS, ...ENGINE_SPEC_FIELDS, ...ELECTRICAL_SPEC_FIELDS];

function SpecGroup({
  titleKey,
  titleFallback,
  t,
  children,
}: {
  titleKey: string;
  titleFallback: string;
  t: (key: string, fallback: string) => string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] font-extrabold text-slate-300 mb-2.5">{t(titleKey, titleFallback)}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">{children}</div>
    </div>
  );
}

// ---------- Add / Edit modal ----------

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductItem | null;
  onSave: (product: ProductItem) => void;
  isSaving: boolean;
  saveError: string | null;
}

function ProductFormModal({ isOpen, onClose, product, onSave, isSaving, saveError }: ProductFormModalProps) {
  const { t } = useLanguage();
  const isEdit = product !== null;
  const [image, setImage] = useState(product?.image ?? '');
  const [galleryImages, setGalleryImages] = useState<string[]>(
    (product?.images ?? []).filter((img) => img !== product?.image)
  );
  const [images360List, setImages360List] = useState<string[]>(product?.images360 ?? []);
  const [inStock, setInStock] = useState(product?.inStock ?? true);
  const [isNew, setIsNew] = useState(product?.isNew ?? false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isUploading360, setIsUploading360] = useState(false);
  const [imageError, setImageError] = useState('');
  const [specsOpen, setSpecsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const angle360InputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultsFromProduct(product),
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(defaultsFromProduct(product));
    setImage(product?.image ?? '');
    setGalleryImages((product?.images ?? []).filter((img) => img !== product?.image));
    setImages360List(product?.images360 ?? []);
    setInStock(product?.inStock ?? true);
    setIsNew(product?.isNew ?? false);
    setImageError('');
    setIsUploading(false);
  }, [isOpen, product, reset]);

  const nameValue = watch('name');
  const slugPreview = useMemo(() => slugify(nameValue || ''), [nameValue]);

  const capacityOptions = useMemo(() => {
    const current = product?.capacity;
    if (current && !CAPACITY_OPTIONS.some((o) => o.value === current)) {
      return [{ value: current, label: current }, ...CAPACITY_OPTIONS];
    }
    return CAPACITY_OPTIONS;
  }, [product]);

  const subCategoryOptions = useMemo(() => {
    const current = product?.subCategory;
    if (current && !SUB_CATEGORY_OPTIONS.some((o) => o.value === current)) {
      return [{ value: current, label: current }, ...SUB_CATEGORY_OPTIONS];
    }
    return SUB_CATEGORY_OPTIONS;
  }, [product]);

  const categoryOptions = useMemo(
    () =>
      CATEGORY_OPTIONS.map((o) => ({
        value: o.value,
        label:
          o.value === 'bike'
            ? t('admin.inventory.categoryBike', 'دراجة نارية')
            : t('admin.inventory.categoryScooter', 'سكوتر'),
      })),
    [t]
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const url = await uploadImageApi(file);
    setIsUploading(false);
    if (url) {
      setImage(url);
      setImageError('');
    } else {
      setImageError(t('admin.inventory.imageUploadFailed', 'فشل رفع الصورة، حاول مرة أخرى'));
    }
    e.target.value = '';
  };

  // Additional gallery photos — each one becomes a selectable "color" swatch on the real product
  // page (clicking a thumbnail there swaps the main photo, one photo per color variant).
  const handleGalleryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingGallery(true);
    const url = await uploadImageApi(file);
    setIsUploadingGallery(false);
    if (url) setGalleryImages((prev) => [...prev, url]);
    e.target.value = '';
  };

  const removeGalleryImage = (url: string) => {
    setGalleryImages((prev) => prev.filter((img) => img !== url));
  };

  // The 8-angle 360° rotation sequence the real View360Rotator component expects, in order.
  const ANGLE_360_LABELS = ['0°', '45°', '90°', '135°', '180°', '225°', '270°', '315°'];

  const handle360FileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading360(true);
    const url = await uploadImageApi(file);
    setIsUploading360(false);
    if (url && images360List.length < 8) setImages360List((prev) => [...prev, url]);
    e.target.value = '';
  };

  const removeImage360 = (idx: number) => {
    setImages360List((prev) => prev.filter((_, i) => i !== idx));
  };

  const submit = (values: ProductFormValues) => {
    if (!image) {
      setImageError(t('admin.inventory.imageRequired', 'الصورة مطلوبة'));
      return;
    }
    const base: ProductItem =
      product ??
      ({
        id: generateId(),
        name: '',
        slug: '',
        category: 'scooter',
        subCategory: '',
        price: 0,
        image: '',
        images: [],
        colors: [],
        images360: [],
        description: '',
        specifications: {},
        inStock: true,
        isNew: false,
      } satisfies ProductItem);

    const merged: ProductItem = {
      ...base,
      name: values.name.trim(),
      slug: slugify(values.name),
      category: values.category,
      subCategory: values.subCategory.trim(),
      price: values.price,
      image,
      description: values.description.trim(),
      capacity: values.capacity,
      power: values.specifications.power,
      speed: values.specifications.maxSpeed,
      cooling: values.specifications.cooling,
      // The form now collects every real field the product detail page can render, so this is a
      // straight overlay — `...base.specifications` still guards any field somehow not covered
      // (e.g. legacy `brakes`) from being lost.
      specifications: {
        ...base.specifications,
        ...values.specifications,
      },
      images: Array.from(new Set([image, ...galleryImages])),
      images360: images360List,
      videoUrl: values.videoUrl?.trim() || undefined,
      catalogPdf: values.catalogPdf?.trim() || undefined,
      inStock,
      isNew,
    };
    onSave(merged);
  };

  return (
    <ActionModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? t('admin.inventory.modalEditTitle', 'تعديل الموديل') : t('admin.inventory.modalAddTitle', 'إضافة موديل جديد')}
      subtitle={isEdit ? product?.name : t('admin.inventory.modalAddSubtitle', 'إضافة موديل سكوتر أو دراجة نارية جديد للمخزون')}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-5" dir="rtl">
        {/* Image */}
        <div>
          <label className="block text-[11px] font-extrabold text-slate-400 mb-1.5">
            {t('admin.inventory.imageLabel', 'صورة الموديل')} <span className="text-[#E11D48]">*</span>
          </label>
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt={t('admin.inventory.imagePreviewAlt', 'معاينة الصورة')} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImagePlus className="w-6 h-6 text-slate-600" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {isUploading ? t('admin.inventory.uploading', 'جاري الرفع...') : t('admin.inventory.uploadNewImage', 'رفع صورة جديدة')}
              </button>
              {imageError && <p className="mt-1.5 text-[11px] font-bold text-[#E11D48]">{imageError}</p>}
            </div>
          </div>

          <p className="mt-3 mb-1.5 text-[10px] font-bold text-slate-500">{t('admin.inventory.chooseFromCatalog', 'أو اختر من صور المنتجات الحقيقية')}</p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {PRESET_IMAGES.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => {
                  setImage(src);
                  setImageError('');
                }}
                className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                  image === src ? 'border-[#E11D48]' : 'border-white/10 hover:border-white/30'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Gallery / color variant photos — each one becomes a clickable color swatch on the real product page */}
        <div>
          <label className="block text-[11px] font-extrabold text-slate-400 mb-1.5">
            {t('admin.inventory.galleryLabel', 'صور الألوان الإضافية (معرض الصور)')}
          </label>
          <p className="text-[10px] text-slate-500 mb-2">
            {t('admin.inventory.galleryHint', 'كل صورة تظهر كلون قابل للاختيار في صفحة المنتج — الصورة الرئيسية أعلاه محسوبة تلقائياً كأول لون')}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {galleryImages.map((src) => (
              <div key={src} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10 bg-white/5 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(src)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
            <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryFileChange} />
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={isUploadingGallery}
              className="w-16 h-16 rounded-lg border-2 border-dashed border-white/15 hover:border-white/30 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50"
            >
              {isUploadingGallery ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Name + slug preview */}
        <div>
          <TextField
            label={t('admin.inventory.nameLabel', 'اسم الموديل')}
            required
            placeholder={t('admin.inventory.namePlaceholder', 'مثال: CRUiSYM 400')}
            error={errors.name?.message}
            {...register('name')}
          />
          <p className="mt-1.5 text-[10px] text-slate-500">
            {t('admin.inventory.permalinkLabel', 'الرابط الدائم:')} <span className="text-slate-400 font-mono">/{slugPreview}</span>
          </p>
        </div>

        {/* Category / sub-category / price / capacity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label={t('admin.inventory.categoryLabel', 'الفئة')}
            required
            options={categoryOptions}
            error={errors.category?.message}
            {...register('category')}
          />
          <SelectField
            label={t('admin.inventory.subCategoryLabel', 'الفئة الفرعية')}
            required
            options={subCategoryOptions}
            error={errors.subCategory?.message}
            {...register('subCategory')}
          />
          <TextField
            label={t('admin.inventory.priceLabel', 'السعر (ج.م)')}
            type="number"
            step="1"
            required
            error={errors.price?.message}
            {...register('price', { valueAsNumber: true })}
          />
          <SelectField
            label={t('admin.inventory.capacityLabel', 'سعة المحرك')}
            required
            options={capacityOptions}
            error={errors.capacity?.message}
            {...register('capacity')}
          />
        </div>

        {/* Description */}
        <TextareaField
          label={t('admin.inventory.descriptionLabel', 'الوصف')}
          required
          rows={3}
          error={errors.description?.message}
          {...register('description')}
        />

        {/* Toggles */}
        <div className="flex items-center gap-3">
          <ToggleField
            label={t('admin.inventory.toggleInStock', 'متوفر بالمخزون')}
            checked={inStock}
            onChange={setInStock}
            icon={PackageCheck}
          />
          <ToggleField label={t('admin.inventory.toggleNew', 'موديل جديد')} checked={isNew} onChange={setIsNew} icon={Sparkles} />
        </div>

        {/* 360° rotation images */}
        <div>
          <label className="block text-[11px] font-extrabold text-slate-400 mb-1.5 flex items-center gap-1.5">
            <RotateCw className="w-3.5 h-3.5" /> {t('admin.inventory.images360Label', 'صور اللف 360 درجة (حتى 8 صور)')}
          </label>
          <p className="text-[10px] text-slate-500 mb-2">
            {t('admin.inventory.images360Hint', 'ارفع الصور بالترتيب بدءاً من الأمام مروراً بكل الزوايا — كل صورة تمثل زاوية دوران واحدة')}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {images360List.map((src, idx) => (
              <div key={src} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10 bg-white/5 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-center text-slate-300 py-0.5">
                  {ANGLE_360_LABELS[idx] ?? idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeImage360(idx)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
            {images360List.length < 8 && (
              <>
                <input ref={angle360InputRef} type="file" accept="image/*" className="hidden" onChange={handle360FileChange} />
                <button
                  type="button"
                  onClick={() => angle360InputRef.current?.click()}
                  disabled={isUploading360}
                  className="w-16 h-16 rounded-lg border-2 border-dashed border-white/15 hover:border-white/30 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50"
                >
                  {isUploading360 ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Video + catalog links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label={t('admin.inventory.videoUrlLabel', 'رابط الفيديو الترويجي (TVCF)')}
            dir="ltr"
            icon={Video}
            placeholder="https://youtube.com/..."
            error={errors.videoUrl?.message}
            {...register('videoUrl')}
          />
          <TextField
            label={t('admin.inventory.catalogPdfLabel', 'رابط ملف الكتالوج (PDF)')}
            dir="ltr"
            icon={Link2}
            placeholder="https://.../catalog.pdf"
            error={errors.catalogPdf?.message}
            {...register('catalogPdf')}
          />
        </div>

        {/* Specifications — grouped exactly like the real product page's own sections */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <button type="button" onClick={() => setSpecsOpen((v) => !v)} className="w-full flex items-center justify-between">
            <span className="text-xs font-extrabold text-white">{t('admin.inventory.specsTitle', 'المواصفات التفصيلية')}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${specsOpen ? 'rotate-180' : ''}`} />
          </button>
          {specsOpen && (
            <div className="mt-4 space-y-5">
              <SpecGroup titleKey="admin.inventory.specGroupChassis" titleFallback="الهيكل والأبعاد" t={t}>
                {CHASSIS_SPEC_FIELDS.map((f) => (
                  <TextField key={f.key} label={t(f.labelKey, f.labelFallback)} placeholder={f.placeholder} {...register(`specifications.${f.key}`)} />
                ))}
              </SpecGroup>
              <SpecGroup titleKey="admin.inventory.specGroupEngine" titleFallback="المحرك" t={t}>
                {ENGINE_SPEC_FIELDS.map((f) => (
                  <TextField key={f.key} label={t(f.labelKey, f.labelFallback)} placeholder={f.placeholder} {...register(`specifications.${f.key}`)} />
                ))}
              </SpecGroup>
              <SpecGroup titleKey="admin.inventory.specGroupElectrical" titleFallback="الكهرباء والإضاءة" t={t}>
                {ELECTRICAL_SPEC_FIELDS.map((f) => (
                  <TextField key={f.key} label={t(f.labelKey, f.labelFallback)} placeholder={f.placeholder} {...register(`specifications.${f.key}`)} />
                ))}
              </SpecGroup>
            </div>
          )}
        </div>

        {saveError && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#E11D48]/10 border border-[#E11D48]/30 text-[#E11D48] text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {saveError}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 text-xs font-bold hover:bg-white/5 transition-colors"
          >
            {t('admin.inventory.cancelButton', 'إلغاء')}
          </button>
          <button
            type="submit"
            disabled={isSaving || isUploading}
            className="flex-1 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-extrabold transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isEdit ? t('admin.inventory.saveEdit', 'حفظ التعديلات') : t('admin.inventory.saveAdd', 'إضافة الموديل')}
          </button>
        </div>
      </form>
    </ActionModal>
  );
}

// ---------- Read-only product preview ----------

// Derived from the same ALL_SPEC_FIELDS list the edit form uses, plus the one legacy field
// (`brakes`) that isn't form-editable but may still exist on older records.
const SPEC_LABELS: Record<keyof ProductSpecifications, string> = {
  ...(Object.fromEntries(ALL_SPEC_FIELDS.map((f) => [f.key, f.labelFallback])) as Record<
    keyof z.infer<typeof specificationsSchema>,
    string
  >),
  brakes: 'الفرامل',
};

/** Translation keys parallel to SPEC_LABELS, used since SPEC_LABELS is module-scope and can't call t() directly. */
const SPEC_LABEL_KEYS: Record<keyof ProductSpecifications, string> = {
  ...(Object.fromEntries(ALL_SPEC_FIELDS.map((f) => [f.key, f.labelKey])) as Record<
    keyof z.infer<typeof specificationsSchema>,
    string
  >),
  brakes: 'admin.inventory.spec.brakes',
};

interface ProductViewDrawerProps {
  product: ProductItem | null;
  onClose: () => void;
  onEdit: (product: ProductItem) => void;
}

function ProductViewDrawer({ product, onClose, onEdit }: ProductViewDrawerProps) {
  const { t } = useLanguage();
  const specEntries = product
    ? (Object.keys(SPEC_LABELS) as (keyof ProductSpecifications)[])
        .map((key) => [key, product.specifications?.[key]] as const)
        .filter(([, value]) => Boolean(value && String(value).trim()))
    : [];

  const gallery = product ? Array.from(new Set([product.image, ...(product.images ?? [])].filter(Boolean))) : [];

  return (
    <Drawer
      isOpen={product !== null}
      onClose={onClose}
      title={t('admin.inventory.viewDrawerTitle', 'عرض المنتج')}
      side="end"
      widthClass="w-full sm:w-[28rem]"
    >
      {product && (
        <div className="p-4 space-y-5" dir="rtl">
          <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10 aspect-square flex items-center justify-center">
            {product.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
            ) : (
              <Package className="w-10 h-10 text-slate-600" />
            )}
          </div>

          {gallery.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {gallery.map((src) => (
                <div key={src} className="w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-black text-white">{product.name}</h3>
              {product.isNew && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E11D48]/10 border border-[#E11D48]/30 text-[#E11D48] text-[10px] font-extrabold">
                  <Sparkles className="w-3 h-3" /> {t('admin.inventory.newBadge', 'جديد')}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5" dir="ltr">
              {product.slug}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-[10px] font-bold text-slate-500 mb-1">{t('admin.inventory.priceLabelSimple', 'السعر')}</p>
              <p className="text-sm font-black text-white tabular-nums">
                {product.price.toLocaleString('en-US')} {t('admin.inventory.currency', 'ج.م')}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-[10px] font-bold text-slate-500 mb-1">{t('admin.inventory.stockLabel', 'المخزون')}</p>
              <StatusBadge
                status={product.inStock ? 'inStock' : 'outOfStock'}
                label={product.inStock ? t('admin.inventory.stockAvailable', 'متوفر') : t('admin.inventory.stockUnavailable', 'غير متوفر')}
              />
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-[10px] font-bold text-slate-500 mb-1">{t('admin.inventory.categoryLabel', 'الفئة')}</p>
              <p className="text-xs font-bold text-slate-200">
                {product.category === 'bike'
                  ? t('admin.inventory.categoryBike', 'دراجة نارية')
                  : t('admin.inventory.categoryScooter', 'سكوتر')}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-[10px] font-bold text-slate-500 mb-1">{t('admin.inventory.subCategoryLabel', 'الفئة الفرعية')}</p>
              <p className="text-xs font-bold text-slate-200">{product.subCategory || '—'}</p>
            </div>
          </div>

          {product.description && (
            <div>
              <p className="text-[11px] font-extrabold text-slate-400 mb-1.5">{t('admin.inventory.descriptionLabel', 'الوصف')}</p>
              <p className="text-xs text-slate-300 leading-relaxed">{product.description}</p>
            </div>
          )}

          {product.colors && product.colors.length > 0 && (
            <div>
              <p className="text-[11px] font-extrabold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" /> {t('admin.inventory.availableColors', 'الألوان المتاحة')}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {product.colors.map((c) => (
                  <span key={c} className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: c }} title={c} />
                ))}
              </div>
            </div>
          )}

          {specEntries.length > 0 && (
            <div>
              <p className="text-[11px] font-extrabold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5" /> {t('admin.inventory.specsTitle', 'المواصفات التفصيلية')}
              </p>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] divide-y divide-white/5">
                {specEntries.map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between px-3.5 py-2 text-xs">
                    <span className="text-slate-500">{t(SPEC_LABEL_KEYS[key], SPEC_LABELS[key])}</span>
                    <span className="font-bold text-slate-200">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(product.catalogPdf || product.videoUrl) && (
            <div className="flex items-center gap-2">
              {product.catalogPdf && (
                <a
                  href={product.catalogPdf}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border border-white/10 text-slate-300 text-xs font-bold hover:bg-white/5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" /> {t('admin.inventory.catalogLink', 'الكتالوج')}
                </a>
              )}
              {product.videoUrl && (
                <a
                  href={product.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border border-white/10 text-slate-300 text-xs font-bold hover:bg-white/5 transition-colors"
                >
                  <Video className="w-3.5 h-3.5" /> {t('admin.inventory.videoLink', 'الفيديو')}
                </a>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => onEdit(product)}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-extrabold transition-colors"
          >
            <Pencil className="w-4 h-4" /> {t('admin.inventory.editThisModel', 'تعديل هذا الموديل')}
          </button>
        </div>
      )}
    </Drawer>
  );
}

// ---------- Page ----------

export default function InventoryPage() {
  const { t } = useLanguage();
  const { isOffline, setOffline } = useAdmin();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ProductItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [viewTarget, setViewTarget] = useState<ProductItem | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth('/api/products')
        .then((r) => r.json())
        .catch(() => null);
      const ok = res?.success && Array.isArray(res.data);
      // Offline mode reflects genuine unreachability (res === null), not a reached-but-rejected response.
      setOffline(res === null);
      if (ok) {
        setProducts((res.data as RawApiProduct[]).map(mapApiProduct));
      } else {
        setProducts(CATALOG_PRODUCTS.map(mapCatalogProduct));
      }
    } finally {
      setIsLoading(false);
    }
  }, [setOffline]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, search]);

  const stats = useMemo(
    () => ({
      total: products.length,
      inStock: products.filter((p) => p.inStock).length,
      outOfStock: products.filter((p) => !p.inStock).length,
      isNew: products.filter((p) => p.isNew).length,
    }),
    [products]
  );

  const openAddModal = () => {
    setEditingProduct(null);
    setSaveError(null);
    setModalOpen(true);
  };

  const openEditModal = (product: ProductItem) => {
    setEditingProduct(product);
    setSaveError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setModalOpen(false);
  };

  const upsertLocal = useCallback((item: ProductItem) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === item.id);
      return exists ? prev.map((p) => (p.id === item.id ? item : p)) : [item, ...prev];
    });
  }, []);

  const handleSave = async (item: ProductItem) => {
    setSaveError(null);
    if (isOffline) {
      upsertLocal(item);
      setModalOpen(false);
      return;
    }
    setIsSaving(true);
    try {
      const isEdit = editingProduct !== null;
      const res = await fetchWithAuth('/api/products', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      })
        .then((r) => r.json())
        .catch(() => null);

      if (res?.success) {
        upsertLocal(item);
        setModalOpen(false);
      } else {
        setSaveError(
          res?.error || res?.message || t('admin.inventory.saveErrorFallback', 'تعذر حفظ الموديل، يرجى المحاولة مرة أخرى')
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;
    if (isOffline) {
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetchWithAuth(`/api/products?id=${encodeURIComponent(deleteTarget.id)}`, {
        method: 'DELETE',
      })
        .then((r) => r.json())
        .catch(() => null);
      if (res?.success) {
        setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: DataTableColumn<ProductItem>[] = [
    {
      key: 'thumbnail',
      header: '',
      className: 'w-14',
      render: (p) => (
        <div className="w-11 h-11 rounded-lg overflow-hidden bg-white/5 border border-white/10 shrink-0">
          {p.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-4 h-4 text-slate-600" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      header: t('admin.inventory.colModel', 'الموديل'),
      render: (p) => (
        <div className="min-w-0 max-w-[220px]">
          <p className="font-bold text-white truncate">{p.name}</p>
          <p className="text-[11px] text-slate-500 truncate">{p.slug}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: t('admin.inventory.categoryLabel', 'الفئة'),
      hideOnMobile: true,
      render: (p) => (
        <div className="text-xs text-slate-300">
          <span className="font-bold">
            {p.category === 'bike' ? t('admin.inventory.categoryBike', 'دراجة نارية') : t('admin.inventory.categoryScooter', 'سكوتر')}
          </span>
          {p.subCategory && <span className="block text-[11px] text-slate-500 mt-0.5">{p.subCategory}</span>}
        </div>
      ),
    },
    {
      key: 'price',
      header: t('admin.inventory.priceLabelSimple', 'السعر'),
      render: (p) => (
        <span className="font-bold text-white tabular-nums">
          {p.price.toLocaleString('en-US')} {t('admin.inventory.currency', 'ج.م')}
        </span>
      ),
    },
    {
      key: 'stock',
      header: t('admin.inventory.stockLabel', 'المخزون'),
      render: (p) => (
        <StatusBadge
          status={p.inStock ? 'inStock' : 'outOfStock'}
          label={p.inStock ? t('admin.inventory.stockAvailable', 'متوفر') : t('admin.inventory.stockUnavailable', 'غير متوفر')}
        />
      ),
    },
    {
      key: 'isNew',
      header: t('admin.inventory.colNew', 'جديد؟'),
      hideOnMobile: true,
      render: (p) =>
        p.isNew ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E11D48]/10 border border-[#E11D48]/30 text-[#E11D48] text-[10px] font-extrabold whitespace-nowrap">
            <Sparkles className="w-3 h-3" /> {t('admin.inventory.newBadge', 'جديد')}
          </span>
        ) : (
          <span className="text-slate-600 text-xs">—</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-left',
      render: (p) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setViewTarget(p);
            }}
            title={t('admin.inventory.viewTooltip', 'عرض')}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(p);
            }}
            title={t('admin.inventory.editTooltip', 'تعديل')}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(p);
            }}
            title={t('admin.inventory.deleteTooltip', 'حذف')}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#E11D48] hover:bg-[#E11D48]/10 transition-colors"
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
        title={t('admin.inventory.pageTitle', 'المخزون والموديلات')}
        subtitle={t('admin.inventory.pageSubtitle', 'إدارة موديلات السكوتر والدراجات النارية')}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('admin.inventory.searchPlaceholder', 'ابحث باسم الموديل...')}
        actions={
          <button
            type="button"
            onClick={openAddModal}
            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-extrabold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('admin.inventory.addModel', 'إضافة موديل')}</span>
          </button>
        }
      />

      <div className="p-4 md:p-6 space-y-6">
        <div className="relative sm:hidden">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.inventory.searchPlaceholder', 'ابحث باسم الموديل...')}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#E11D48]/60"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t('admin.inventory.statTotal', 'إجمالي الموديلات')}
            value={stats.total}
            icon={Package}
            accent="rose"
            isLoading={isLoading}
          />
          <StatCard
            title={t('admin.inventory.statInStock', 'متوفر بالمخزون')}
            value={stats.inStock}
            icon={PackageCheck}
            accent="emerald"
            isLoading={isLoading}
          />
          <StatCard
            title={t('admin.inventory.statOutOfStock', 'غير متوفر')}
            value={stats.outOfStock}
            icon={PackageX}
            accent="amber"
            isLoading={isLoading}
          />
          <StatCard
            title={t('admin.inventory.statNewModels', 'موديلات جديدة')}
            value={stats.isNew}
            icon={Sparkles}
            accent="violet"
            isLoading={isLoading}
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredProducts}
          keyExtractor={(p) => p.id}
          isLoading={isLoading}
          onRowClick={(p) => setViewTarget(p)}
          emptyMessage={t('admin.inventory.emptyMessage', 'لا توجد موديلات مطابقة للبحث')}
        />
      </div>

      <ProductFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        product={editingProduct}
        onSave={handleSave}
        isSaving={isSaving}
        saveError={saveError}
      />

      <ProductViewDrawer
        product={viewTarget}
        onClose={() => setViewTarget(null)}
        onEdit={(p) => {
          setViewTarget(null);
          openEditModal(p);
        }}
      />

      <ActionModal
        isOpen={deleteTarget !== null}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        title={t('admin.inventory.deleteModalTitle', 'حذف الموديل')}
        subtitle={deleteTarget?.name}
        maxWidth="sm"
      >
        <div className="space-y-4" dir="rtl">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#E11D48]/10 border border-[#E11D48]/30">
            <AlertTriangle className="w-5 h-5 text-[#E11D48] shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              {t('admin.inventory.deleteConfirmText', 'هل أنت متأكد من حذف هذا الموديل نهائيًا؟ لا يمكن التراجع عن هذا الإجراء.')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setDeleteTarget(null)}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 text-xs font-bold hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              {t('admin.inventory.cancelButton', 'إلغاء')}
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteConfirmed}
              className="flex-1 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-extrabold transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {t('admin.inventory.deleteConfirmButton', 'حذف نهائي')}
            </button>
          </div>
        </div>
      </ActionModal>
    </div>
  );
}
