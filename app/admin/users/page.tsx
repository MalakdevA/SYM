'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Users,
  UserCheck,
  ShieldCheck,
  UserCog,
  Plus,
  Pencil,
  Trash2,
  Ban,
  CheckCircle2,
  Loader2,
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
import type { AdminUserItem, AdminRole } from '@/types/admin';

// The platform's core Super Admin record — protected from deletion/deactivation in this UI.
const PROTECTED_ID = 'adm-101';

const MOCK_USERS: AdminUserItem[] = [
  { id: 'adm-101', name: 'محمد السيد', email: 'admin@symegypt.com', phone: '01000000001', role: 'Super Admin', status: 'active', showroom: 'الإدارة المركزية', last_login: '2026-08-24 08:15' },
  { id: 'adm-102', name: 'سارة عبد الرحمن', email: 'sara.abdelrahman@symegypt.com', phone: '01123456780', role: 'Sales Manager', status: 'active', showroom: 'فرع مدينة نصر', last_login: '2026-08-23 17:40' },
  { id: 'adm-103', name: 'كريم فتحي', email: 'karim.fathy@symegypt.com', phone: '01234567891', role: 'Content Editor', status: 'active', showroom: 'الإدارة المركزية', last_login: '2026-08-22 12:05' },
  { id: 'adm-104', name: 'نور الهدى حسن', email: 'nour.hassan@symegypt.com', phone: '01098765432', role: 'Support Staff', status: 'inactive', showroom: 'فرع الشيخ زايد', last_login: '2026-08-10 09:22' },
  { id: 'adm-105', name: 'عمرو خالد', email: 'amr.khaled@symegypt.com', phone: '01187654321', role: 'Finance Admin', status: 'active', showroom: 'الإدارة المركزية', last_login: '2026-08-24 07:50' },
];

const ROLE_OPTIONS: { value: AdminRole; label: string }[] = [
  { value: 'Super Admin', label: 'مدير عام' },
  { value: 'Sales Manager', label: 'مدير مبيعات' },
  { value: 'Content Editor', label: 'محرر محتوى' },
  { value: 'Support Staff', label: 'فريق الدعم' },
  { value: 'Finance Admin', label: 'مدير مالي' },
];

const ROLE_VALUES = ROLE_OPTIONS.map((r) => r.value) as [AdminRole, ...AdminRole[]];

const ROLE_LABELS: Record<AdminRole, string> = ROLE_OPTIONS.reduce(
  (acc, r) => ({ ...acc, [r.value]: r.label }),
  {} as Record<AdminRole, string>
);

// i18n keys for the Arabic display labels above — the underlying AdminRole `value`
// itself is never translated (it's the real backend value).
const ROLE_LABEL_KEYS: Record<AdminRole, string> = {
  'Super Admin': 'admin.users.roleSuperAdmin',
  'Sales Manager': 'admin.users.roleSalesManager',
  'Content Editor': 'admin.users.roleContentEditor',
  'Support Staff': 'admin.users.roleSupportStaff',
  'Finance Admin': 'admin.users.roleFinanceAdmin',
};

const ROLE_TONE: Record<AdminRole, 'emerald' | 'rose' | 'amber' | 'slate' | 'sky'> = {
  'Super Admin': 'rose',
  'Sales Manager': 'sky',
  'Content Editor': 'amber',
  'Support Staff': 'slate',
  'Finance Admin': 'emerald',
};

const STATUS_OPTIONS: { value: 'active' | 'inactive'; label: string }[] = [
  { value: 'active', label: 'نشط' },
  { value: 'inactive', label: 'غير نشط' },
];

const STATUS_LABELS: Record<'active' | 'inactive', string> = STATUS_OPTIONS.reduce(
  (acc, s) => ({ ...acc, [s.value]: s.label }),
  {} as Record<'active' | 'inactive', string>
);

const STATUS_LABEL_KEYS: Record<'active' | 'inactive', string> = {
  active: 'admin.users.statusActive',
  inactive: 'admin.users.statusInactive',
};

