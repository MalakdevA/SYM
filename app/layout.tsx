import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

import { Inter } from "next/font/google";
import "./globals.css";
import { SiteThemeProvider } from "@/lib/context/site-theme";
import { VisitTracker } from "@/components/analytics/visit-tracker";
import { ProductsSync } from "@/components/analytics/products-sync";
import { InitialSplashScreen } from "@/components/ui/InitialSplashScreen";
import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://symegypt.com'),
  title: {
    default: "SYM Egypt | الوكيل الرسمي واسعار اسكوتر SYM في مصر 2026",
    template: "%s | SYM Egypt Official",
  },
  description:
    "الموقع الرسمي والوكيل المعتمد لسكوترات اس واي ام SYM في مصر. استكشف احدث موديلات اسكوتر SYM Jet 14 EVO, Symphony ST 200, Cruisym 400, Husky ADV 200 مع اسعار القطع الأصلية ومراكز الصيانة المعتمدة وفحص سريان الضمان.",
  keywords: [
    "سكوتر SYM",
    "اسكوتر اس واي ام مصر",
    "اسعار اسكوتر SYM 2026",
    "SYM Jet 14 EVO 200",
    "SYM Symphony ST 200",
    "SYM Cruisym 400",
    "SYM Husky ADV 200",
    "قطع غيار SYM الأصلية",
    "صيانة اسكوتر SYM مصر",
    "سكوترات مصر بالتقسيط",
    "موزعين SYM المعتمدين في مصر",
    "ضمان سكوتر SYM",
  ],
  authors: [{ name: "SYM Egypt Official Dealership", url: "https://symegypt.com" }],
  creator: "SYM Egypt",
  publisher: "SYM Motors Egypt",
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  category: "automotive",
  other: {
    "geo.region": "EG-C",
    "geo.placename": "Cairo, Egypt",
    "geo.position": "30.0444;31.2357",
    "ICBM": "30.0444, 31.2357",
    "DC.title": "SYM Egypt Scooters & Motorcycles",
    "DC.creator": "SYM Egypt",
    "DC.language": "ar",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "SYM Egypt | الوكيل الرسمي واسعار اسكوتر SYM في مصر",
    description:
      "الموقع الرسمي والوكيل المعتمد لسكوترات SYM في مصر. تعرف على المواصفات والأسعار ومراكز الصيانة المعتمدة وتجارب القيادة.",
    url: "https://symegypt.com",
    siteName: "SYM Egypt Official",
    locale: "ar_EG",
    type: "website",
    images: [
      {
        url: "https://symegypt.com/sym_hero_banner_new.png",
        width: 1200,
        height: 630,
        alt: "SYM Egypt Official Scooters & Motorcycles 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SYM Egypt | اسكوترات واسعار اسكوتر اس واي ام في مصر",
    description:
      "الموقع الرسمي والوكيل المعتمد لسكوترات SYM في مصر. استكشف المواصفات وأماكن المعارض ومراكز الصيانة.",
    images: ["https://symegypt.com/sym_hero_banner_new.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/sym-logo-circle.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  alternates: {
    canonical: "https://symegypt.com",
    languages: {
      "ar-EG": "https://symegypt.com",
      "en-EG": "https://symegypt.com/en",
    },
  },
};

// Comprehensive Schema.org JSON-LD (AutoDealer + FAQPage for AEO & GEO)
const jsonLdSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AutoDealer",
      "@id": "https://symegypt.com/#organization",
      "name": "SYM Egypt",
      "alternateName": ["اس واي ام مصر", "SYM Motors Egypt", "توكيل SYM مصر"],
      "url": "https://symegypt.com",
      "logo": "https://symegypt.com/SymLogo-S-red.png",
      "image": "https://symegypt.com/sym_hero_banner_new.png",
      "description": "الوكيل الرسمي والموزع المعتمد لسكوترز ودراجات SYM في جمهورية مصر العربية ومراكز الصيانة وقطع الغيار الأصلية.",
      "telephone": "+201271384149",
      "email": "info@symegypt.com",
      "priceRange": "$$",
      "currenciesAccepted": "EGP",
      "paymentAccepted": "Cash, Credit Card, Fawry, Meeza, Installment",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "شارع مكرم عبيد، مدينة نصر",
        "addressLocality": "القاهرة",
        "addressRegion": "القاهرة الكبرى",
        "postalCode": "11765",
        "addressCountry": "EG"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "30.0561",
        "longitude": "31.3418"
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
          "opens": "09:00",
          "closes": "22:00"
        }
      ],
      "sameAs": [
        "https://www.facebook.com/symegypt",
        "https://www.instagram.com/symegypt",
        "https://www.youtube.com/@symglobal"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://symegypt.com/#website",
      "url": "https://symegypt.com",
      "name": "SYM Egypt",
      "description": "اسكوترات واسعار اسكوتر اس واي ام في مصر - الوكيل الرسمي",
      "publisher": {
        "@id": "https://symegypt.com/#organization"
      },
      "inLanguage": "ar-EG",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://symegypt.com/all-models?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://symegypt.com/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "ما هي أسعار وموديلات سكوتر SYM الرسمية في مصر؟",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "تتوفر سكوترات SYM بأسعار تبدأ من الفئات الاقتصادية والحضرية مثل SYM Jet 14 و Symphony ST 200 إلى فئات المغامرات SYM Husky ADV 200 والماكسي سكوتر الفاخر SYM Cruisym 400، مع ضمان رسمي سنتين وتوافر كامل لقطع الغيار الأصلية."
          }
        },
        {
          "@type": "Question",
          "name": "ما هي مدة الضمان المعتمد على سكوترات SYM بمصر؟",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "يقدم توكيل SYM في مصر ضماناً رسمياً معتمداً لمدة عامين كاملين أو 20,000 كيلومتر ضد عيوب الصناعة مع التزام مراكز الخدمة المعتمدة بكافة الصيانات الدورية."
          }
        },
        {
          "@type": "Question",
          "name": "أين توجد مراكز صيانة وقطع غيار SYM المعتمدة في مصر؟",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "تنتشر مراكز الخدمة المعتمدة في القاهرة (مدينة نصر والتجمع الخامس)، الجيزة (المهندسين والشيخ زايد)، الإسكندرية (سموحة)، والمنصورة وطنطا بالدلتا."
          }
        },
        {
          "@type": "Question",
          "name": "كيف يمكن حجز تجربة قيادة (Test Ride) لسكوتر SYM؟",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "يمكنك حجز تجربة قيادة مجانية مباشرة عبر موقع SYM Egypt الرسمي باختيار الموديل والفرع الأقرب لك، وسيتم التواصل لتأكيد الموعد فوراً."
          }
        }
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: Readonly<React.ReactNode>;
}>) {
  return (
    <html lang="ar" dir="rtl" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#000000" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body className="antialiased min-h-full flex flex-col font-sans bg-black text-white select-none">
        <LanguageProvider>
          <CartProvider>
            <SiteThemeProvider>
              <InitialSplashScreen />
              <VisitTracker />
              <ProductsSync />
              <CartDrawer />
              {children}
            </SiteThemeProvider>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
