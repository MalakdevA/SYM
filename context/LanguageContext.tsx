'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '@/lib/i18n/translations';

interface LanguageContextType {
  language: Language;
  dir: 'rtl' | 'ltr';
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (path: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const applyLanguage = (lang: Language) => {
  if (typeof document === 'undefined') return;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lang;
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Sync language setting from localStorage after hydration
    const saved = localStorage.getItem('sym_lang') as Language;
    if (saved === 'en' || saved === 'ar') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguageState(saved);
      applyLanguage(saved);
    } else {
      applyLanguage('ar');
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('sym_lang', lang);
    applyLanguage(lang);
  };

  const toggleLanguage = () => {
    const nextLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(nextLang);
  };

  const t = (path: string, fallback: string = ''): string => {
    const keys = path.split('.');
    let current: unknown = translations[language];

    for (const key of keys) {
      if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[key];
      } else {
        // Fallback to English if key missing in current lang
        let engCurrent: unknown = translations['en'];
        for (const k of keys) {
          if (engCurrent && typeof engCurrent === 'object' && k in (engCurrent as Record<string, unknown>)) {
            engCurrent = (engCurrent as Record<string, unknown>)[k];
          } else {
            return fallback || path;
          }
        }
        return typeof engCurrent === 'string' ? engCurrent : fallback || path;
      }
    }

    return typeof current === 'string' ? current : fallback || path;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, dir, setLanguage, toggleLanguage, t }}>
      <div dir={dir} className={mounted ? '' : 'contents'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
