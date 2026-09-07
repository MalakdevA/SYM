'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  bgCanvas: string;
  bgSurface: string;
}

export interface SiteContent {
  siteName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  bannerText: string;
  showBanner: boolean;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  footerNotice: string;
  maintenanceMode: boolean;
}

export interface ThemePreset {
  id: string;
  name: string;
  primary: string;
  primaryHover: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'sym-red', name: 'SYM أحمر قياسي', primary: '#E60012', primaryHover: '#C4000F' },
  { id: 'sapphire-blue', name: 'أزرق كهربائي', primary: '#2563EB', primaryHover: '#1D4ED8' },
  { id: 'emerald-green', name: 'أخضر زردي', primary: '#059669', primaryHover: '#047857' },
  { id: 'sunset-orange', name: 'برتقالي ناري', primary: '#EA580C', primaryHover: '#C2410C' },
  { id: 'cyber-purple', name: 'بنفسجي سايبر', primary: '#9333EA', primaryHover: '#7E22CE' },
  { id: 'gold-amber', name: 'ذهبي فاخر', primary: '#D97706', primaryHover: '#B45309' },
];

const DEFAULT_COLORS: ThemeColors = {
  primary: '#E60012',
  primaryHover: '#C4000F',
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  bgCanvas: '#000000',
  bgSurface: '#0A0A0A',
};

const DEFAULT_CONTENT: SiteContent = {
  siteName: 'SYM Egypt',
  tagline: 'الوكيل الرسمي والموزع المعتمد لسكوترز ودراجات SYM في مصر',
  heroTitle: 'انطلق بقوة الحرية والأداء الأقصى مع SYM مصر',
  heroSubtitle: 'تشكيلة 2026 الرسمية من أحدث السكوترز والتكنولوجيا التايوانية المتقدمة مع ضمان الموزع المعتمد وشبكة صيانة في كافة المحافظات.',
  bannerText: '🔥 خصومات وعروض خاصة بمناسبة الصيف على موديلات Jet 14 EVO و Symphony ST!',
  showBanner: true,
  contactPhone: '01271384149',
  contactEmail: 'info@sym-egypt.com',
  contactAddress: 'القاهرة - مصر: المنطقة الصناعية - طريق النصر',
  footerNotice: 'جميع الحقوق محفوظة © 2026 شركة SYM Egypt - الوكيل الرسمي لموتوسيكلات وسكوترز SYM.',
  maintenanceMode: false,
};

interface SiteThemeContextType {
  colors: ThemeColors;
  content: SiteContent;
  isLoading: boolean;
  updateColors: (newColors: Partial<ThemeColors>) => void;
  updateContent: (newContent: Partial<SiteContent>) => void;
  applyPreset: (presetId: string) => void;
  resetToDefaults: () => void;
  saveSettingsToApi: () => Promise<boolean>;
}

const SiteThemeContext = createContext<SiteThemeContextType | undefined>(undefined);

const LOCAL_STORAGE_COLORS_KEY = 'sym_egypt_site_colors_v2';
const LOCAL_STORAGE_CONTENT_KEY = 'sym_egypt_site_content_v2';

