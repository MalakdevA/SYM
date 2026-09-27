'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';
import { ProductItem } from '@/lib/data/products';
import { fetchLiveProduct } from '@/lib/products-store';
import { formatPrice, shouldFlipImageToFaceLeft } from '@/lib/utils';
import { InstallmentCalculator } from '@/components/scooters/InstallmentCalculator';
import TestRideForm from '@/components/customer/TestRideForm';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { PURCHASING_ENABLED } from '@/lib/constants';
import {
  Flame,
  Zap,
  Gauge,
  Droplets,
  Award,
  MessageCircle,
  Scale,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Play,
  RotateCw,
  ChevronUp,
  Check,
  ShoppingBag
} from 'lucide-react';

// Helper function to return dynamic features for any scooter/bike model
interface FeatureItem {
  title: string;
  description: string;
  image: string;
  isWide?: boolean;
}

function getProductFeatures(product: ProductItem, isAr: boolean = false): { conceptTitle?: string; conceptDescription?: string; paragraphs?: string[]; htmlContent?: string; featureGallery?: Array<{ src: string; alt: string; caption?: string }>; has3dBadges?: boolean; list: FeatureItem[] } {
  const name = product.name;

  if (product.slug === 'joymax-z-300') {
    return {
      conceptTitle: isAr ? 'قيادة السكوتر تمنحك تجربة ممتعة ومذهلة بلا حدود' : 'Riding with Your Scooter Can Be a Joyful and Amazing Experience',
      conceptDescription: isAr
        ? 'تم تصميم Joymax Z 300 ليعزز متعة القيادة اليومية. يحقق هيكله المدمج التناغم المثالي بين التحكم الرياضي الرشيق وراحة الفئة الأولى للمحترفين. يتميز الموديل بمظهر عصري وجودة تايوانية فائقة وأداء استثنائي بسعر مثالي!'
        : `Joymax Z was designed to maximize your riding enjoyment. Its compact body achieves the fine harmony between the agile sports handling and the business class comfort. The model features the up to date look, high quality, outstanding performance, and affordable price!`,
      list: [
        {
          title: isAr ? 'مصابيح LED أمامي فائقة الإضاءة' : 'Full LED Headlights',
          description: isAr ? 'تمنح المصابيح الأمامية والخلفية الـ LED إضاءة استثنائية وتمنح Joymax Z 300 حضوراً مهيباً على الطرقات ليلاً ونهاراً.' : 'Full LED headlights and tail lights deliver superior illumination and give the Joymax Z 300 a striking road presence day and night.',
          image: '/assets/hero/headlight.png'
        },
        {
          title: isAr ? 'إضاءة خلفية LED مجسمة' : 'LED Tail Light',
          description: isAr ? 'مجموعة الإضاءة الخلفية الـ LED المتميزة توفر رؤية خلفية ممتازة وتخلق مظهرًا توقيعيًا فريدًا لسلسلة Joymax Z.' : 'The distinctive LED tail light cluster provides excellent rear visibility and creates a signature look unique to the Joymax Z series.',
          image: '/assets/hero/Headlight1.png'
        }
      ]
    };
  }

  if (product.slug === 'orbit-3-dx-150' || product.slug === 'orbit-3-150') {
    return {
      conceptTitle: isAr ? 'أداء رياضي عصري وتصميم حضري انسيابي' : 'Modern Sporty Performance & Streamlined Urban Mobility',
      conceptDescription: isAr
        ? 'تم تصميم SYM Orbit III DX 150 لتلبية متطلبات التنقل اليومي والقيادة الرياضية الحضرية بكل مرونة وأناقة. يأتي بمحرك 150cc القوي ونظام محرك موفر للوقود مع مظهر جريء، إضاءة LED حديثة، مساحة تخزين خوذة واسعة، ومنافذ شحن ذكية.'
        : `The SYM Orbit III DX 150 is engineered for versatile daily commuting and agile urban sport riding. Powered by a responsive 150cc engine, it features aggressive sharp styling, full LED positioning lights, ample underseat helmet storage, and user-friendly ergonomic controls.`,
      has3dBadges: true,
      featureGallery: [
        { src: '/assets/products/features/orbit3-headlight.png', alt: 'Orbit III DX 150 LED Headlight', caption: isAr ? 'مصباح LED عالي الإضاءة' : 'LED Headlight & Position Lamp' },
        { src: '/assets/products/features/orbit3-meter.png', alt: 'Orbit III DX 150 LCD Dashboard', caption: isAr ? 'عداد LCD رقمي متعدد الوظائف' : 'Digital LCD Dashboard' },
        { src: '/assets/products/features/orbit3-underseat.png', alt: 'Orbit III DX 150 Underseat Storage', caption: isAr ? 'صندوق تخزين واسع تحت المقعد' : 'Spacious Underseat Helmet Storage' },
        { src: '/assets/products/features/orbit3-brake.png', alt: 'Orbit III DX 150 CBS Disc Brake', caption: isAr ? 'فرامل ديسك هيدروليكية مع CBS' : 'CBS Disc Brake System' },
        { src: '/assets/products/features/orbit3-usb.png', alt: 'Orbit III DX 150 USB Quick Charger', caption: isAr ? 'منفذ شحن سريع USB QC 3.0' : 'USB QC 3.0 Quick Charger' }
      ],
      list: [
        {
          title: isAr ? 'تصميم عصري رياضي وإضاءة LED' : 'Sporty Styling & LED Position Lamp',
          description: isAr ? 'خطوط حادة هجومية مع إضاءة توقيعية LED تمنحك حضوراً جذاباً ورؤية ممتازة على الطريق.' : 'Sharp aggressive lines with LED signature position lamps for modern presence and safety.',
          image: '/assets/products/features/orbit3-headlight.png'
        },
        {
          title: isAr ? 'عداد LCD رقمي عالي التباين' : 'High-Contrast Digital LCD Instrument Dashboard',
          description: isAr ? 'لوحة عدادات رقمية تعرض السرعة، مستوى الوقود، المسافات، والجهد الكهربائي بوضوح تام ليلاً ونهاراً.' : 'Full digital LCD instrument cluster delivering real-time fuel, speed, trip meter, and battery metrics.',
          image: '/assets/products/features/orbit3-meter.png'
        },
        {
          title: isAr ? 'مساحة تخزين واسعة تحت المقعد' : 'Spacious Underseat Helmet Storage',
          description: isAr ? 'صندوق تخزين اتساعي لخوذة كاملة وأغراضك الشخصية بسهولة مع حماية من الأتربة.' : 'Generous underseat storage compartment that easily holds a full helmet and essentials.',
          image: '/assets/products/features/orbit3-underseat.png'
        },
        {
          title: isAr ? 'نظام فرامل أقراص متطور CBS' : 'Combined Braking System (CBS)',
          description: isAr ? 'فرامل هيدروليكية أمامية Ø 226 مم بنظام CBS يضمن توقف متوازن وسريع على كافة الطرق.' : 'Front hydraulic 226mm disc brake with CBS ensuring reliable stopping power and stability.',
          image: '/assets/products/features/orbit3-brake.png'
        },
        {
          title: isAr ? 'شاحن سريع QC 3.0 USB ومساحة أمامية' : 'USB Quick Charger QC 3.0 & Utility Pocket',
          description: isAr ? 'منفذ شحن ذكي للهواتف مع جيب أمامي متعدد الاستخدامات لسهولة الاستخدام أثناء القيادة.' : 'QC 3.0 USB charging socket with convenient front utility pocket for smart device charging.',
          image: '/assets/products/features/orbit3-usb.png'
        }
      ]
    };
  }

  if (product.slug === 'cruisym-300' || product.slug === 'cruisym-300i') {
    return {
      conceptTitle: '',
      htmlContent: isAr
        ? `<p class="mb-4">تدمج SYM المظهر العصري الحضري والرياضي، وتجمع بين وظائف السفر والتحمل مع عناصر المغامرة الشاقة لتصمّم السكوتر الماكسي المتعدد الاستخدامات كروزر-Cruisym. تندمج واجهة السكوتر مع الهيكل الجريء للدراجات النارية، كما تمنح المرايات الخلفية القابلة للطي والمزودة بإشارات LED عالية القوة هوية فريدة لا مثيل لها. إنه السكوتر الأكثر أناقة وقوة الذي شاهدته على الإطلاق.</p><p class="mb-4">ومع روح الأداء العالي، تأتي النسخة الجديدة معتمدة بمعايير Euro 5+ لتطوير الكفاءة وتوفير الوقود وحماية البيئة مع رفع معدلات الأمان على الطرق.</p>`
        : `<p class="mb-4">SYM integrates the urban and sport appearance, combines the touring function with the adventure elements, to create the multifunctional crossover Maxi scooter-Cruisym. The beak image of the adventure bike is blended into the front design. The foldable rear view mirrors with the high power LED signal lights create the unique identity. It is the most stylish scooter you have ever seen.</p><p class="mb-4">With the distinctive spirit inside, there is no doubt that Cruisym the Euro 5+ version of Cruisym–is going to evolve. The upgrades will be seen on certain features to make this scooter trendy.</p>`,
      list: [
        {
          title: isAr ? 'عدسات مصابيح LED إسقاطية' : 'Projector LED Headlight',
          description: isAr ? 'عدسات إسقاطية LED مزدوجة تمنح إضاءة قوية ورؤية استثنائية في الظلام مع مظهر تقني عصري.' : 'The exposed-lens LED projectors for superior illumination and a high-tech look.',
          image: '/assets/products/features/led.jpg'
        },
        {
          title: isAr ? 'مصباح خلفي 3D مجسم' : '3D Sculpted Tail Light',
          description: isAr ? 'تصميم مصابيح LED خلفية مجسمة يعكس هوية SYM العصرية الحصرية ويضمن سلامة القيادة.' : 'The matrix-style LED tail light echoes the layered, angular design of the front, creating a cohesive visual signature.',
          image: '/assets/products/features/3d.jpg'
        }
      ]
    };
  }

  if (product.slug === 'cruisym-400i') {
    return {
      conceptTitle: isAr ? 'دع قلبك يكون بوصلتك' : 'Let your heart be your compass',
      conceptDescription: isAr
        ? `تجمع لغة تصميم ${name} بين الهجومية الجريئة والأناقة الفائقة. تم تشكيل كل سطح ليعكس التوازن بين الخفة والانطلاق الإنسيابي، حتى أثناء التوقف.`
        : `The ${name}'s design language is a deliberate fusion of aggression and elegance. Every surface is crafted to convey a sense of lightness and forward momentum, even at a standstill.`,
      list: [
        {
          title: isAr ? 'عدسات مصابيح LED إسقاطية' : 'Projector LED Headlight',
          description: isAr ? 'عدسات إسقاطية LED مكشوفة لتوفير إضاءة استثنائية ورؤية ممتازة مع مظهر تقني عالي.' : 'The exposed-lens LED projectors for superior illumination and a high-tech look.',
          image: '/assets/products/features/led.jpg'
        },
        {
          title: isAr ? 'مصباح خلفي 3D مجسم' : '3D Sculpted Tail Light',
          description: isAr ? 'تصميم مصفوفة المصابيح الخلفية الـ LED يعكس طابع الواجهة الأمامية ليمنح السكوتر مظهرًا توقيعياً فريداً.' : 'The matrix-style LED tail light echoes the layered, angular design of the front, creating a cohesive visual signature.',
          image: '/assets/products/features/3d.jpg'
        },
        {
          title: isAr ? 'شاشة TFT قياس 7 بوصة' : '7-inch TFT Display',
          description: isAr ? 'شاشة ذكية تعدل السطوع تلقائياً بين النهار والليل مع 3 واجهات عرض مختلفة لأعلى مستوى من الرؤية.' : 'Smart day/night auto-brightness meets three UI modes for peak visibility.',
          image: '/assets/products/features/inch.jpg',
          isWide: true
        }
      ]
    };
  }

  if (product.slug === 'husky-adv') {
    return {
      conceptTitle: isAr ? 'تحدَّ جميع الطرق والتضاريس بثقة مطلقة' : 'Conquer any terrain with fearless confidence',
      conceptDescription: isAr
        ? `يجمع ${name} بين المظهر المغامر الجريء وتكنولوجيا الإضاءة المتقدمة ونظام تعليق طويل المدى مع خلوص أرضي مرتفع لتجربة مغامرة استثنائية على الطرقات الحضرية والوعرة.`
        : `The ${name} combines crossover adventure ergonomics with aggressive LED styling, long-travel suspension, and high ground clearance for effortless urban and off-road riding.`,
      has3dBadges: true,
      list: [
        {
          title: isAr ? 'تصميم مغامرة Crossover ADV' : 'Crossover ADV Body Styling',
          description: isAr ? 'هيكل مغامرة شاق مع ارتفاع ممتازة عن الأرض لاستكشاف الطرق الوعرة والشوارع بكل ثقة.' : 'Rugged adventure chassis with high ground clearance for urban exploration and rough terrain.',
          image: product.image
        },
        {
          title: isAr ? 'منظومة مصابيح LED Matrix كاملة' : 'Full LED Matrix Headlight System',
          description: isAr ? 'عدسات إضاءة LED إسقاطية عالية الشدة لتوفير أقصى مستوى من الرؤية ليلًا في جميع الأجواء.' : 'High-intensity dual LED projector lenses providing maximum night visibility in all weather conditions.',
          image: '/assets/products/features/led.jpg'
        },
        {
          title: isAr ? 'عداد LCD رقمي متعدد الوظائف' : 'Digital LCD Multi-Function Instrument Cluster',
          description: isAr ? 'لوحة عدادات LCD فائقة التباين تعرض بيانات مستوى الوقود، والسرعة، والمسافات، والجهد الكهربائي.' : 'High-contrast LCD instrument panel delivering real-time fuel, speed, trip, and battery metrics.',
          image: product.images?.[1] || product.image
        }
      ]
    };
  }

  if (product.slug === 'jet-14-evo') {
    return {
      conceptTitle: '',
      htmlContent: isAr ? `
        <p class="mb-6">أدركت SYM الجوهر الحقيقي لدراجات التنقل اليومي الذكية؛ وهي الاقتصادية والعملية والشكل الرياضي الأنيق. واستناداً إلى النجاح المبهر لـ JET 14، يأتي JET 14 EVO بمساحة تخزين أوسع تحت المقعد وفتحة خزان وقود أمامية لتوفير أعلى مستويات الراحة.</p>
        <h4 class="text-[18px] md:text-[20px] font-bold text-[#333333] mt-8 mb-3 font-sans uppercase">تصميم رياضي حضري أنيق</h4>
        <p class="mb-4">تعتمد الإضاءة الخطية الـ LED حس التكنولوجيا من فئات السيارات الفاخرة، مع إشارات انعطاف أمامية ديناميكية وتطعيمات V-shape تعكس الجمال العصري.</p>
        <div class="w-full max-w-[720px] overflow-hidden my-6"><img src="/assets/hero/position light.png" alt="Jet 14 Evo Position Light" class="w-full h-auto block object-cover rounded-xl" /></div>
        <h4 class="text-[18px] md:text-[20px] font-bold text-[#333333] mt-8 mb-3 font-sans uppercase">قيادة بمنتهى الراحة والاستقرار</h4>
        <p class="mb-4">تم تمديد قاعدة العجلات من 1350 إلى 1370 مم مع تزويده بنظام <span class="text-[#E60012] font-semibold">A.L.E.H.</span> المانع لارتفاع المحرك وتوسيع الإطار الخلفي لثبات مطلق على السرعات العالية.</p>
        <h4 class="text-[18px] md:text-[20px] font-bold text-[#333333] mt-8 mb-3 font-sans uppercase">تخزين وخدمة مريحة</h4>
        <p class="mb-4">بفضل خزان الوقود الأمامي، اتسعت مساحة التخزين تحت المقعد إلى 28 لتر لتتسع لخوذة كاملة ومتعلقاتك اليومية. كما تحتوي على شاشة LCD ملونة 5 بوصة ومخرج شحن سريع USB Type-C و Type-A.</p>
      ` : `<p class="mb-6">SYM deeply realized the essence of a competent commuting two wheeler; economy, utility but stylish are European commuters' concern. Based on the brilliant features from the JET14, the JET14 EVO's under seat storage is larger and front located fuel tank cap improves convenience. In the meantime, the lengthened wheelbase and top case extension capability make each ride much cushier and less worried.</p><h4 class="text-[18px] md:text-[20px] font-bold text-[#333333] mt-8 mb-3 font-['Arial','Helvetica_Neue',Helvetica,sans-serif] tracking-tight uppercase">STYLISH URBAN SPORT</h4><p class="mb-4">Followed the design concept of SYM maxi scooter Joymax Z+, the JET14 EVO duplicated the spirit on the front. The linear LED position lights demonstrates automobile grade sense of technology, along with the dynamic LED front turn indicators and the V-shape garnish truly stimulates the new wave of modern beauty.</p><div class="w-full max-w-[720px] overflow-hidden my-6"><img src="/assets/hero/position light.png" alt="Jet 14 Evo STYLISH URBAN SPORT Position Light" class="w-full h-auto block object-cover" /></div><h4 class="text-[18px] md:text-[20px] font-bold text-[#333333] mt-8 mb-3 font-['Arial','Helvetica_Neue',Helvetica,sans-serif] tracking-tight uppercase">RIDE WITH COMFORT</h4><p class="mb-4">The JET14 EVO shares the frame from the reengineered Symphony ST; the wheelbase was lengthened from 1350 to 1370 mm, with <span class="text-[#E60012] font-semibold">A.L.E.H.</span>(Anti-lift Engine Hanger System) and 120 mm widened rear tire are gathered for better comfort and stability. The extended foot slopes were designed for riders to select between the two riding positions.</p><p class="mb-6">The JET14 EVO also includes comfy riding geometry and ample foot board as the predecessor.</p><h4 class="text-[18px] md:text-[20px] font-bold text-[#333333] mt-8 mb-3 font-['Arial','Helvetica_Neue',Helvetica,sans-serif] tracking-tight uppercase">USER ORIENTED</h4><p class="mb-4">Thanks to the front-located fuel tank, the under seat storage has been expanded to 28 L and can accommodate one regular size* full face helmet and other stuff.</p><p class="mb-4 text-xs text-[#777777]">(*The luggage box may not accommodate all sizes and shapes helmets).</p><p class="mb-4">The new 5-inch color LCD dash contains the basic info usually seen on other SYM models: vehicle and engine speed, clock, battery voltage, coolant temperature gauge (125 liquid cooled), fuel gauge, side stand indicator, trip meters . Moreover, it integrates ambient temperature display that benefits daily use a lot.</p><p class="mb-6">Dual braking aids: 2-channel <span class="text-[#E60012] font-semibold">ABS</span> or CBS are also standard equipped for the JET14 EVO. SYM kept various types of engine options for customers: 125 air cooled(2-valve)/liquid cooled(4-valve) and 200(169 c.c.) air cooled, all conform to EURO 5+ emission standards.</p><h4 class="text-[18px] md:text-[20px] font-bold text-[#333333] mt-8 mb-3 font-['Arial','Helvetica_Neue',Helvetica,sans-serif] tracking-tight uppercase">FUNCTIONAL UPGRADES</h4><p class="mb-4">The 5-inch color LCD instrument panel is standard equipped on each type of JET14 EVO. The integrated top case carrier is well considered in convenience and artistic look. The double USB charging sockets Type-C and Type-A (QC 3.0) are equipped for enhanced flexibility. The convenience of refueling is greatly improved by the front fuel tank cap, which makes every gas station time becomes pleasant. Hazard light is another upgrade for the JET14 EVO.</p>`,
      list: []
    };
  }

  if (product.slug === 'jet-4-150' || product.slug === 'jet-4') {
    return {
      conceptTitle: '',
      htmlContent: isAr ? `
        <p class="mb-4 text-[#555555] text-sm leading-[1.7]">يعد Jet 4 طرازاً كلاسيكياً عريقاً في أسطول SYM، فهو يجمع بين الهيكل الرياضي الخفيف والسعر الاقتصادي المناسب لتنقلات الشباب اليومية.</p>
        <p class="mb-6 text-[#555555] text-sm leading-[1.7]">يأتي الطراز المطور Jet 4 RX بمعايير Euro 5 ليقدم قفزة نوعية تجمع بين مظهر المغامرة الجريء والشاسيه المطور لقيادة أكثر ثباتاً وسلاسة.</p>
      ` : `<p class="mb-4 text-[#555555] text-sm leading-[1.7] font-sans">Jet 4 is one of the classic SYM models. It is the commuting scooter with the sports apparel and economical price. The 50cc and 125cc options allow the customers to choose the ideal displacement according to their needs.</p><p class="mb-6 text-[#555555] text-sm leading-[1.7] font-sans">After the lasting product life, it's time for Jet 4's evolution. Jet 4 RX – the Euro 5 version of Jet 4 – has come out with the all new upgrade. It not only combines the sports and off-road elements on the apparel but also applies the new frame to make it better riding experience.</p>`,
      featureGallery: [
        { src: '/assets/products/features/jet4-headlight.png', alt: 'Jet 4 Headlight', caption: isAr ? 'المصباح الأمامي' : 'Headlight' },
        { src: '/assets/products/features/jet4-taillight.png', alt: 'Jet 4 3D LED Taillight' },
        { src: '/assets/products/features/jet4-lcd.png', alt: 'Jet 4 LCD Instrument Meter' }
      ],
      list: [
        {
          title: isAr ? 'مصابيح LED هجومية وإضاءة إرشادية' : 'Aggressive LED Headlight & Position Lamp',
          description: isAr ? 'عدسات إضاءة LED مزدوجة فائقة القوة مع إضاءة النهار الـ DRL لمظهر رياضي هجومي.' : 'High-intensity dual LED projector optics with sharp angular DRL position lamp for aggressive sport presence.',
          image: '/assets/products/features/jet4-headlight.png'
        },
        {
          title: isAr ? 'مصباح خلفي 3D مجسم' : 'Signature 3D Sculpted LED Tail Light',
          description: isAr ? 'مجموعة مصابيح خلفية LED بتصميم الأجنحة المزدوجة لتوفير سلامة ورؤية فائقة من الخلف.' : 'Distinctive dual-wing LED rear signature lighting providing safety and instant recognition from behind.',
          image: '/assets/products/features/jet4-taillight.png'
        },
        {
          title: isAr ? 'عداد LCD رقمي عالي التباين' : 'High-Contrast LCD Digital Instrument Cluster',
          description: isAr ? 'لوحة عدادات رقمية تظهر السرعة، والوقود، والساعة، والجهد مع ضبط الإضاءة تلقائياً ليلاً.' : 'Full digital LCD dashboard displaying speed, fuel level, clock, and voltage with auto-dimmer night visibility.',
          image: '/assets/products/features/jet4-lcd.png'
        }
      ]
    };
  }

  if (product.slug === 'jet-14-dd') {
    return {
      conceptTitle: isAr ? 'JET 14 DD 150/200 - الرشاقة الحضرية وأمان الفرامل المزدوجة' : 'JET 14 DD 150/200 - Urban Agility & Double Disc Safety',
      htmlContent: isAr ? `
        <p class="mb-6">يعد JET 14 DD السكوتر الأكثر مبيعاً وعراقة بعجلات 14 بوصة. صُمم خصيصاً للتنقل اليومي في المدينة مع أرضية مسطحة مريحة وفرامل ديسك مزدوجة (DD) لثبات مطلق وقوة توقف ممتازة.</p>
        <h4 class="text-[18px] md:text-[20px] font-bold text-[#333333] mt-8 mb-3 font-sans uppercase">فرامل ديسك مزدوجة (DD) وعجلات 14 بوصة</h4>
        <p class="mb-4">مزود بفرامل ديسك أمامي 260 مم وفرامل ديسك خلفي 220 مم لأداء توقف استثنائي. تضمن العجلات الألومنيوم سعة 14 بوصة قيادة سلسة فوق الحفر والمطبات الحضرية.</p>
        <div class="w-full max-w-[720px] overflow-hidden my-6"><img src="/assets/products/features/jet14-dd-brakes.png" alt="SYM Jet 14 DD Double Disc Brakes" class="w-full h-auto block object-cover rounded-xl border border-gray-200" /></div>
        <h4 class="text-[18px] md:text-[20px] font-bold text-[#333333] mt-8 mb-3 font-sans uppercase">أرضية مسطحة مريحة وأرغونومكس حضري</h4>
        <p class="mb-4">صُمم لراحة الراكب مع أرضية مسطحة واسعة لسهولة حرق الأقدام وحمل الحقائب اليومية، وارتفاع مقعد منخفض 770 مم يناسب جميع القامات.</p>
      ` : `<p class="mb-6">The JET 14 DD is SYM's iconic best-selling 14-inch urban sport scooter. Engineered specifically for city commuters, it features a lightweight chassis, flat floorboard ergonomics, and dual disc brakes (DD) for reliable stopping power and high-speed stability.</p><h4 class="text-[18px] md:text-[20px] font-bold text-[#333333] mt-8 mb-3 font-['Arial','Helvetica_Neue',Helvetica,sans-serif] tracking-tight uppercase">DUAL DISC BRAKING (DD) & 14" WHEELS</h4><p class="mb-4">Equipped with front 260mm wave disc brake and rear 220mm disc brake, the JET 14 DD provides exceptional braking performance and short stopping distances. The 14-inch aluminum alloy wheels ensure smooth handling over urban potholes and cobblestones.</p><div class="w-full max-w-[720px] overflow-hidden my-6"><img src="/assets/products/features/jet14-dd-brakes.png" alt="SYM Jet 14 DD Double Disc Brakes and 14-inch Alloy Wheels" class="w-full h-auto block object-cover rounded-xl shadow-md border border-gray-200" /></div><h4 class="text-[18px] md:text-[20px] font-bold text-[#333333] mt-8 mb-3 font-['Arial','Helvetica_Neue',Helvetica,sans-serif] tracking-tight uppercase">URBAN ERGONOMICS & FLAT FLOORBOARD</h4><p class="mb-4">Designed with rider comfort in mind, the JET 14 DD features a spacious flat floorboard allowing comfortable leg room and easy carrying of everyday bags. The low 770mm seat height provides easy ground reach for all riders.</p><h4 class="text-[18px] md:text-[20px] font-bold text-[#333333] mt-8 mb-3 font-['Arial','Helvetica_Neue',Helvetica,sans-serif] tracking-tight uppercase">DUAL HEADLIGHT & LED POSITION LAMPS</h4><p class="mb-4">The aggressive dual headlight cluster includes bright LED position lights for modern aesthetics and maximum road presence day and night.</p><h4 class="text-[18px] md:text-[20px] font-bold text-[#333333] mt-8 mb-3 font-['Arial','Helvetica_Neue',Helvetica,sans-serif] tracking-tight uppercase">RELIABLE 150CC 4-STROKE ENGINE</h4><p class="mb-4">Powered by a fuel-efficient 150cc air-cooled 4-stroke engine delivering 12.5 HP @ 8000 RPM, the JET 14 DD provides punchy acceleration for overtaking in city traffic with minimal fuel consumption.</p>`,
      list: [
        {
          title: isAr ? 'فرامل ديسك مزدوجة (أمامي 260مم وخلفي 220مم)' : 'Double Disc Brakes (Front 260mm & Rear 220mm)',
          description: isAr ? 'تضمن فرامل الديسك الموجية على كلا العجلتين قوة توقف متزامنة وممتازة.' : 'Wave disc brakes on both wheels ensure synchronized, powerful stopping capability.',
          image: '/assets/products/features/jet14-dd-brakes.png'
        },
        {
          title: isAr ? 'جنوط سبائكية مقاس 14 بوصة' : '14-Inch Alloy Wheels',
          description: isAr ? 'تمتص العجلات مقاس 14 بوصة عيوب الطرق الحضرية لقيادة أكثر سلاسة وأماناً.' : 'Larger 14-inch wheels absorb city road imperfections for a smoother, safer ride.',
          image: product.images?.[0] || product.image
        },
        {
          title: isAr ? 'مساحة تخزين واسعة تحت المقعد' : 'Spacious Helmet Storage & Utility Hook',
          description: isAr ? 'تتسع المساحة الكبيرة تحت المقعد لخوذة كاملة وأغراضك اليومية.' : 'Generous under-seat compartment accommodates a full-face helmet plus daily essentials.',
          image: product.images?.[1] || product.image
        }
      ]
    };
  }

  if (product.slug === 'jet-x-200' || product.slug === 'jet-x-150') {
    return {
      conceptTitle: '',
      htmlContent: isAr ? `
        <p class="mb-4 text-[#555555]">تعد سلسلة Jet واحدة من أكثر سلاسل سكوتر SYM رقيًا وعراقة. مرّ أكثر من عقد من الزمان منذ انطلاق السلسلة لأول مرة، وما زالت طرازات Jet الأكثر مبيعًا في الأسواق الأوروبية والعالمية. وانطلاقاً من الجينات الرياضية المتفوقة، حققت SYM قفزة هندسية بالتعاون مع GPX لابتكار الطراز الرياضي الجريء والقوي – Jet X 200.</p>
        <p class="mb-6 text-[#555555]">باعتباره الطراز الرائد في سلسلة Jet، يتميز Jet X بميزات مذهلة تشمل تصميم هيكل مستوحى من دراجات السباق الرياضية، ومواصفات هندسية تمنح الراكب الراحة والأمان المطلق وتجربة قيادة فاخرة مع التحكم الديناميكي والدقة المتناهية.</p>
        <h4 class="text-[18px] md:text-[20px] font-bold text-[#333333] mt-6 mb-3 font-sans">إضاءة LED كاملة</h4>
        <p class="mb-4 text-[#555555]">تم تجهيز Jet X بمصابيح LED أمامي، ومصابيح إرشادية LED، ومصابيح خلفية LED، وإشارات انعطاف LED. لا يمنح نظام الإضاءة الـ LED الكامل طراز Jet X مظهراً مستقبلياً وعصرياً فحسب، بل يرفع من مستوى أمان القيادة ليلاً بشكل استثنائي.</p>
        <div class="w-full max-w-[720px] overflow-hidden my-6"><img src="/assets/hero/headl.png" alt="Jet X LED Headlight" class="w-full h-auto block object-cover rounded-xl" /></div>
        <h4 class="text-[18px] md:text-[20px] font-bold text-[#333333] mt-8 mb-3 font-sans">سهولة التحكم والارغونومكس المريحة</h4>
        <p class="mb-4 text-[#555555]">من الداخل إلى الخارج، يركز تصميم Jet X بالكامل على سهولة التحكم والراحة التامة للراكب. يستطيع الراكب الاستمتاع بوضع استجابة مريح وتوجيه دقيق على مختلف الطرق.</p>
        <h4 class="text-[18px] md:text-[20px] font-bold text-[#333333] mt-8 mb-3 font-sans">نظام التشغيل الذكي بدون مفتاح Keyless 2.0</h4>
        <p class="mb-4 text-[#555555]">يطبق Jet X نظام تشغيل بدون مفتاح لجعل القيادة أكثر ذكاءً وراحة. يستبدل ريموت الكنترول المفتاح التقليدي لتشغيل المحرك بسهولة وسرعة.</p>
        <h4 class="text-[18px] md:text-[20px] font-bold text-[#333333] mt-8 mb-3 font-sans">عداد LCD الرقمي المستقبلي</h4>
        <p class="mb-4 text-[#555555]">يوفر عداد LCD المطور رؤية مستقبلية واضحة لجميع بيانات السرعة والوقود والجهد الكهربائي مع خاصية التعديل التلقائي للسطوع Auto Dimmer لضمان أفضل رؤية في جميع الظروف.</p>
        <div class="w-full max-w-[720px] overflow-hidden my-6"><img src="/assets/hero/Jetxinstrument.png" alt="Jet X LCD Instrument Dashboard" class="w-full h-auto block object-cover rounded-xl" /></div>
        <h4 class="text-[18px] md:text-[20px] font-bold text-[#333333] mt-8 mb-3 font-sans">مفتاح إضاءة التنبيه للطورائ (Hazard Control)</h4>
        <p class="mb-4 text-[#555555]">مفتاح التحكم بإشارات الانتظار والفرامل الطارئة لتنبيه المركبات خلفك عند التوقف المفاجئ.</p>
        <div class="w-full max-w-[720px] overflow-hidden my-6"><img src="/assets/hero/hazardcontrollight.png" alt="Jet X Hazard Control Light Switch" class="w-full h-auto block object-cover rounded-xl" /></div>
        <div class="space-y-6 pt-4">
          <p class="text-[14px] text-[#666666] leading-[1.65]"><strong class="font-bold text-[#333333] text-[15px] block mb-1">محرك 4 صمامات تبريد مائي (Liquid-Cooled)</strong>يضمن التبريد المائي الحفاظ على درجة الحرارة المثالية لأجزاء المحرك، مما يرفع الكفاءة والأداء إلى أقصى حد.</p>
          <p class="text-[14px] text-[#666666] leading-[1.65]"><strong class="font-bold text-[#333333] text-[15px] block mb-1">مساعد خلفي قابل للتعديل (Adjustable Rear Suspension)</strong>يمكن تعديل المساعدين الخلفيين لضبط مستوى امتصاص الصدمات وتوفير ثبات ممتاز.</p>
          <p class="text-[14px] text-[#666666] leading-[1.65]"><strong class="font-bold text-[#333333] text-[15px] block mb-1">مساحة تخزين أمامية ذكية (Front Compartment)</strong>توفر مساحة للتخزين السريع للكروت والهواتف الذكية مع مخرج شحن سريع QC 2.0.</p>
          <p class="text-[14px] text-[#666666] leading-[1.65]"><strong class="font-bold text-[#333333] text-[15px] block mb-1">نظام التحكم في الجر (Traction Control System - TCS)</strong>يمنع انزلاق العجلة الخلفية عند الانطلاق أو التسارع أو الانعطاف على الطرق الزلقة.</p>
        </div>`
        : `<p class="mb-4">Jet is one of the most prestigious series in the SYM scooter lineup. It has been more than a decade since the Jet series' debut. Until now, Jet 14 is still the hot-selling model in the European markets. Evolution from the superior DNA of Jet 14, SYM makes the self-breakthrough in design orientation through collaboration with GPX and eventually creates the concise and aggressive model – Jet X.</p><p class="mb-6">Being the flagship model of the Jet series, Jet X equips with the tremendous features included but not limited to the racing bike characteristic design which makes Jet X with the unique identification; the high-end specs offer the riders the convenience, safety and the luxury riding experience; the advanced engineering adjustment brings the perfect maneuverability and ergonomics. All the riding essentials, you can definitely experience them from Jet X.</p><h4 class="text-[18px] md:text-[20px] font-bold text-[#333333] mt-6 mb-3 font-['Arial','Helvetica_Neue',Helvetica,sans-serif] tracking-tight">LED Lighting</h4><p class="mb-4">Jet X equips with the LED headlight, LED position light, LED taillight, and LED turn indicators. The full LED lighting not only makes Jet X modern and futuristic but also greatly improves the riding safety.</p><div class="w-full max-w-[720px] overflow-hidden my-6"><img src="/assets/hero/headl.png" alt="Jet X LED Headlight" class="w-full h-auto block object-cover" /></div><h4 class="text-[18px] md:text-[20px] font-bold text-[#333333] mt-8 mb-3 font-['Arial','Helvetica_Neue',Helvetica,sans-serif] tracking-tight">Maneuverability & Ergonomics</h4><p class="mb-4">From the inside out, the whole Jet X design especially focuses on the maneuverability and ergonomics. The rider is able to experience the amazing ride with the outstanding handling and relaxing riding position on Jet X.</p><h4 class="text-[18px] md:text-[20px] font-bold text-[#333333] mt-8 mb-3 font-['Arial','Helvetica_Neue',Helvetica,sans-serif] tracking-tight">Keyless System 2.0</h4><p class="mb-4">Jet X applies the keyless system to make the ride smart and convenience. The special key fob has replaced the tradition key to access the ignition. With the key fob around, the rider is able to start the scooter easily and intuitively.</p><h4 class="text-[18px] md:text-[20px] font-bold text-[#333333] mt-8 mb-3 font-['Arial','Helvetica_Neue',Helvetica,sans-serif] tracking-tight">LCD Instrument</h4><p class="mb-4">Full sense of the space and hi-tech, it delivers a futuristic concept and for sure all the information is shown clearly and stylishly on the special made new LCD instrument. In addition, the auto dimmer makes sure the best visibility in all kinds of environments.</p><div class="w-full max-w-[720px] overflow-hidden my-6"><img src="/assets/hero/Jetxinstrument.png" alt="Jet X LCD Instrument Dashboard" class="w-full h-auto block object-cover" /></div><h4 class="text-[18px] md:text-[20px] font-bold text-[#333333] mt-8 mb-3 font-['Arial','Helvetica_Neue',Helvetica,sans-serif] tracking-tight">Hazard Control Light</h4><p class="mb-4">Hazard control light is mainly used in an emergency to warn the vehicles behind.</p><div class="w-full max-w-[720px] overflow-hidden my-6"><img src="/assets/hero/hazardcontrollight.png" alt="Jet X Hazard Control Light Switch" class="w-full h-auto block object-cover" /></div><div class="space-y-6 pt-4"><p class="text-[14px] text-[#666666] leading-[1.65] font-['Arial','Helvetica_Neue',Helvetica,sans-serif]"><strong class="font-bold text-[#555555] text-[15px] mr-1.5">4 Valves Liquid-Cooled Engine</strong>Inside a liquid-cooled engine, the liquid is circulated to maintain the ideal operating temperatures of machine parts. Therefore, the efficiency and performance of engine can be highly improved.</p><p class="text-[14px] text-[#666666] leading-[1.65] font-['Arial','Helvetica_Neue',Helvetica,sans-serif]"><strong class="font-bold text-[#555555] text-[15px] block mb-1">Adjustable Rear Suspension</strong>The rear suspension can be adjusted as the rider's need and show the premium support and stability.</p><p class="text-[14px] text-[#666666] leading-[1.65] font-['Arial','Helvetica_Neue',Helvetica,sans-serif]"><strong class="font-bold text-[#555555] text-[15px] block mb-1">Front Compartment</strong>The front compartment provides the storage spaces for key cards and even big screen smart phones. Make those items easy to get as you need!</p><p class="text-[14px] text-[#666666] leading-[1.65] font-['Arial','Helvetica_Neue',Helvetica,sans-serif]"><strong class="font-bold text-[#555555] text-[15px] block mb-1">Roller Rocker Arm</strong>With the mechanical improvement, the engine can do better than regular, such as reducing the wear of parts, decreasing heat generation, unnecessary power consumption caused by friction.</p><p class="text-[14px] text-[#666666] leading-[1.65] font-['Arial','Helvetica_Neue',Helvetica,sans-serif]"><strong class="font-bold text-[#555555] text-[15px] block mb-1">Quick Charge 2.0</strong>QC 2.0 power output makes sure your electronic gadgets always stay alive.</p><p class="text-[14px] text-[#666666] leading-[1.65] font-['Arial','Helvetica_Neue',Helvetica,sans-serif]"><strong class="font-bold text-[#555555] text-[15px] block mb-1">Traction Control System (TCS)</strong>TCS attempts to prevent a vehicle's rear wheel from slipping at the time of getting started, accelerating,or making turns. It’s the mainstream safety function on the high-end scooter.</p></div>`,
      list: []
    };
  }

  if (product.slug === 'maxsym-tl-508') {
    return {
      conceptTitle: isAr ? 'السكوتر الماكسي الرائد ثنائي الأسطوانات' : 'Brand New Top-of-the-range Maxi Scooter',
      htmlContent: isAr ? `
        <p class="mb-4">انطلق رسمياً MAXSYM TL، الطراز الأول بمحرك ثنائي الأسطوانات (Twin-Cylinder) من أسطول SYM الماكسي.</p>
        <p class="mb-4">كـ سكوتر ماكسي رائد، يجمع MAXSYM TL بين الثبات الخارق والديناميكية العالية للدراجات النارية الكبيرة مع راحة وسهولة السكوتر القيادي في تصميم واحد مذهل.</p>
        <p class="mb-4">يتميز بتوزيع وزن متساوي 50/50، وقاعدة عجلات قصيرة، ونظام تعليق خلفي Multi-Link أفقي لضمان أعلى مستويات التحكم والقيادة الرياضية.</p>
      ` : `<p class="mb-4">TL, the first model of SYM twin-cylinder lineup, is now officially launched.</p><p class="mb-4">As SYM next-gen flagship maxi scooter, MAXSYM TL embraces outstanding motorcycle handling and unbelievable scooter convenience in one body. Nothing needs to be sacrificed due to the perfect art of fusion.</p><p class="mb-4">It features motorbike-type engine mounting, great dynamic performance and futuristic sports apparel.</p><p class="mb-4">Perfect body configuration such as 50/50 weight distribution, shortened wheelbase and single-sided multi-link rear suspension ensure TL delivering excellent handling performance. With sports apparel and compact body size, need no complex decoration, the TL simply presents its concise, aggressive and toughness.</p><p class="mb-4">SYM MAXSYM TL has crossed the boundary just to offer a better choice, a choice without any compromise. All in one, one for all! Follow the instinct and enjoy the excitement with TL!</p>`,
      list: [
        {
          title: isAr ? 'محرك ثنائي الأسطوانات 508cc DOHC' : 'Parallel Twin-Cylinder DOHC 508cc Engine',
          description: isAr ? 'يولد قوة 45.5 حصان مع تدفق طاقة سلس ونغمة عادم رياضية ممتازة.' : 'Produces 45.5 HP with silky smooth power delivery and twin-cylinder exhaust rumble.',
          image: product.image
        },
        {
          title: isAr ? 'نظام تعليق خلفي Multi-Link أفقية' : 'Multi-Link Rear Suspension with Oil-Damped Gas Shock',
          description: isAr ? 'مساعد خلفي أفقي على غرار الدراجات النارية الكبيرة لثبات ممتاز على السرعات العالية.' : 'Motorcycle-spec horizontal rear suspension for razor-sharp high-speed cornering stability.',
          image: '/assets/products/features/3d.jpg'
        },
        {
          title: isAr ? 'فرامل ديسك مزدوجة مع نظام Bosch ABS' : 'Dual Radial 4-Piston Calipers with Bosch ABS',
          description: isAr ? 'فرامل ديسك مزدوجة مقاس 275 مم مع كاليبرات 4 مكابس لقوة توقف هائلة.' : 'Dual 275mm front discs with radial 4-piston calipers for immense stopping power.',
          image: product.images?.[1] || product.image
        }
      ]
    };
  }

  if (product.slug.includes('st-150') || product.slug.includes('st-200') || product.slug === 'symphony-st' || product.slug.includes('symphony-st')) {
    return {
      conceptTitle: '',
      has3dBadges: true,
      htmlContent: isAr ? `
        <div class="space-y-8 text-[#555555] text-[14px] leading-[1.75]">
          <div class="space-y-4">
            <p>تعتبر Symphony ST واحدة من أكثر الموديلات مبيعاً وخياراً مثالياً لجيل التنقل الحضري الجديد. بفضل إضاءة الـ LED الكاملة، وتقنية A.L.E.H المانعة لارتفاع المحرك، وخزان الوقود الأمامي، وفرامل الديسك الأمامية والخلفية، تضمن Symphony ST الأناقة والأداء المتميز.</p>
          </div>

          <div class="space-y-4 pt-2">
            <h3 class="text-[20px] font-bold text-[#555555]">إضاءة LED كاملة</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 my-6 max-w-[840px]">
              <div class="w-full overflow-hidden bg-gray-50 border border-gray-100 rounded-xl">
                <img src="/assets/products/features/symphony-st-headlight.png" alt="Symphony ST Full LED Headlight" class="w-full h-auto block object-cover" />
              </div>
              <div class="w-full overflow-hidden bg-gray-50 border border-gray-100 rounded-xl">
                <img src="/assets/products/features/symphony-st-taillight.png" alt="Symphony ST Full LED Taillight" class="w-full h-auto block object-cover" />
              </div>
            </div>
          </div>
        </div>
      ` : `
        <div class="space-y-8 text-[#555555] font-['Arial','Helvetica_Neue',Helvetica,sans-serif] text-[14px] leading-[1.75] tracking-normal">
          <div class="space-y-4">
            <p>The Symphony ST is one of SYM's best-selling models and a top choice among the new generation of urban scooters. With features like full LED lighting, A.L.E.H, large storage space, a front-mounted fuel tank cap, and front and rear disc brakes, the Symphony ST ensures both style and performance.</p>
          </div>

          <div class="space-y-4 pt-2">
            <h3 class="text-[20px] font-bold text-[#555555] tracking-tight">Full LED Lighting</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 my-6 max-w-[840px]">
              <div class="w-full overflow-hidden bg-gray-50 border border-gray-100">
                <img src="/assets/products/features/symphony-st-headlight.png" alt="Symphony ST Full LED Headlight" class="w-full h-auto block object-cover" />
              </div>
              <div class="w-full overflow-hidden bg-gray-50 border border-gray-100">
                <img src="/assets/products/features/symphony-st-taillight.png" alt="Symphony ST Full LED Taillight" class="w-full h-auto block object-cover" />
              </div>
            </div>
          </div>
        </div>
      `,
      featureGallery: [
        {
          src: '/assets/products/features/symphony-st-headlight.png',
          alt: 'Symphony ST Front View',
          caption: ''
        },
        {
          src: '/assets/hero/instrument copy.jpg',
          alt: 'Symphony ST Digital LCD Meter',
          caption: isAr ? 'عداد LCD رقمي' : 'LCD Instrument'
        }
      ],
      list: []
    };
  }

  if (product.slug === 'nhx-200' || product.slug.includes('nhx')) {
    return {
      conceptTitle: '',
      list: [
        {
          title: isAr ? 'تصميم جديد ووضعية قيادة هجومية' : 'New design & Aggressive Posture',
          description: isAr ? 'تتميز بنقطة ثقل منخفضة ووضعية قيادة منحنية للأمام تعزز الرشاقة والانطلاق.' : 'Engineered with a low center of gravity and forward-leaning stance for agile speed.',
          image: '/assets/hero/side.png'
        },
        {
          title: isAr ? 'مصابيح L-shaped مزدوجة وإضاءة مسلاطية' : 'Dual L-shaped Position Lights & Projector',
          description: isAr ? 'مصابيح إرشادية على شكل L مع عدسة إسقاط مدمجة لمظهر هجومي غامض.' : 'L-shaped position lights integrated with concealed projector headlamp.',
          image: '/assets/hero/front-end.png'
        },
        {
          title: isAr ? 'ترقية المحرك والقوة 10.5 كيلوواط' : 'Power Upgrade - 10.5 kW Liquid-Cooled',
          description: isAr ? 'محرك 4 صمامات بتبريد مائي يرفع القوة بنسبة 28% مع 11 نيوتن متر عزم دوران.' : 'Newly developed 4-valve liquid-cooled engine boosting power by 28%.',
          image: '/assets/hero/power_upgrade_chart.png'
        },
        {
          title: isAr ? 'شاسيه أنبوبي صلب Perimeter Frame' : 'Exceptional Handling - Perimeter Frame',
          description: isAr ? 'هيكل صلب خفيف الوزن مع مقص خلفي A-type وتوزيع وزن متعادل 50/50.' : 'High-rigidity perimeter frame with A-type swing arm and 50/50 weight distribution.',
          image: '/assets/hero/NH_frame.png'
        }
      ]
    };
  }

  if (product.slug.includes('xwolf') || product.slug.includes('x-wolf')) {
    return {
      conceptTitle: isAr ? 'SYM X-Wolf 150 - المتانة المطلقة والتصميم الكلاسيكي الأنيق' : 'SYM X-Wolf 150 - Ultimate Heavy-Duty Classic Motorcycle',
      conceptDescription: isAr
        ? 'تجمع دراجة SYM X-Wolf 150 بين الأناقة الكلاسيكية والأداء الشاق الموثوق. تم تجهيزها بمحرك O.H.C بسعة 149.4 سي سي بقوة 9.1 كيلوواط (12.4 حصان) مع شداد تلقائي Auto-Tensioner، شاسيه فولاذي مصفح Steel Frame، جنوط سبائكية ألومنيوم Aluminum Rims، سعة خزان وقود استثنائية 15 لتر، ومنظومة كهربائية اعتماديّة بقدرة 140W وبطارية 12V 7Ah.'
        : 'The authentic SYM X-Wolf 150 combines classic style with dependable heavy-duty performance. Powered by a 149.4cc O.H.C. engine with Auto-Tensioner, high-rigidity steel frame, aluminum alloy rims, massive 15L fuel tank, and 140W alternator.',
      list: [
        {
          title: isAr ? 'محرك O.H.C 149.4cc مع شداد تلقائي (Auto-Tensioner)' : '149.4cc O.H.C. Engine & Auto-Tensioner',
          description: isAr ? 'محرك 4 أشواط بكامة علوية O.H.C وقطر شوط Φ62 × 49.5 مم يولد 9.1 كيلوواط / 8500 دورة وعزم 11 N.m لأقصى درجات الاعتمادية.' : '4-stroke O.H.C. engine with Φ62 × 49.5 mm bore/stroke producing 9.1 kW @ 8500 RPM and 11 Nm torque.',
          image: '/assets/hero/L90_engine.png'
        },
        {
          title: isAr ? 'شاسيه فولاذي مصفح Steel Frame وجنوط ألومنيوم' : 'Steel Frame Chassis & Aluminum Alloy Rims',
          description: isAr ? 'هيكل فولاذي صلب مدمج بأبعاد 2050×745×1100 مم وقاعدة عجلات 1280 مم مع جنوط سبائكية ألومنيوم لثبات قياسي.' : 'High-rigidity steel frame measuring 2050x745x1100 mm with 1280mm wheelbase and aluminum alloy rims.',
          image: '/assets/hero/NH_frame.png'
        },
        {
          title: isAr ? 'خزان وقود ضخم سعة 15 لتر (15L Fuel Capacity)' : 'Massive 15-Liter Super Touring Fuel Tank',
          description: isAr ? 'خزان وقود اتساعي سعة 15 لتر يتيح قطع مسافات طويلة في الرحلات والسفر دون الحاجة للتوقف المكرر للتزود بالوقود.' : 'Generous 15L fuel capacity providing extended riding range for long-distance commuting.',
          image: product.image
        },
        {
          title: isAr ? 'مساعدين Double Swing ومنظومة كهربائية 140W' : 'Double Swing Rear Suspension & 140W Electricals',
          description: isAr ? 'مساعدين خلفيين مزدوجين Double Swing ومساعد أمامي تلسكوبي مع إشعال إلكتروني TCI وبطارية 12V 7Ah ودينامو 140W.' : 'Double swing rear shock absorption, Telescopic front fork, TCI ignition, 12V 7Ah battery, and 140W alternator.',
          image: '/assets/hero/front-end.png'
        }
      ]
    };
  }

  if (product.slug === 'nht-200' || product.slug.includes('nht')) {
    return {
      // Verified against the official sym-global.com/symnht300 page — this is the single
      // Features paragraph that page actually has; the previous multi-section marketing copy
      // here (Adventure-Ready Design / Off-Road Capability / Practicality & Technology) wasn't
      // sourced from any official SYM page and has been dropped rather than left unverified.
      paragraphs: isAr
        ? [
          'تُعد سلسلة SYM NHT مجموعة من دراجات المغامرة الكروس أوفر، صُممت خصيصاً لمستكشف المدينة. وضعية القيادة المائلة قليلاً للأمام تمنحك رؤية أمامية أوضح. ولتحقيق تحكم استثنائي، تتميز SYM NHT 300 بتعليق مركزي (Centered-Suspension) وفرامل أقراص أمامية وخلفية مزودة بنظام ABS. كما تمنحها الإضاءة LED الكاملة، والمحرك المبرد بالسائل، وعداد LCD مظهراً عصرياً متطوراً. وهي مزودة أيضاً بواجهة منقار (Beak) وواقي أمامي (Visor) يبرزان طابع المغامرة. تصميم نظام التعليق يمنحها قدرة أكبر على عبور مختلف التضاريس، مما يجعل رحلتك أكثر راحة.',
        ]
        : [
          'The SYM NHT series is a collection of crossover adventure; designed for the urban explorer. The slightly upright riding posture offers you clearer forward visibility. To achieve outstanding handling, SYM NHT 300 features centered-suspension and front & rear brake disc with ABS. Full-LED lighting, liquid-cooled engine and LCD instrument on SYM NHT 300 give the bike a contemporary look. It also equipped with beak and visor emphasizing the adventure look. The design of suspension provides greater ability to crossing various terrains which can make your riding journey more comfortable.',
        ],
      featureGallery: [
        { src: '/assets/products/nht-200/features/SYMNH-T_200_FR_disc_ABS.png', alt: 'SYM NHT Front Disc Brake', caption: isAr ? 'فرامل ديسك أمامية' : 'Front Disc' },
        { src: '/assets/products/nht-200/features/SYMNH-T_200_meter_tank_top_view.png', alt: 'SYM NHT Instrument Cluster', caption: isAr ? 'لوحة العدادات' : 'Instrument' },
        { src: '/assets/products/nht-200/features/SYMNH-T_200_RR_disc_ABS.png', alt: 'SYM NHT Rear Disc Brake', caption: isAr ? 'فرامل ديسك خلفية' : 'Rear Disc' },
      ],
      list: []
    };
  }

  if (product.slug === 'nhx-200' || product.slug.includes('nhx')) {
    return {
      conceptTitle: '',
      htmlContent: isAr ? `
        <div class="space-y-10 text-[#555555] text-[14px] leading-[1.75]">
          <div class="space-y-4">
            <p>تعد الدراجة النارية SYM NHX 200 دراجة شوارع رياضية تدمج الأسلوب الحضري الهجومي مع التحسينات الهندسية الفائقة. يمنحك وضع القيادة المائل للأمام إحساساً بالسرعة والانطلاق مع خزان وقود أوسع سعة 14 لتر لمسافات أطول.</p>
          </div>
          <div class="space-y-4 pt-2">
            <div class="flex items-center gap-3">
              <span class="w-5 h-6 bg-[#383b4e] inline-block transform -skew-x-12 rounded-xs"></span>
              <h3 class="text-[20px] md:text-[22px] font-bold text-[#333333]">تصميم هجومي حديث</h3>
            </div>
            <p>يتميز التصميم بمركز ثقل منخفض، مع إضاءة L-shaped الـ LED المزدوجة ومظهر انسيابي حاد نحو الأمام.</p>
          </div>
        </div>
      ` : `
        <div class="space-y-10 text-[#555555] font-['Arial','Helvetica_Neue',Helvetica,sans-serif] text-[14px] leading-[1.75] tracking-normal">
          <div class="space-y-4">
            <p>The SYM NHX is a sport street bike that blends aggressive urban styling with functional upgrades to enhance the rider experience. Its forward-leaning riding posture and sharp, dynamic design convey speed and momentum.</p>
          </div>
        </div>
      `,
      list: []
    };
  }

  if (product.slug === 'xwolf-300' || product.slug.includes('xwolf')) {
    return {
      conceptTitle: '',
      htmlContent: isAr ? `
        <div class="space-y-10 text-[#666666] text-[14px] leading-[1.7]">
          <div class="space-y-4">
            <div class="space-y-2">
              <h3 class="text-[22px] font-bold text-[#333333]">تصميم هجومي جريء (X-Wolf 300)</h3>
              <p class="max-w-[780px]">تتميز X-Wolf 300 بتصميم Mecha الهجومي مع مظهر الرالي القوي الذي يعكس شخصية الشباب المغامرة، وموقف عريض لرؤية وتحكم ممتاز على مختلف الطرقات والوعرة.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-center max-w-[850px] pt-2">
              <div class="md:col-span-6">
                <img src="/assets/hero/2-1.png" alt="SYM NH Rally Riding Posture" class="w-full h-auto block object-contain rounded-xl" />
              </div>
              <div class="md:col-span-6">
                <img src="/assets/hero/1-1.png" alt="SYM NH Front Rally Design" class="w-full h-auto block object-contain rounded-xl" />
              </div>
            </div>
          </div>
          <div class="space-y-6 pt-2">
            <div class="space-y-2">
              <h3 class="text-[22px] font-bold text-[#333333]">زجاج رياضي واقي وواقيات يد ألومنيوم</h3>
              <p class="max-w-[780px]">مزودة بزجاج واقي مظلل لزيادة الانسيابية والأناقة وحماية السائق من الرياح والحصى.</p>
            </div>
            <div class="space-y-2">
              <h3 class="text-[22px] font-bold text-[#333333]">زيادة القوة بنسبة 28% مع الفتيس الـ 6 سرعات</h3>
              <p class="max-w-[780px]">محرك مطور 300cc بتبريد مائي يمنح القوة والتسارع الاستثنائي على السرعات المختلفة.</p>
            </div>
          </div>
        </div>
      ` : `
        <div class="space-y-10 text-[#666666] font-['Arial','Helvetica_Neue',Helvetica,sans-serif] text-[14px] leading-[1.7] tracking-normal">
          <div class="space-y-4">
            <div class="space-y-2">
              <h3 class="text-[22px] font-bold text-[#333333] tracking-tight">New design</h3>
              <p class="max-w-[780px]">The SYMNH R features an aggressive, Mecha-style front design that enhances its high-tech appeal and distinctive presence.</p>
            </div>
          </div>
        </div>
      `,
      list: []
    };
  }

  if (product.slug.includes('symphony')) {
    return {
      conceptTitle: isAr ? 'سلسلة Symphony - السكوتر الأوروبي الأكثر رشاقة بالعجلات الكبيرة' : 'Symphony Series - High-Wheel European Agile Scooter',
      conceptDescription: isAr
        ? `تعتبر ${name} سكوتر العجلات الكبيرة الأوروبي الشهير من SYM. صُمم بجنوط 16 بوصة، وفرامل ديسك CBS، ومحرك Euro 5، وإضاءة LED نهارية لقيادة سلسة ومريحة فوق الطرق الحضرية.`
        : `The ${name} is SYM's signature European high-wheel scooter. Built with 16-inch alloy rims, CBS combined disc braking, Euro 5 engine, and LED daytime running lights for outstanding maneuverability over urban roads.`,
      list: [
        {
          title: isAr ? 'جنوط سبائكية مرتفعة مقاس 16 بوصة' : '16-Inch High-Wheel Alloy Rims',
          description: isAr ? 'تمتص العجلات الكبيرة مقاس 16 بوصة عيوب الطريق وتوفر ثباتًا ممتازًا على السرعات العالية.' : 'Large 16-inch alloy wheels absorb road bumps and deliver superior high-speed stability.',
          image: product.image
        },
        {
          title: isAr ? 'إضاءة LED كاملة توقيعية' : 'Full LED Position & Headlight Signature',
          description: isAr ? 'مصابيح أمامية LED مزدوجة فائقة الإضاءة مع مصابيح DRL نهارية لرؤية ليلية مثالية.' : 'Bright dual LED headlights with signature DRL position lamps for peak night visibility.',
          image: '/assets/products/features/led.jpg'
        },
        {
          title: isAr ? 'نظام الفرامل الموحد (CBS)' : 'Combined Braking System (CBS)',
          description: isAr ? 'فرامل ديسك أمامي وخلفي متزامنة تضمن توقف متوازن وسريع عند الطوارئ.' : 'Synchronized front and rear disc brakes provide balanced and short stopping distances.',
          image: '/assets/products/features/3d.jpg'
        }
      ]
    };
  }

  if (product.slug === 'fiddle-4-150' || product.id === 'fiddle-4-150') {
    return {
      conceptTitle: isAr ? 'سكوتر SYM Fiddle - لمسات ريترو وعصرية أنيقة' : 'SYM Fiddle Scooter - Retro Inside, Style Outfit',
      htmlContent: isAr ? `
        <div class="mb-6">
          <span class="text-4xl font-serif italic font-extrabold tracking-widest text-gray-400 bg-gradient-to-r from-gray-300 via-gray-100 to-gray-400 bg-clip-text text-transparent drop-shadow-sm select-none">Fiddle</span>
        </div>
        <div class="space-y-4 text-[#555555] text-[15px] leading-[1.75] font-sans">
          <p>على مدار العقد الماضي، كان Fiddle الرفيق الأكثر وفاءً للتنقل الحضري لآلاف الشباب في مختلف المدن.</p>
          <p>تم تطوير Fiddle الجديد بتطعيمات جلدية راقية ومصابيح LED جديدة. هذا المظهر العصري يجمع بين الفخامة والأناقة.</p>
          <p>بجانب الشكل الأنيق، زُود السكوتر بنظام <span class="text-[#E60012] font-semibold">A.L.E.H.</span> المانع لارتفاع المحرك للحد من اهتزاز المحرك عند التسارع السريع وزيادة ثبات التحكم.</p>
          <p class="font-semibold pt-1">استكشف الميزات الرئيسية أدناه:</p>
          <ul class="list-disc pr-6 pl-0 space-y-1.5 font-medium">
            <li>مفتاح إضاءة طوارئ (Hazard Control Light)</li>
            <li>عداد LCD رقمي جديد بالكامل</li>
            <li>مخرج شحن سريع QC2.0 USB</li>
            <li>نظام A.L.E.H لثبات المحرك</li>
            <li>مساعدين خلفيين قابلين للتعديل</li>
          </ul>
        </div>
        <div class="my-8 flex justify-center">
          <img src="/assets/products/blue 0.png" alt="SYM Fiddle 4 Blue" class="w-full max-w-[480px] h-auto object-contain transform scale-x-[-1]" />
        </div>
      ` : `
        <div class="mb-6">
          <span class="text-4xl font-serif italic font-extrabold tracking-widest text-gray-400 bg-gradient-to-r from-gray-300 via-gray-100 to-gray-400 bg-clip-text text-transparent drop-shadow-sm select-none">Fiddle</span>
        </div>
        <div class="space-y-4 text-[#555555] text-[15px] leading-[1.75] font-sans">
          <p>For the last decade, Fiddle has been the most loyal urban pal leading thousands of youngsters in and out cities.</p>
          <p>The new Fiddle is refined with leather garnish and new LED lights. This novel outfit is more sophisticated but chic.</p>
          <p>Except for the stylish look, it also equipped with SYM state-of-the-art A.L.E.H(Anti-Lift Engine Hanger System). ALEH does not give discomfort of the rider when instant acceleration; meanwhile, increases the handling stability.</p>
          <p class="font-semibold pt-1">Please check out more features below:</p>
          <ul class="list-disc pl-6 space-y-1.5 font-medium">
            <li>Hazard Control Light</li>
            <li>All New LCD Instrument</li>
            <li>QC2.0 USB Socket</li>
            <li>A.L.E.H</li>
            <li>Adjustable Rear Suspension</li>
          </ul>
        </div>
        <div class="my-8 flex justify-center">
          <img src="/assets/products/blue 0.png" alt="SYM Fiddle 4 Blue" class="w-full max-w-[480px] h-auto object-contain transform scale-x-[-1]" />
        </div>
      `,
      featureGallery: [
        { src: '/assets/hero/FRONT_FUEL.jpg', alt: 'Front Fuel Cap', caption: isAr ? 'فتحة الوقود الأمامية' : 'Front Fuel Cap' },
        { src: '/assets/hero/KEY.jpg', alt: 'Key Lock & Utility Hook', caption: isAr ? 'قفل المفتاح وعلاقة الأغراض' : 'Key Lock & Hook' },
        { src: '/assets/hero/METER copy.jpg', alt: 'All New LCD Instrument', caption: isAr ? 'لوحة عدادات LCD رقمية' : 'LCD Instrument Panel' },
        { src: '/assets/hero/SEAT.jpg', alt: 'Refined Leather Seat Garnish', caption: isAr ? 'مقعد جلدي فاخر' : 'Leather Garnish Seat' },
        { src: '/assets/hero/hazardcontrollight.png', alt: 'Hazard Control Light', caption: isAr ? 'مفتاح إضاءة الطوارئ' : 'Hazard Control Switch' }
      ],
      list: []
    };
  }

  if (product.slug.includes('orbit-2') || product.id.includes('orbit-2') || product.name.includes('Orbit II')) {
    return {
      conceptTitle: isAr ? 'الميزات الأساسية' : 'Features',
      htmlContent: isAr ? `
        <div class="space-y-5 text-[#555555] text-[15px] leading-[1.8] font-sans max-w-[840px]">
          <p>يجمع Orbit II بين العناصر البسيطة والواضحة ليخلق مظهراً رياضياً وأنيقاً، مما يرفع الجودة الشاملة لسكوتر التنقل اليومي.</p>
          <p>يعتمد Orbit II أداء محرك موثوق للغاية مع نظام تعليق خاص طورته SYM ليحافظ على ثبات هيكل السكوتر عند التسارع ويمنح الراكب شعوراً بالراحة والاستقرار أثناء التوجيه.</p>
        </div>
      ` : `
        <div class="space-y-5 text-[#555555] text-[15px] leading-[1.8] font-sans max-w-[840px]">
          <p>The Orbit II combined with simple and clear element to create a sporty and exquisite appearance, making the entry level of commuter scooter enhances overall quality.</p>
          <p>Orbit II inducts reliable engine performance. SYM designs the special engine suspension system, enables the relative position of the engine and the car body to maintain a steady state when accelerating, suppress the instability caused by the lifting position, making riders feel stable and comfortable when steering.</p>
        </div>
      `,
      featureGallery: [
        { src: '/assets/hero/Luggagebox.jpg', alt: 'Luggage Box', caption: isAr ? 'صندوق التخزين' : 'Luggage Box' },
        { src: '/assets/hero/orbitheadlightpressed.png', alt: 'Headlight', caption: isAr ? 'المصباح الأمامي' : 'Headlight' },
        { src: '/assets/hero/03-ORBIT-III_XE12W1-EU_Tailight.jpg', alt: 'Taillight', caption: isAr ? 'المصباح الخلفي' : 'Taillight' }
      ],
      list: []
    };
  }

  if (product.slug === 'fiddle-3-150' || product.id === 'fiddle-3-150') {
    return {
      conceptTitle: isAr ? 'SYM Fiddle III - الفخامة الكلاسيكية الأوروبية والأسلوب الخالد' : 'SYM Fiddle III - Vintage European Luxury & Timeless Style',
      htmlContent: isAr ? `
        <div class="space-y-5 text-[#555555] text-[15px] leading-[1.8] font-sans max-w-[840px]">
          <p>يمثل Fiddle III الأيقوني التناغم المثالي بين الجماليات الكلاسيكية الأوروبية وتكنولوجيا القيادة الحضرية الحديثة. مع فرامل ديسك مزدوجة، ومقعد جلدي مريح وممتد، وتطعيمات كروم فاخرة، يبرز Fiddle III كرمز حقيقي للأناقة في كل شارع.</p>
          <p>مزود بمحرك 150cc عالي الاستجابة ومساحة تخزين واسعة تحت المقعد توفر تسارعاً سلساً واقتصادية فائقة في استهلاك الوقود.</p>
        </div>
      ` : `
        <div class="space-y-5 text-[#555555] text-[15px] leading-[1.8] font-sans max-w-[840px]">
          <p>The iconic Fiddle III represents the perfect harmony between classic European vintage aesthetics and modern urban riding technology. Featuring double disc brakes, an elongated comfortable leather-style seat, and refined chrome finishes, Fiddle III stands out as a true statement of style on every city street.</p>
          <p>Equipped with a highly responsive 150cc engine and generous under-seat storage, Fiddle III provides smooth acceleration, exceptional fuel economy, and unmatched rider comfort for daily commutes and weekend escapes.</p>
        </div>
      `,
      list: []
    };
  }

  if (product.slug === 'fiddle-2-150' || product.id === 'fiddle-2-150') {
    return {
      conceptTitle: isAr ? 'الميزات الأساسية' : 'Features',
      htmlContent: isAr ? `
        <div class="space-y-5 text-[#555555] text-[15px] leading-[1.8] font-sans max-w-[840px]">
          <p>إعادة إحياء الأناقة الريترو والتصميم الكلاسيكي الغربي الخالص تجسدت في Fiddle II. لمسات كلاسيكية فاخرة تجمع بين منحنيات الهيكل والمصابيح الكلاسيكية وتطعيمات الكروم اللامعة.</p>
          <p>يوفر المقعد راحة ممتازة أثناء القيادة، كما تتيح المساحة تحته تخزين متعلقاتك اليومية بسهولة.</p>
        </div>
      ` : `
        <div class="space-y-5 text-[#555555] text-[15px] leading-[1.8] font-sans max-w-[840px]">
          <p>The reproduction of retro elegance and its pure western classic design are embodied on Fiddle II. Old fashion elegance and talent. Pure westernized classic design. The astonishing modern retro design is the integration of arc body shape, classic European head light and tail light, and the chromed garnishes. Arc line designed with classic old fashion head lamp, westernized old fashion taillight and electroplated decoration; one remarkable design.</p>
          <p>The seat offers great comfort at riding and the space under it is sufficient to accommodate your trophies after a pleasant shopping. It is the most eye-catching ride with Fiddle II in and around the city. Westernized cushion; not only offer more comfortable riding but with more space under the cushion to place more stuffs and catch people's sight!</p>
        </div>
      `,
      list: []
    };
  }

  if (product.slug.includes('fiddle')) {
    return {
      conceptTitle: isAr ? 'سلسلة Fiddle - الفخامة الكلاسيكية الأوروبية الخالدة' : 'Fiddle Series - Timeless Retro European Luxury',
      conceptDescription: isAr
        ? `تدمج ${name} بين طراز الريترو الأوروبي وتكنولوجيا الحقن الإلكتروني للوقود (EFI)، وإضاءة LED، وفرامل ديسك أمامي وخلفي، ومقعد جلدي فاخر.`
        : `The ${name} blends vintage European styling with modern electronic fuel injection, LED lighting, front & rear disc brakes, and comfortable leather-grained seating.`,
      list: [
        {
          title: isAr ? 'تصميم كلاسيكي ريترو فاخر' : 'Classic Vintage Retro Styling',
          description: isAr ? 'منحنيات هيكل أوروبية خالدة مع تطعيمات الكروم ومقعد جلدي فاخر.' : 'Timeless European body curves with chrome accents and premium leather-style seat finish.',
          image: product.image
        },
        {
          title: isAr ? 'نظام الحقن الإلكتروني (E.F.I.)' : 'Electronic Fuel Injection (E.F.I.)',
          description: isAr ? 'محرك انسيابي بحقن إلكتروني للوقود يمنح استجابة فورية، وانبعاثات منخفضة، واقتصادية عالية.' : 'Advanced fuel injection engine delivering smooth throttle response, low emissions, and great fuel economy.',
          image: '/assets/products/features/led.jpg'
        },
        {
          title: isAr ? 'مساحة تخزين تحت المقعد وشاحن USB' : 'Under-Seat Storage & USB Charging',
          description: isAr ? 'مساحة تخزين واسعة تحت المقعد مع منفذ USB ملائم لشحن الأجهزة أثناء القيادة.' : 'Generous storage under the seat with convenient USB port to charge devices on the go.',
          image: product.images?.[1] || product.image
        }
      ]
    };
  }

  if (product.slug === 'symphony-sr-150' || product.slug === 'symphony-sr-125') {
    return {
      paragraphs: isAr
        ? [
          'تتميز Symphony SR الجديدة بتصميم حاد وزاوي، يعكس حيوية شبابية من خلال فتحات التهوية سداسية الشكل (Honeycomb) والخطوط الانسيابية للهيكل. يستمد طابعها الفريد من الحواف الحادة، وبصمة العائلة الموروثة، وعناصر مآخذ الهواء الرياضية.',
          'مزودة بإضاءة موضعية LED، ومصباح أمامي وخلفي LED، بالإضافة إلى عداد LCD حديث، فهي مليئة بالإحساس بالتكنولوجيا. مع عجلات 16 بوصة، توفر ثباتاً ممتازاً أثناء القيادة، مدعومة بنظام ABS/CBS، ومساعدين خلفيين مزدوجين، وتعليق خلفي قابل للتعديل لمزيد من الأمان والراحة. كما تضيف خاصية الشحن السريع QC2.0 مزيداً من الراحة لتستمتع بالكامل بمتعة القيادة داخل المدينة.',
        ]
        : [
          "The new Symphony SR integrates a sharp, angular design, exuding youthful dynamism through its honeycomb-shaped air inlets style and sleek body lines. Its unique styling originates from sharp contours, inherited family DNA, and sporty air intake elements.",
          "Equipped with LED position light, headlight, and taillight, plus a modern LCD instrument, it's packed with a sense of technology. Combined with a 16-inch wheels, it offers stable handling, complemented by ABS/CBS, dual rear shock, and adjustable rear suspension for enhanced riding safety and comfort. The QC2.0 fast charging function adds further convenience, allowing you to fully enjoy urban riding pleasure.",
        ],
      list: [
        {
          title: isAr ? 'تصميم رياضي' : 'Sporty Design',
          description: isAr
            ? 'مقارنة بالموديل السابق، اعتمد التصميم الأمامي لـ SYMPHONY SR الجديدة طابعاً أكثر جرأة وحدة بخطوط أكثر بساطة ورياضية. وتمتد خطوط بصمة العائلة من جانبي المصباح الأمامي، بملامح جانبية درامية تعكس إحساساً أكبر بالحداثة.'
            : 'Compared to the previous model, the front-end design of the new SYMPHONY SR adopts a more aggressive and sharper style with simpler, more athletic lines. Inherited family DNA lines extend from both sides of the headlight, and the dramatic side profile exhibits a heightened sense of modernity.',
          image: product.image
        },
        {
          title: isAr ? 'إضاءة LED كاملة' : 'LED Lighting',
          description: isAr
            ? 'تمت ترقية المصباح الأمامي والإضاءة الموضعية والمصباح الخلفي جميعها إلى LED، مما يعزز الأمان أثناء القيادة الليلية ويمنح السكوتر مظهراً عصرياً وتقنياً متطوراً.'
            : 'The headlight, position light, and taillight are all upgraded to LED, enhancing nighttime safety while giving the scooter a modern, high-tech look.',
          image: '/assets/products/features/symphony-sr-150/headlight.jpg'
        },
        {
          title: isAr ? 'عداد LCD جديد' : 'New LCD Instrument',
          description: isAr
            ? 'تعزز لوحة العدادات المطورة من وضوح القراءة وتجربة المستخدم، مع تناسق كامل مع المظهر العصري والديناميكي لـ SYMPHONY SR.'
            : 'The upgraded instrument cluster enhances readability and user experience, while seamlessly matching the modern and dynamic look of SYMPHONY SR.',
          image: '/assets/products/features/symphony-sr-150/instrument.jpg'
        }
      ]
    };
  }

  if (product.slug === 'adx-300') {
    return {
      htmlContent: isAr
        ? `<p class="mb-4">وُلدت ADX 300 من سكوتر المدينة الماكسي JOYRIDE 300، لكنها بالكامل "مُغامرة" الطابع سواء في الأرغونومكس أو الهيكل أو المظهر الخارجي. وبعد نجاح ADX 125، تأتي هذه الآلة المطورة بالكامل لتكون ليست فقط مثالية للتنقل اليومي، بل مصممة بوضوح لتحويل حلم المغامرة إلى حقيقة: تجرأ على الاستكشاف!</p>
<ul class="list-disc pl-5 rtl:pr-5 rtl:pl-0 space-y-1 mb-4">
  <li>يعتمد نفس بصمة ADX 125 مع أبعاد جسم عضلية، زجاج أمامي قصير، واجهة أمامية بطراز ADV، فتحات تهوية للهواء، وخزان وقود بعيد المدى سعة 16 لتر لموديل ADX 300.</li>
  <li>إضاءة موضعية بشكل V مع 4 مصابيح إسقاطية LED تشكل معاً هوية الإضاءة الأمامية المميزة.</li>
  <li>لوحة عدادات TFT LCD مقاس 7 بوصة بثلاث واجهات عرض مختلفة، مع تبديل تلقائي بين وضعي النهار والليل.</li>
  <li>منفذا شحن USB مزدوجان Type-C وType-A.</li>
  <li>نظام مفتاح ذكي Keyless مزود بمانع تشغيل (Immobilizer).</li>
  <li>نظام TCS وفرامل ABS من BOSCH.</li>
</ul>
<p class="mb-4">تعليق طويل المدى ومريح يجمع بين راحة القيادة اليومية بين وسط المدينة والضواحي، وبين إعداد المغامرة الحقيقي بهيكل معزز، مقود عريض مزود بواقيات يد، وإطارات مخصصة للمغامرة — فالاستكشاف هنا ليس شعاراً بل واقعاً فعلياً.</p>`
        : `<p class="mb-4">Originated from the city maxi scooter JOYRIDE 300, the ADX 300 is overall &ldquo;adventurized&rdquo;, whether ergonomics, chassis or exterior. Coming after the ADX 125, this entire evolved adventure machine isn't just ideal for daily commute, clearly its purpose is to make the imagination of adventure come true, dare to explore!</p>
<ul class="list-disc pl-5 rtl:pr-5 rtl:pl-0 space-y-1 mb-4">
  <li>Applied ADX crossover DNA same as the ADX 125. Muscular body dimension, short windscreen, ADV style front end, air inlet garnish and long range fuel tank (16L for ADX 300).</li>
  <li>V-shaped position light and 4 projective headlights build up the iconic front LED lighting.</li>
  <li>7-inch TFT LCD instrument panel contains three display styles; day &amp; night mode auto switch.</li>
  <li>Double USB charging sockets type-C &amp; type-A.</li>
  <li>Smart key system includes immobilizer.</li>
  <li>TCS &amp; BOSCH ABS</li>
</ul>
<p class="mb-4">The cushy longer suspension travel is two birds with one stone; riders are easy to transfer every ride from downtown to suburban areas. In collaboration with the adventure ready bike setup includes strengthened chassis, wide handlebars integrates hand guards and adventure tires, dare to explore is no slogan but true actions.</p>`,
      featureGallery: [
        { src: '/assets/products/adx-300/features/ADX300_TFTMeter.JPG', alt: 'ADX 300 7-inch TFT LCD display', caption: isAr ? 'شاشة TFT LCD مقاس 7 بوصة (وضع نهار/ليل)' : '7-inch TFT LCD display (day/night mode)' },
        { src: '/assets/products/adx-300/features/ADX300_KEYLESS.JPG', alt: 'ADX 300 Smart key system', caption: isAr ? 'نظام مفتاح ذكي' : 'Smart key system' },
        { src: '/assets/products/adx-300/features/701A0516.JPG', alt: 'ADX 300 V-shape position light', caption: isAr ? 'إضاءة موضعية بشكل V' : 'V-shape position light' },
        { src: '/assets/products/adx-300/features/701A0547.JPG', alt: 'ADX 300 LED tail light', caption: isAr ? 'مصباح خلفي LED' : 'LED tail light' },
      ],
      list: []
    };
  }

  // Generic fallback for any of the 18 scooters & bikes
  return {
    conceptTitle: isAr ? 'صُممت بشغف وتكنولوجيا لراحة واعتمادية يومية' : 'Engineered for passion, comfort and daily reliability',
    conceptDescription: isAr
      ? `تجمع ${name} بين هندسة SYM العالمية، والأرغونومكس الفاخرة، والأداء الموفر للوقود لرفع مستوى كل رحلة.`
      : `The ${name} combines SYM's world-class engineering, premium ergonomics, and fuel-efficient performance to elevate every ride.`,
    list: [
      {
        title: isAr ? 'توقيع إضاءة LED حديث' : 'Modern LED Lighting Signature',
        description: isAr ? 'مصابيح أمامية وخلفية LED ساطعة مصممة لرؤية عالية وحضور عصري فريد.' : 'Bright LED headlamps and tail lamps designed for high visibility and distinctive aesthetic presence.',
        image: product.image
      },
      {
        title: isAr ? 'محرك عالي الكفاءة والأداء' : 'High-Efficiency Engine',
        description: isAr ? `محرك ${product.capacity || ''} مهيأ للتسارع الفوري، وانبعاثات منخفضة، وعمر افتراضي طويل.` : `${product.capacity || ''} engine tuned for instant acceleration, low emissions, and reliable longevity.`,
        image: '/assets/products/features/led.jpg'
      },
      {
        title: isAr ? 'مقعد أرغونوميك ومساحة تخزين واسعة' : 'Ergonomic Seating & Storage Compartment',
        description: isAr ? 'مساحة تخزين واسعة تحت المقعد مع أرغونومكس مريحة للسائق والراكب للتنقلات اليومية.' : 'Spacious under-seat storage with comfortable rider and passenger ergonomics for daily commutes.',
        image: product.images?.[1] || product.image
      }
    ]
  };
}