const userFormSchema = z.object({
  name: z.string().trim().min(2, 'الاسم يجب ألا يقل عن حرفين'),
  email: z.string().trim().min(1, 'البريد الإلكتروني مطلوب').email('بريد إلكتروني غير صالح'),
  phone: z.string().trim().min(8, 'رقم هاتف غير صالح').max(20, 'رقم هاتف غير صالح'),
  role: z.enum(ROLE_VALUES),
  showroom: z.string().trim().optional(),
  status: z.enum(['active', 'inactive']),
  password: z.string().optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

const DEFAULT_FORM_VALUES: UserFormValues = {
  name: '',
  email: '',
  phone: '',
  role: 'Sales Manager',
  showroom: '',
  status: 'active',
  password: '',
};

export default function AdminUsersPage() {
  const { t } = useLanguage();
  const { isOffline, setOffline } = useAdmin();
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deletingUser, setDeletingUser] = useState<AdminUserItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const json = await fetchWithAuth('/api/admin-users')
        .then((r) => r.json())
        .catch(() => null);

      const list = json?.data;
      const ok = json?.success && Array.isArray(list);

      // Offline mode reflects genuine unreachability (json === null), not a reached-but-rejected response.
      setOffline(json === null);
      setUsers(ok ? list : MOCK_USERS);
    } finally {
      setIsLoading(false);
    }
  }, [setOffline]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, search]);

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.status === 'active').length,
      superAdmins: users.filter((u) => u.role === 'Super Admin').length,
      salesManagers: users.filter((u) => u.role === 'Sales Manager').length,
    }),
    [users]
  );

  function openAddModal() {
    setEditingUser(null);
    reset(DEFAULT_FORM_VALUES);
    setIsModalOpen(true);
  }

  function openEditModal(user: AdminUserItem) {
    setEditingUser(user);
    reset({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      showroom: user.showroom ?? '',
      status: user.status,
      password: '',
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingUser(null);
    reset(DEFAULT_FORM_VALUES);
  }

  async function onSubmit(values: UserFormValues) {
    const trimmedPassword = (values.password ?? '').trim();

    if (!editingUser && !trimmedPassword) {
      setError('password', { message: 'كلمة المرور مطلوبة عند إضافة مدير جديد' });
      return;
    }
    if (trimmedPassword && trimmedPassword.length < 8) {
      setError('password', { message: 'كلمة المرور يجب ألا تقل عن 8 أحرف' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        role: values.role,
        showroom: (values.showroom ?? '').trim(),
        status: values.status,
      };
      if (trimmedPassword) payload.password = trimmedPassword;
      if (editingUser) payload.id = editingUser.id;

      if (isOffline) {
        if (editingUser) {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === editingUser.id
                ? { ...u, name: payload.name as string, email: payload.email as string, phone: payload.phone as string, role: payload.role as AdminRole, showroom: payload.showroom as string, status: payload.status as 'active' | 'inactive' }
                : u
            )
          );
        } else {
          const newUser: AdminUserItem = {
            id: `adm-${Date.now()}`,
            name: payload.name as string,
            email: payload.email as string,
            phone: payload.phone as string,
            role: payload.role as AdminRole,
            showroom: payload.showroom as string,
            status: payload.status as 'active' | 'inactive',
            last_login: undefined,
          };
          setUsers((prev) => [newUser, ...prev]);
        }
        closeModal();
        return;
      }

      const res = await fetchWithAuth('/api/admin-users', {
        method: editingUser ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((r) => r.json())
        .catch(() => null);

      if (res?.success) {
        await load();
        closeModal();
      } else {
        setError('root', { message: res?.error || 'حدث خطأ أثناء حفظ البيانات' });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleStatus(user: AdminUserItem) {
    if (user.id === PROTECTED_ID && user.status === 'active') return;
    const nextStatus: 'active' | 'inactive' = user.status === 'active' ? 'inactive' : 'active';

    if (isOffline) {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u)));
      return;
    }

    const res = await fetchWithAuth('/api/admin-users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, status: nextStatus }),
    })
      .then((r) => r.json())
      .catch(() => null);

    if (res?.success) {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u)));
    }
  }

  async function confirmDelete() {
    if (!deletingUser || deletingUser.id === PROTECTED_ID) return;
    setIsDeleting(true);
    try {
      if (isOffline) {
        setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
        setDeletingUser(null);
        return;
      }

      const res = await fetchWithAuth(`/api/admin-users?id=${encodeURIComponent(deletingUser.id)}`, {
        method: 'DELETE',
      })
        .then((r) => r.json())
        .catch(() => null);

      if (res?.success) {
        setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
        setDeletingUser(null);
      }
    } finally {
      setIsDeleting(false);
    }
  }

  const roleLabel = (role: AdminRole) => t(ROLE_LABEL_KEYS[role], ROLE_LABELS[role]);
  const statusLabel = (status: 'active' | 'inactive') => t(STATUS_LABEL_KEYS[status], STATUS_LABELS[status]);
  const roleOptions = ROLE_OPTIONS.map((r) => ({ value: r.value, label: roleLabel(r.value) }));
  const statusOptions = STATUS_OPTIONS.map((s) => ({ value: s.value, label: statusLabel(s.value) }));

  const columns: DataTableColumn<AdminUserItem>[] = [
    {
      key: 'name',
      header: t('admin.users.colName', 'الاسم'),
      render: (u) => (
        <div className="min-w-0">
          <p className="font-bold text-white truncate">{u.name}</p>
          <p className="text-[11px] text-slate-500 truncate sm:hidden">{u.email}</p>
        </div>
      ),
    },
    { key: 'email', header: t('admin.users.colEmail', 'البريد الإلكتروني'), render: (u) => <span className="text-slate-300">{u.email}</span>, hideOnMobile: true },
    {
      key: 'role',
      header: t('admin.users.colRole', 'الصلاحية'),
      render: (u) => <StatusBadge status={u.role} label={roleLabel(u.role)} tone={ROLE_TONE[u.role]} />,
    },
    { key: 'showroom', header: t('admin.users.colShowroom', 'المعرض / الفرع'), render: (u) => <span className="text-slate-300">{u.showroom || '—'}</span>, hideOnMobile: true },
    {
      key: 'status',
      header: t('admin.users.colStatus', 'الحالة'),
      render: (u) => <StatusBadge status={u.status} label={statusLabel(u.status)} />,
    },
    {
      key: 'last_login',
      header: t('admin.users.colLastLogin', 'آخر دخول'),
      render: (u) => <span className="text-slate-400 text-xs">{u.last_login || '—'}</span>,
      hideOnMobile: true,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-left',
      render: (u) => {
        const isProtected = u.id === PROTECTED_ID;
        const disableDeactivate = isProtected && u.status === 'active';
        return (
          <div className="flex items-center gap-1.5 justify-end">
            <button
              type="button"
              onClick={() => openEditModal(u)}
              title={t('admin.users.actionEdit', 'تعديل')}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => !disableDeactivate && handleToggleStatus(u)}
              disabled={disableDeactivate}
              title={
                disableDeactivate
                  ? t('admin.users.protectedDeactivateMsg', 'لا يمكن إلغاء تفعيل حساب المدير العام الأساسي للمنصة')
                  : u.status === 'active'
                  ? t('admin.users.actionDeactivate', 'إلغاء التفعيل')
                  : t('admin.users.actionActivate', 'تفعيل')
              }
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                disableDeactivate
                  ? 'text-slate-700 cursor-not-allowed'
                  : u.status === 'active'
                  ? 'text-amber-400 hover:bg-amber-500/10'
                  : 'text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              {u.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => !isProtected && setDeletingUser(u)}
              disabled={isProtected}
              title={isProtected ? t('admin.users.protectedDeleteMsg', 'لا يمكن حذف حساب المدير العام الأساسي للمنصة') : t('admin.users.actionDelete', 'حذف')}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isProtected ? 'text-slate-700 cursor-not-allowed' : 'text-[#E11D48] hover:bg-[#E11D48]/10'
              }`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <AdminHeader
        title={t('admin.users.pageTitle', 'مديرو النظام')}
        subtitle={t('admin.users.pageSubtitle', 'إدارة حسابات وصلاحيات مديري لوحة التحكم')}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('admin.users.searchPlaceholder', 'بحث بالاسم أو البريد الإلكتروني...')}
        actions={
          <button
            type="button"
            onClick={openAddModal}
            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E11D48] text-white text-xs font-bold hover:bg-[#c11340] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('admin.users.addButton', 'إضافة مدير جديد')}</span>
          </button>
        }
      />

      <div className="p-4 md:p-6 space-y-6">
        <div className="relative sm:hidden">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.users.searchPlaceholder', 'بحث بالاسم أو البريد الإلكتروني...')}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#E11D48]/60"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title={t('admin.users.statTotal', 'إجمالي المديرين')} value={stats.total} icon={Users} accent="rose" isLoading={isLoading} />
          <StatCard title={t('admin.users.statActive', 'حسابات نشطة')} value={stats.active} icon={UserCheck} accent="emerald" isLoading={isLoading} />
          <StatCard title={t('admin.users.statSuperAdmins', 'مديرون عامون')} value={stats.superAdmins} icon={ShieldCheck} accent="violet" isLoading={isLoading} />
          <StatCard title={t('admin.users.statSalesManagers', 'مديرو المبيعات')} value={stats.salesManagers} icon={UserCog} accent="amber" isLoading={isLoading} />
        </div>

        <DataTable
          columns={columns}
          data={filteredUsers}
          keyExtractor={(u) => u.id}
          isLoading={isLoading}
          emptyMessage={t('admin.users.emptyMessage', 'لا يوجد مديرون مطابقون للبحث')}
        />
      </div>

      <ActionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingUser ? t('admin.users.modalEditTitle', 'تعديل بيانات المدير') : t('admin.users.addButton', 'إضافة مدير جديد')}
        subtitle={editingUser ? editingUser.email : t('admin.users.modalAddSubtitle', 'أدخل بيانات حساب المدير الجديد')}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label={t('admin.users.fieldNameLabel', 'الاسم الكامل')} required placeholder={t('admin.users.namePlaceholder', 'مثال: أحمد محمود')} error={errors.name?.message} {...register('name')} />
            <TextField label={t('admin.users.colEmail', 'البريد الإلكتروني')} type="email" required placeholder="admin@symegypt.com" error={errors.email?.message} {...register('email')} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label={t('admin.users.fieldPhoneLabel', 'رقم الهاتف')} required placeholder="01000000000" error={errors.phone?.message} {...register('phone')} />
            <SelectField label={t('admin.users.colRole', 'الصلاحية')} required options={roleOptions} error={errors.role?.message} {...register('role')} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label={t('admin.users.colShowroom', 'المعرض / الفرع')} placeholder={t('admin.users.showroomPlaceholder', 'فرع مدينة نصر')} error={errors.showroom?.message} {...register('showroom')} />
            <SelectField label={t('admin.users.colStatus', 'الحالة')} required options={statusOptions} error={errors.status?.message} {...register('status')} />
          </div>
          <TextField
            label={t('admin.users.passwordLabel', 'كلمة المرور')}
            type="password"
            required={!editingUser}
            placeholder={editingUser ? t('admin.users.passwordHint', 'اتركه فارغاً لعدم التغيير') : '••••••••'}
            error={errors.password?.message}
            {...register('password')}
          />

          {errors.root?.message && (
            <p className="text-xs font-bold text-[#E11D48] bg-[#E11D48]/10 border border-[#E11D48]/30 rounded-xl px-3 py-2">
              {errors.root.message}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#E11D48] text-white text-sm font-bold hover:bg-[#c11340] transition-colors disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingUser ? t('admin.users.saveEdits', 'حفظ التعديلات') : t('admin.users.addManager', 'إضافة المدير')}
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 text-sm font-bold hover:bg-white/10 transition-colors"
            >
              {t('admin.users.cancelButton', 'إلغاء')}
            </button>
          </div>
        </form>
      </ActionModal>

      <ActionModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        title={t('admin.users.deleteConfirmTitle', 'تأكيد الحذف')}
        subtitle={deletingUser?.name}
        maxWidth="sm"
      >
        <div dir="rtl">
          <p className="text-sm text-slate-300">
            {t('admin.users.deleteConfirmPrefix', 'هل أنت متأكد من حذف حساب')} <span className="font-bold text-white">{deletingUser?.name}</span>
            {t('admin.users.deleteConfirmSuffix', '؟ لا يمكن التراجع عن هذا الإجراء.')}
          </p>
          <div className="flex items-center gap-3 mt-5">
            <button
              type="button"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#E11D48] text-white text-sm font-bold hover:bg-[#c11340] transition-colors disabled:opacity-60"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('admin.users.deletePermanently', 'حذف نهائياً')}
            </button>
            <button
              type="button"
              onClick={() => setDeletingUser(null)}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 text-sm font-bold hover:bg-white/10 transition-colors"
            >
              {t('admin.users.cancelButton', 'إلغاء')}
            </button>
          </div>
        </div>
      </ActionModal>
    </div>
  );
}