export function SiteThemeProvider({ children }: { children: React.ReactNode }) {
  const [colors, setColors] = useState<ThemeColors>(DEFAULT_COLORS);
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch settings from DB API on mount
  useEffect(() => {
    async function loadSettingsFromApi() {
      try {
        const res = await fetch('/api/settings/index.php');
        if (!res.ok) {
          return;
        }
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          return;
        }
        const data = await res.json();
        if (data.success && data.data) {
          const s = data.data;
          setColors({
            primary: s.primary_color || DEFAULT_COLORS.primary,
            primaryHover: s.primary_hover || DEFAULT_COLORS.primaryHover,
            textPrimary: s.text_primary || DEFAULT_COLORS.textPrimary,
            textSecondary: s.text_secondary || DEFAULT_COLORS.textSecondary,
            textMuted: s.text_muted || DEFAULT_COLORS.textMuted,
            bgCanvas: s.bg_canvas || DEFAULT_COLORS.bgCanvas,
            bgSurface: s.bg_surface || DEFAULT_COLORS.bgSurface,
          });
          setContent({
            siteName: 'SYM Egypt',
            tagline: 'الوكيل الرسمي والموزع المعتمد لسكوترز ودراجات SYM في مصر',
            heroTitle: s.hero_title || DEFAULT_CONTENT.heroTitle,
            heroSubtitle: s.hero_subtitle || DEFAULT_CONTENT.heroSubtitle,
            bannerText: s.banner_text || DEFAULT_CONTENT.bannerText,
            showBanner: s.show_banner !== undefined ? Boolean(s.show_banner) : DEFAULT_CONTENT.showBanner,
            contactPhone: s.contact_phone || DEFAULT_CONTENT.contactPhone,
            contactEmail: s.contact_email || DEFAULT_CONTENT.contactEmail,
            contactAddress: s.contact_address || DEFAULT_CONTENT.contactAddress,
            footerNotice: s.footer_notice || DEFAULT_CONTENT.footerNotice,
            maintenanceMode: s.maintenance_mode !== undefined ? Boolean(s.maintenance_mode) : DEFAULT_CONTENT.maintenanceMode,
          });
        }
      } catch (e) {
        console.error('Failed to load settings from DB API:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettingsFromApi();
  }, []);

  // Update CSS Custom Variables whenever colors change
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', colors.primary);
    root.style.setProperty('--brand-primary-hover', colors.primaryHover);
    root.style.setProperty('--text-primary', colors.textPrimary);
    root.style.setProperty('--text-secondary', colors.textSecondary);
    root.style.setProperty('--text-muted', colors.textMuted);
    root.style.setProperty('--bg-canvas', colors.bgCanvas);
    root.style.setProperty('--bg-surface', colors.bgSurface);
  }, [colors]);

  const updateColors = (newColors: Partial<ThemeColors>) => {
    setColors((prev) => {
      const updated = { ...prev, ...newColors };
      try {
        localStorage.setItem(LOCAL_STORAGE_COLORS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const updateContent = (newContent: Partial<SiteContent>) => {
    setContent((prev) => {
      const updated = { ...prev, ...newContent };
      try {
        localStorage.setItem(LOCAL_STORAGE_CONTENT_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const applyPreset = (presetId: string) => {
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      updateColors({
        primary: preset.primary,
        primaryHover: preset.primaryHover,
      });
    }
  };

  const resetToDefaults = () => {
    setColors(DEFAULT_COLORS);
    setContent(DEFAULT_CONTENT);
    try {
      localStorage.removeItem(LOCAL_STORAGE_COLORS_KEY);
      localStorage.removeItem(LOCAL_STORAGE_CONTENT_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const saveSettingsToApi = async (): Promise<boolean> => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_COLORS_KEY, JSON.stringify(colors));
        localStorage.setItem(LOCAL_STORAGE_CONTENT_KEY, JSON.stringify(content));
      }

      const { fetchWithAuth } = await import('@/lib/api');
      const payload = {
        primary_color: colors.primary,
        primary_hover: colors.primaryHover,
        text_primary: colors.textPrimary,
        text_secondary: colors.textSecondary,
        text_muted: colors.textMuted,
        bg_canvas: colors.bgCanvas,
        bg_surface: colors.bgSurface,
        hero_title: content.heroTitle,
        hero_subtitle: content.heroSubtitle,
        banner_text: content.bannerText,
        show_banner: content.showBanner ? 1 : 0,
        contact_phone: content.contactPhone,
        contact_email: content.contactEmail,
        contact_address: content.contactAddress,
        footer_notice: content.footerNotice,
        maintenance_mode: content.maintenanceMode ? 1 : 0,
      };
      
      const res = await fetchWithAuth('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((r) => r.json())
        .catch(() => null);

      return Boolean(res?.success);
    } catch (e) {
      console.error('Failed to save settings:', e);
      return false;
    }
  };

  return (
    <SiteThemeContext.Provider
      value={{
        colors,
        content,
        isLoading,
        updateColors,
        updateContent,
        applyPreset,
        resetToDefaults,
        saveSettingsToApi,
      }}
    >
      {children}
    </SiteThemeContext.Provider>
  );
}

export function useSiteTheme() {
  const context = useContext(SiteThemeContext);
  if (!context) {
    return {
      colors: DEFAULT_COLORS,
      content: DEFAULT_CONTENT,
      isLoading: false,
      updateColors: () => {},
      updateContent: () => {},
      applyPreset: () => {},
      resetToDefaults: () => {},
      saveSettingsToApi: async () => false,
    };
  }
  return context;
}