function SymFeatureBadges() {
  const badges = [
    {
      id: 'led',
      label: 'Full LED',
      icon: (
        <div className="flex flex-col items-center justify-center">
          <svg className="w-7 h-7 text-gray-800" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span className="text-[10px] font-black text-[#E60012] tracking-wider uppercase -mt-0.5">LED</span>
        </div>
      )
    },
    {
      id: 'aleh',
      label: 'A.L.E.H Frame',
      icon: (
        <div className="flex items-center justify-center w-full h-full p-1">
          <span className="text-[10px] font-black text-gray-900 tracking-tighter">A.L.E.H</span>
        </div>
      )
    },
    {
      id: 'lcd',
      label: 'LCD Dashboard',
      icon: (
        <div className="flex flex-col items-center justify-center">
          <span className="text-[8px] font-extrabold text-gray-700 tracking-wider">LCD</span>
          <div className="border border-red-500 bg-red-50/80 rounded px-1.5 py-0.5 mt-0.5 shadow-2xs">
            <span className="text-[11px] font-mono font-black text-[#E60012] tracking-tighter">188</span>
          </div>
        </div>
      )
    },
    {
      id: 'abs',
      label: 'ABS Braking',
      icon: (
        <div className="flex flex-col items-center justify-center">
          <svg className="w-6 h-6 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
            <circle cx="12" cy="12" r="4" />
          </svg>
          <span className="text-[9px] font-black text-[#E60012] tracking-wider uppercase -mt-0.5">ABS</span>
        </div>
      )
    },
    {
      id: 'suspension',
      label: 'Adjustable Suspension',
      icon: (
        <div className="flex flex-col items-center justify-center relative">
          <svg className="w-6 h-6 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M8 6h8M8 10h8M8 14h8M8 18h8" />
          </svg>
          <span className="text-[9px] font-bold text-[#E60012] absolute -bottom-1">↘</span>
        </div>
      )
    },
    {
      id: 'storage',
      label: 'Dual Helmet Storage',
      icon: (
        <div className="flex flex-col items-center justify-center">
          <svg className="w-7 h-7 text-gray-800" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-9 7c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm6 0c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
          </svg>
          <span className="text-[8px] font-bold text-[#E60012] tracking-tighter">DUAL</span>
        </div>
      )
    },
    {
      id: 'qc3',
      label: 'QC 3.0 USB',
      icon: (
        <div className="flex flex-col items-center justify-center">
          <svg className="w-5 h-5 text-gray-800" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15 7v2h2v8h-2v2h-2V7h2M9 7v10h2V7H9m-4 0v10h2V7H5z" />
          </svg>
          <div className="border border-red-500 bg-red-50 rounded px-1 py-0 mt-0.5">
            <span className="text-[7px] font-black text-[#E60012] tracking-tight">QC3.0</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 my-6 pb-2">
      {badges.map((b) => (
        <div
          key={b.id}
          title={b.label}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-gray-50 via-gray-150 to-gray-300 border-2 border-white/95 shadow-[0_4px_10px_rgba(0,0,0,0.15),inset_0_2px_4px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(0,0,0,0.2)] flex items-center justify-center p-1.5 hover:scale-105 transition-transform duration-200 cursor-pointer select-none"
        >
          {b.icon}
        </div>
      ))}
    </div>
  );
}

function ScrollableFeatureGallery({ items }: { items: Array<{ src: string; alt: string; caption?: string }> }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [thumbWidthPct, setThumbWidthPct] = React.useState<number>(33);
  const [thumbLeftPct, setThumbLeftPct] = React.useState<number>(0);

  const updateScroll = React.useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    if (scrollWidth <= clientWidth) {
      setThumbWidthPct(100);
      setThumbLeftPct(0);
      return;
    }
    const widthRatio = clientWidth / scrollWidth;
    const wPct = Math.max(25, Math.min(80, widthRatio * 100));
    const maxScroll = scrollWidth - clientWidth;
    const scrollRatio = Math.max(0, Math.min(1, scrollLeft / maxScroll));
    const maxLeftPct = 100 - wPct;
    const lPct = scrollRatio * maxLeftPct;

    setThumbWidthPct(wPct);
    setThumbLeftPct(lPct);
  }, []);

  React.useEffect(() => {
    updateScroll();
    window.addEventListener('resize', updateScroll);
    return () => window.removeEventListener('resize', updateScroll);
  }, [updateScroll]);

  return (
    <div className="w-full my-8 space-y-4">
      {/* Scrollable Gallery Items */}
      <div
        ref={scrollRef}
        onScroll={updateScroll}
        className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory py-1 cursor-grab active:cursor-grabbing select-none"
      >
        {items.map((item, idx) => (
          <div key={idx} className="flex-none w-[300px] sm:w-[380px] md:w-[441px] snap-start">
            <div className="relative overflow-hidden bg-gray-100 aspect-[3/2] border border-gray-200 group rounded-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src}
                alt={item.alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            {item.caption && (
              <p className="mt-3 text-center text-xs font-semibold text-gray-600">
                {item.caption}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Custom Red Scrollbar Track */}
      <div className="relative w-full h-[3px] bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute top-0 bottom-0 bg-[#E60012] rounded-full transition-all duration-75"
          style={{
            width: `${thumbWidthPct}%`,
            left: `${thumbLeftPct}%`,
          }}
        />
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string; isLast?: boolean }) {
  return (
    <div className="grid grid-cols-12 py-2.5 gap-2 items-center">
      <span className="col-span-6 sm:col-span-5 text-base sm:text-lg font-medium text-gray-500 leading-relaxed font-sans">{label}</span>
      <span className="col-span-6 sm:col-span-7 text-base sm:text-lg font-semibold text-gray-800 leading-relaxed font-sans">{value}</span>
    </div>
  );
}

interface ScooterDetailViewProps {
  product: ProductItem;
  allProducts: ProductItem[];
}

export function ScooterDetailView({ product: initialProduct, allProducts }: ScooterDetailViewProps) {
  const { language, dir, t } = useLanguage();
  const { addItem } = useCart();
  const isAr = language === 'ar';

  const [currentProduct, setCurrentProduct] = useState<ProductItem>(initialProduct);

  // Live sync against the real backend: catches admin-made price/stock/spec
  // edits for real customers, not just the admin's own browser.
  React.useEffect(() => {
    let cancelled = false;
    fetchLiveProduct(initialProduct.slug || initialProduct.id).then((live) => {
      if (!cancelled && live) {
        setCurrentProduct((prev) => {
          const merged = { ...prev, ...live };
          // Real 8-angle 360° photography currently lives in the static catalog bundle until
          // an admin syncs the same set into the live DB — a live record with no (or an
          // incomplete) images360 must not erase a real, complete static set.
          if ((!live.images360 || live.images360.length < 8) && prev.images360 && prev.images360.length >= 8) {
            merged.images360 = prev.images360;
          }
          return merged;
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [initialProduct]);

  const product = currentProduct;

  // Color Variants & Images
  const galleryImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const [selectedImage, setSelectedImage] = useState<string>(galleryImages[0]);
  const [selectedColorIdx, setSelectedColorIdx] = useState<number>(0);
  const hasTvcf =
    product.slug !== 'nhx-200' &&
    !product.slug.includes('nhx') &&
    product.slug !== 'xwolf-300' &&
    !product.slug.includes('xwolf') &&
    product.slug !== 'nht-200' &&
    !product.slug.includes('nht') &&
    product.slug !== 'orbit-3-dx-150' &&
    !product.slug.includes('orbit-3') &&
    !product.slug.includes('orbit-iii') &&
    product.slug !== 'jet-14-evo' &&
    // jet-14-dd and jet-4-150 have no verified official TVCF of their own — both were
    // falling through to the shared default video ID below, which belongs to a different
    // model entirely (same root cause, two products hit by it so far).
    product.slug !== 'jet-14-dd' &&
    product.slug !== 'jet-4-150' &&
    product.slug !== 'fiddle-3-150' &&
    // fiddle-2-150 (Fiddle II): the official sym-global.com product page has no TVCF/video
    // section at all for this model, confirming it never had one to begin with.
    product.slug !== 'fiddle-2-150' &&
    // symphony-sr-150 / symphony-sr-125 (Symphony SR): the official sym-global.com product
    // page has no TVCF/video section at all for this model.
    product.slug !== 'symphony-sr-150' &&
    product.slug !== 'symphony-sr-125' &&
    // joymax-z-300 and orbit-2-150 have no verified official TVCF of their own — both were
    // falling through to the shared default video ID, which belongs to a different model.
    product.slug !== 'joymax-z-300' &&
    product.slug !== 'orbit-2-150';
  const [activeNav, setActiveNav] = useState<'Color' | 'Features' | 'View 360°' | 'TVCF' | 'Specification' | 'Catalog'>('Color');
  const [isPlayingTvcf, setIsPlayingTvcf] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [catalogTab, setCatalogTab] = useState<'maintenance' | 'specifications'>('maintenance');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const featuresData = getProductFeatures(product, isAr);

  const getBannerForProduct = (p: ProductItem) => {
    if (p.slug === 'symphony-sr-150' || p.slug === 'symphony-sr-125' || p.slug.includes('sr-150')) return '/assets/banners/sr-150-custom-bg.png';
    if (p.slug.includes('st-150') || p.slug.includes('st-200') || p.slug.includes('symphony-st')) return '/assets/banners/st-150-custom-bg.png';
    if (p.slug === 'nhx-200' || p.slug.includes('nhx')) return '/assets/banners/nhx-200-custom-bg.png';
    if (p.slug === 'xwolf-300' || p.slug.includes('xwolf')) return '/assets/banners/xwolf-300-custom-bg.png';
    if (p.slug === 'cruisym-400i') return '/assets/banners/cruisym-400-scenic-banner.png';
    if (p.slug === 'cruisym-300') return '/assets/banners/cruisym-300-scenic-banner.png';
    if (p.slug === 'husky-adv') return '/assets/banners/husky-adv-scenic-banner.png';
    if (p.bannerImage && !p.bannerImage.includes('cruisym')) return p.bannerImage;
    return '/top_banner2 copy.jpg';
  };

  const [bannerSrc, setBannerSrc] = useState<string>(getBannerForProduct(product));

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShareUrl(window.location.href);
    setBannerSrc(getBannerForProduct(product));
  }, [product]);

  const specs = product.specifications || {};

  // Preload all color variant images into browser memory for 0ms instant switching
  React.useEffect(() => {
    const imagesToPreload = galleryImages;

    imagesToPreload.forEach((src: string) => {
      if (typeof window !== 'undefined') {
        const img = new window.Image();
        img.src = src;
      }
    });

    // Real-time ScrollSpy Observer for Next.js
    const sectionIds = [
      { id: 'hero-color', name: 'Color' },
      { id: 'features', name: 'Features' },
      { id: 'view360', name: 'View 360°' },
      ...(hasTvcf ? [{ id: 'tvcf', name: 'TVCF' }] : []),
      { id: 'specification', name: 'Specification' },
      ...(product.catalogPdf ? [{ id: 'catalog', name: 'Catalog' }] : [])
    ];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const sec of sectionIds) {
        const el = document.getElementById(sec.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveNav(sec.name as 'Features' | 'Color' | 'View 360°' | 'TVCF' | 'Specification' | 'Catalog');
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [product, galleryImages, hasTvcf]);

  const scrollToSection = (id: string, navName: string) => {
    setActiveNav(navName as 'Features' | 'Color' | 'View 360°' | 'TVCF' | 'Specification' | 'Catalog');
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const whatsappText = encodeURIComponent(
    isAr
      ? `مرحباً SYM مصر، أود الاستفسار عن كارت الصيانة والدعم الفني وقطع غيار سكوتر ${product.name}`
      : `Hello, I would like to inquire about the official maintenance manual and parts for ${product.name}`
  );

  return (
    <div className="w-full bg-[#1c1c1e] text-gray-900 min-h-screen font-sans select-none relative" dir={dir}>

      {/* Floating Navigation Panel (Official SYM Global Sidebar Design) */}
      <aside className={`fixed ${dir === 'rtl' ? 'left-0 rounded-r-none border-r border-b' : 'right-0 rounded-l-none border-l border-b'} top-32 z-40 w-52 text-white hidden lg:block shadow-2xl overflow-hidden border-neutral-800`}>

        {/* Red Compare Header Button */}
        <Link
          href="/compare"
          className="w-full bg-[#E60012] hover:bg-red-700 text-white font-bold py-3.5 px-4 text-xs uppercase flex items-center justify-start gap-2.5 tracking-wider transition-colors"
        >
          <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
            <path d="M19 13c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3zm0 4c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zM5 13c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3zm0 4c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm7.8-6.8l-1.3-2.2H8.5c-.3 0-.5.2-.5.5s.2.5.5.5h2.4l.7 1.2-2.1 3c-.2.3-.1.7.2.9.1.1.2.1.3.1.2 0 .4-.1.5-.3l2.3-3.3h3.7c.3 0 .5-.2.5-.5s-.2-.5-.5-.5h-3.9z" />
          </svg>
          <span className="text-xs font-bold tracking-wide">{t('detail.addCompare', '+ ADD COMPARE')}</span>
        </Link>

        {/* Official Nav List */}
        <div className="bg-[#2b2b2b] py-5 px-5 relative">
          <ul className="space-y-5 text-sm font-semibold relative">
            {[
              { id: 'hero-color', name: 'Color', label: t('common.color', 'Color') },
              { id: 'features', name: 'Features', label: t('common.features', 'Features') },
              { id: 'view360', name: 'View 360°', label: t('common.view360', 'View 360°') },
              ...(hasTvcf ? [{ id: 'tvcf', name: 'TVCF', label: t('detail.tvcf', 'TVCF') }] : []),
              { id: 'specification', name: 'Specification', label: t('common.specs', 'Specification') },
              ...(product.catalogPdf ? [{ id: 'catalog', name: 'Catalog', label: t('detail.catalog', 'Catalog') }] : [])
            ].map((item, idx, arr) => {
              const isActive = activeNav === item.name;
              return (
                <li key={item.id} className="relative">
                  {/* Timeline Connecting Line */}
                  {idx < arr.length - 1 && (
                    <div className={`absolute ${dir === 'rtl' ? 'left-[7px]' : 'right-[7px]'} top-[14px] w-[1px] h-[34px] bg-[#555555] z-0`} />
                  )}
                  <button
                    type="button"
                    onClick={() => scrollToSection(item.id, item.name)}
                    className="w-full flex items-center justify-between py-0.5 transition-all z-10 relative group"
                  >
                    <span className={`text-[16px] font-sans tracking-tight transition-colors ${isActive ? 'text-white font-bold' : 'text-[#999999] font-normal hover:text-white'}`}>
                      {item.label}
                    </span>
                    <div className={`w-4 h-4 rounded-full transition-all flex items-center justify-center z-10 ${isActive ? 'bg-white shadow-md scale-105' : 'border border-[#777777] bg-transparent'}`} />
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Social Share Buttons with Divider Lines matching Screenshot */}
          <div className="mt-6 pt-0 space-y-0">
            {/* Facebook Share */}
            <div className="border-t border-[#3a3a3a] pt-3 pb-3">
              <a
                className="flex items-center gap-4 text-[#999999] hover:text-white transition-colors text-[15px] font-sans group"
                href={`http://www.facebook.com/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="nofollow"
              >
                <svg className="w-5 h-5 fill-current text-[#999999] group-hover:text-white flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="font-normal">{t('detail.share', 'Share')}</span>
              </a>
            </div>

            {/* Twitter Share */}
            <div className="border-t border-[#3a3a3a] pt-3 pb-1">
              <a
                className="flex items-center gap-4 text-[#999999] hover:text-white transition-colors text-[15px] font-sans group"
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="nofollow"
              >
                <svg className="w-5 h-5 fill-current text-[#999999] group-hover:text-white flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z" />
                </svg>
                <span className="font-normal">{t('detail.share', 'Share')}</span>
              </a>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sticky Section Horizontal Bar */}
      <div className="lg:hidden sticky top-16 z-30 bg-[#222222]/95 backdrop-blur-md border-b border-neutral-800 px-4 py-2 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 min-w-max">
          <button
            type="button"
            onClick={() => scrollToSection('hero-color', 'Color')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${activeNav === 'Color' ? 'bg-[#E60012] text-white' : 'bg-neutral-800 text-gray-300'}`}
          >
            {t('common.color', 'Color')}
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('features', 'Features')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${activeNav === 'Features' ? 'bg-[#E60012] text-white' : 'bg-neutral-800 text-gray-300'}`}
          >
            {t('common.features', 'Features')}
          </button>
        </div>
      </div>

      {/* 1. Top Hero Background Banner - Custom High-Def Egyptian Landmarks Theme */}
      <div className="relative w-full h-[320px] sm:h-[400px] md:h-[480px] bg-black overflow-hidden border-b border-zinc-800">
        <Image
          src={bannerSrc}
          alt={`${product.name} Hero Banner`}
          fill
          priority
          sizes="100vw"
          quality={100}
          unoptimized
          onError={() => setBannerSrc('/assets/banners/egypt-hero-banner.png')}
          className="object-cover object-center brightness-105 contrast-105 select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30 pointer-events-none"></div>
      </div>

      {/* 2. Main Overlapping White Card Stage (Exact SYM Global Layout: 220px Left Gap & Full White Right Edge) */}
      <div className={`relative z-20 w-full ${dir === 'rtl' ? 'lg:mr-[220px] lg:w-[calc(100%-220px)]' : 'lg:ml-[220px] lg:w-[calc(100%-220px)]'} -mt-20 md:-mt-32 pb-24`}>

        <div className={`bg-white shadow-[-4px_0_12px_rgba(0,0,0,0.2)] p-6 md:p-12 ${dir === 'rtl' ? 'lg:pl-60' : 'lg:pr-60'} border-gray-200 min-h-0 md:min-h-[900px] flex flex-col justify-between rounded-none`}>

          <div className="space-y-16">

            {/* Hero Scooter Stage & Color Thumbnails Section */}
            <div id="hero-color" className="space-y-6 scroll-mt-28">

              {/* 1. Central Scooter Stage Image (Restored Original Size & High-Definition Clarity) */}
              <div
                className="relative w-full h-[280px] sm:h-[340px] md:h-[400px] max-w-[560px] mx-auto overflow-visible flex items-center justify-center -mt-20 sm:-mt-28 md:-mt-36 z-30 transform-gpu"
                style={{ transform: shouldFlipImageToFaceLeft(selectedImage) ? 'scaleX(-1)' : 'none' }}
              >
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  className="object-contain p-0 scale-100 hover:scale-105 transition-transform duration-300 ease-out filter drop-shadow-2xl brightness-105 contrast-105"
                  priority
                  quality={100}
                />
              </div>

              {/* 2. Scooter Name Title & Color Selector Palette — one row, directly under the stage image */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 border-b border-gray-200 pb-8 pt-4 w-full">

                {/* Scooter Name Title & Category */}
                <div className="flex flex-col text-start space-y-2.5 flex-shrink-0 max-w-full">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[2.1rem] font-black text-[#E60012] tracking-tight uppercase font-sans leading-tight whitespace-normal sm:whitespace-nowrap">
                    {product.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">
                    {t('nav.home', 'Home')} / {t('nav.products', 'Products')} / {product.category === 'scooter' ? t('common.scooter', 'Scooter') : t('common.bike', 'Bike')} / {product.name} / {product.capacity?.includes('cc') ? product.capacity : `${product.capacity || '150'} cc`}
                  </p>

                  <div className="pt-1">
                    {PURCHASING_ENABLED ? (
                      <button
                        type="button"
                        onClick={() => {
                          addItem({
                            product_id: product.slug || product.id,
                            product_name: product.name,
                            price: product.price || 0,
                            quantity: 1,
                            image: selectedImage || product.image,
                            item_type: 'scooter',
                            meta: {
                              capacity: product.capacity || undefined,
                            },
                          });
                        }}
                        className="px-6 py-2.5 bg-[#E60012] hover:bg-[#C4000F] text-white font-extrabold text-xs sm:text-sm rounded-full transition-all shadow-[0_0_15px_rgba(230,0,18,0.4)] flex items-center justify-center gap-2 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>{isAr ? 'شراء الآن / أضف لسلة التسوق' : 'Buy Now / Add to Cart'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        title={isAr ? 'خاصية الشراء عبر الموقع قريباً' : 'Online purchasing is coming soon'}
                        className="px-6 py-2.5 bg-gray-300 text-gray-600 font-extrabold text-xs sm:text-sm rounded-full flex items-center justify-center gap-2 cursor-not-allowed whitespace-nowrap"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>{isAr ? 'قريباً' : 'Coming Soon'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Interactive Color Thumbnails Palette — single row, never wraps */}
                <div className="flex flex-row flex-nowrap items-center gap-2.5 sm:gap-3.5 overflow-x-auto scrollbar-hide px-2 py-2 max-w-full z-10 lg:pr-8 rtl:lg:pr-0 rtl:lg:pl-8">
                  {galleryImages.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedImage(img);
                        setSelectedColorIdx(idx);
                      }}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 bg-white border-2 transition-all duration-200 p-0.5 flex-shrink-0 flex items-center justify-center rounded-xl ${selectedColorIdx === idx
                        ? 'border-[#E60012] shadow-lg ring-4 ring-[#E60012]/20 scale-105 z-10'
                        : 'border-gray-200 hover:border-gray-400 opacity-90 hover:opacity-100'
                        }`}
                    >
                      <div className="relative w-full h-full transform-gpu flex items-center justify-center overflow-hidden rounded-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt={`${product.name} color ${idx + 1}`}
                          className="w-full h-full object-contain p-0.5 filter drop-shadow-md brightness-110 contrast-105 transition-transform duration-200 hover:scale-110"
                          style={{ transform: shouldFlipImageToFaceLeft(img) ? 'scaleX(-1) scale(1.12)' : 'scale(1.12)' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = product.image;
                          }}
                        />
                      </div>
                    </button>
                  ))}
                </div>

              </div>

            </div>

            {/* 3. Features Section dynamically rendered per scooter/bike model */}
            <div id="features" className="space-y-8 scroll-mt-28 pt-8">

              {/* Features Title with Red Accent Bar */}
              <div className={`flex items-center gap-3 ${dir === 'rtl' ? 'border-r-4 border-l-0 pr-4 pl-0' : 'border-l-4 border-[#E60012] pl-4'} border-[#E60012] py-1`}>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {isAr ? 'الميزات الأساسية' : 'Features'}
                </h2>
              </div>

              {/* Subheading & Concept */}
              <div className="col-md-12 pt-2">
                {featuresData.has3dBadges && <SymFeatureBadges />}
                {featuresData.conceptTitle && (
                  <h3 className="text-[18px] md:text-[20px] font-bold text-[#555555] mt-2 mb-4 font-['Arial','Helvetica_Neue',Helvetica,sans-serif] tracking-tight">
                    {featuresData.conceptTitle}
                  </h3>
                )}

                {featuresData.htmlContent ? (
                  <div
                    className="text-[14px] text-[#666666] font-normal leading-[1.75] tracking-normal max-w-[840px] font-['Arial','Helvetica_Neue',Helvetica,sans-serif]"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(featuresData.htmlContent) }}
                  />
                ) : featuresData.paragraphs && featuresData.paragraphs.length > 0 ? (
                  <div className="space-y-4">
                    {featuresData.paragraphs.map((para: string, pIdx: number) => (
                      <p key={pIdx} className="text-[14px] text-[#666666] font-normal leading-[1.65] tracking-normal max-w-[840px] font-['Arial','Helvetica_Neue',Helvetica,sans-serif]">
                        {para}
                      </p>
                    ))}
                  </div>
                ) : (
                  featuresData.conceptDescription && (
                    <p className="text-[14px] text-[#666666] font-normal leading-[1.65] tracking-normal max-w-[840px] font-['Arial','Helvetica_Neue',Helvetica,sans-serif]">
                      {featuresData.conceptDescription}
                    </p>
                  )
                )}

                {featuresData.featureGallery && featuresData.featureGallery.length > 0 && (
                  <ScrollableFeatureGallery items={featuresData.featureGallery} />
                )}
              </div>

              {/* Feature Items List with Images matching official SYM layout 1:1 */}
              {product.slug === 'joymax-z-300' ? (
                <div className="space-y-10 pt-4 max-w-[840px] font-sans">

                  {/* Full LED Headlights — two images side by side */}
                  <div className="space-y-4">
                    <h4 className="text-[18px] md:text-[20px] font-bold text-[#555555] tracking-tight">
                      {isAr ? 'مصابيح LED أمامي فائقة الإضاءة' : 'Full LED Headlights'}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/hero/JM headlight.png"
                        alt="Joymax Z 300 LED Headlight Front"
                        className="w-full h-auto object-cover block"
                        onError={(e) => { (e.target as HTMLImageElement).src = product.image; }}
                      />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/hero/Headlight1.png"
                        alt="Joymax Z 300 LED Headlight Detail"
                        className="w-full h-auto object-cover block"
                        onError={(e) => { (e.target as HTMLImageElement).src = product.image; }}
                      />
                    </div>
                  </div>

                  {/* TCS Section */}
                  <div className="space-y-2">
                    <ul className="list-disc pl-5 rtl:pr-5 rtl:pl-0 text-[14px] text-[#555555] leading-[1.75]">
                      <li>
                        <span className="font-bold">{isAr ? 'نظام التحكم في الجر (TCS)' : 'Traction Control System (TCS)'}</span>
                        <p className="text-[14px] text-[#666666] leading-[1.75] mt-1 font-normal">
                          {isAr
                            ? 'يمنع نظام TCS انزلاق العجلة الخلفية للسكوتر عند الانطلاق أو التسارع أو الانعطاف على الطرق الزلقة وهو عنصر أمان حاسم في الفئات المتقدمة.'
                            : 'TCS attempts to prevent a vehicle\'s rear wheel from slipping at the time of getting started, accelerating, or making turns. It\'s the mainstream safe function on the high-end scooter.'}
                        </p>
                      </li>
                    </ul>
                  </div>

                  {/* Other Features */}
                  <div className="space-y-3">
                    <h4 className="text-[18px] md:text-[20px] font-bold text-[#555555] tracking-tight">
                      {isAr ? 'ميزات أخرى' : 'Other Features'}
                    </h4>
                    <ul className="list-disc pl-5 rtl:pr-5 rtl:pl-0 space-y-1 text-[14px] text-[#666666] leading-[1.75]">
                      <li>{isAr ? 'شاحن سريع QC 3.0 USB' : 'Quick Charge 3.0'}</li>
                      <li>{isAr ? 'محرك تبريد مائي' : 'Liquid-cooled engine'}</li>
                      <li>{isAr ? 'مساعدين خلفيين مزدوجين' : 'Dual Shock absorber'}</li>
                      <li>{isAr ? 'مفتاح إضاءة طوارئ' : 'Hazard Control Light'}</li>
                      <li>{isAr ? 'تخزين لخوذتين' : 'Two Helmets Storage'}</li>
                      <li>{isAr ? 'زجاج أمامي قابل للتعديل' : 'Adjustable Windshield'}</li>
                      <li>{isAr ? 'مسند ظهر قابل للتعديل' : 'Adjustable Waistrest'}</li>
                      <li>{isAr ? 'تشغيل بدون مفتاح Keyless' : 'Keyless'}</li>
                      <li>{isAr ? 'نظام فرامل TCS' : 'TCS'}</li>
                    </ul>
                  </div>

                  {/* Feature Image Slider */}
                  <div className="relative w-full">
                    <div
                      ref={(el) => {
                        if (el) {
                          el.onscroll = () => {
                            const progress = el.scrollLeft / (el.scrollWidth - el.clientWidth);
                            const bar = el.nextElementSibling?.querySelector('[data-scroll-bar]') as HTMLElement;
                            if (bar) bar.style.width = `${progress * 100}%`;
                          };
                        }
                      }}
                      className="w-full overflow-x-auto scrollbar-hide"
                    >
                      <div className="flex gap-5 pb-2" style={{ width: 'max-content' }}>
                        {[
                          { src: '/assets/hero/JM headlight.png', label: isAr ? 'رؤية أمامية' : 'Front View' },
                          { src: '/assets/hero/taillight copy.png', label: isAr ? 'مصباح خلفي' : 'Tail Light' },
                          { src: '/assets/hero/JMmeter_eu.png', label: isAr ? 'عداد TFT' : 'TFT Instrument' },
                          { src: '/assets/hero/keyless png.png', label: isAr ? 'تشغيل ذكي' : 'Keyless' },
                          { src: '/assets/hero/adjustable.png', label: isAr ? 'مسند ظهر قابل للتعديل' : 'Adjustable Waistrest' },
                          { src: '/assets/hero/joymaxz_metin.png', label: isAr ? 'تخزين لخوذتين' : '2 Helmet Storage' },
                        ].map((item, idx) => (
                          <div key={idx} className="flex-shrink-0 w-[260px] sm:w-[275px] overflow-hidden relative bg-black">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.src}
                              alt={item.label}
                              className="w-full h-[180px] object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).src = product.image; }}
                            />
                            <div className="p-2 text-center text-xs font-bold text-white bg-black/70">{item.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Red scroll progress bar */}
                    <div className="w-full h-[3px] bg-gray-200 mt-3 relative overflow-hidden">
                      <div data-scroll-bar style={{ width: '30%' }} className="h-full bg-[#E60012] transition-[width] duration-100 ease-out" />
                    </div>
                  </div>

                </div>
              ) : product.slug === 'husky-adv' ? (
                <div className="space-y-10 pt-4 max-w-[960px] font-sans">
                  <p className="text-[14px] text-[#666666] leading-[1.75] mb-6">
                    {isAr
                      ? 'تم تصميم SYM Husky ADV 200 لعشاق المغامرات والتنقل الحضري اليومي. يجمع السكوتر بين أرغونومكس المغامرة الهجومية، ونظام التعليق طويل المدى، وخزان وقود سعة 15 لتر الرائد في فئته، ونظام A.L.E.H المسجل لتقديم أداء سلس وثبات استثنائي على كافة الطرق.'
                      : 'The SYM Husky ADV 200 is engineered for urban commuters and outdoor adventure enthusiasts alike. Combining aggressive ADV motorcycle ergonomics, long-travel suspension, a class-leading 15L fuel tank, and patented A.L.E.H. technology, the Husky ADV 200 delivers smooth power, sharp handling, and supreme touring comfort on any terrain.'}
                  </p>

                  {/* Feature 1: Full LED Lighting */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-[18px] md:text-[20px] font-bold text-[#333333] tracking-tight uppercase">
                      {isAr ? 'إضاءة LED كاملة' : 'FULL LED LIGHTING'}
                    </h4>
                    <p className="text-[14px] text-[#666666] leading-[1.75]">
                      {isAr
                        ? 'مزود بمصباح أمامي LED، إضاءة موضعية LED، مصباح خلفي LED، وإشارات انعطاف LED. الإضاءة LED الكاملة لا تمنح Husky ADV 200 مظهراً عصرياً فحسب، بل ترفع أيضاً مستوى الأمان أثناء القيادة الليلية.'
                        : 'Equipped with an LED headlight, LED position light, LED tail light, and LED turn indicators. The full LED lighting not only gives the Husky ADV 200 a striking look but also greatly improves riding safety.'}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                      <div className="w-full overflow-hidden bg-gray-50 border border-gray-100 rounded-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/assets/banners/headlight.png"
                          alt="Husky ADV 200 Full LED Headlight"
                          className="w-full h-[260px] sm:h-[320px] md:h-[360px] object-cover block"
                          onError={(e) => { (e.target as HTMLImageElement).src = product.image; }}
                        />
                      </div>
                      <div className="w-full overflow-hidden bg-gray-50 border border-gray-100 rounded-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/assets/banners/taillight.png"
                          alt="Husky ADV 200 LED Tail Light"
                          className="w-full h-[260px] sm:h-[320px] md:h-[360px] object-cover block"
                          onError={(e) => { (e.target as HTMLImageElement).src = product.image; }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Feature 2: Auto-Dimmer 5" TFT Instrument (Day/Night) */}
                  <div className="space-y-3 pt-4">
                    <h4 className="text-[18px] md:text-[20px] font-bold text-[#333333] tracking-tight uppercase">
                      {isAr ? 'شاشة TFT مقاس 5 بوصة بتعتيم تلقائي (نهار/ليل)' : 'AUTO-DIMMER 5" TFT INSTRUMENT (DAY/NIGHT)'}
                    </h4>
                    <p className="text-[14px] text-[#666666] leading-[1.75]">
                      {isAr
                        ? 'شاشة TFT الجديدة مقاس 5 بوصة مزودة بخاصية التعتيم التلقائي تضمن رؤية ممتازة في جميع الظروف. كما تتوفر بوضعين (نهار وليل) يتم التبديل بينهما تلقائياً، وتوفر المعلومات بوضوح كامل لدعم القائد في كل مغامرة.'
                        : 'The all-new 5" TFT instrument with the auto dimmer guarantees great visibility in all kinds of environments. It also features two modes (Day and Night) which switch automatically, offering the clearest instrument readout to support riders on every adventure.'}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                      <div className="w-full overflow-hidden bg-gray-50 border border-gray-100 rounded-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/assets/banners/Instrument.png"
                          alt="Husky ADV 200 5-inch TFT Display Day Mode"
                          className="w-full h-[260px] sm:h-[320px] md:h-[360px] object-cover block"
                          onError={(e) => { (e.target as HTMLImageElement).src = product.image; }}
                        />
                      </div>
                      <div className="w-full overflow-hidden bg-gray-50 border border-gray-100 rounded-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/assets/banners/instrument_night.png"
                          alt="Husky ADV 200 5-inch TFT Display Night Mode"
                          className="w-full h-[260px] sm:h-[320px] md:h-[360px] object-cover block"
                          onError={(e) => { (e.target as HTMLImageElement).src = product.image; }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Feature 3: Advance Protection (ABS + TCS) */}
                  <div className="space-y-3 pt-4">
                    <h4 className="text-[18px] md:text-[20px] font-bold text-[#333333] tracking-tight uppercase">
                      {isAr ? 'حماية متقدمة' : 'ADVANCE PROTECTION'}
                    </h4>
                    <p className="text-[14px] text-[#666666] leading-[1.75]">
                      {isAr ? (
                        <>الحماية المتقدمة تمنح القائد ثقة أكبر عند خوض المجهول. استكشاف المغامرة يصبح آمناً بمساعدة نظامي <span className="text-[#E60012] font-semibold">TCS</span> و<span className="text-[#E60012] font-semibold">ABS</span>.</>
                      ) : (
                        <>Advanced protection gives riders more confidence when getting into the unknown. Exploring adventure can be safe with the help of <span className="text-[#E60012] font-semibold">TCS</span> and <span className="text-[#E60012] font-semibold">ABS</span>.</>
                      )}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                      <div className="w-full overflow-hidden bg-gray-50 border border-gray-100 rounded-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/assets/banners/ABS.png"
                          alt="Husky ADV 200 Anti-Lock Braking System"
                          className="w-full h-[260px] sm:h-[320px] md:h-[360px] object-contain block"
                          onError={(e) => { (e.target as HTMLImageElement).src = product.image; }}
                        />
                      </div>
                      <div className="w-full overflow-hidden bg-gray-50 border border-gray-100 rounded-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/assets/banners/TCS.png"
                          alt="Husky ADV 200 Traction Control System"
                          className="w-full h-[260px] sm:h-[320px] md:h-[360px] object-contain block"
                          onError={(e) => { (e.target as HTMLImageElement).src = product.image; }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Feature 4: Keyless System & QC 3.0 / 15L Fuel Tank */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-3">
                      <h4 className="text-[16px] md:text-[18px] font-bold text-[#333333] tracking-tight uppercase">
                        {isAr ? 'نظام KEYLESS وشحن QC 3.0' : 'KEYLESS SYSTEM AND QC 3.0'}
                      </h4>
                      <p className="text-[14px] text-[#666666] leading-[1.75]">
                        {isAr
                          ? 'نظام Keyless 2.0 أكثر سهولة في الاستخدام، ويتميز بوضع التشغيل الطارئ الذي يتيح تشغيل المحرك حتى عند ضعف بطارية الريموت.'
                          : 'The Keyless System 2.0 is more user-oriented and easier to operate. It has an emergency ignition mode which allows you to start the engine even when the key fob battery is low.'}
                      </p>
                      <div className="w-full overflow-hidden bg-gray-50 border border-gray-100 rounded-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/assets/banners/keyless.png"
                          alt="Husky ADV 200 Keyless Ignition and QC 3.0 USB Port"
                          className="w-full h-[260px] sm:h-[320px] md:h-[360px] object-cover block"
                          onError={(e) => { (e.target as HTMLImageElement).src = product.image; }}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-[16px] md:text-[18px] font-bold text-[#333333] tracking-tight uppercase">
                        {isAr ? 'خزان وقود 15 لتر' : '15L FUEL TANK'}
                      </h4>
                      <p className="text-[14px] text-[#666666] leading-[1.75]">
                        {isAr
                          ? 'سعة خزان الوقود الكبيرة تقلل من عدد مرات التوجه لمحطة الوقود. سعة 15 لتر أكبر من معظم الماكسي سكوتر، مما يتيح للقائد الاستمتاع بالرحلة دون القلق بشأن الوقود.'
                          : 'The large fuel tank capacity reduces the frequency of visiting a gas station. The 15L fuel tank capacity is even bigger than most maxi scooters. The rider can focus on enjoying the ride without worrying about fuel.'}
                      </p>
                      <div className="w-full overflow-hidden bg-gray-50 border border-gray-100 rounded-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/assets/banners/fueltank.png"
                          alt="Husky ADV 200 15L Fuel Tank"
                          className="w-full h-[260px] sm:h-[320px] md:h-[360px] object-cover block"
                          onError={(e) => { (e.target as HTMLImageElement).src = product.image; }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Feature 5: Front Compartment */}
                  <div className="space-y-3 pt-4">
                    <h4 className="text-[18px] md:text-[20px] font-bold text-[#333333] tracking-tight uppercase">
                      {isAr ? 'صندوق تخزين أمامي' : 'FRONT COMPARTMENT'}
                    </h4>
                    <p className="text-[14px] text-[#666666] leading-[1.75]">
                      {isAr
                        ? 'يتيح صندوق التخزين الأمامي للقائد وضع الهاتف والمحفظة أو الأدوات الشخصية بداخله بأمان.'
                        : 'The front compartment allows the riders to put their phones, wallets, or gadgets inside.'}
                    </p>
                  </div>
                </div>
              ) : product.slug === 'maxsym-tl-508' ? (
                <div className="space-y-10 pt-4 max-w-[840px] font-sans">
                  {/* Item 1: Sketch Graphic Concept */}
                  <div className="w-full overflow-hidden rounded-none border-none flex justify-start">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/assets/hero/maxsym-tl-01.jpg"
                      alt="Maxsym TL Design Concept"
                      className="w-auto max-w-full max-h-[340px] md:max-h-[380px] block object-contain ml-0 mr-auto rtl:ml-auto rtl:mr-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = product.image;
                      }}
                    />
                  </div>

                  {/* Item 2: Sufficient and Stable Power Performance */}
                  <div className="space-y-4 pt-2 font-sans">
                    <h4 className="text-[18px] md:text-[20px] font-bold text-[#555555] tracking-tight">
                      {isAr ? 'أداء قوي واستقرار فائق للمحرك' : 'Sufficient and Stable Power Performance'}
                    </h4>
                    <ul className="list-disc pl-5 rtl:pr-5 rtl:pl-0 space-y-2 text-[14px] text-[#666666] leading-[1.75]">
                      <li>
                        {isAr
                          ? 'محرك ثنائي الأسطوانات عل خط واحد (In-line twin cylinder) مزود بأسطوانة توازن عكسية ومقبض هيدروليكي مبلل متعدد الأقراص لتخفيض اهتزازات المحرك عند السرعات العالية ونقل القوة بسلاسة تامة.'
                          : 'In-line twin cylinder engine with reverse balance cylinder and multi-disc automatic wet clutch effectively reduces the engine vibration at high speeds, delivering vibration-free power to the rear wheel since start up.'}
                      </li>
                      <li>
                        {isAr
                          ? '8 صمامات – DOHC سعة 508 سي سي، يولد قوة قصوى 33.5 كيلوواط (45.5 حصان) عند 6,750 دورة/دقيقة—أقوى أداء في هذه الفئة.'
                          : '8 Valve – DOHC - 508 displacement, Maximum power 33.5 kW@6,750 rpm. Power performance is one of the best in similar capacity-competitors.'}
                      </li>
                    </ul>
                    <div className="w-full overflow-hidden rounded-none border-none pt-2 flex justify-start">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/hero/maxsym-tl-02.jpg"
                        alt="Sufficient and Stable Power Performance Engine"
                        className="w-auto max-w-full max-h-[340px] md:max-h-[380px] block object-contain ml-0 mr-auto rtl:ml-auto rtl:mr-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = product.image;
                        }}
                      />
                    </div>
                  </div>

                  {/* Item 3: Excellent Maneuverability */}
                  <div className="space-y-4 pt-4 font-sans">
                    <h4 className="text-[18px] md:text-[20px] font-bold text-[#555555] tracking-tight">
                      {isAr ? 'قدرة استثنائية على التوجيه والمناورة' : 'Excellent Maneuverability'}
                    </h4>
                    <ul className="list-disc pl-5 rtl:pr-5 rtl:pl-0 space-y-2 text-[14px] text-[#666666] leading-[1.75]">
                      <li>
                        {isAr
                          ? 'نظام تعليق خلفي أحادي بفرع متعدد (Multi-link mono shock) يمتص صدمات الطريق بدقة متناهية ويضمن استجابة حساسة وشعوراً تاماً بالطريق.'
                          : 'The exquisite “rear mono shock with multi-link suspension” simply justifies the incredible ability to absorb the impact from road surface and reacts delicately. This architecture enables rider to sense every inch of road feedback.'}
                      </li>
                      <li>
                        {isAr
                          ? 'مساعدين أمامية مقلوبة (Upside-down) مع مشبك ثنائي مقوى لزيادة صلابة وثبات نظام التعليق.'
                          : 'Upside-down front fork with double triple clamp enhances the rigidity of the suspension system, stability.'}
                      </li>
                      <li>
                        {isAr
                          ? 'توزيع وزن متوازن بنسبة 50/50 بين الأمام والخلف، مقترن بقاعدة عجلات قصيرة ومقصورة مقبض ألومنيوم ممتدة لمنح Maxsym TL رشاقة وحصانة فائقة عند المناورة.'
                          : 'In addition, the 50/50 balanced weight distribution, shortened wheelbase and extended aluminum swing arm make TL born to be excellence at handling, fulfilling both ways of high speed stability and remarkable urban agility.'}
                      </li>
                    </ul>
                    <div className="w-full overflow-hidden rounded-none border-none pt-2 flex justify-start">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/hero/maxsym-tl-03.jpg"
                        alt="Excellent Maneuverability Suspension"
                        className="w-auto max-w-full max-h-[340px] md:max-h-[380px] block object-contain ml-0 mr-auto rtl:ml-auto rtl:mr-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = product.image;
                        }}
                      />
                    </div>
                    <div className="w-full overflow-hidden rounded-none border-none pt-4 flex justify-start">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/hero/maxsym-tl-04.jpg"
                        alt="Maxsym TL Chassis Frame Structure"
                        className="w-auto max-w-full max-h-[340px] md:max-h-[380px] block object-contain ml-0 mr-auto rtl:ml-auto rtl:mr-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = product.image;
                        }}
                      />
                    </div>
                  </div>

                  {/* Item 4: Ensure a Safe Ride */}
                  <div className="space-y-4 pt-4 font-sans">
                    <h4 className="text-[18px] md:text-[20px] font-bold text-[#555555] tracking-tight">
                      {isAr ? 'منظومة أمان عالية الثقة' : 'Ensure a Safe Ride'}
                    </h4>
                    <p className="text-[14px] text-[#666666] leading-[1.75]">
                      {isAr
                        ? 'نظام كبح مزدوج بكليبرات شعاعية ذات 4 مكابس + ديسكات موجية 275 مم مع خراطيم فرامل فولاذية مصفحة لقوة فرملة هائلة ومدعومة بنظام ABS فائق الدقة.'
                        : 'The braking system covers dual radial 4-piston front caliper + 275mm wave discs with steel braided brake hoses, delivering powerful braking force. With assist of the precise ABS control, the ultimate braking performance is assured.'}
                    </p>
                    <p className="text-[14px] text-[#666666] leading-[1.75]">
                      {isAr
                        ? '4 مصابيح LED عاكسة توفر أقصى كفاءة رؤية ليلية على الطرق المظلمة.'
                        : 'Four reflective LED headlights demonstrate a splendid overall lighting performance with high beam on providing a clearer vision at night.'}
                    </p>
                    <div className="w-full overflow-hidden rounded-none border-none pt-2 flex justify-start">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/hero/maxsym-tl-05.jpg"
                        alt="Ensure a Safe Ride Braking"
                        className="w-auto max-w-full max-h-[340px] md:max-h-[380px] block object-contain ml-0 mr-auto rtl:ml-auto rtl:mr-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = product.image;
                        }}
                      />
                    </div>
                    <div className="w-full overflow-hidden rounded-none border-none pt-4 flex justify-start">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/hero/maxsym-tl-06.jpg"
                        alt="Four reflective LED headlights"
                        className="w-auto max-w-full max-h-[340px] md:max-h-[380px] block object-contain ml-0 mr-auto rtl:ml-auto rtl:mr-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = product.image;
                        }}
                      />
                    </div>
                  </div>

                  {/* Item 5: Concise and Aggressive Sportive Look Design */}
                  <div className="space-y-4 pt-4 font-sans">
                    <h4 className="text-[18px] md:text-[20px] font-bold text-[#555555] tracking-tight">
                      {isAr ? 'تصميم رياضي هجومي وانسيابي' : 'Concise and Aggressive Sportive Look Design'}
                    </h4>
                    <ul className="list-disc pl-5 rtl:pr-5 rtl:pl-0 space-y-2 text-[14px] text-[#666666] leading-[1.75]">
                      <li>
                        {isAr
                          ? 'هيكل مدمج ورياضي يعبر عن الجرأة والقوة دون الحاجة إلى تفاصيل زائدة.'
                          : 'Compact and size body configuration need no complex decoration, simply present its concise, aggressive and toughness.'}
                      </li>
                      <li>
                        {isAr
                          ? 'مصابيح خلفية LED 3D عاكسة تمنح هويّة مستقبلية مميزة.'
                          : '3D reflective LED taillight design shows high recognition identity and futuristic style.'}
                      </li>
                    </ul>
                    <div className="w-full overflow-hidden rounded-none border-none pt-2 flex justify-start">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/hero/maxsym-tl-07.jpg"
                        alt="3D reflective LED taillight design"
                        className="w-auto max-w-full max-h-[340px] md:max-h-[380px] block object-contain ml-0 mr-auto rtl:ml-auto rtl:mr-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = product.image;
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : product.slug === 'cruisym-300' || product.slug === 'cruisym-300i' ? (
                <div className="space-y-8 pt-4 max-w-[840px]">
                  {/* Row 1: Full LED Lighting */}
                  <div className="space-y-3">
                    <h4 className="text-[20px] md:text-[22px] font-bold text-[#333333] font-['Arial','Helvetica_Neue',Helvetica,sans-serif]">
                      {isAr ? 'إضاءة LED كاملة' : 'Full LED Lighting'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="w-full overflow-hidden bg-gray-50 border border-gray-100/80">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/assets/hero/headlight.png"
                          alt="Full LED Headlight"
                          className="w-full h-auto block object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/hero/led.jpg';
                          }}
                        />
                      </div>
                      <div className="w-full overflow-hidden bg-gray-50 border border-gray-100/80">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/assets/hero/taillight.png"
                          alt="Full LED Taillight"
                          className="w-full h-auto block object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/hero/3d.jpg';
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: LCD Instrument & Keyless */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                    <div className="space-y-3">
                      <strong className="text-[20px] md:text-[22px] font-bold text-[#333333] block font-['Arial','Helvetica_Neue',Helvetica,sans-serif]">
                        {isAr ? 'عداد LCD رقمي' : 'LCD Instrument'}
                      </strong>
                      <div className="w-full overflow-hidden bg-gray-50 border border-gray-100/80">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/assets/hero/meter.jpg"
                          alt="LCD Instrument"
                          className="w-full h-auto block object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/hero/inch.jpg';
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <strong className="text-[20px] md:text-[22px] font-bold text-[#333333] block font-['Arial','Helvetica_Neue',Helvetica,sans-serif]">
                        {isAr ? 'نظام تشغيل بدون مفتاح (Keyless)' : 'Keyless'}
                      </strong>
                      <div className="w-full overflow-hidden bg-gray-50 border border-gray-100/80">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/assets/hero/keyless2.0.jpg"
                          alt="Keyless"
                          className="w-full h-auto block object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/hero/led.jpg';
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Adjustable Windshield (5th Image) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                    <div className="space-y-3">
                      <strong className="text-[20px] md:text-[22px] font-bold text-[#333333] block font-['Arial','Helvetica_Neue',Helvetica,sans-serif]">
                        {isAr ? 'زجاج أمامي قابل للتعديل' : 'Adjustable Windshield'}
                      </strong>
                      <div className="w-full overflow-hidden bg-gray-50 border border-gray-100/80">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/assets/hero/windshiled.png"
                          alt="Adjustable Windshield"
                          className="w-full h-auto block object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/hero/3d.jpg';
                          }}
                        />
                      </div>
                    </div>
                    <div className="hidden md:block"></div>
                  </div>
                </div>
              ) : product.slug === 'nhx-200' || product.slug.includes('nhx') ? (
                <div className="space-y-10 pt-4 max-w-[840px] font-sans">
                  {/* Intro text */}
                  <p className="text-[14px] md:text-[15px] text-[#555555] leading-[1.75] mb-6 font-sans">
                    {isAr
                      ? 'تعتبر الدراجة النارية SYM NHX دراجة رياضية للشوارع تعكس المظهر الحضري الجريء مع ترقيات عملية تعزز تجربة الراكب. تمنحك وضعية القيادة المنحنية للأمام والتصميم الديناميكي الحاد شعوراً فورياً بالسرعة والانطلاق. تشمل التحسينات الرئيسية خزان وقود أكبر سعة 14 لتراً لمدى أطول، ومقعد مريح محسن للرحلات الطويلة، ومحرك تبريد مائي متطور لأداء أعلى، وشاشة LCD رقمية لتقرأ البيانات بوضوح تام.'
                      : 'The SYM NHX is a sport street bike that blends aggressive urban styling with functional upgrades to enhance the rider experience. Its forward-leaning riding posture and sharp, dynamic design convey speed and momentum. Key enhancements include a larger 14-litre fuel tank for extended range, improved seat cushioning for long-distance comfort, a newly developed liquid-cooled engine for better performance, and a LCD instrument panel for better visibility.'}
                  </p>

                  {/* Section 1: New design */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-6 bg-[#3B3856] inline-block transform -skew-x-12 rounded-xs"></span>
                      <h3 className="text-[20px] md:text-[22px] font-bold text-[#333333] tracking-tight">
                        {isAr ? 'تصميم جديد' : 'New design'}
                      </h3>
                    </div>
                    <p className="text-[14px] text-[#666666] leading-[1.75]">
                      {isAr
                        ? 'تم ضبط وضعية القيادة لمركز ثقل منخفض مع انحناءة للأمام. يتركز التصميم الكلي ويحدد خطوط الهيكل باتجاه الأمام، مما يعطي انطباعاً قوياً بالسرعة والانطلاق الفوري.'
                        : 'The riding posture is intentionally set with a lower center of gravity and a forward-leaning stance. The overall design deliberately concentrates and sharpens the styling lines toward the front, conveying a strong sense of forward momentum and speed.'}
                    </p>
                    {/* Side Profile Styling Lines Image */}
                    <div className="w-full max-w-[760px] overflow-hidden my-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/hero/side.png"
                        alt="SYM NHX New Design Styling Lines"
                        className="w-full h-auto block object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).src = product.image; }}
                      />
                    </div>
                  </div>

                  {/* Front Headlight & Position Lights Section */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-6 pt-2">
                    <div className="md:col-span-5 w-full overflow-hidden flex justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/hero/front-end.png"
                        alt="SYM NHX Front Face & Position Lights"
                        className="w-full max-w-[340px] h-auto block object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).src = product.image; }}
                      />
                    </div>
                    <div className="md:col-span-7 space-y-4 text-[14px] text-[#666666] leading-[1.75]">
                      <p>
                        {isAr
                          ? 'تؤكد المصابيح الإرشادية المزدوجة على شكل حرف L المظهر الهجومي المستعد للانطلاق. تتكامل خطوط الهيكل الأمامي مع خزان الوقود لخلق مظهر مدمج وأنيق.'
                          : 'The dual L-shaped position lights emphasize a forward-focused, sprint-ready impression. The styling lines of the front end and fuel tank are integrated to create a compact and clean overall appearance.'}
                      </p>
                      <p>
                        {isAr
                          ? 'ومن خلال إخفاء عدسة الإضاءة الإسقاطية (Projector)، تكتسب الواجهة الأمامية طابعاً غامضاً وقوياً.'
                          : 'By concealing the projector headlamp, the front face is given a mysterious and aggressive character.'}
                      </p>
                    </div>
                  </div>

                  {/* Section 2: Power upgrade */}
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-6 bg-[#3B3856] inline-block transform -skew-x-12 rounded-xs"></span>
                      <h3 className="text-[20px] md:text-[22px] font-bold text-[#333333] tracking-tight">
                        {isAr ? 'ترقية القوة والأداء' : 'Power upgrade'}
                      </h3>
                    </div>
                    <p className="text-[14px] text-[#666666] leading-[1.75]">
                      {isAr
                        ? 'تتميز NHX بمحرك متطور 4 صمامات وتبريد مائي. ترتفع القوة القصوى إلى 10.5 كيلوواط، بينما يرتفع عزم الدوران إلى 11 نيوتن متر. يطور هذا التحديث كفاءة التبريد ويمنح زيادة ملحوظة في الأداء.'
                        : 'The NHX features a newly developed 4-valve, liquid-cooled powertrain. Maximum horsepower increases to 10.5 kW, while torque rises to 11 Nm. This upgrade improves cooling efficiency and delivers a significant boost in performance.'}
                    </p>
                    {/* Power Upgrade Comparison Graph Image */}
                    <div className="w-full max-w-[760px] overflow-hidden my-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/hero/power_upgrade_chart.png"
                        alt="SYM NHX Power Upgrade Comparison Chart"
                        className="w-full h-auto block object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).src = product.image; }}
                      />
                    </div>
                  </div>

                  {/* Section 3: Exceptional handling */}
                  <div className="space-y-6 pt-4">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-6 bg-[#3B3856] inline-block transform -skew-x-12 rounded-xs"></span>
                      <h3 className="text-[20px] md:text-[22px] font-bold text-[#333333] tracking-tight">
                        {isAr ? 'تحكم واستجابة استثنائية' : 'Exceptional handling'}
                      </h3>
                    </div>

                    {/* Subsection: Perimeter frame */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-7 space-y-3">
                        <h4 className="text-[16px] md:text-[18px] font-bold text-[#333333]">
                          {isAr ? 'هيكل أنبوبي صلب (Perimeter frame)' : 'Perimeter frame'}
                        </h4>
                        <p className="text-[14px] text-[#666666] leading-[1.75]">
                          {isAr
                            ? 'تتميز سلسلة SYMNH بهيكل أنبوبي صلب (Perimeter frame) خفيف الوزن عالي المتانة يعزز القوة ودقة التوجيه مع المظهر الميكانيكي الأنيق. يستفيد الراكب من التحكم السريع والرشيق في المدينة والأداء المستقر على السرعات المتوسطة والعالية.'
                            : 'The SYMNH series features a lightweight, high-rigidity perimeter frame that enhances strength, handling precision, and mechanical aesthetics. Riders benefit from quick, agile control in the city and stable performance at mid- to high-speed riding.'}
                        </p>
                        <p className="text-[14px] text-[#666666] leading-[1.75]">
                          {isAr
                            ? 'كما يزيد مقص المقص الخلفي على شكل A والمثبت بقوة بالشاسيه من الصلابة الكلية وثبات الجزء الخلفي لقيادة أكثر ثقة ومتعة.'
                            : 'The A-type rear swing arm, firmly mounted to the chassis, further boosts overall rigidity and rear-end stability for a more confident and enjoyable ride.'}
                        </p>
                      </div>
                      <div className="md:col-span-5 w-full overflow-hidden flex justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/assets/hero/NH_frame.png"
                          alt="SYM NHX Perimeter Frame & A-type Swing Arm"
                          className="w-full max-w-[360px] h-auto block object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).src = product.image; }}
                        />
                      </div>
                    </div>

                    {/* Subsection: 50/50 Weight distribution */}
                    <div className="space-y-2 pt-2">
                      <h4 className="text-[16px] md:text-[18px] font-bold text-[#333333]">
                        {isAr ? 'توزيع وزن متعادل 50/50' : '50/50 Weight distribution'}
                      </h4>
                      <p className="text-[14px] text-[#666666] leading-[1.75]">
                        {isAr
                          ? 'مع توزيع الوزن المتوازن بنسبة 50/50، تضمن SYMNH X توجيهاً رزيناً ورشيقاً واستجابة فورية لأوامر القيادة.'
                          : 'With 50/50 weight distribution, SYMNH X is steering in more agile and quick-responsive performance.'}
                      </p>
                    </div>

                    {/* Subsection: Transmission upgrade */}
                    <div className="space-y-2 pt-2">
                      <h4 className="text-[16px] md:text-[18px] font-bold text-[#333333]">
                        {isAr ? 'ترقية ناقل الحركة 6 سرعات' : 'Transmission upgrade'}
                      </h4>
                      <p className="text-[14px] text-[#666666] leading-[1.75]">
                        {isAr
                          ? 'تم تطوير ناقل الحركة من 5 سرعات إلى 6 سرعات لزيادة التحمل والمتانة. مع السرعة الإضافية، أصبحت نسب التروس أقرب إلى بعضها مقارنة بالطراز السابق، مما يعزز تجربة القيادة والمتعة الكلية.'
                          : 'The transmission was upgraded from 5 gears to 6, making it more durable. With the additional gear, the gear ratios are also closer together compared to the base model, enhancing the riding experience and overall enjoyment.'}
                      </p>
                    </div>

                    {/* Subsection: Centered-suspension */}
                    <div className="space-y-2 pt-2">
                      <h4 className="text-[16px] md:text-[18px] font-bold text-[#333333]">
                        {isAr ? 'مساعد خلفي مركزي (Centered-suspension)' : 'Centered-suspension'}
                      </h4>
                      <p className="text-[14px] text-[#666666] leading-[1.75]">
                        {isAr
                          ? 'يأتي المساعد الخلفي مركزي التثبيت لتوفير أعلى مستويات الثبات والتوازن أثناء القيادة.'
                          : 'Rear suspension is a center-mounted to provide the most stable ride.'}
                      </p>
                    </div>

                    {/* Bottom Wallpaper Photo matching Screenshot 5 */}
                    <div className="w-full max-w-[760px] overflow-hidden my-6 rounded-lg shadow-sm border border-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/hero/圖片RR.png"
                        alt="SYM NHX 200 Bike Background Photo"
                        className="w-full h-auto block object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/assets/banners/nhx-200-custom-bg.png'; }}
                      />
                    </div>

                    {/* Section 4: Practicality matching new screenshot */}
                    <div className="space-y-6 pt-6">
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-6 bg-[#3B3856] inline-block transform -skew-x-12 rounded-xs"></span>
                        <h3 className="text-[20px] md:text-[22px] font-bold text-[#333333] tracking-tight">
                          {isAr ? 'العملانية والراحة' : 'Practicality'}
                        </h3>
                      </div>

                      {/* Subsection 1: Upgraded seat comfort */}
                      <div className="space-y-2">
                        <h4 className="text-[16px] md:text-[18px] font-bold text-[#333333]">
                          {isAr ? 'تحسين راحة المقعد' : 'Upgraded seat comfort'}
                        </h4>
                        <p className="text-[14px] text-[#666666] leading-[1.75]">
                          {isAr
                            ? 'يتميز المقعد الآن ببطانة محسنة وإسفنج أكثر كُثافة، مما يوفر راحة فائقة أثناء الرحلات الطويلة لتجربة قيادة أكثر متعة.'
                            : 'The seat now features enhanced cushion with thicker foam, delivering superior comfort during extended rides for a more pleasant riding experience.'}
                        </p>
                      </div>

                      {/* Subsection 2: 14L fuel tank */}
                      <div className="space-y-2 pt-2">
                        <h4 className="text-[16px] md:text-[18px] font-bold text-[#333333]">
                          {isAr ? 'خزان وقود سعة 14 لتر' : '14L fuel tank'}
                        </h4>
                        <p className="text-[14px] text-[#666666] leading-[1.75]">
                          {isAr
                            ? 'مزودة بخزان وقود كبير سعة 14 لتراً، صُممت الدراجة النارية لقطع مسافات طويلة بوقود وفير وتوقفات أقل للتزود بالوقود.'
                            : 'Equipped with a large 14-litre fuel tank, the motorcycle is built for greater endurance, allowing for longer rides with fewer fuel stops.'}
                        </p>
                      </div>

                      {/* Subsection 3: QC3.0 & Type-C */}
                      <div className="space-y-2 pt-2">
                        <h4 className="text-[16px] md:text-[18px] font-bold text-[#333333]">
                          {isAr ? 'شاحن سريع QC3.0 و Type-C' : 'QC3.0 & Type-C'}
                        </h4>
                        <p className="text-[14px] text-[#666666] leading-[1.75]">
                          {isAr
                            ? 'مزودة بمنفذ شحن سريع QC 3.0 و USB Type-C لتوفير شحن سريع وفعال للهواتف الذكية والأجهزة الإلكترونية أثناء القيادة.'
                            : 'Equipped with QC 3.0 and USB Type-C fast charging, it provides efficient, high-speed power for smartphones, and other electronics while riding.'}
                        </p>
                      </div>

                      {/* Practicality Seat Image */}
                      <div className="w-full max-w-[760px] overflow-hidden my-6 rounded-lg shadow-sm border border-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/assets/hero/seat.png"
                          alt="SYM NHX Upgraded Seat Comfort & Practicality"
                          className="w-full h-auto block object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/assets/hero/SEAT.jpg'; }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : product.slug === 'xwolf-300' || product.slug.includes('xwolf') ? (
                <div className="space-y-10 pt-4 max-w-[840px] font-sans">
                  {/* Section 1: New design matching Screenshot 1 */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-6 bg-[#3B3856] inline-block transform -skew-x-12 rounded-xs"></span>
                      <h3 className="text-[20px] md:text-[22px] font-bold text-[#333333] tracking-tight">
                        {isAr ? 'تصميم جديد مستوحى من الرالي' : 'New design'}
                      </h3>
                    </div>
                    <p className="text-[14px] text-[#666666] leading-[1.75]">
                      {isAr
                        ? 'تتميز SYMNH R بتصميم واجهة Mecha هجومي يعزز من طابعها العصري وفائق التكنولوجيا. يعكس مظهرها الخارجي المستوحى من دراجات الرالي شخصية جريئة وقوية بوضعية قيادة مرتفعة وقائمة. لا يعزز هذا التصميم الشكل الجمالي الصلب لدراجات المغامرة فحسب، بل يدعم وضعية القيادة المثالية لرؤية أوضح وتحكم أفضل على مختلف التضاريس.'
                        : 'The SYMNH R features an aggressive, Mecha-style front design that enhances its high-tech appeal and distinctive presence. Its rally-inspired exterior styling reflects a bold and youthful personality, characterized by an upright and elevated stance. This design not only reinforces the rugged aesthetics of an off-road rally bike but also supports the ideal riding posture—upright and tall—for improved visibility and better control across varying terrain.'}
                    </p>

                    {/* Dual Images matching Screenshot 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-6">
                      <div className="md:col-span-6 w-full overflow-hidden flex justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/assets/hero/1-1.png"
                          alt="SYMNH R Side View Airflow Lines"
                          className="w-full max-w-[380px] h-auto block object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/assets/hero/side.png'; }}
                        />
                      </div>
                      <div className="md:col-span-6 w-full overflow-hidden flex justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/assets/hero/2-1.png"
                          alt="SYMNH R Front Mecha Design"
                          className="w-full max-w-[340px] h-auto block object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/assets/hero/front-end.png'; }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Compact sport windscreen & Solid rugged exterior matching Screenshot 2 */}
                  <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                      <h4 className="text-[16px] md:text-[18px] font-bold text-[#333333]">
                        {isAr ? 'زجاج رياضي مدمج لحماية الرياح' : 'Compact sport windscreen'}
                      </h4>
                      <p className="text-[14px] text-[#666666] leading-[1.75]">
                        {isAr
                          ? 'تم تزويد الدراجة بزجاج أمامي مظلل لتعزيز الأناقة والراحة، مما يمنح NHR مظهراً أكثر هجومية مع توفير حماية إضافية لقيادة ممتعة.'
                          : 'A smoked windscreen is fitted to enhance both style and comfort, giving the NHR a more aggressive look while providing added protection for a more enjoyable ride.'}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <h4 className="text-[16px] md:text-[18px] font-bold text-[#333333]">
                        {isAr ? 'تصميم خارجي صلب ومقاوم للصدمات' : 'Solid & rugged exterior design'}
                      </h4>
                      <p className="text-[14px] text-[#666666] leading-[1.75]">
                        {isAr
                          ? 'يعطي اعتماد الأغطية الجانبية المربعة ونقاط التثبيت الظاهرة انطباعاً متيناً وقوياً يعبر عن القدرة على تحمل الطرق القاسية.'
                          : 'The adoption of a block-shaped side cover and the exposed fastening points creating a solid and rugged impression.'}
                      </p>
                    </div>

                    {/* Windscreen & Cockpit Photo matching Screenshot 2 */}
                    <div className="w-full max-w-[760px] overflow-hidden my-4 rounded-lg shadow-sm border border-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/hero/windscreen.png"
                        alt="SYMNH R Compact Sport Windscreen & Handguards"
                        className="w-full h-auto block object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/assets/hero/windshiled.png'; }}
                      />
                    </div>
                  </div>

                  {/* Section 3: Perimeter frame matching Screenshot 3 */}
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-6 bg-[#3B3856] inline-block transform -skew-x-12 rounded-xs"></span>
                      <h3 className="text-[20px] md:text-[22px] font-bold text-[#333333] tracking-tight">
                        {isAr ? 'هيكل أنبوبي صلب (Perimeter frame)' : 'Perimeter frame'}
                      </h3>
                    </div>
                    <p className="text-[14px] text-[#666666] leading-[1.75]">
                      {isAr
                        ? 'تتميز سلسلة SYMNH بهيكل أنبوبي صلب (Perimeter frame) خفيف الوزن عالي المتانة يعزز القوة ودقة التوجيه مع المظهر الميكانيكي الأنيق. يستفيد الراكب من التحكم السريع والرشيق في المدينة والأداء المستقر على السرعات المتوسطة والعالية. كما يزيد مقص المقص الخلفي على شكل A والمثبت بقوة بالشاسيه من الصلابة الكلية وثبات الجزء الخلفي لقيادة أكثر ثقة ومتعة.'
                        : 'The SYMNH series features a lightweight, high-rigidity perimeter frame that enhances strength, handling precision, and mechanical aesthetics. Riders benefit from quick, agile control in the city and stable performance at mid- to high-speed riding. The A-type rear swing arm, firmly mounted to the chassis, further boosts overall rigidity and rear-end stability for a more confident and enjoyable ride.'}
                    </p>
                    {/* Frame 3D CAD Image matching Screenshot 3 */}
                    <div className="w-full max-w-[760px] overflow-hidden my-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/hero/NH_frame.png"
                        alt="SYMNH High Rigidity Perimeter Frame"
                        className="w-full h-auto block object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).src = product.image; }}
                      />
                    </div>
                  </div>

                  {/* Section 4: Transmission, Centered-suspension, Skid plate & Seat matching Screenshot 4 */}
                  <div className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-7 space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-[16px] md:text-[18px] font-bold text-[#333333]">
                            {isAr ? 'ترقية ناقل الحركة 6 سرعات' : 'Transmission upgrade'}
                          </h4>
                          <p className="text-[14px] text-[#666666] leading-[1.75]">
                            {isAr
                              ? 'تم تطوير ناقل الحركة من 5 سرعات إلى 6 سرعات لزيادة التحمل والمتانة. مع السرعة الإضافية، أصبحت نسب التروس أقرب إلى بعضها مقارنة بالطراز السابق، مما يعزز تجربة القيادة والمتعة الكلية.'
                              : 'The transmission was upgraded from five gears to six, making it more durable. With the additional gear, the gear ratios are also closer together compared to the base model, enhancing the riding experience and overall enjoyment.'}
                          </p>
                        </div>

                        <div className="space-y-2 pt-2">
                          <h4 className="text-[16px] md:text-[18px] font-bold text-[#333333]">
                            {isAr ? 'مساعد خلفي مركزي (Centered-suspension)' : 'Centered-suspension'}
                          </h4>
                          <p className="text-[14px] text-[#666666] leading-[1.75]">
                            {isAr
                              ? 'يأتي المساعد الخلفي مركزي التثبيت لتوفير أعلى مستويات الثبات والتوازن أثناء القيادة.'
                              : 'Rear suspension is a center-mounted to provide the most stable ride.'}
                          </p>
                        </div>
                      </div>

                      <div className="md:col-span-5 w-full overflow-hidden flex justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/assets/hero/L90_engine.png"
                          alt="SYMNH R 300 Engine & Transmission"
                          className="w-full max-w-[360px] h-auto block object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/assets/hero/22.png'; }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <h4 className="text-[16px] md:text-[18px] font-bold text-[#333333]">
                        {isAr ? 'صفيحة حماية المحرك وحاميات اليدين' : 'Skid plate & handguards'}
                      </h4>
                      <p className="text-[14px] text-[#666666] leading-[1.75]">
                        {isAr
                          ? 'تأتي NHR قياسياً مع صفيحة حماية المحرك وحاميات اليدين المصممة للرحلات القاسية. تتميز الصفيحة المعدنية بمتانة عالية ومظهر أنيق وتحمي الجزء السفلي بفعالية من صدمات الحجارة.'
                          : 'The NHR comes standard with a skid plate and handguards, both designed for challenging rides. The metal skid plate is highly durable, boasts a refined appearance, and effectively protects the underside, particularly by preventing damage from stone impact.'}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <h4 className="text-[16px] md:text-[18px] font-bold text-[#333333]">
                        {isAr ? 'تحسين راحة المقعد' : 'Enhanced seat comfort'}
                      </h4>
                      <p className="text-[14px] text-[#666666] leading-[1.75]">
                        {isAr
                          ? 'تم تطوير المقعد ببطانة رغوية أكثر كُثافة لتوفير راحة فائقة أثناء الرحلات الطويلة لتجربة قيادة أكثر متعة.'
                          : 'The seat was upgraded with a thicker foam cushion, providing superior comfort during long rides for a more pleasant riding experience.'}
                      </p>
                    </div>
                  </div>

                  {/* Section 5: Front Travel Suspension & Wire-spoke wheels matching Screenshot 5 */}
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <h4 className="text-[16px] md:text-[18px] font-bold text-[#333333]">
                        {isAr ? 'تعليق أمامي شوط 140 مم وعجلات سلكية صلبة' : 'Front 140 mm travel suspension & Durable Wire-spoke wheels'}
                      </h4>
                      <p className="text-[14px] text-[#666666] leading-[1.75]">
                        {isAr
                          ? 'تأتي NHR قياسياً مع صفيحة حماية وحاميات اليدين ونظام تعليق أمامي طويل الشوط (140 مم) وعجلات سلكية متينة مخصصة للطرق الوعرة، مما يحمي المحرك ويضمن خلوصاً أرضياً ممتازاً.'
                          : 'NHR comes standard with a skid plate and handguards, both designed for challenging rides. The metal skid plate is highly durable, boasts a refined appearance, and effectively protects the underside, particularly by preventing damage from stone impact.'}
                      </p>
                    </div>

                    {/* Full Bike Side Profile Image matching Screenshot 5 */}
                    <div className="w-full max-w-[760px] overflow-hidden my-6">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/hero/KV.png"
                        alt="SYMNH R XWolf 300 / NHR Full Side Profile"
                        className="w-full h-auto block object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/assets/banners/xwolf-300-custom-bg.png'; }}
                      />
                    </div>

                    {/* Additional Features: Full LED, New LCD, Expended fuel capacity, USB Type-A & Type-C */}
                    <div className="space-y-6 pt-6">
                      <div className="space-y-1.5">
                        <h4 className="text-[20px] md:text-[22px] font-bold text-[#444444] font-['Arial','Helvetica_Neue',Helvetica,sans-serif] tracking-tight">
                          {isAr ? 'منظومة إضاءة LED بالكامل' : 'Full LED lighting'}
                        </h4>
                        <p className="text-[14px] md:text-[15px] text-[#555555] leading-[1.65]">
                          {isAr
                            ? 'تضمن المصابيح الأمامية والخلفية وإشارات الانعطاف والمصابيح الإرشادية الـ LED رؤية فائقة وواضحة ليلاً ونهاراً، مما يرفع من مستوى أمان القيادة بشكل كبير.'
                            : 'LED headlights/ taillights/ turn signals and position lights are easier to be seen both during the day and at night, greatly enhancing riding safety.'}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-3">
                        <h4 className="text-[20px] md:text-[22px] font-bold text-[#444444] font-['Arial','Helvetica_Neue',Helvetica,sans-serif] tracking-tight">
                          {isAr ? 'شاشة عدادات LCD جديدة' : 'New LCD display'}
                        </h4>
                        <p className="text-[14px] md:text-[15px] text-[#555555] leading-[1.65]">
                          {isAr
                            ? 'تم تزويد الدراجة بشاشة LCD رقمية جديدة لتعزيز وضوح القراءة، مما يمنح الراكب معلومات دقيقة وواضحة بنظرة واحدة أثناء القيادة.'
                            : 'A LCD display has been introduced to greatly enhance readability, providing the rider with clearer and more visible information at a glance.'}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-3">
                        <h4 className="text-[20px] md:text-[22px] font-bold text-[#444444] font-['Arial','Helvetica_Neue',Helvetica,sans-serif] tracking-tight">
                          {isAr ? 'سعة وقود موسعة 14 لتر' : 'Expended fuel capacity'}
                        </h4>
                        <p className="text-[14px] md:text-[15px] text-[#555555] leading-[1.65]">
                          {isAr
                            ? 'مع خزان وقود وفير سعة 14 لتراً، صُممت هذه الدراجة النارية لقطع مسافات طويلة بوقود كافٍ وتوقفات أقل للتزود بالوقود.'
                            : 'With a generous 14-litre fuel tank, this motorcycle is built for endurance, allowing riders to travel longer distances with fewer fuel stops.'}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-3">
                        <h4 className="text-[20px] md:text-[22px] font-bold text-[#444444] font-['Arial','Helvetica_Neue',Helvetica,sans-serif] tracking-tight">
                          {isAr ? 'منافذ شحن USB Type-A & Type-C' : 'USB Type-A & Type-C'}
                        </h4>
                        <p className="text-[14px] md:text-[15px] text-[#555555] leading-[1.65]">
                          {isAr
                            ? 'مزودة بمنافذ شحن سريع QC 3.0 و USB Type-C لتوفير طاقة عالية السرعة وفعالة للهواتف الذكية والأجهزة الإلكترونية أثناء القيادة.'
                            : 'Equipped with QC 3.0 and USB Type-C fast charging, it provides efficient, high-speed power for smartphones, and other electronics while riding.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (product.slug === 'symphony-sr-150' || product.slug === 'symphony-sr-125') ? (
                <div className="space-y-10 pt-4 max-w-[840px] font-sans">
                  <h4 className="text-[20px] md:text-[22px] font-bold text-[#333333] tracking-tight">
                    {isAr ? 'ترقية رئيسية' : 'Major upgrade'}
                  </h4>

                  {/* Sporty Design */}
                  <div className="space-y-3">
                    <h4 className="text-[18px] md:text-[20px] font-bold text-[#555555] tracking-tight">
                      {isAr ? 'تصميم رياضي' : 'Sporty Design'}
                    </h4>
                    <p className="text-[14px] text-[#666666] leading-[1.75]">
                      {isAr
                        ? 'الواجهة الأمامية الرياضية: مقارنة بالموديل السابق، اعتمد التصميم الأمامي لـ SYMPHONY SR الجديدة طابعاً أكثر جرأة وحدة بخطوط أكثر بساطة ورياضية.'
                        : 'Sport front profile: Compared to the previous model, the front-end design of the new SYMPHONY SR adopts a more aggressive and sharper style, featuring simpler and more athletic lines.'}
                    </p>
                    <p className="text-[14px] text-[#666666] leading-[1.75]">
                      {isAr
                        ? 'بصمة العائلة الموروثة: تمتد خطوط جانب المصباح الأمامي البارزة من جانبيه، بينما تعكس الملامح الجانبية الدرامية إحساساً أكبر بالحداثة.'
                        : 'Inherited family DNA: prominent lines extend from both sides of the headlight, while the dramatic side profile and features exhibit a heightened sense of modernity.'}
                    </p>
                  </div>

                  {/* LED Lighting — headlight + taillight side by side */}
                  <div className="space-y-3">
                    <h4 className="text-[18px] md:text-[20px] font-bold text-[#555555] tracking-tight">
                      {isAr ? 'إضاءة LED كاملة' : 'LED Lighting'}
                    </h4>
                    <p className="text-[14px] text-[#666666] leading-[1.75]">
                      {isAr
                        ? 'تمت ترقية المصباح الأمامي والإضاءة الموضعية والمصباح الخلفي جميعها إلى LED، مما يعزز الأمان أثناء القيادة الليلية ويمنح السكوتر مظهراً عصرياً وتقنياً متطوراً.'
                        : 'The headlight, position light, and taillight are all upgraded to LED, enhancing nighttime safety while giving the scooter a modern, high-tech look.'}
                    </p>
                    <div className="relative h-[260px] sm:h-[340px] md:h-[400px] mt-2">
                      {/* Headlight — back layer, upper-left */}
                      <div className="absolute left-0 top-0 w-[62%] sm:w-[58%] h-[70%] rounded-2xl bg-gray-100 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/assets/products/features/symphony-sr-150/headlight.jpg"
                          alt="Symphony SR LED Headlight"
                          className="w-full h-full object-cover block"
                          style={{
                            maskImage: 'linear-gradient(to bottom, black 60%, transparent 96%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 96%)',
                          }}
                          onError={(e) => { (e.target as HTMLImageElement).src = product.image; }}
                        />
                      </div>
                      {/* Taillight — front layer, lower-right, overlapping */}
                      <div className="absolute right-0 top-[32%] sm:top-[28%] w-[52%] sm:w-[46%] h-[68%] rounded-2xl bg-gray-100 overflow-hidden shadow-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/assets/products/features/symphony-sr-150/taillight.jpg"
                          alt="Symphony SR LED Taillight"
                          className="w-full h-full object-cover block"
                          style={{
                            maskImage: 'linear-gradient(to bottom, black 60%, transparent 96%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 96%)',
                          }}
                          onError={(e) => { (e.target as HTMLImageElement).src = product.image; }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* New LCD Instrument */}
                  <div className="space-y-3">
                    <h4 className="text-[18px] md:text-[20px] font-bold text-[#555555] tracking-tight">
                      {isAr ? 'عداد LCD جديد' : 'New LCD Instrument'}
                    </h4>
                    <p className="text-[14px] text-[#666666] leading-[1.75]">
                      {isAr
                        ? 'تعزز لوحة العدادات المطورة من وضوح القراءة وتجربة المستخدم، مع تناسق كامل مع المظهر العصري والديناميكي لـ SYMPHONY SR.'
                        : 'The upgraded instrument cluster enhances readability and user experience, while seamlessly matching the modern and dynamic look of SYMPHONY SR.'}
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/assets/products/features/symphony-sr-150/instrument.jpg"
                      alt="Symphony SR New LCD Instrument"
                      className="w-full max-w-[500px] h-auto object-cover block"
                      onError={(e) => { (e.target as HTMLImageElement).src = product.image; }}
                    />
                  </div>

                  {/* Other Features */}
                  <div className="space-y-3">
                    <h4 className="text-[18px] md:text-[20px] font-bold text-[#555555] tracking-tight">
                      {isAr ? 'ميزات أخرى' : 'Other features'}
                    </h4>
                    <ul className="list-disc pl-5 rtl:pr-5 rtl:pl-0 space-y-1 text-[14px] text-[#666666] leading-[1.75]">
                      <li>{isAr ? 'عجلات 16 بوصة' : "16\" wheels"}</li>
                      <li>{isAr ? 'نظام ABS/CBS' : 'ABS/CBS'}</li>
                      <li>{isAr ? 'فرامل قرصية أمامية وخلفية' : 'Front & rear disk brakes'}</li>
                      <li>{isAr ? 'شحن سريع' : 'Quick charge'}</li>
                      <li>{isAr ? 'مساعدين خلفيين مزدوجين' : 'Dual shock absorber'}</li>
                    </ul>
                  </div>

                  {/* Closing gallery strip */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { src: '/assets/products/features/symphony-sr-150/headlight.jpg', alt: 'Symphony SR Headlight' },
                      { src: '/assets/products/features/symphony-sr-150/taillight.jpg', alt: 'Symphony SR Taillight' },
                      { src: '/assets/products/features/symphony-sr-150/instrument.jpg', alt: 'Symphony SR Instrument' },
                    ].map((item, idx) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={idx}
                        src={item.src}
                        alt={item.alt}
                        className="w-full h-[100px] sm:h-[150px] object-cover block"
                        onError={(e) => { (e.target as HTMLImageElement).src = product.image; }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-12 pt-4">
                  {featuresData.list.map((feat: FeatureItem, fIdx: number) => (
                    <div key={fIdx} className="space-y-3">
                      <h4 className="text-base md:text-lg font-bold text-gray-900">
                        {feat.title}
                      </h4>
                      {feat.description && (
                        <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                          {feat.description}
                        </p>
                      )}
                      <div className={`w-full overflow-hidden rounded-xl mt-2 shadow-sm border border-gray-100 ${feat.isWide ? 'max-w-[960px] ml-0 mr-auto rtl:ml-auto rtl:mr-0 bg-black/5' : 'h-[240px] sm:h-[320px] md:h-[380px]'}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={feat.image}
                          alt={feat.title}
                          className={feat.isWide ? 'w-full h-auto block object-contain' : 'w-full h-full object-cover object-center'}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = product.image;
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* 4. View 360° Interactive Preview Section matching Official SYM Site */}
            <div id="view360" className="space-y-8 scroll-mt-28 pt-8">
              <div className={`flex items-center gap-3 ${dir === 'rtl' ? 'border-r-4 border-l-0 pr-4 pl-0' : 'border-l-4 border-[#E60012] pl-4'} border-[#E60012] py-1`}>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {isAr ? 'عرض 360 درجة' : 'View 360°'}
                </h2>
              </div>

              {/* 360° Stage with VIEW 360° Watermark & Red 360 Badge */}
              <div className="relative w-full bg-transparent overflow-hidden py-8 px-0 select-none border-none">

                {/* Large Background Watermark Text "VIEW 360°" matching official SYM site */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                  <span className="text-[80px] sm:text-[130px] md:text-[180px] font-black text-gray-200/90 tracking-widest italic select-none uppercase whitespace-nowrap">
                    VIEW 360°
                  </span>
                </div>

                {/* Interactive 360 Scooter Stage */}
                <View360Rotator
                  productName={product.name}
                  defaultImage={selectedImage}
                  productSlug={product.slug}
                  galleryImages={galleryImages}
                  images360={product.images360}
                />

              </div>
            </div>

            {/* 5. TVCF Video Showcase Section */}
            {hasTvcf && (
              <div id="tvcf" className="space-y-8 scroll-mt-28 pt-8">
                <div className={`flex items-center gap-3 ${dir === 'rtl' ? 'border-r-4 border-l-0 pr-4 pl-0' : 'border-l-4 border-[#E60012] pl-4'} border-[#E60012] py-1`}>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                    {t('detail.tvcf', 'TVCF')}
                  </h2>
                </div>

                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl group border border-gray-200">
                  {isPlayingTvcf ? (
                    <iframe
                      className="w-full h-full embed-responsive-item"
                      src={`https://www.youtube.com/embed/${product.slug === 'husky-adv' ? 'ospSjdM73I8' :
                        product.slug === 'adx-300' ? 'd29PeLzTsBQ' :
                        product.slug.includes('st') ? 'rdS-cndBpDI' :
                          product.slug === 'cruisym-400i' || product.slug === 'cruisym-300' || product.slug === 'cruisym-300i' ? 'kRJaVSUrHfI' :
                            product.slug === 'maxsym-tl-508' ? 'LbY1QmWQ9D0' :
                              product.slug === 'fiddle-4-150' ? 'MTVl_seaBB4' :
                                'ifuEDAyfbLE'
                        }?rel=0&autoplay=1`}
                      title={`${product.name} Official Commercial`}
                      referrerPolicy="strict-origin-when-cross-origin"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      {/* Cover Poster Image matching the specific scooter's official video */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://img.youtube.com/vi/${product.slug === 'husky-adv' ? 'ospSjdM73I8' :
                          product.slug === 'adx-300' ? 'd29PeLzTsBQ' :
                          product.slug.includes('st') ? 'rdS-cndBpDI' :
                            product.slug === 'cruisym-400i' || product.slug === 'cruisym-300' || product.slug === 'cruisym-300i' ? 'kRJaVSUrHfI' :
                              product.slug === 'maxsym-tl-508' ? 'LbY1QmWQ9D0' :
                                product.slug === 'fiddle-4-150' ? 'MTVl_seaBB4' :
                                  'ifuEDAyfbLE'
                          }/maxresdefault.jpg`}
                        alt={`${product.name} Commercial`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `/assets/banners/tvcf-cover.jpg`;
                        }}
                      />

                      {/* Top-Left Header Overlay */}
                      <div className={`absolute top-4 ${dir === 'rtl' ? 'right-4' : 'left-4'} z-20 flex items-center gap-3 drop-shadow-lg`}>
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md border border-gray-100">
                          <span className="text-[11px] font-black text-[#E60012] tracking-tighter italic">SYM</span>
                        </div>
                        <div className="flex flex-col text-start">
                          <span className="text-white font-extrabold text-sm sm:text-base tracking-wide drop-shadow-md">
                            SYM {product.name}
                          </span>
                          <span className="text-gray-200 text-xs font-semibold tracking-wider drop-shadow-sm uppercase">
                            SYM EGYPT
                          </span>
                        </div>
                      </div>

                      {/* Red Center YouTube Play Button */}
                      <button
                        type="button"
                        onClick={() => setIsPlayingTvcf(true)}
                        className="absolute inset-0 m-auto w-16 h-11 sm:w-20 sm:h-14 rounded-2xl bg-[#FF0000] hover:bg-[#E60012] hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center shadow-2xl z-20 cursor-pointer group/btn"
                        title="Play Commercial Video"
                      >
                        <svg className="w-7 h-7 fill-white translate-x-0.5" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>

                      {/* Bottom Overlay Bar */}
                      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-2 pointer-events-auto">
                          <button
                            type="button"
                            onClick={() => {
                              if (navigator.share) {
                                navigator.share({ title: product.name, url: window.location.href });
                              }
                            }}
                            className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-md cursor-pointer"
                            title="Share"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsPlayingTvcf(true)}
                          className="pointer-events-auto flex items-center gap-1.5 bg-black/70 hover:bg-black/90 text-white text-xs font-bold px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/10 transition-all shadow-md cursor-pointer"
                        >
                          <span>{isAr ? 'شاهد على' : 'Watch on'}</span>
                          <span className="font-extrabold tracking-tight text-white flex items-center gap-0.5">
                            <svg className="w-4 h-3 fill-red-600" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                            YouTube
                          </span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 5. Official Specification Section dynamically adapted for each model */}
            <div id="specification" className="space-y-0 scroll-mt-28 pt-8">
              <div className={`flex items-center gap-3 ${dir === 'rtl' ? 'border-r-4 border-l-0 pr-4 pl-0' : 'border-l-4 border-[#E60012] pl-4'} border-[#E60012] py-1 mb-6`}>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {isAr ? 'المواصفات الفنية' : 'Specification'}
                </h2>
              </div>

              {/* ── Dimensions ── */}
              <div className="border-t border-gray-200">
                <div className="grid grid-cols-1 lg:grid-cols-12 py-8">
                  <div className="lg:col-span-4 mb-4 lg:mb-0 text-start">
                    <h3 className="text-2xl sm:text-3xl font-bold italic text-gray-400 font-serif tracking-tight">
                      {isAr ? 'الأبعاد والأوزان' : 'Dimensions'}
                    </h3>
                  </div>
                  <div className="lg:col-span-8">
                    {specs.dimensions && <SpecRow label={isAr ? 'الطول × العرض × الارتفاع (مم)' : 'Length x Width x Height (mm)'} value={specs.dimensions} />}
                    {specs.wheelBase && <SpecRow label={isAr ? 'قاعدة العجلات (مم)' : 'Wheel Base (mm)'} value={specs.wheelBase} />}
                    {specs.weight && <SpecRow label={isAr ? 'الوزن الصافي (كجم)' : 'Curb Weight'} value={specs.weight} />}
                    {specs.frontSuspension && <SpecRow label={isAr ? 'المساعدين الأمامية' : 'Front Suspension'} value={specs.frontSuspension} />}
                    {specs.rearSuspension && <SpecRow label={isAr ? 'المساعدين الخلفية' : 'Rear Suspension'} value={specs.rearSuspension} />}
                    {specs.rimMaterial && <SpecRow label={isAr ? 'مادة الجنوط' : 'Front/Rear Rim Material'} value={specs.rimMaterial} />}
                    {specs.frontTire && <SpecRow label={isAr ? 'مقاس الإطار الأمامي' : 'Front Tire Dimensions'} value={specs.frontTire} />}
                    {specs.rearTire && <SpecRow label={isAr ? 'مقاس الإطار الخلفي' : 'Rear Tire Dimensions'} value={specs.rearTire} />}
                    {specs.tirePressure && <SpecRow label={isAr ? 'ضغط الإطارات' : 'Tire Pressure'} value={specs.tirePressure} />}
                    {(specs.frontBrakes || (specs.brakes && !specs.rearBrakes)) && <SpecRow label={isAr ? 'فرامل أمامي' : 'Front Brakes Type/Diameter'} value={specs.frontBrakes || specs.brakes || ''} />}
                    {specs.rearBrakes && <SpecRow label={isAr ? 'فرامل خلفي' : 'Rear Brakes Type/Diameter'} value={specs.rearBrakes} />}
                    {specs.fuelTank && <SpecRow label={isAr ? 'سعة خزان الوقود' : 'Fuel Capacity'} value={specs.fuelTank} />}
                    {specs.seatHeight && <SpecRow label={isAr ? 'ارتفاع المقعد (مم)' : 'Seat Height (mm)'} value={specs.seatHeight} isLast />}
                  </div>
                </div>
              </div>

              {/* ── Power System ── */}
              <div className="border-t border-gray-200">
                <div className="grid grid-cols-1 lg:grid-cols-12 py-8">
                  <div className="lg:col-span-4 mb-4 lg:mb-0 text-start">
                    <h3 className="text-2xl sm:text-3xl font-bold italic text-gray-400 font-serif tracking-tight">
                      {isAr ? 'منظومة المحرك' : 'Power System'}
                    </h3>
                  </div>
                  <div className="lg:col-span-8">
                    {specs.emissionsStandard && <SpecRow label={isAr ? 'معيار الانبعاثات' : 'Emissions Standard'} value={specs.emissionsStandard} />}
                    {specs.engine && <SpecRow label={isAr ? 'نوع المحرك' : 'Engine Type/Cylinder'} value={specs.engine} />}
                    {(specs.capacity || product.capacity) && <SpecRow label={isAr ? 'السعة اللترية (سي سي)' : 'Displacement'} value={specs.capacity || product.capacity || ''} />}
                    {specs.boreStroke && <SpecRow label={isAr ? 'القطر × الشوط (مم)' : 'Bore × Stroke'} value={specs.boreStroke} />}
                    {specs.compressionRatio && <SpecRow label={isAr ? 'نسبة الانضغاط' : 'Compression Ratio'} value={specs.compressionRatio} />}
                    {specs.idlingSpeed && <SpecRow label={isAr ? 'سرعة السلانسيه' : 'Idling Speed'} value={specs.idlingSpeed} />}
                    {specs.fuelSystem && <SpecRow label={isAr ? 'نظام الوقود' : 'Fuel System'} value={specs.fuelSystem} />}
                    {(specs.power || product.power) && <SpecRow label={isAr ? 'القوة القصوى' : 'Max. Horsepower'} value={specs.power || product.power || ''} />}
                    {specs.torque && <SpecRow label={isAr ? 'العزم الأقصى' : 'Max. Torque'} value={specs.torque} />}
                    {specs.clutchType && <SpecRow label={isAr ? 'نوع الدبرياج' : 'Clutch Type'} value={specs.clutchType} />}
                    {specs.valveTrain && <SpecRow label={isAr ? 'نظام الكامة والصمامات' : 'Valve Train'} value={specs.valveTrain} />}
                    {specs.tensioner && <SpecRow label={isAr ? 'شداد السلسلة' : 'Tensioner'} value={specs.tensioner} />}
                    {specs.engineOilCapacity && <SpecRow label={isAr ? 'سعة زيت المحرك' : 'Engine Oil Capacity'} value={specs.engineOilCapacity} />}
                    {specs.maxSpeed && <SpecRow label={isAr ? 'السرعة القصوى' : 'Max. Speed'} value={specs.maxSpeed} />}
                    {(specs.cooling || product.cooling) && <SpecRow label={isAr ? 'نظام التبريد' : 'Cooling System'} value={specs.cooling || product.cooling || ''} />}
                    {specs.transmission && <SpecRow label={isAr ? 'ناقل الحركة' : 'Transmission'} value={specs.transmission} isLast />}
                  </div>
                </div>
              </div>

              {/* ── Electric System ── */}
              {(specs.startingSystem || specs.headlightSpec || specs.taillightSpec || specs.frontPositionLamp || specs.turningSignalLight || specs.ignitionSystem || specs.alternator || specs.battery || specs.licenseLight || specs.fuseSpec || specs.sparkPlug) && (
                <div className="border-t border-gray-200">
                  <div className="grid grid-cols-1 lg:grid-cols-12 py-8">
                    <div className="lg:col-span-4 mb-4 lg:mb-0 text-start">
                      <h3 className="text-2xl sm:text-3xl font-bold italic text-gray-400 font-serif tracking-tight">
                        {isAr ? 'المنظومة الكهربائية' : 'Electric System'}
                      </h3>
                    </div>
                    <div className="lg:col-span-8">
                      {specs.startingSystem && <SpecRow label={isAr ? 'نظام التشغيل' : 'Starting System'} value={specs.startingSystem} />}
                      {specs.headlightSpec && <SpecRow label={isAr ? 'المصباح الأمامي' : 'Headlight'} value={specs.headlightSpec} />}
                      {specs.licenseLight && <SpecRow label={isAr ? 'إضاءة اللوحة' : 'License Light'} value={specs.licenseLight} />}
                      {specs.taillightSpec && <SpecRow label={isAr ? 'المصباح الخلفي' : 'Taillight'} value={specs.taillightSpec} />}
                      {specs.frontPositionLamp && <SpecRow label={isAr ? 'إضاءة المواضع' : 'Front Position Lamp'} value={specs.frontPositionLamp} />}
                      {specs.turningSignalLight && <SpecRow label={isAr ? 'إشارات الانعطاف' : 'Front/Rear Turning Signal Light'} value={specs.turningSignalLight} />}
                      {specs.ignitionSystem && <SpecRow label={isAr ? 'نظام الإشعال' : 'Ignition System'} value={specs.ignitionSystem} />}
                      {specs.alternator && <SpecRow label={isAr ? 'قدرة المولد والدينامو' : 'Alternator'} value={specs.alternator} />}
                      {specs.battery && <SpecRow label={isAr ? 'سعة البطارية' : 'Battery'} value={specs.battery} />}
                      {specs.fuseSpec && <SpecRow label={isAr ? 'الفيوزات' : 'Fuse'} value={specs.fuseSpec} />}
                      {specs.sparkPlug && <SpecRow label={isAr ? 'شمعة الإشعال (البوجيه)' : 'Spark Plug'} value={specs.sparkPlug} isLast />}
                    </div>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-400 leading-relaxed pt-4 border-t border-gray-100">
                {isAr
                  ? '"المواصفات أعلاه للاسترشاد فقط، يرجى الرجوع إلى شهادة المطابقة للحصول على المواصفات النهائية!"'
                  : '"Above Specifications are for reference only, please refer to Certificate to get final Specs!"'}
                <br />
                <span className="text-[#E60012]">
                  {isAr
                    ? 'قد تختلف المعلومات الواردة في هذا الموقع عن الموديلات المتاحة فعلياً. راجع موزع SYM المعتمد لمزيد من التفاصيل. شكراً لكم.'
                    : 'The information contained in this website may differ from the available models. See your SYM dealers for more details. Thank you.'}
                </span>
              </p>

            </div>{/* end #specification */}

            {/* 7. Official PDF Catalog & Owner's Technical Manual Section */}
            {product.catalogPdf && (
              <div id="catalog" className="space-y-8 scroll-mt-28 pt-20 mt-20 md:pt-24 md:mt-24 border-t border-gray-100/70">
                <div className={`${dir === 'rtl' ? 'border-r-4 border-l-0 pr-4 pl-0' : 'border-l-4 border-[#E60012] pl-4'} border-[#E60012] py-1`}>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                    {isAr ? 'الكتالوج الرسمي وكتيب التعليمات' : "Technical Catalog & Owner's Manual"}
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">
                    {isAr ? 'الكتالوج المصنعي الرسمي، وجدول الصيانة الدورية، والمعايير الفنية المعتمدة' : 'Official factory documentation, maintenance schedules, and technical service parameters'}
                  </p>
                </div>

                {/* Clean Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">

                  {/* Left Column: PDF File Download Box */}
                  <div className="lg:col-span-5 space-y-5 bg-white p-6 md:p-7 rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-[#E60012] flex-shrink-0 shadow-xs">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5c0 .8-.7 1.5-1.5 1.5H7v2H5.5V9H8c.8 0 1.5.7 1.5 1.5v1zm5 2c0 .8-.7 1.5-1.5 1.5h-2.5V9H13c.8 0 1.5.7 1.5 1.5v3zm4-3.5h-3v1.5h2.5V13H15v2h-1.5V9H18.5v1.5zM7 10.5h1v1H7v-1zm4.5 0h1v3h-1v-3z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#E60012] bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
                          {isAr ? 'وثائق رسمية معتمدة من SYM' : 'SYM Certified Documentation'}
                        </span>
                        <h3 className="text-sm font-bold text-gray-900 mt-1 tracking-tight">
                          {isAr ? `كتيب SYM ${product.name} الفني الرسمي.pdf` : `SYM ${product.name} Technical Manual.pdf`}
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed font-sans">
                      {isAr
                        ? 'كتيب المالك الرسمي المعتمد دليل الخدمة الفنية وجدول الصيانات الدورية، ومخططات الكهرباء، وسعة السوائل الزيوت.'
                        : 'Factory-approved owner manual and technical service guide including periodic maintenance intervals, electrical wiring schematics, fluid capacity limits, and component tolerances.'}
                    </p>

                    {/* Meta Specs Pill */}
                    <div className="flex items-center justify-between text-[11px] font-semibold text-gray-600 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#E60012]">📄</span>
                        <span>{isAr ? '2 صفحة رسمية' : '2 Official Pages'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#E60012]">⚡</span>
                        <span>{isAr ? 'ملف PDF متجهات' : 'HD Vector PDF'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#E60012]">🔒</span>
                        <span>{isAr ? 'معتمد من المصنع' : 'Factory Approved'}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2.5 pt-2">
                      <a
                        href={product.catalogPdf}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-3 px-4 rounded-xl bg-[#E60012] hover:bg-red-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
                      >
                        <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                          <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                        </svg>
                        <span>{isAr ? 'تحميل الكتالوج والكتيب الفني (PDF)' : 'Download Technical Manual (PDF)'}</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => setPreviewImage('/assets/products/cruisym-maintenance-schedule.jpg')}
                        className="w-full py-3 px-4 rounded-xl bg-gray-100/80 hover:bg-gray-200/90 text-gray-800 font-bold text-xs border border-gray-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <svg className="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span>{isAr ? 'معاينة جدول الصيانة داخل الصفحة' : 'Preview Maintenance Specs In-Page'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Catalog Content Summary Grid */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="border-b border-gray-200 pb-2.5 flex items-center justify-between">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#E60012]" />
                        {isAr ? 'أبرز مواصفات الخدمة والصيانة الرسمية' : 'Official Service & Maintenance Highlights'}
                      </h4>
                      <span className="text-[11px] font-semibold text-gray-400">{isAr ? 'مواصفات SYM الرسمية' : 'SYM Factory Specs'}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                      <div className="p-4 rounded-xl bg-white border border-gray-200/90 shadow-xs hover:border-gray-300 transition-all space-y-1.5">
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-red-50 border border-red-100 flex items-center justify-center text-[#E60012] text-xs">
                            🛠️
                          </div>
                          <span className="text-xs font-bold text-gray-900">{isAr ? 'جدول الصيانة الفحصية' : 'Periodic Maintenance Schedule'}</span>
                        </div>
                        <p className="text-gray-500 text-[11px] leading-relaxed rtl:pr-8 ltr:pl-8">
                          {isAr ? 'مواعيد الصيانة لزيت المحرك، الفلاتر، سير CVT، شمعات الإشعال، وسائل التبريد.' : 'Scheduled service intervals for engine oil, filters, CVT drive belt, spark plugs, and coolant replacement.'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-gray-200/90 shadow-xs hover:border-gray-300 transition-all space-y-1.5">
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 text-xs">
                            ⚡
                          </div>
                          <span className="text-xs font-bold text-gray-900">{isAr ? 'المنظومة الكهربائية والفيوزات' : 'Electrical & Fuse Mapping'}</span>
                        </div>
                        <p className="text-gray-500 text-[11px] leading-relaxed rtl:pr-8 ltr:pl-8">
                          {isAr ? 'معايير إضاءة LED، مواصفات البطارية 12V 11Ah، وخريطة أمبير الفيوزات.' : 'Full LED lighting electrical ratings, 12V 11Ah battery specifications, and fuse amp mapping.'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-gray-200/90 shadow-xs hover:border-gray-300 transition-all space-y-1.5">
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 text-xs">
                            💧
                          </div>
                          <span className="text-xs font-bold text-gray-900">{isAr ? 'سعة السوائل والزيوت' : 'Fluid Capacities & Lubricants'}</span>
                        </div>
                        <p className="text-gray-500 text-[11px] leading-relaxed rtl:pr-8 ltr:pl-8">
                          {isAr ? 'زيت المحرك (2.0 لتر)، زيت الفتيس (350 سي سي)، وخزان البنزين 14.5 لتر.' : 'Engine oil (2.0L), transmission fluid (350cc), and unleaded fuel tank volume (14.5L).'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-gray-200/90 shadow-xs hover:border-gray-300 transition-all space-y-1.5">
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 text-xs">
                            ⚙️
                          </div>
                          <span className="text-xs font-bold text-gray-900">{isAr ? 'ضغط الإطارات وحمولة الوزن' : 'Tire Pressures & Load Limits'}</span>
                        </div>
                        <p className="text-gray-500 text-[11px] leading-relaxed rtl:pr-8 ltr:pl-8">
                          {isAr ? 'ضغط الإطارات الموصى به (أمامي 33 PSI / خلفي 36 PSI) والحمولة القصوى.' : 'Recommended cold tire pressure (Front 33 PSI / Rear 36 PSI) and maximum payload capacity.'}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Direct Service Support Bar */}
                    <div className="p-4 rounded-xl bg-red-50/70 border border-red-100 flex flex-col sm:flex-row items-center justify-between gap-3.5 mt-4 shadow-xs">
                      <div className="flex items-center gap-2.5 text-start">
                        <MessageCircle className="w-5 h-5 text-[#E60012] flex-shrink-0" />
                        <span className="text-xs font-semibold text-gray-800">
                          {isAr ? 'هل تحتاچ مساعدة بشأن قطع الغيار الرسمية أو جدول الصيانة؟' : 'Need assistance regarding official spare parts or service schedules?'}
                        </span>
                      </div>
                      <a
                        href={`https://wa.me/201279881123?text=${whatsappText}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-[#E60012] hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 hover:scale-105 active:scale-95"
                      >
                        <span>{t('nav.support', 'Technical Support')}</span>
                        <svg className={`w-3.5 h-3.5 fill-current ${isAr ? 'rotate-180' : ''}`} viewBox="0 0 24 24">
                          <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </a>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* Modal Lightbox for PDF & Catalog Image Preview */}
            {previewImage && (
              <div
                className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
                onClick={() => setPreviewImage(null)}
              >
                <div
                  className="relative max-w-5xl max-h-[90vh] w-full overflow-auto rounded-2xl bg-zinc-950 p-4 border border-zinc-800 shadow-2xl space-y-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCatalogTab('maintenance')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${catalogTab === 'maintenance' ? 'bg-[#E60012] text-white' : 'bg-zinc-800 text-gray-300'
                          }`}
                      >
                        🛠️ {isAr ? 'جدول الصيانات' : 'Maintenance Schedule'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCatalogTab('specifications')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${catalogTab === 'specifications' ? 'bg-[#E60012] text-white' : 'bg-zinc-800 text-gray-300'
                          }`}
                      >
                        📋 {isAr ? 'المواصفات الفنية' : 'Technical Specifications'}
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <a
                        href="/assets/docs/SYM-Cruisym-400-Official-Catalog.pdf"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-lg bg-[#E60012] hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        📄 {isAr ? 'فتح ملف PDF' : 'Open PDF'}
                      </a>
                      <button
                        type="button"
                        onClick={() => setPreviewImage(null)}
                        className="w-8 h-8 rounded-full bg-zinc-800 text-white hover:bg-red-600 flex items-center justify-center transition-all cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      catalogTab === 'maintenance'
                        ? '/assets/products/cruisym-maintenance-schedule.jpg'
                        : '/assets/products/cruisym-full-specifications.jpg'
                    }
                    alt="Catalog High Resolution Preview"
                    className="w-full h-auto rounded-xl object-contain mx-auto"
                  />
                </div>
              </div>
            )}

          </div>{/* end space-y-16 */}

        </div>{/* end bg-white card */}

      </div>{/* end relative z-20 */}

    </div>
  );
}

function View360Rotator({
  productName,
  defaultImage,
  productSlug,
  galleryImages,
  images360,
}: {
  productName: string;
  defaultImage: string;
  productSlug?: string;
  galleryImages?: string[];
  images360?: string[];
}) {
  const angleDegrees = [0, 45, 90, 135, 180, 225, 270, 315];

  // Real 8-angle studio photography, when a product has it, is declared via
  // its `images360` array (see CRUiSYM 400 in lib/data/products.ts for the
  // reference set and file convention) — drop-in for any model, no code
  // changes needed here. Without that set, cycling through the product's
  // full gallery mixed different COLOR variants into the same "rotation",
  // so the color visibly swapped mid-drag — worse than no rotation at all.
  // Instead, spin the one real hero photo on itself (mirrored for the far
  // side) so the color stays consistent and it still turns smoothly; it's
  // never a fabricated new angle, just the same real photo shown both ways.
  const hasReal360Set = Array.isArray(images360) && images360.length >= angleDegrees.length;

  const images = angleDegrees.map((angle, idx) => {
    if (hasReal360Set) {
      return { src: images360![idx], fallback: defaultImage, alt: `${productName} ${angle}°`, angle, flip: false };
    }
    // Angles 0-135 show the photo as-is; 180-315 mirror it — a simple, honest
    // turn illusion from a single real photo, one consistent color throughout.
    const flip = idx >= 4;
    return { src: defaultImage, fallback: defaultImage, alt: `${productName} ${angle}°`, angle, flip };
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  const startXRef = React.useRef(0);

  // Preload all images for 0ms instant rotation
  React.useEffect(() => {
    images.forEach((imgObj: { src: string }) => {
      if (typeof window !== 'undefined') {
        const img = new window.Image();
        img.src = imgObj.src;
      }
    });
  }, [images]);

  // Auto-spin timer when 360 degree button is clicked
  React.useEffect(() => {
    if (!isAutoSpinning) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 400);
    return () => clearInterval(interval);
  }, [isAutoSpinning, images.length]);

  const handleNext = () => {
    if (!isAutoSpinning) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
    setIsAutoSpinning((prev) => !prev);
  };

  const handlePointerDown = (clientX: number) => {
    setIsAutoSpinning(false);
    setIsDragging(true);
    startXRef.current = clientX;
  };

  const handlePointerMove = (clientX: number) => {
    if (!isDragging) return;
    const diff = clientX - startXRef.current;
    const stepThreshold = 12; // 12px drag sensitivity
    if (Math.abs(diff) >= stepThreshold) {
      const steps = Math.floor(Math.abs(diff) / stepThreshold);
      if (diff > 0) {
        setCurrentIndex((prev) => (prev - steps + images.length * 1000) % images.length);
      } else {
        setCurrentIndex((prev) => (prev + steps) % images.length);
      }
      startXRef.current = clientX;
    }
  };

  // Global event listeners for drag so movement outside component bounds keeps working smoothly
  React.useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX);
    };
    const onMouseUp = () => {
      setIsDragging(false);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX);
      }
    };
    const onTouchEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging]);

  return (
    <div className="view360-content flex flex-col items-center justify-center w-full max-w-[950px] mx-auto select-none">
      <div
        className={`view360 relative z-10 w-full h-[320px] sm:h-[440px] md:h-[520px] flex items-center justify-center ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        onMouseDown={(e) => handlePointerDown(e.clientX)}
        onTouchStart={(e) => {
          if (e.touches.length > 0) handlePointerDown(e.touches[0].clientX);
        }}
      >
        <div className="rotation relative w-full h-full flex items-center justify-center perspective-1000" id="circlr" data-circlr="true">
          {images.map((imgObj: { src: string; fallback: string; angle: number; flip?: boolean }, idx: number) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={idx}
              alt={productName}
              src={imgObj.src}
              data-index={idx}
              onError={(e) => {
                (e.target as HTMLImageElement).src = imgObj.fallback || defaultImage;
              }}
              style={{
                display: idx === currentIndex ? 'block' : 'none',
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                pointerEvents: 'none',
                // Real per-angle photography (when it exists) is shown as-is, never
                // distorted. Without it, the single real hero photo is mirrored for
                // the far-side angles — a plain flip, not a fake 3D/skew illusion.
                transform: imgObj.flip ? 'scaleX(-1)' : 'none',
                transition: 'opacity 0.12s ease-out',
              }}
              className="filter drop-shadow-xl"
            />
          ))}
        </div>
      </div>

      {/* Interactive Red 360° 3D Ring Arrow */}
      <div className="view-btn flex items-center justify-center -mt-2 z-20">
        <button
          type="button"
          onClick={handleNext}
          className={`group flex flex-col items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer ${isAutoSpinning ? 'scale-105' : ''}`}
          title="Click to toggle auto-rotation or drag to rotate 360°"
        >
          <div className="relative flex items-center justify-center w-20 h-12">
            {/* Red 360° Text in center of ring */}
            <span className="relative z-10 text-[16px] font-black text-[#E60012] tracking-tighter leading-none select-none -mt-1">
              360°
            </span>

            {/* Red 3D Rotation Ring SVG wrapping around 360° */}
            <svg className="absolute inset-0 w-20 h-12 text-[#E60012] group-hover:scale-105 transition-transform duration-300" viewBox="0 0 80 48" fill="none">
              {/* Left arc curving around left side of 360 */}
              <path
                d="M 25 16 C 12 16, 10 38, 36 38"
                stroke="#E60012"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Right arc curving around right side of 360 */}
              <path
                d="M 55 16 C 68 16, 70 38, 42 38"
                stroke="#E60012"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Left-pointing arrowhead at bottom center */}
              <polygon points="36,38 46,33 44,43" fill="#E60012" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}

