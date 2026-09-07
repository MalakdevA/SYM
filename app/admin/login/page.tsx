'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ShieldCheck, WifiOff, Eye, EyeOff, Bike, Wrench, Store, Sparkles } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import type { AdminUser } from '@/lib/auth';

const LOGIN_ENDPOINTS = ['/api/auth/login.php', '/api/auth/login'];

type Translate = (key: string, fallback: string) => string;

function buildLoginSchema(t: Translate) {
  return z.object({
    email: z
      .string()
      .min(1, t('admin.login.emailRequired', 'البريد الإلكتروني مطلوب'))
      .email(t('admin.login.emailInvalid', 'صيغة البريد الإلكتروني غير صحيحة')),
    password: z.string().min(4, t('admin.login.passwordTooShort', 'كلمة المرور قصيرة جداً')),
  });
}

type LoginForm = z.infer<ReturnType<typeof buildLoginSchema>>;

/** Live real counts fetched from the public (unauthenticated) catalog endpoints — never hardcoded, never fabricated. */
function useLiveStats() {
  const [stats, setStats] = useState<{ products: number | null; parts: number | null; showrooms: number | null }>({
    products: null,
    parts: null,
    showrooms: null,
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [productsRes, partsRes, showroomsRes] = await Promise.all([
        fetch('/api/products/index.php').then((r) => r.json()).catch(() => null),
        fetch('/api/spare-parts/index.php').then((r) => r.json()).catch(() => null),
        fetch('/api/showrooms/index.php').then((r) => r.json()).catch(() => null),
      ]);
      if (cancelled) return;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStats({
        products: productsRes?.success && Array.isArray(productsRes.data) ? productsRes.data.length : null,
        parts: partsRes?.success && Array.isArray(partsRes.data) ? partsRes.data.length : null,
        showrooms: showroomsRes?.success && Array.isArray(showroomsRes.data) ? showroomsRes.data.length : null,
      });
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return stats;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, setOffline } = useAdmin();
  const { t } = useLanguage();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const stats = useLiveStats();

  const loginSchema = useMemo(() => buildLoginSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  type LoginAttempt = { status: 'success'; user: AdminUser } | { status: 'rejected' } | { status: 'unreachable' };

  // Reaching the real backend and getting a real "wrong email/password" answer must NEVER be
  // treated as a network failure — only a genuine unreachable backend (fetch throwing on every
  // endpoint) counts as that, and even then there is no client-side login fallback: a real
  // password check against the real backend is the only way in.
  async function attemptLogin(payload: LoginForm): Promise<LoginAttempt> {
    let reachedBackend = false;
    for (const endpoint of LOGIN_ENDPOINTS) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          if (res.status >= 400 && res.status < 500) reachedBackend = true;
          continue;
        }
        reachedBackend = true;
        const data = await res.json();
        if (data?.success && data?.data?.user) {
          return { status: 'success', user: data.data.user as AdminUser };
        }
        return { status: 'rejected' };
      } catch {
        continue;
      }
    }
    return reachedBackend ? { status: 'rejected' } : { status: 'unreachable' };
  }

  const onSubmit = async (values: LoginForm) => {
    setServerError('');
    const result = await attemptLogin(values);

    if (result.status === 'success') {
      setOffline(false);
      login(result.user);
      router.replace('/admin');
      return;
    }

    if (result.status === 'rejected') {
      setServerError(t('admin.login.invalidCredentials', 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'));
      return;
    }

    // Genuinely unreachable — there is no client-side login fallback. Authentication only ever
    // succeeds against the real backend, so this just asks the admin to retry once it's back.
    setServerError(t('admin.login.serverErrorFallback', 'تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى لاحقاً.'));
  };

  const statItems = [
    {
      icon: Bike,
      value: stats.products,
      labelKey: 'admin.login.statModels',
      labelFallback: 'موديل سكوتر ودراجة',
      iconClass: 'text-[#FB7185] bg-gradient-to-br from-[#E11D48]/25 to-[#E11D48]/5 ring-1 ring-inset ring-[#E11D48]/25',
      barClass: 'from-[#FB7185] to-[#BE123C]',
    },
    {
      icon: Wrench,
      value: stats.parts,
      labelKey: 'admin.login.statParts',
      labelFallback: 'قطعة غيار أصلية',
      iconClass: 'text-violet-300 bg-gradient-to-br from-violet-500/25 to-violet-500/5 ring-1 ring-inset ring-violet-500/25',
      barClass: 'from-violet-300 to-violet-600',
    },
    {
      icon: Store,
      value: stats.showrooms,
      labelKey: 'admin.login.statShowrooms',
      labelFallback: 'معرض معتمد',
      iconClass: 'text-emerald-300 bg-gradient-to-br from-emerald-500/25 to-emerald-500/5 ring-1 ring-inset ring-emerald-500/25',
      barClass: 'from-emerald-300 to-emerald-600',
    },
  ];

  return (
    <div className="min-h-screen flex bg-[#080C16] font-[family-name:var(--font-cairo)]" dir="rtl">
      {/* Brand showcase panel — hidden on small screens, live real catalog counts (not hardcoded) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12">
        <div className="pointer-events-none absolute -top-24 -start-24 w-[420px] h-[420px] rounded-full bg-[#E11D48]/20 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/3 -end-32 w-[360px] h-[360px] rounded-full bg-violet-600/[0.12] blur-[130px]" />
        <div className="pointer-events-none absolute -bottom-24 -end-24 w-[420px] h-[420px] rounded-full bg-emerald-500/15 blur-[120px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="admin-noise pointer-events-none absolute inset-0" />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative max-w-md"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#E11D48]/15 via-violet-500/10 to-transparent border border-white/10 text-[11px] font-bold text-slate-300 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#FB7185]" />
            {t('admin.login.brandBadge', 'لوحة التحكم الإدارية الرسمية')}
          </div>
          <h2 className="text-3xl font-black leading-tight mb-3 bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">
            {t('admin.login.brandTitle', 'إدارة منصة SYM Egypt بالكامل من مكان واحد')}
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-10">
            {t(
              'admin.login.brandSubtitle',
              'المخزون، الطلبات، العملاء، الصيانة، والمعارض — تحكم كامل ومباشر مبني على بياناتك الحقيقية.'
            )}
          </p>

          <div className="grid grid-cols-3 gap-3">
            {statItems.map((s) => (
              <div
                key={s.labelKey}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
              >
                <span className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${s.barClass} opacity-80`} />
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 ${s.iconClass}`}>
                  <s.icon className="w-4 h-4" />
                </div>
                <p className="text-xl font-black text-white tabular-nums">
                  {s.value === null ? <span className="inline-block w-8 h-5 rounded bg-white/10 animate-pulse" /> : s.value.toLocaleString('en-US')}
                </p>
                <p className="text-[10px] font-bold text-slate-500 mt-1 leading-tight">{t(s.labelKey, s.labelFallback)}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Login form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 relative overflow-hidden">
        <div className="pointer-events-none absolute top-0 start-1/4 w-[420px] h-[420px] rounded-full bg-[#E11D48]/10 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/2 end-0 w-[360px] h-[360px] rounded-full bg-violet-600/[0.08] blur-[130px]" />
        <div className="pointer-events-none absolute bottom-0 end-1/4 w-[420px] h-[420px] rounded-full bg-emerald-500/10 blur-[120px]" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-7 shadow-2xl shadow-black/50 before:content-[''] before:absolute before:-inset-px before:rounded-2xl before:bg-gradient-to-br before:from-[#E11D48]/25 before:via-transparent before:to-violet-600/20 before:-z-10 before:blur-sm"
        >
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FB7185] via-[#E11D48] to-violet-700 flex items-center justify-center font-black text-white text-xl shadow-[0_10px_30px_-6px_rgba(225,29,72,0.55)] ring-1 ring-inset ring-white/25 mb-3">
              <span className="relative z-10">S</span>
              <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/25 to-transparent opacity-60" />
            </div>
            <h1 className="text-lg font-black text-white">{t('admin.login.title', 'لوحة تحكم SYM Egypt')}</h1>
            <p className="text-xs text-slate-500 mt-1">{t('admin.login.subtitle', 'سجّل الدخول لإدارة المنصة')}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
              <label className="block text-[11px] font-extrabold text-slate-400 mb-1.5">{t('admin.login.emailLabel', 'البريد الإلكتروني')}</label>
              <div className="relative">
                <Mail className="absolute top-1/2 -translate-y-1/2 end-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  autoComplete="username"
                  placeholder={t('admin.login.emailPlaceholder', 'name@example.com')}
                  className="w-full px-3.5 pe-9 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#E11D48]/60 transition-colors"
                  {...register('email')}
                />
              </div>
              {errors.email && <span className="block mt-1 text-[11px] font-bold text-[#E11D48]">{errors.email.message}</span>}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
              <label className="block text-[11px] font-extrabold text-slate-400 mb-1.5">{t('admin.login.passwordLabel', 'كلمة المرور')}</label>
              <div className="relative">
                <Lock className="absolute top-1/2 -translate-y-1/2 end-3 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-3.5 pe-9 ps-9 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#E11D48]/60 transition-colors"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 -translate-y-1/2 start-3 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <span className="block mt-1 text-[11px] font-bold text-[#E11D48]">{errors.password.message}</span>}
            </motion.div>

            {serverError && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-[#E11D48]/10 border border-[#E11D48]/30 text-[#E11D48] text-xs font-bold">
                <WifiOff className="w-4 h-4 shrink-0 mt-0.5" />
                {serverError}
              </div>
            )}

            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#FB7185] via-[#E11D48] to-[#BE123C] hover:brightness-110 text-white text-sm font-black shadow-[0_8px_24px_-8px_rgba(225,29,72,0.6)] transition-all disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {t('admin.login.submitButton', 'تسجيل الدخول')}
            </motion.button>
          </form>

          <p className="mt-5 text-center text-[10px] font-bold text-slate-600">
            {t('admin.login.secureNotice', 'اتصال آمن ومشفّر · SYM Egypt Enterprise Platform')}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
