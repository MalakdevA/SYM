'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Palette,
  Type,
  Layers,
  Megaphone,
  Phone,
  Mail,
  MapPin,
  Wrench,
  AlertTriangle,
  Save,
  CheckCircle2,
  XCircle,
  Loader2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/layout/AdminHeader';
import { TextField, TextareaField, ToggleField } from '@/components/admin/ui/FormControls';
import {
  useSiteTheme,
  THEME_PRESETS,
  type ThemeColors,
  type SiteContent,
} from '@/lib/context/site-theme';
import { useLanguage } from '@/context/LanguageContext';

interface ColorFieldDef {
  key: keyof ThemeColors;
  label: string;
  hint?: string;
}

function getColorFields(t: (key: string, fallback: string) => string): ColorFieldDef[] {
  return [
    { key: 'primary', label: t('admin.settings.colorPrimaryLabel', 'اللون الأساسي'), hint: t('admin.settings.colorPrimaryHint', 'لون الأزرار والعناصر البارزة') },
    { key: 'primaryHover', label: t('admin.settings.colorPrimaryHoverLabel', 'لون التمرير (Hover)'), hint: t('admin.settings.colorPrimaryHoverHint', 'يظهر عند مرور الفأرة على العناصر') },
    { key: 'textPrimary', label: t('admin.settings.colorTextPrimaryLabel', 'لون النص الأساسي') },
    { key: 'textSecondary', label: t('admin.settings.colorTextSecondaryLabel', 'لون النص الثانوي') },
    { key: 'textMuted', label: t('admin.settings.colorTextMutedLabel', 'لون النص الباهت') },
    { key: 'bgCanvas', label: t('admin.settings.colorBgCanvasLabel', 'خلفية الصفحة') },
    { key: 'bgSurface', label: t('admin.settings.colorBgSurfaceLabel', 'خلفية العناصر') },
  ];
}

