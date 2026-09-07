'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Header from '@/components/customer/Header';
import Footer from '@/components/customer/Footer';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import {
  Award,
  CheckCircle2,
  Cpu,
  Flame,
  Gauge,
  BatteryCharging,
  Activity,
  ZoomIn,
  X,
  Factory,
  Bot,
  ShieldCheck,
  Building2,
  Wrench,
  Layers,
  TrendingUp,
  Maximize2
} from 'lucide-react';

export default function AboutPage() {
  const { language, dir } = useLanguage();
  const isAr = language === 'ar';

  const [activeTechIdx, setActiveTechIdx] = useState<number>(0);
  const [activeTimelineIdx, setActiveTimelineIdx] = useState<number>(3); // Default to 2026 SEMOTIVE
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string; desc?: string } | null>(null);

  // Smooth Scroll Parallax Dynamics
  const { scrollYProgress } = useScroll();
  const nebulaY1 = useTransform(scrollYProgress, [0, 1], ['0%', '60%']);
  const nebulaY2 = useTransform(scrollYProgress, [0, 1], ['0%', '-40%']);

  // 1. SEMOTIVE At a Glance (Exact Data from Profile)
  const atAGlanceStats = useMemo(() => [
    {
      value: '25+ YEARS',
      labelAr: 'الخبرة والإرث الصناعي',
      labelEn: 'INDUSTRIAL HERITAGE',
      subAr: 'تأسست شركة هامرز عام 2000 كرواد لصناعة وسائل النقل الخفيف بمصر',
      subEn: 'Hammers International Established in 2000',
      icon: Building2,
    },
    {
      value: '30,000 m²',
      labelAr: 'المجمع الصناعي الماسي',
      labelEn: 'NEW INDUSTRIAL BASE',
      subAr: 'مجمع تصنيع متطور في مدينة العاشر من رمضان',
      subEn: 'Flagship Manufacturing Complex in 10th of Ramadan City',
      icon: Factory,
    },
    {
      value: '100,000',
      labelAr: 'مركبة طاقة إنتاجية سنوياً',
      labelEn: 'ANNUAL VEHICLE CAPACITY',
      subAr: 'قاعدة إنتاجية مرنة لتلبية الطلب المحلي والتصدير الإقليمي',
      subEn: 'Scalable Output for Domestic Demand & Regional Export',
      icon: Gauge,
    },
    {
      value: 'ABB',
      labelAr: 'التعاون الصناعي للروبوتات',
      labelEn: 'ROBOTIC COOPERATION',
      subAr: 'أتمتة عملية اللحام والتجميع بدقة وتكرارية عالية',
      subEn: 'Advanced Robotic Manufacturing & Automation',
      icon: Bot,
    },
    {
      value: 'DMG MORI',
      labelAr: 'تكنولوجيا CNC الألمانية',
      labelEn: 'GERMAN CNC TECHNOLOGY',
      subAr: 'تشغيل أسطوانات ومكونات المحركات والمسبوكات',
      subEn: 'German CNC Engine & Cylinder-Block Machining',
      icon: Cpu,
    },
    {
      value: 'CNC',
      labelAr: 'تصنيع القوالب والأسطمبات والأجزاء',
      labelEn: 'MOULDS • TOOLING • ENGINE PARTS',
      subAr: 'قدرات هندسية ذاتية لتصنيع القوالب ومثبتات الإنتاج',
      subEn: 'In-House Moulds, Dies, Fixtures & Custom Tooling',
      icon: Wrench,
    },
  ], []);

  // 2. Progression Timeline Roadmap (Verbatim DOCX Progression)
  const progressionMilestones = useMemo(() => [
    {
      year: '2000',
      stageAr: 'التجميع والإنتاج الأولي (ASSEMBLY)',
      stageEn: 'ASSEMBLY',
      titleAr: 'تأسيس شركة هامرز الدولية لصناعة وسائل النقل الخفيف',
      titleEn: 'Hammers International Established',
      descAr: 'تأسست شركة هامرز الدولية عام 2000 وبنت أكثر من عقدين من الخبرة التصنيعية في قطاع وسائل النقل الخفيف والدراجات النارية في مصر. تطور العمل حول إنتاج المركبات، التعاون الفني، وتصنيع الهياكل والمحركات.',
      descEn: 'Hammers International for Light Transportation Industry was established in 2000, building more than two decades of manufacturing experience in Egypt’s two-wheel and light-vehicle sector around vehicle production, frame and engine manufacturing.',
      badgeAr: 'تأسيس هامرز',
      badgeEn: 'HAMMERS ESTABLISHED',
      highlightAr: 'بداية الإرث الصناعي وتصنيع الهياكل والمحركات',
      highlightEn: 'Foundational Industrial Roots & Frame Production',
    },
    {
      year: '2012',
      stageAr: 'التصنيع المرخص (MANUFACTURING)',
      stageEn: 'MANUFACTURING',
      titleAr: '14 عاماً من التعاون الصناعي مع SYM تايوان',
      titleEn: '14 Years of Industrial Cooperation with SYM Taiwan',
      descAr: 'تطور التعاون مع شركة Sanyang Motor Co., Ltd. (SYM) التايوانية لأكثر من مجرد توزيع: بنى منصة تراكمية من التصنيع المرخص، الدعم الفني، هندسة الإنتاج، ومعرفة تصنيع المحركات والهياكل والجودة في مصر.',
      descEn: 'Fourteen years of close industrial cooperation with Taiwan’s Sanyang Motor Co., Ltd. (SYM) built a cumulative platform of licensed manufacturing, technical support, production engineering, frame and engine know-how in Egypt.',
      badgeAr: 'تحالف SYM تايوان',
      badgeEn: 'SYM TAIWAN ALLIANCE',
      highlightAr: 'تصنيع مرخص ونقل تكنولوجيا المحركات والهياكل',
      highlightEn: 'Licensed Manufacturing & Engine Know-how',
    },
    {
      year: '2018',
      stageAr: 'التوطين والهندسة الدقيقة (LOCALIZATION & PRECISION ENGINEERING)',
      stageEn: 'LOCALIZATION & PRECISION ENGINEERING',
      titleAr: 'أتمتة ماكينات CNC وتصنيع القوالب الذاتية',
      titleEn: 'Robotic & CNC Adoption & Mould Making',
      descAr: 'الاعتماد التدريجي لروبوتات ABB وماكينات الـ CNC الألمانية (DMG MORI)، وبناء قدرات هندسية داخلية لتصنيع القوالب والأسطمبات لتوطين المكونات الميكانيكية وتقليل الاستيراد.',
      descEn: 'Progressive adoption of robotic and CNC technologies, building in-house mould and die tooling capabilities to treat localization as an engineering program rather than sourcing.',
      badgeAr: 'دقة CNC والقوالب',
      badgeEn: 'PRECISION CNC & MOULDS',
      highlightAr: 'توطين القوالب والأسطمبات وتكنولوجيا CNC',
      highlightEn: 'In-House Moulds, Dies & CNC Machining',
    },
    {
      year: '2026',
      stageAr: 'المنظومة الصناعية الشاملة (INDUSTRIAL ECOSYSTEM)',
      stageEn: 'INDUSTRIAL ECOSYSTEM',
      titleAr: 'سيموتيف لتصنيع المركبات ذ.م.م (SEMOTIVE LLC)',
      titleEn: 'SEMOTIVE Vehicles Manufacturing LLC',
      descAr: 'سيموتيف هي الكيان الصناعي الموحد للمجموعة والمظلة المؤسسية التي تجمع وحدات التصنيع والمصانع والقدرات الهندسية تحت استراتيجية ومنصة إدارية واحدة، وتدير مجمع العاشر من رمضان الماسي. تدمج سيموتيف تصنيع المركبات والمحركات، والمكونات الدقيقة، والهندسة الروبوتية، وتشغيل CNC، وإنتاج القوالب والأسطمبات، وأنظمة الجودة، وتقنيات التصنيع المتقدمة ضمن منظومة صناعية قابلة للتوسع.',
      descEn: 'SEMOTIVE Vehicles Manufacturing LLC is now the Group’s unified industrial entity, bringing its manufacturing units, factories and capabilities under one corporate platform and 30,000 m² Diamond Base. SEMOTIVE integrates vehicle and engine manufacturing, precision components, robotic engineering, CNC machining, mould and tooling production, quality systems and advanced manufacturing technologies within a scalable industrial ecosystem.',
      badgeAr: 'الكيان الصناعي الموحد',
      badgeEn: 'UNIFIED INDUSTRIAL ENTITY',
      highlightAr: 'تكامل 8 قطاعات صناعية بطاقة 100,000 مركبة/سنة',
      highlightEn: '8 Integrated Operational Layers & 100K Capacity',
    },
  ], []);

  // 3. Factory Mission Points (Verbatim from DOCX)
  const factoryMissionList = useMemo(() => [
    {
      ar: 'إنشاء قاعدة تصنيع مصرية قابلة للتوسع لإنتاج وسائل النقل الخفيف.',
      en: 'Create a scalable Egyptian manufacturing base for light vehicles.',
    },
    {
      ar: 'زيادة خلق القيمة المحلية من خلال توطين المكونات والعمليات التصنيعية.',
      en: 'Increase local value creation through component and process localization.',
    },
    {
      ar: 'بناء قدرات هندسية داخلية للهندسة الدقيقة وتصنيع القوالب والأسطمبات.',
      en: 'Build in-house precision engineering and tooling capabilities.',
    },
    {
      ar: 'نشر الأتمتة المتقدمة لتحسين التكرارية، الجودة، والإنتاجية.',
      en: 'Deploy advanced automation to improve repeatability, quality and productivity.',
    },
    {
      ar: 'تأسيس منصة صناعية قادرة على تلبية الطلب المحلي ونمو التصدير الإقليمي المستقبلي.',
      en: 'Establish a platform capable of serving domestic demand and future regional export growth.',
    },
  ], []);

  // 4. Advanced Manufacturing Technology Sections (Verbatim from DOCX)
  const mfgTechSections = useMemo(() => [
    {
      id: 'robotic',
      titleAr: 'الهندسة الروبوتية (ROBOTIC ENGINEERING)',
      titleEn: 'ROBOTIC ENGINEERING',
      subtitleAr: 'بالتعاون الصناعي مع ABB',
      subtitleEn: 'Industrial Cooperation with ABB',
      descAr: 'تصنيع وأتمتة روبوتية متقدمة بموجب تعاون صناعي مع شركة ABB العالمية، لدعم الدقة والتكرارية وكفاءة الإنتاج في لحام الهياكل والتجميع.',
      descEn: 'Advanced robotic manufacturing and automation under industrial cooperation with ABB, supporting precision, consistency and production efficiency.',
      partner: 'ABB Robotics',
      icon: Bot,
    },
    {
      id: 'mould',
      titleAr: 'تصنيع القوالب والأسطمبات بـ CNC (CNC MOULD & TOOL MAKING)',
      titleEn: 'CNC MOULD & TOOL MAKING',
      subtitleAr: 'قدرات هندسية داخلية ذاتية',
      subtitleEn: 'In-House Precision Tooling & Dies',
      descAr: 'قدرة ذاتية باستخدام ماكينات CNC لتصنيع القوالب، الأسطمبات، المثبتات، وأدوات الإنتاج، مما يعزز التوطين الصناعي للمنتجات ويقلل الاعتماد على القوالب المستوردة.',
      descEn: 'In-house CNC capability for moulds, dies, fixtures and production tooling, strengthening product industrialization and reducing dependence on imported tooling.',
      partner: 'SEMOTIVE Tooling',
      icon: Wrench,
    },
    {
      id: 'machining',
      titleAr: 'تشغيل المحركات وبلوك الأسطوانات (ENGINE & CYLINDER-BLOCK MACHINING)',
      titleEn: 'ENGINE & CYLINDER-BLOCK MACHINING',
      subtitleAr: 'معدات DMG MORI بتكنولوجيا ألمانية',
      subtitleEn: 'German Tech & DMG MORI Equipment',
      descAr: 'تشغيل دقيق متقدم بآلات CNC لمكونات المحرك وبلوك الأسطوانات باستعمال تكنولوجيات التصنيع الألمانية ومعدات شركة DMG MORI العالمية.',
      descEn: 'Advanced CNC machining for engine components and cylinder blocks using German manufacturing technologies and DMG MORI equipment.',
      partner: 'DMG MORI Germany',
      icon: Cpu,
    },
  ], []);

  // 5. The 8 Operational Layers of SEMOTIVE Ecosystem (Verbatim from DOCX)
  const ecosystem8Layers = useMemo(() => [
    { ar: 'تصنيع وسائل النقل الخفيف والتجميع النهائي.', en: 'Light-vehicle manufacturing and final assembly.' },
    { ar: 'التصنيع المتعلق بمجموعات المحركات والقوة المحركة.', en: 'Engine and powertrain-related manufacturing.' },
    { ar: 'التشغيل الدقيق بآلات CNC للمكونات الميكانيكية.', en: 'CNC precision machining for mechanical components.' },
    { ar: 'تشغيل بلوك الأسطوانات ومعالجة أجزاء المحرك.', en: 'Cylinder-block machining and engine-component processing.' },
    { ar: 'تصنيع القوالب، الأسطمبات، المثبتات وأدوات الإنتاج.', en: 'Mould, die, fixture and tooling manufacturing.' },
    { ar: 'هندسة الإنتاج الروبوتي وخلايا التصنيع المؤتمتة.', en: 'Robotic production engineering and automated manufacturing cells.' },
    { ar: 'مراقبة الجودة، الاختبارات وهندسة العمليات الصناعية.', en: 'Quality control, testing and industrial process engineering.' },
    { ar: 'الأبحاث، تكييف المنتجات وقدرة التنقل الكهربائي المستقبلي.', en: 'Research, product adaptation and future electric-mobility capability.' },
  ], []);

  // 6. Engine Technologies (Exact Docx Images & Descriptions)
  const engineTechList = useMemo(() => [
    {
      id: 'steadite',
      titleAr: 'أسطوانة سبائك الإستيدايت (Steadite Alloy Cylinder)',
      titleEn: 'Steadite Alloy Cylinder',
      descAr: 'يضمن توزيع غشاء الزيت بشكل منتظم وموحد على جدار الأسطوانة، مما يدعم مقاومة التآكل وأحكام الهواء والأداء العالي.',
      descEn: 'Uniform oil distribution on the cylinder wall supports wear resistance, air-tightness and high performance over long lifespans.',
      image: '/assets/about/docx_steadite_cylinder.png',
      icon: Flame,
    },
    {
      id: 'four-valve',
      titleAr: 'محرك 4 صمامات عالي القوة (4-Valve Power Engine)',
      titleEn: '4-Valve Power Engine Architecture',
      descAr: 'يزيد تصميم الـ 4 صمامات من مساحة تدفق السحب والعادم، مما يدعم الاحتراق الأكمل وإمكانية توليد قوة حصانية أعلى.',
      descEn: 'The four-valve architecture increases intake and exhaust flow area, supporting fuller combustion and higher power potential.',
      image: '/assets/about/docx_4valve_engine.png',
      icon: Gauge,
    },
    {
      id: 'ceramic',
      titleAr: 'الأسطوانة المطلاة بالسيراميك (Ceramic-Coated Cylinder)',
      titleEn: 'Ceramic-Coated Cylinder (Ni-SiC)',
      descAr: 'تشتيت جزيئات سيراميك سيليكون كربيد (SiC) على جدار الأسطوانة لتوفير الصلابة، ومقاومة التآكل ومقاومة الحرارة العالية.',
      descEn: 'SiC ceramic particles dispersed on the cylinder wall provide extreme hardness, wear resistance and high heat resistance.',
      image: '/assets/about/docx_ceramic_cylinder.png',
      icon: Layers,
    },
    {
      id: 'efi',
      titleAr: 'نظام الحقن الإلكتروني للوقود (Electronic Fuel Injection - EFI)',
      titleEn: 'Electronic Fuel Injection (EFI)',
      descAr: 'يستخدم نظام EFI التحكم الإلكتروني لحساب متطلبات خليط الهواء والوقود بدقة لتحسين عملية الاحتراق واستهلاك الوقود.',
      descEn: 'EFI uses electronic control to calculate air-fuel requirements precisely for optimal combustion and efficiency.',
      image: '/assets/about/docx_efi_system.png',
      icon: Activity,
    },
  ], []);

  // 7. Strategic Direction Points (Verbatim from DOCX)
  const strategicDirections = useMemo(() => [
    { ar: 'تعميق التصنيع المصري وخلق القيمة المضافة المحلية.', en: 'Deepen Egyptian manufacturing and local value creation.' },
    { ar: 'بناء بيئة صناعية مستدامة للموردين والقوالب والعمليات الدقيقة.', en: 'Build a sustainable ecosystem of suppliers, tooling and precision processes.' },
    { ar: 'استخدام تقنيات الأتمتة و الـ CNC لرفع القدرة الصناعية والتكرارية.', en: 'Use automation and CNC technologies to raise industrial capability and consistency.' },
    { ar: 'تطوير مجمع العاشر من رمضان كقاعدة تصنيعية رئيسية للمجموعة.', en: 'Develop the 10th of Ramadan complex as the Group’s flagship manufacturing base.' },
    { ar: 'التوسع نحو طاقة إنتاجية سنوية تبلغ 100,000 مركبة نقل خفيف.', en: 'Scale toward an annual production capacity of 100,000 light vehicles.' },
    { ar: 'خلق أساس للنمو في الأسواق الإقليمية والتصنيع الموجه للتصدير مستقبلاً.', en: 'Create a foundation for regional market growth and future export-oriented manufacturing.' },
  ], []);

  const currentTech = mfgTechSections[activeTechIdx];
  const currentTimeline = progressionMilestones[activeTimelineIdx];

  return (
    <div className="min-h-screen bg-[#030306] text-white font-sans overflow-x-hidden selection:bg-[#E60012] selection:text-white" dir={dir}>
      <Header />

      {/* ── 🌌 GLOBAL BACKGROUND NEBULA ATMOSPHERE ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          style={{ y: nebulaY1 }}
          animate={{
            x: [0, 50, -50, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-36 left-1/2 -translate-x-1/2 w-[1400px] h-[750px] bg-[radial-gradient(ellipse_at_center,rgba(230,0,18,0.24)_0%,rgba(150,0,15,0.10)_50%,transparent_80%)] blur-[140px] opacity-80 will-change-transform transform-gpu"
        />

        <motion.div
          style={{ y: nebulaY2 }}
          animate={{
            x: [0, -70, 70, 0],
            opacity: [0.4, 0.65, 0.4],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 -left-36 w-[850px] h-[850px] bg-[radial-gradient(circle,rgba(220,0,18,0.18)_0%,rgba(110,0,10,0.08)_55%,transparent_80%)] blur-[160px] will-change-transform transform-gpu"
        />
      </div>

      {/* ── 🔍 High Resolution Lightbox Modal ── */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
            onClick={() => setLightboxImage(null)}
          >
            <div
              className="relative max-w-5xl w-full max-h-[92vh] bg-zinc-950 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center justify-center border-2 border-[#E60012]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E60012] animate-pulse" />
                  <span className="text-white font-extrabold text-sm sm:text-lg truncate max-w-[70vw]">{lightboxImage.title}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="p-2 rounded-full bg-zinc-900 hover:bg-[#E60012] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="relative w-full h-[55vh] sm:h-[65vh] bg-black rounded-xl overflow-hidden flex items-center justify-center border border-zinc-800 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lightboxImage.src}
                  alt={lightboxImage.title}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-contain filter contrast-110 brightness-110 block"
                />
              </div>

              {lightboxImage.desc && (
                <p className="text-xs sm:text-sm text-zinc-300 pt-3 text-center max-w-3xl font-light">
                  {lightboxImage.desc}
                </p>
              )}

              <div className={`w-full pt-3 flex flex-wrap items-center justify-between text-[11px] sm:text-xs text-zinc-400 gap-2 border-t border-zinc-800/80 mt-2 ${isAr ? 'font-sans' : 'font-mono'}`}>
                <span className="font-bold text-[#E60012]">🔍 {isAr ? 'المعرض الرسمي لملف سيموتيف' : 'SEMOTIVE OFFICIAL PROFILE EXHIBIT'}</span>
                <span>{isAr ? 'اضغط في أي مكان خارج الصورة للإغلاق' : 'TOUCH OR CLICK OUTSIDE TO CLOSE'}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 1. Hero Section (Official DOCX Cover & Identity) ── */}
      <section className="relative z-10 w-full min-h-[92vh] sm:min-h-screen flex flex-col justify-between pt-28 pb-16 sm:pt-36 sm:pb-20 border-b border-zinc-800/80 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Main Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="lg:col-span-7 space-y-6"
            >
              {/* Kicker Tagline */}
              <div className={`text-xs sm:text-sm font-bold text-[#E60012] tracking-[0.2em] uppercase ${isAr ? 'font-sans' : 'font-mono'}`}>
                {isAr ? 'صناعة الهندسة.. تصنيع المستقبل.' : 'ENGINEERING INDUSTRY. MANUFACTURING THE FUTURE.'}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.15]">
                {isAr ? (
                  <>
                    سيموتيف <br />
                    <span className="text-[#E60012]">لتصنيع المركبات ذ.م.م</span>
                  </>
                ) : (
                  <>
                    SEMOTIVE <br />
                    <span className="text-[#E60012]">VEHICLES MANUFACTURING LLC</span>
                  </>
                )}
              </h1>

              <h2 className="text-sm sm:text-base font-bold text-zinc-300">
                {isAr ? 'سيموتيف: الكيان الصناعي القابض لمجموعة المصانع' : 'SEMOTIVE: The Industrial Holding Entity for the Group of Factories'}
              </h2>

              <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed max-w-xl">
                {(isAr
                  ? 'تأسست شركة هامرز الدولية لصناعة وسائل النقل الخفيف عام 2000 وبنت أكثر من عقدين من الخبرة التصنيعية في مصر. وتُمثّل "سيموتيف لتصنيع المركبات ذ.م.م" الكيان الصناعي الموحد للمجموعة الذي يجمع مصانعها وقدراتها التصنيعية المتقدمة تحت مظلة واحدة.'
                  : 'Hammers International for Light Transportation Industry was established in 2000, building more than two decades of manufacturing experience. SEMOTIVE Vehicles Manufacturing LLC is now the Group’s unified industrial entity bringing its factories under one platform.')}
              </p>

              {/* Early Stat Trio (Verbatim from DOCX intro) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {[
                  { value: '2000', labelAr: 'تأسيس هامرز', labelEn: 'HAMMERS ESTABLISHED' },
                  { value: '25+', labelAr: 'سنة إرث صناعي', labelEn: 'INDUSTRIAL HERITAGE' },
                  { value: isAr ? 'مجموعة' : 'GROUP', labelAr: 'من المصانع المتخصصة', labelEn: 'OF SPECIALIZED FACTORIES', valueIsAr: true },
                ].map((s, i) => (
                  <div key={i} className="relative overflow-hidden p-3.5 rounded-xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 text-center">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#E60012] to-transparent" />
                    <span className={`text-lg sm:text-xl font-black text-white block ${s.valueIsAr ? 'font-sans' : 'font-mono'}`}>{s.value}</span>
                    <span className="text-[10px] font-bold text-zinc-400 block leading-tight mt-1">{isAr ? s.labelAr : s.labelEn}</span>
                  </div>
                ))}
              </div>

            </motion.div>

            {/* Exact DOCX Image 1 (Hero Banner) */}
            <div className="lg:col-span-5">
              <div
                className="relative rounded-3xl overflow-hidden bg-black border-2 border-zinc-800 hover:border-[#E60012] transition-colors shadow-2xl group cursor-pointer"
                onClick={() =>
                  setLightboxImage({
                    src: '/assets/about/docx_hero_banner.jpg',
                    title: 'SEMOTIVE Corporate & Industrial Profile Cover 2026',
                    desc: isAr ? 'الغلاف الرسمي والواجهة الصناعية لشركة سيموتيف لتصنيع المركبات ذ.م.م' : 'Official cover image from SEMOTIVE 2026 Corporate Profile',
                  })
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/about/docx_hero_banner.jpg"
                  alt="SEMOTIVE Official Cover Profile 2026"
                  className="w-full h-[380px] sm:h-[480px] object-cover group-hover:scale-105 transition-transform duration-700 block"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                  <div>
                    <span className={`px-3 py-1 rounded-full bg-[#E60012] text-white text-xs font-bold uppercase inline-block mb-1 ${isAr ? 'font-sans' : 'font-mono'}`}>
                      {isAr ? 'معرض رسمي' : 'OFFICIAL EXHIBIT'}
                    </span>
                    <h4 className="text-sm font-extrabold text-white">{isAr ? 'الملف الصناعي لسيموتيف 2026' : 'SEMOTIVE 2026 Industrial Profile'}</h4>
                  </div>
                  <div className="p-3 rounded-full bg-black/80 border border-white/20 text-white">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── SEMOTIVE at a Glance Grid Strip ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-12">
          <div className="text-center pb-4">
            <span className={`text-[#E60012] text-xs font-bold uppercase tracking-widest ${isAr ? 'font-sans' : 'font-mono'}`}>{isAr ? 'سيموتيف في لمحة' : 'SEMOTIVE AT A GLANCE'}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-2xl">
            {atAGlanceStats.map((st, i) => {
              const Icon = st.icon;
              return (
                <div key={i} className="p-3 sm:p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
                  <div className="p-2 rounded-lg bg-red-950 text-[#E60012] w-fit">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span dir="ltr" className="text-lg sm:text-xl font-black text-white block font-mono tracking-tight">{st.value}</span>
                  <span className="text-[11px] font-extrabold text-zinc-200 block leading-tight">{isAr ? st.labelAr : st.labelEn}</span>
                  <span className="text-[10px] text-zinc-400 font-light block truncate">{isAr ? st.subAr : st.subEn}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 2. The Transformation & Progression Roadmap ── */}
      <section className="relative z-10 py-20 sm:py-28 bg-[#040407] border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 border-l-4 border-[#E60012] pl-3 py-0.5">
              <span className={`text-[#E60012] text-xs font-bold uppercase tracking-widest ${isAr ? 'font-sans' : 'font-mono'}`}>{isAr ? 'التحول' : 'THE TRANSFORMATION'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {isAr ? 'مسيرة التحول والتطور الصناعي' : 'A Clear Industrial Progression'}
            </h2>
          </div>

          {/* Timeline Step Buttons */}
          <div className="flex items-center justify-start lg:justify-center gap-3 overflow-x-auto pb-3 no-scrollbar">
            {progressionMilestones.map((m, idx) => {
              const isCurrent = activeTimelineIdx === idx;
              return (
                <button
                  key={m.year}
                  type="button"
                  onClick={() => setActiveTimelineIdx(idx)}
                  className={`px-5 py-3 rounded-2xl font-mono text-xs sm:text-sm font-black transition-all shrink-0 cursor-pointer flex items-center gap-2 border ${
                    isCurrent
                      ? 'bg-[#E60012] text-white border-red-500 shadow-xl shadow-red-600/30 scale-105'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current" />
                  <span>{m.year}</span>
                  <span className={`text-[10px] font-normal opacity-80 ${isAr ? 'font-sans' : ''}`}>({isAr ? m.stageAr.split(' (')[0] : m.stageEn})</span>
                </button>
              );
            })}
          </div>

          {/* Active Milestone Card */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTimeline.year}
                initial={{ opacity: 0, x: isAr ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isAr ? 20 : -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-4 space-y-4 border-b lg:border-b-0 lg:border-r border-zinc-800 pb-6 lg:pb-0 lg:pr-8">
                  <span className={`px-3 py-1 rounded-full bg-red-950 border border-red-800 text-[#E60012] font-bold text-xs ${isAr ? 'font-sans' : 'font-mono'}`}>
                    {isAr ? currentTimeline.badgeAr : currentTimeline.badgeEn}
                  </span>
                  <div className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tighter">
                    {currentTimeline.year}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                    {isAr ? currentTimeline.titleAr : currentTimeline.titleEn}
                  </h3>
                </div>

                <div className="lg:col-span-8 space-y-4">
                  <span className={`text-xs font-bold text-[#E60012] uppercase block ${isAr ? 'font-sans' : 'font-mono'}`}>
                    {isAr ? currentTimeline.stageAr : currentTimeline.stageEn}
                  </span>
                  <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed">
                    {isAr ? currentTimeline.descAr : currentTimeline.descEn}
                  </p>
                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm font-extrabold text-white flex items-center justify-between">
                    <span>{isAr ? currentTimeline.highlightAr : currentTimeline.highlightEn}</span>
                    <TrendingUp className="w-4 h-4 text-[#E60012]" />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* ── 3. SEMOTIVE 10th of Ramadan - Diamond Base ── */}
      <section className="relative z-10 py-20 sm:py-28 bg-[#030306] border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 border-l-4 border-[#E60012] pl-3 py-0.5">
              <span className={`text-[#E60012] text-xs font-bold uppercase tracking-widest ${isAr ? 'font-sans' : 'font-mono'}`}>{isAr ? 'القاعدة الصناعية الماسية' : 'THE DIAMOND MANUFACTURING BASE'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              SEMOTIVE 10th of Ramadan
            </h2>
            <p className="text-zinc-300 text-sm sm:text-base font-light">
              {isAr ? 'القاعدة الماسية لتصنيع وسائل النقل الخفيف والدراجات النارية' : 'The Diamond Manufacturing Base for Light Vehicles'}
            </p>
            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
              {isAr
                ? 'يقع في قلب الفصل الصناعي القادم لسيموتيف مجمعها التصنيعي الجديد بمدينة العاشر من رمضان. تم تصميم الموقع ليكون القاعدة الصناعية الماسية للمجموعة: منصة عالية التقنية للإنتاج القابل للتوسع لوسائل النقل الخفيف، وتوطين أعمق، وتصنيع دقيق.'
                : "At the center of SEMOTIVE's next industrial chapter is its new manufacturing complex in 10th of Ramadan City. The site is conceived as the Group's Diamond Manufacturing Base: a high-technology platform for scalable light-vehicle production, deeper localization and precision manufacturing."}
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800">
              <span className="text-3xl sm:text-4xl font-black text-[#E60012] font-mono block">30,000 m²</span>
              <span className="text-xs sm:text-sm font-bold text-white block mt-1">{isAr ? 'مساحة المجمع التصنيعي' : 'MANUFACTURING FOOTPRINT'}</span>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800">
              <span className="text-3xl sm:text-4xl font-black text-[#E60012] font-mono block">100,000</span>
              <span className="text-xs sm:text-sm font-bold text-white block mt-1">{isAr ? 'مركبة / سنة طاقة إنتاجية' : 'VEHICLES / YEAR CAPACITY'}</span>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800">
              <span dir="ltr" className="text-3xl sm:text-4xl font-black text-[#E60012] font-mono block">10th OF RAMADAN</span>
              <span className="text-xs sm:text-sm font-bold text-white block mt-1">{isAr ? 'الموقع الصناعي بالعاشر من رمضان' : 'INDUSTRIAL CITY LOCATION'}</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed text-center max-w-4xl mx-auto">
            {isAr
              ? 'يتم تصميم المصنع للتجاوز إلى ما هو أبعد من التجميع التقليدي. فبنيته الصناعية موجهة لربط إنتاج المركبات بالهندسة الروبوتية، وتشغيل CNC، وقدرات تصنيع القوالب والأسطمبات، وتصنيع مكونات المحرك، وأنظمة الجودة، وتطوير المنتجات المستقبلية.'
              : 'The factory is being structured to move beyond conventional assembly. Its industrial architecture is intended to connect vehicle production with robotic engineering, CNC machining, mould and tooling capability, engine component manufacturing, quality systems and future product development.'}
          </p>

          {/* Factory Mission List */}
          <div className="p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-6">
            <h3 className="text-xl font-extrabold text-white border-b border-zinc-800 pb-4">
              {isAr ? 'مهمة وأهداف المصنع (Factory Mission):' : 'Factory Mission & Objectives:'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {factoryMissionList.map((m, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <CheckCircle2 className="w-5 h-5 text-[#E60012] shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-zinc-200 font-light">{isAr ? m.ar : m.en}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── 4. Advanced Manufacturing Technology (Robotic, CNC, Moulds) ── */}
      <section className="relative z-10 py-20 sm:py-28 bg-[#040407] border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 border-l-4 border-[#E60012] pl-3 py-0.5">
              <span className={`text-[#E60012] text-xs font-bold uppercase tracking-widest ${isAr ? 'font-sans' : 'font-mono'}`}>{isAr ? 'تكنولوجيا التصنيع المتقدمة' : 'ADVANCED MANUFACTURING TECHNOLOGY'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {isAr ? 'تكنولوجيا التصنيع المتقدمة' : 'Advanced Manufacturing Technology'}
            </h2>
            <p className={`text-xs sm:text-sm text-zinc-400 ${isAr ? 'font-sans' : 'font-mono'}`}>
              {isAr ? 'التكنولوجيا كقدرة صناعية حقيقية — ليست مجرد عرض.' : 'Technology as an industrial capability — not a showroom feature.'}
            </p>
            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
              {isAr
                ? 'تتمحور خطة سيموتيف التكنولوجية حول القدرة الإنتاجية: تؤدي الروبوتات عمليات صناعية متكررة، وتُنتج أنظمة CNC أجزاء دقيقة وقوالب، ويحافظ نموذج المصنع المتكامل على قدر أكبر من المعرفة التصنيعية داخل المؤسسة.'
                : 'SEMOTIVE’s technology program is positioned around production capability: robots perform repeatable industrial operations; CNC systems create precision parts and tooling; and the integrated factory model retains more manufacturing knowledge inside the organization.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mfgTechSections.map((sec, idx) => {
              const Icon = sec.icon;
              return (
                <div key={sec.id} className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 hover:border-[#E60012]/60 transition-all space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-zinc-900 text-[#E60012] border border-zinc-800">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#E60012] px-2.5 py-1 rounded-full bg-red-950 border border-red-800">
                      {sec.partner}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-extrabold text-white">{isAr ? sec.titleAr : sec.titleEn}</h3>
                  <span className={`text-xs text-zinc-400 block ${isAr ? 'font-sans' : 'font-mono'}`}>{isAr ? sec.subtitleAr : sec.subtitleEn}</span>
                  <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">{isAr ? sec.descAr : sec.descEn}</p>
                </div>
              );
            })}
          </div>

          <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed text-center max-w-4xl mx-auto">
            {isAr
              ? 'معاً، تهدف هذه القدرات إلى خلق منظومة تصنيعية تتكامل فيها الأتمتة والتشغيل والقوالب وإنتاج المركبات مع بعضها البعض. والقيمة الاستراتيجية هنا لا تقتصر على زيادة الإنتاج فقط، بل تمتد إلى تحكم أكبر في الجودة، والتوطين، وزمن التوريد، والمعرفة الصناعية.'
              : 'Together, these capabilities are intended to create a manufacturing system in which automation, machining, tooling and vehicle production reinforce one another. The strategic value is not only higher output, but also greater control over quality, localization, lead time and industrial know-how.'}
          </p>

        </div>
      </section>

      {/* ── 5. SEMOTIVE LLC: 8 Integrated Operational Layers ── */}
      <section className="relative z-10 py-20 sm:py-28 bg-[#030306] border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 border-l-4 border-[#E60012] pl-3 py-0.5">
              <span className={`text-[#E60012] text-xs font-bold uppercase tracking-widest ${isAr ? 'font-sans' : 'font-mono'}`}>{isAr ? 'منظومة تشغيلية موحدة' : 'UNIFIED OPERATIONAL ECOSYSTEM'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              SEMOTIVE LLC: {isAr ? 'المنظومة الصناعية الموحدة (8 قطاعات)' : 'The Unified Industrial Platform'}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 font-light">
              {isAr
                ? 'تجمع سيموتيف الطبقات الرئيسية الثمانية لتصنيع وسائل النقل الخفيف داخل منظومة إنتاجية متكاملة واحدة.'
                : 'SEMOTIVE connects the principal 8 layers of light-vehicle manufacturing within one integrated ecosystem.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ecosystem8Layers.map((lyr, i) => (
              <div key={i} className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
                <span className="text-[#E60012] font-mono font-bold text-sm shrink-0">0{i + 1}.</span>
                <span className="text-xs sm:text-sm text-zinc-200 font-light">{isAr ? lyr.ar : lyr.en}</span>
              </div>
            ))}
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-3 max-w-4xl mx-auto text-center">
            <div className="p-2.5 rounded-xl bg-zinc-900 text-[#E60012] border border-zinc-800 w-fit mx-auto">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white">
              {isAr ? 'لماذا يهم التكامل' : 'Why Integration Matters'}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
              {isAr
                ? 'يتيح هيكل مجموعة المصانع لسيموتيف التعامل مع التوطين كبرنامج هندسي وليس مجرد عملية توريد. فيمكن إعادة تصميم المكونات لتناسب التصنيع محلياً، ويمكن تطوير القوالب والأسطمبات داخلياً، ويمكن أتمتة العمليات، كما يمكن أن تعود ملاحظات الجودة مباشرة إلى هندسة الإنتاج.'
                : 'The Group-of-Factories structure allows SEMOTIVE to treat localization as an engineering program rather than only a sourcing exercise. Components can be redesigned for manufacturability, tooling can be developed locally, processes can be automated, and quality feedback can return directly to production engineering.'}
            </p>
          </div>

        </div>
      </section>

      {/* ── 6. Industrial Heritage with SYM & Engine Tech (DOCX Images 2,3,4,5,6) ── */}
      <section className="relative z-10 py-20 sm:py-28 bg-[#040407] border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Heritage with SYM Section with DOCX Image 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 border-l-4 border-[#E60012] pl-3 py-0.5">
                <span dir={isAr ? 'rtl' : 'ltr'} className={`text-[#E60012] text-xs font-bold uppercase tracking-widest ${isAr ? 'font-sans' : 'font-mono'}`}>
                  {isAr ? '14 عاماً من التعاون مع SYM' : '14 YEARS SYM COOPERATION'}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {isAr ? 'الإرث الصناعي مع SYM تايوان' : 'Industrial Heritage with SYM Taiwan'}
              </h2>
              <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed">
                {isAr
                  ? 'تشكل 14 عاماً من التعاون الصناعي الوثيق مع شركة Sanyang Motor Co., Ltd. (SYM) جزءاً رئيسياً من رأس المال الصناعي التراكمي للمجموعة. جمعت العلاقة بين التصنيع المرخص في مصر، والدعم الفني، وخبرة إنتاج الهياكل والمحركات، واعتماد تقنيات الروبوت والـ CNC، وتطوير الجودة والمعرفة العميقة بالمنتج. وتُعد هذه الشراكة الصناعية الممتدة 14 عاماً أساساً مهماً تُبنى عليه اليوم منظومة سيموتيف الصناعية الأكبر.'
                  : 'Fourteen years of close industrial cooperation with Sanyang Motor Co., Ltd. (SYM) form a major part of the Group’s accumulated industrial capital. The relationship combined licensed manufacturing in Egypt with technical support, frame & engine experience, and quality development. This 14-year industrial partnership is an important foundation upon which SEMOTIVE’s larger manufacturing ecosystem is now being built.'}
              </p>

              <div className="pt-2 space-y-3">
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  {isAr ? 'محاور فنية محفوظة من الملف التقني السابق' : 'Technical Themes Retained from the Legacy Profile'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { ar: 'معرفة تصنيع المركبات والمحركات.', en: 'Vehicle and engine manufacturing know-how.' },
                    { ar: 'معدات الإنتاج الآلي وهندسة التصنيع.', en: 'Automatic production equipment and manufacturing engineering.' },
                    { ar: 'تطوير القوالب وقدرات التشغيل الميكانيكي.', en: 'Mould development and mechanical processing capability.' },
                    { ar: 'تطوير المنتجات عبر السكوترات والدراجات النارية والتنقل الكهربائي.', en: 'Product development across scooters, motorcycles and electric mobility.' },
                    { ar: 'الجودة والابتكار والانضباط التصنيعي المهني.', en: 'Quality, innovation and professional manufacturing discipline.' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                      <CheckCircle2 className="w-4 h-4 text-[#E60012] shrink-0 mt-0.5" />
                      <span className="text-xs text-zinc-300 font-light">{isAr ? item.ar : item.en}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Exact DOCX Image 2 (Heritage SYM) */}
            <div className="lg:col-span-5">
              <div
                className="relative rounded-2xl overflow-hidden bg-black border border-zinc-800 hover:border-[#E60012] transition-colors shadow-2xl group cursor-pointer"
                onClick={() =>
                  setLightboxImage({
                    src: '/assets/about/docx_heritage_sym.png',
                    title: 'SYM Industrial Heritage Exhibit',
                    desc: isAr ? 'الرسم الهندسي التوضيحي للإرث الصناعي مع SYM تايوان' : 'SYM Taiwan Licensed Engineering Heritage Diagram from Profile',
                  })
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/about/docx_heritage_sym.png"
                  alt="Industrial Heritage with SYM Taiwan"
                  className="w-full h-[280px] sm:h-[340px] object-contain p-4 group-hover:scale-105 transition-transform duration-500 block"
                />
                <div className="absolute top-3 right-3 p-2 rounded-full bg-black/80 text-white">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Engine Technologies Section with DOCX Images 3,4,5,6 */}
          <div className="space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {isAr ? 'تكنولوجيا المحركات والمعرفة التصنيعية' : 'Engine Technology & Manufacturing Knowledge'}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
                {isAr
                  ? 'يحتوي الملف الفني الأصلي على أمثلة مفيدة لتقنيات المحركات المرتبطة بقاعدة معرفة SYM التصنيعية. وقد تم الاحتفاظ بها هنا كإرث تقني، فيما تركز قصة مصنع سيموتيف الجديد على القدرة على تصنيع وتشغيل المكونات بعمق محلي أكبر — وجميع الأشكال التالية مستخرجة فعلياً من ملف البروفايل المؤسسي الرسمي 2026.'
                  : 'The original technical profile contains useful examples of the engine technologies associated with the SYM manufacturing knowledge base. These are retained here as technical heritage, while SEMOTIVE’s new factory story focuses on the capability to manufacture and machine components with greater local depth — all diagrams below are extracted directly from the official 2026 corporate profile document.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {engineTechList.map((eng) => {
                const Icon = eng.icon;
                return (
                  <div key={eng.id} className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 hover:border-[#E60012]/60 transition-all flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="p-2.5 rounded-xl bg-zinc-900 text-[#E60012] w-fit border border-zinc-800">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-extrabold text-white leading-snug">{isAr ? eng.titleAr : eng.titleEn}</h4>
                      <p className="text-xs text-zinc-300 font-light leading-relaxed">{isAr ? eng.descAr : eng.descEn}</p>
                    </div>

                    {/* Exact DOCX Image */}
                    <div
                      className="relative w-full h-36 bg-black rounded-xl overflow-hidden border border-zinc-800 p-2 flex items-center justify-center cursor-pointer group"
                      onClick={() =>
                        setLightboxImage({
                          src: eng.image,
                          title: isAr ? eng.titleAr : eng.titleEn,
                          desc: isAr ? eng.descAr : eng.descEn,
                        })
                      }
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={eng.image}
                        alt={eng.titleEn}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 block"
                      />
                      <div className="absolute top-2 right-2 p-1 bg-black/80 rounded-full text-white">
                        <ZoomIn className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ── 7. Quality, Sustainability & Future Mobility (DOCX Image 7) ── */}
      <section className="relative z-10 py-20 sm:py-28 bg-[#030306] border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Exact DOCX Image 7 (Future Mobility / Sustainability) */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div
                className="relative rounded-2xl overflow-hidden bg-black border border-zinc-800 hover:border-[#E60012] transition-colors shadow-2xl group cursor-pointer"
                onClick={() =>
                  setLightboxImage({
                    src: '/assets/about/docx_future_mobility.jpg',
                    title: 'Quality, Sustainability & Future Mobility Exhibit',
                    desc: isAr ? 'صورة الجودة والاستدامة والتنقل الكهربائي المستقبلي من ملف البروفايل الرسمي' : 'Official Quality & Future Electric Mobility diagram from profile',
                  })
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/about/docx_future_mobility.jpg"
                  alt="Quality, Sustainability & Future Mobility"
                  className="w-full h-[300px] sm:h-[380px] object-cover group-hover:scale-105 transition-transform duration-500 block"
                />
                <div className="absolute top-3 right-3 p-2 rounded-full bg-black/80 text-white">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-5 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 border-l-4 border-[#E60012] pl-3 py-0.5">
                <span className={`text-[#E60012] text-xs font-bold uppercase tracking-widest ${isAr ? 'font-sans' : 'font-mono'}`}>{isAr ? 'منصة المستقبل' : 'FORWARD PLATFORM'}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                <BatteryCharging className="w-7 h-7 sm:w-8 sm:h-8 text-[#E60012] shrink-0" />
                {isAr ? 'الجودة، الاستدامة والتنقل المستقبلي' : 'Quality, Sustainability & Future Mobility'}
              </h2>
              <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed">
                {isAr
                  ? 'يضع الملف الفني السابق تركيزاً قوياً على الإدارة البيئية، ومنع التلوث، وتوفير الطاقة، وإعادة تدوير الموارد، وتطوير منتجات أكثر كفاءة. كما يحدد التنقل الكهربائي كتوجه طويل المدى لصناعة المركبات.'
                  : 'The legacy profile places strong emphasis on environmental management, pollution prevention, energy saving, resource recycling and the development of more efficient products. It also identifies electric mobility as a long-term direction for the vehicle industry.'}
              </p>

              <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed">
                {isAr
                  ? 'تم تصميم منصة سيموتيف الصناعية الجديدة لتوفير المرونة التصنيعية المطلوبة لأجيال المنتجات المستقبلية. نفس القدرات التي تدعم وسائل النقل الخفيف التقليدية — الأتمتة، التشغيل الدقيق، تصنيع القوالب، والاختبارات — تشكل الأساس الصناعي لبرامج التنقل الكهربائي المستقبلية.'
                  : 'SEMOTIVE’s new industrial base is designed to provide manufacturing flexibility required for future product generations. The same capabilities supporting conventional light vehicles — automation, CNC machining, tooling, and process engineering — form the foundation for electric mobility.'}
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <CheckCircle2 className="w-4 h-4 text-[#E60012] shrink-0" />
                  <span className="text-xs sm:text-sm text-zinc-200">{isAr ? 'جودة تصنيعية مبنية داخل العملية الإنتاجية.' : 'Manufacturing quality built into the process.'}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <CheckCircle2 className="w-4 h-4 text-[#E60012] shrink-0" />
                  <span className="text-xs sm:text-sm text-zinc-200">{isAr ? 'إنتاج كفء للموارد وتقليل النفايات الصناعية.' : 'Resource-efficient production and reduced industrial waste.'}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <CheckCircle2 className="w-4 h-4 text-[#E60012] shrink-0" />
                  <span className="text-xs sm:text-sm text-zinc-200">{isAr ? 'جاهزية هندسية لمجموعات القوة وتكنولوجيا التنقل الجديدة.' : 'Engineering readiness for new powertrain and mobility technologies.'}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <CheckCircle2 className="w-4 h-4 text-[#E60012] shrink-0" />
                  <span className="text-xs sm:text-sm text-zinc-200">{isAr ? 'منصة إنتاجية قادرة على التطور مع متطلبات السوق والتنظيم.' : 'A production platform capable of evolving with market and regulatory requirements.'}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 8. Industrial Vision & Strategic Direction ── */}
      <section className="relative z-10 py-20 sm:py-28 bg-[#040407] border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 border-l-4 border-[#E60012] pl-3 py-0.5">
              <span className={`text-[#E60012] text-xs font-bold uppercase tracking-widest ${isAr ? 'font-sans' : 'font-mono'}`}>{isAr ? 'الرؤية الصناعية لسيموتيف' : 'SEMOTIVE INDUSTRIAL VISION'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {isAr ? 'الرؤية والتوجه الاستراتيجي' : 'Industrial Vision & Strategic Direction'}
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed">
              {isAr
                ? 'يتمثل طموح سيموتيف في تحويل الخبرة التصنيعية المتراكمة إلى منصة صناعية مصرية حديثة، بحجم وتقنية وعمق هندسي يؤهلها للمنافسة إقليمياً.'
                : "SEMOTIVE's ambition is to convert accumulated manufacturing experience into a modern Egyptian industrial platform with the scale, technology and engineering depth to compete regionally."}
            </p>
            <div className="p-6 rounded-3xl bg-zinc-950 border-2 border-red-900/60 shadow-2xl">
              <blockquote className={`text-base sm:text-xl text-[#E60012] font-bold ${isAr ? 'font-sans' : 'font-mono'}`}>
                {isAr
                  ? '"تُمثّل هامرز الإرث الصناعي العريق.. وتُمثّل سيموتيف التحول المؤسسي نحو المستقبل."'
                  : '"Hammers represents the industrial heritage. SEMOTIVE represents its transformation into the future."'}
              </blockquote>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {strategicDirections.map((dirItem, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span className={`text-[#E60012] font-bold text-xs ${isAr ? 'font-sans' : 'font-mono'}`}>{isAr ? `اتجاه 0${idx + 1}` : `DIRECTION 0${idx + 1}`}</span>
                <p className="text-xs sm:text-sm text-zinc-200 font-light leading-relaxed">{isAr ? dirItem.ar : dirItem.en}</p>
              </div>
            ))}
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-3 max-w-4xl mx-auto text-center">
            <div className="p-2.5 rounded-xl bg-zinc-900 text-[#E60012] border border-zinc-800 w-fit mx-auto">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white">
              {isAr ? 'الطرح الصناعي' : 'Industrial Proposition'}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
              {isAr
                ? 'سيموتيف ليست مجرد اسم جديد لهامرز. فهامرز تمثل الجذور الصناعية للمجموعة وإرثها التصنيعي المتراكم، بينما تُعد "سيموتيف لتصنيع المركبات ذ.م.م" الكيان الصناعي الموحد الحالي الذي يوحّد ويطوّر مصانع المجموعة ووحدات التصنيع والقدرات الصناعية المتقدمة.'
                : "SEMOTIVE is not simply a new name for Hammers. Hammers represents the Group's industrial roots and accumulated manufacturing heritage, while SEMOTIVE Vehicles Manufacturing LLC is the current unified industrial entity that consolidates and develops the Group's factories, manufacturing units and advanced industrial capabilities."}
            </p>
          </div>

        </div>
      </section>

      {/* ── 9. Final CTA Banner ── */}
      <section className="relative z-10 py-20 sm:py-28 bg-[#030306]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-zinc-950 to-black border-2 border-zinc-800 shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,rgba(230,0,18,0.2)_0%,transparent_70%)] pointer-events-none" />

            <span className={`text-[#E60012] text-xs font-bold uppercase tracking-widest block ${isAr ? 'font-sans' : 'font-mono'}`}>
              {isAr ? 'الفصل القادم لصناعة وسائل النقل الخفيف المصرية' : 'The Next Chapter of Egyptian Light-Vehicle Manufacturing'}
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {isAr ? 'سيموتيف لتصنيع المركبات ذ.م.م' : 'SEMOTIVE VEHICLES MANUFACTURING LLC'}
            </h2>

            <p className={`text-lg sm:text-xl text-[#E60012] font-bold ${isAr ? 'font-sans' : 'font-mono'}`}>
              {isAr ? 'صناعة الهندسة.. تصنيع المستقبل.' : 'ENGINEERING INDUSTRY. MANUFACTURING THE FUTURE.'}
            </p>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl mx-auto font-light leading-relaxed">
              {isAr
                ? 'الكيان الصناعي الموحد لمجموعة المصانع من الإرث الصناعي إلى الجيل القادم من تصنيع وسائل النقل الخفيف والدراجات النارية بمصر.'
                : 'The unified industrial entity for the group of factories from industrial heritage to the next generation of light-vehicle manufacturing in Egypt.'}
            </p>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
              {isAr
                ? 'بُنيت على تاريخ هامرز الصناعي وتوسعت من خلال سيموتيف لتصنيع المركبات ذ.م.م، وتعمل المجموعة على إنشاء منصة تصنيعية عالية التقنية ترتكز على التوطين والهندسة الدقيقة والأتمتة والإنتاج القابل للتوسع.'
                : "Built on Hammers' industrial history and expanded through SEMOTIVE Vehicles Manufacturing LLC, the Group is creating a high-technology manufacturing platform centered on localization, precision engineering, automation and scalable vehicle production."}
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/products"
                className="px-8 py-4 bg-[#E60012] hover:bg-red-700 text-white rounded-full font-extrabold text-xs sm:text-sm shadow-2xl transition-all hover:scale-105 cursor-pointer"
              >
                {isAr ? 'معرض الموديلات والمنتجات' : 'EXPLORE VEHICLE CATALOG'}
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                {isAr ? 'تواصل مع الكيان الصناعي' : 'CONTACT INDUSTRIAL TEAM'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