function ColorPickerField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-[11px] font-extrabold text-slate-400 mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <span
          className="relative shrink-0 w-11 h-11 rounded-xl border border-white/10 overflow-hidden"
          style={{ backgroundColor: /^#([0-9a-f]{3}){1,2}$/i.test(value) ? value : '#000000' }}
        >
          <input
            type="color"
            value={/^#([0-9a-f]{6})$/i.test(value) ? value : '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label={label}
          />
        </span>
        <TextField
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir="ltr"
          className="font-mono text-left"
        />
      </div>
      {hint && <span className="block mt-1 text-[10px] text-slate-500">{hint}</span>}
    </div>
  );
}

export default function AdminSettingsPage() {
  const { colors, content, isLoading, updateColors, updateContent, applyPreset, resetToDefaults, saveSettingsToApi } =
    useSiteTheme();
  const { t } = useLanguage();
  const COLOR_FIELDS = getColorFields(t);

  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    setSaveState('saving');
    try {
      const ok = await saveSettingsToApi();
      setSaveState(ok ? 'success' : 'error');
    } catch {
      setSaveState('error');
    } finally {
      setTimeout(() => setSaveState('idle'), 3500);
    }
  };

  const handleReset = () => {
    if (window.confirm(t('admin.settings.resetConfirm', 'هل تريد استرجاع الإعدادات الافتراضية؟ سيتم فقدان التعديلات غير المحفوظة.'))) {
      resetToDefaults();
    }
  };

  const setColor = (key: keyof ThemeColors) => (value: string) => updateColors({ [key]: value } as Partial<ThemeColors>);
  const setContentField = <K extends keyof SiteContent>(key: K) => (value: SiteContent[K]) =>
    updateContent({ [key]: value } as Partial<SiteContent>);

  return (
    <div>
      <AdminHeader
        title={t('admin.settings.pageTitle', 'إعدادات الموقع')}
        subtitle={t('admin.settings.pageSubtitle', 'المظهر والألوان ومحتوى الموقع العام')}
      />

      <div className="p-4 md:p-6 space-y-6 pb-28">
        {/* المظهر والألوان */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#E11D48]/10 text-[#E11D48]">
              <Palette className="w-[18px] h-[18px]" />
            </span>
            <div>
              <h2 className="text-sm font-black text-white">{t('admin.settings.appearanceTitle', 'المظهر والألوان')}</h2>
              <p className="text-[11px] text-slate-500">{t('admin.settings.appearanceSubtitle', 'تحكم في هوية الألوان المستخدمة عبر الموقع بالكامل')}</p>
            </div>
          </div>

          {THEME_PRESETS.length > 0 && (
            <div className="mb-5">
              <p className="text-[11px] font-extrabold text-slate-400 mb-2">{t('admin.settings.presetsLabel', 'تشكيلات جاهزة')}</p>
              <div className="flex flex-wrap gap-2">
                {THEME_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                      colors.primary === preset.primary
                        ? 'border-[#E11D48]/60 bg-[#E11D48]/10 text-white'
                        : 'border-white/10 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: preset.primary }}
                    />
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COLOR_FIELDS.map((field) => (
              <ColorPickerField
                key={field.key}
                label={field.label}
                hint={field.hint}
                value={colors[field.key]}
                onChange={setColor(field.key)}
              />
            ))}
          </div>

          {/* Live preview */}
          <div className="mt-5 rounded-xl border border-white/10 p-4" style={{ backgroundColor: colors.bgSurface }}>
            <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-slate-500">
              <Sparkles className="w-3.5 h-3.5" />
              {t('admin.settings.livePreviewLabel', 'معاينة مباشرة')}
            </div>
            <p className="font-black text-lg" style={{ color: colors.textPrimary }}>
              {content.heroTitle || t('admin.settings.heroTitlePlaceholder', 'عنوان القسم الرئيسي')}
            </p>
            <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
              {content.heroSubtitle || t('admin.settings.heroSubtitlePlaceholder', 'العنوان الفرعي يظهر هنا')}
            </p>
            <button
              type="button"
              className="mt-3 px-4 py-2 rounded-lg text-xs font-bold text-white"
              style={{ backgroundColor: colors.primary }}
            >
              {t('admin.settings.previewButtonLabel', 'زر تجريبي')}
            </button>
          </div>
        </motion.section>

        {/* محتوى الموقع */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#E11D48]/10 text-[#E11D48]">
              <Layers className="w-[18px] h-[18px]" />
            </span>
            <div>
              <h2 className="text-sm font-black text-white">{t('admin.settings.contentTitle', 'محتوى الموقع')}</h2>
              <p className="text-[11px] text-slate-500">{t('admin.settings.contentSubtitle', 'النصوص وبيانات التواصل الظاهرة للعملاء')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label={t('admin.settings.heroTitleLabel', 'عنوان القسم الرئيسي (Hero)')}
                icon={Type}
                value={content.heroTitle}
                onChange={(e) => setContentField('heroTitle')(e.target.value)}
              />
              <TextField
                label={t('admin.settings.heroSubtitleLabel', 'العنوان الفرعي للقسم الرئيسي')}
                icon={Type}
                value={content.heroSubtitle}
                onChange={(e) => setContentField('heroSubtitle')(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start">
              <TextField
                label={t('admin.settings.bannerTextLabel', 'نص الشريط الإعلاني')}
                icon={Megaphone}
                value={content.bannerText}
                onChange={(e) => setContentField('bannerText')(e.target.value)}
              />
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 mb-1.5">{t('admin.settings.bannerStatusLabel', 'حالة الشريط')}</label>
                <ToggleField
                  label={content.showBanner ? t('admin.settings.bannerEnabled', 'الشريط مفعّل') : t('admin.settings.bannerDisabled', 'الشريط متوقف')}
                  checked={content.showBanner}
                  onChange={(v) => setContentField('showBanner')(v)}
                  icon={Megaphone}
                />
              </div>
            </div>

            <div className="h-px bg-white/10" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextField
                label={t('admin.settings.phoneLabel', 'رقم الهاتف')}
                icon={Phone}
                dir="ltr"
                value={content.contactPhone}
                onChange={(e) => setContentField('contactPhone')(e.target.value)}
              />
              <TextField
                label={t('admin.settings.emailLabel', 'البريد الإلكتروني')}
                icon={Mail}
                dir="ltr"
                type="email"
                value={content.contactEmail}
                onChange={(e) => setContentField('contactEmail')(e.target.value)}
              />
              <TextField
                label={t('admin.settings.addressLabel', 'العنوان')}
                icon={MapPin}
                value={content.contactAddress}
                onChange={(e) => setContentField('contactAddress')(e.target.value)}
              />
            </div>

            <TextareaField
              label={t('admin.settings.footerNoticeLabel', 'نص أسفل الصفحة (Footer)')}
              value={content.footerNotice}
              onChange={(e) => setContentField('footerNotice')(e.target.value)}
              rows={2}
            />

            <div className="h-px bg-white/10" />

            <div
              className={`flex flex-col sm:flex-row sm:items-center gap-3 justify-between p-4 rounded-xl border ${
                content.maintenanceMode
                  ? 'border-amber-500/40 bg-amber-950/20'
                  : 'border-white/10 bg-[#0F172A]'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle
                  className={`w-[18px] h-[18px] mt-0.5 shrink-0 ${content.maintenanceMode ? 'text-amber-400' : 'text-slate-500'}`}
                />
                <div>
                  <p className="text-sm font-bold text-white">{t('admin.settings.maintenanceModeLabel', 'وضع الصيانة')}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {t('admin.settings.maintenanceWarning', 'تفعيل هذا الخيار يوقف الموقع بالكامل أمام العملاء ويعرض صفحة صيانة بدلاً منه. استخدمه بحذر.')}
                  </p>
                </div>
              </div>
              <div className="sm:w-48">
                <ToggleField
                  label={content.maintenanceMode ? t('admin.settings.maintenanceActive', 'الموقع متوقف حالياً') : t('admin.settings.maintenanceInactive', 'الموقع يعمل بشكل طبيعي')}
                  checked={content.maintenanceMode}
                  onChange={(v) => setContentField('maintenanceMode')(v)}
                  icon={Wrench}
                />
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 inset-x-0 md:right-0 z-30 border-t border-white/10 bg-[#0F172A]/95 backdrop-blur-2xl">
        <div className="px-4 md:px-6 py-3.5 flex items-center justify-end gap-3">
          {saveState === 'success' && (
            <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              {t('admin.settings.saveSuccess', 'تم الحفظ بنجاح')}
            </span>
          )}
          {saveState === 'error' && (
            <span className="flex items-center gap-1.5 text-[#E11D48] text-xs font-bold">
              <XCircle className="w-4 h-4" />
              {t('admin.settings.saveError', 'حدث خطأ أثناء الحفظ')}
            </span>
          )}

          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading || saveState === 'saving'}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 text-xs font-bold hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            {t('admin.settings.resetButton', 'استرجاع الافتراضي')}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading || saveState === 'saving'}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#C11740] text-white text-sm font-black transition-colors disabled:opacity-60"
          >
            {saveState === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saveState === 'saving' ? t('admin.settings.saving', 'جاري الحفظ...') : t('admin.settings.saveButton', 'حفظ الإعدادات')}
          </button>
        </div>
      </div>
    </div>
  );
}
