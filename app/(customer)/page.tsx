'use client';

import Header from '@/components/customer/Header';
import Footer from '@/components/customer/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function HomePage() {
  const { dir, t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [huskySlide, setHuskySlide] = useState(0);

  const slides = [
    {
      image: '/assets/hero/husky adv.png',
      label: '',
      title: 'SYM',
      subtitle: t('home.heroSubtitle1', 'Husky ADV'),
      tabName: 'Husky ADV',
      link: '/scooter/husky-adv',
    },
    {
      image: '/assets/hero/cruisym 400.png',
      label: '',
      title: 'SYM',
      subtitle: t('home.heroSubtitle2', 'CRUiSYM 400'),
      tabName: 'CRUiSYM 400',
      link: '/scooter/cruisym-400i',
    },
    {
      image: '/assets/hero/joymax z300.png',
      label: '',
      title: 'SYM',
      subtitle: t('home.heroSubtitle3', 'Joymax Z 300'),
      tabName: 'Joymax Z 300',
      link: '/scooter/joymax-z-300',
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const nextHuskySlide = useCallback(() => {
    setHuskySlide((prev) => (prev + 1) % 3);
  }, []);

  const prevHuskySlide = () => {
    setHuskySlide((prev) => (prev - 1 + 3) % 3);
  };

  useEffect(() => {
    const huskyTimer = setInterval(nextHuskySlide, 3000);
    return () => clearInterval(huskyTimer);
  }, [nextHuskySlide]);

  const [activeVideoIndex, setActiveVideoIndex] = useState(1);

  const videoSlides = [
    {
      title: 'CRUiSYM 400',
      video: '/assets/videos/SYM CRUiSYM 400 - GLOBAL SYM (1080p, h264).mp4',
      link: '/scooter/cruisym-400i',
    },
    {
      title: 'SYM ADX',
      video: '/assets/videos/SYM ADX.mp4',
      link: '/all-models',
    },
    {
      title: 'Symphony ST',
      video: '/assets/videos/SYMPHONY ST 125.mp4',
      link: '/scooter/symphony-st-new',
    },
    {
      title: 'Fiddle 4',
      video: '/assets/videos/Official SYM Fiddle 4 200i Video.mp4',
      link: '/scooter/fiddle-4-150',
    },
  ];

  const scrollToVideo = useCallback((index: number) => {
    const carousel = document.getElementById('video-carousel');
    if (!carousel) return;
    const cards = carousel.querySelectorAll('.video-card');
    const targetIndex = (index + videoSlides.length) % videoSlides.length;
    if (cards[targetIndex]) {
      const card = cards[targetIndex] as HTMLElement;
      const containerWidth = carousel.clientWidth;
      const cardWidth = card.clientWidth;
      const scrollTarget = card.offsetLeft - (containerWidth - cardWidth) / 2;
      carousel.scrollTo({
        left: scrollTarget,
        behavior: 'smooth',
      });
      setActiveVideoIndex(targetIndex);
    }
  }, [videoSlides.length]);

  const handleVideoScroll = () => {
    const carousel = document.getElementById('video-carousel');
    if (!carousel) return;
    const cards = carousel.querySelectorAll('.video-card');
    const containerCenter = carousel.scrollLeft + carousel.clientWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    cards.forEach((card, idx) => {
      const cardElement = card as HTMLElement;
      const cardCenter = cardElement.offsetLeft + cardElement.clientWidth / 2;
      const distance = Math.abs(containerCenter - cardCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });

    setActiveVideoIndex(closestIndex);
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    const alignCarousel = () => {
      const carousel = document.getElementById('video-carousel');
      if (!carousel) return;
      const cards = carousel.querySelectorAll('.video-card');
      if (cards[1]) {
        const card = cards[1] as HTMLElement;
        const containerWidth = carousel.clientWidth;
        const cardWidth = card.clientWidth;
        const scrollTarget = card.offsetLeft - (containerWidth - cardWidth) / 2;
        carousel.scrollLeft = scrollTarget;
      }
    };

    alignCarousel();
    const timer = setTimeout(alignCarousel, 50);
    return () => clearTimeout(timer);
  }, []);



  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      <Header />

      {/* 1. Main Responsive Hero Slider */}
      <section className="relative w-full h-[520px] sm:h-[620px] md:h-[720px] lg:h-[840px] overflow-hidden bg-black pt-16 select-none">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentSlide ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
          >
            {/* Background Hero Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.image}
              alt={slide.tabName}
              className="w-full h-full object-cover object-center brightness-95"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

            {/* Centered Content Layer - Perfectly Proportioned Across Devices */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-8 sm:pt-0">
              <div className="max-w-5xl mx-auto flex flex-col items-center space-y-2 sm:space-y-4">
                {slide.label && (
                  <span className="text-white text-xs sm:text-base md:text-xl font-bold tracking-widest uppercase text-shadow-md">
                    {slide.label}
                  </span>
                )}
                <h1 className="text-white text-xl sm:text-3xl md:text-5xl font-light tracking-widest text-shadow-md">
                  {slide.title}
                </h1>
                <h2 className="text-white text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-tight text-shadow-lg pb-2 sm:pb-4">
                  {slide.subtitle}
                </h2>

                <Link
                  href={slide.link}
                  className="inline-flex items-center justify-center px-8 sm:px-12 py-3 sm:py-4 bg-[#E30000] hover:bg-red-700 text-white rounded-full text-xs sm:text-base font-bold tracking-wide shadow-xl shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
                >
                  {t('common.learnMore', 'Learn more')}
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Slide Name Bottom Tabs */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 sm:gap-8 max-w-full px-4 overflow-x-auto scrollbar-hide">
          {slides.map((slide, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentSlide(index)}
              className={`text-xs sm:text-sm transition-all pb-1 whitespace-nowrap ${currentSlide === index
                ? 'text-white font-bold border-b-2 border-white opacity-100'
                : 'text-gray-300 font-normal border-b-2 border-transparent opacity-60 hover:opacity-100'
                }`}
            >
              {slide.tabName}
            </button>
          ))}
        </div>

        {/* Prev Arrow */}
        <button
          type="button"
          onClick={prevSlide}
          className="absolute left-2 sm:left-6 md:left-10 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#E30000] transition-all border border-white/20 shadow-lg"
          aria-label="Previous slide"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Next Arrow */}
        <button
          type="button"
          onClick={nextSlide}
          className="absolute right-2 sm:right-6 md:right-10 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#E30000] transition-all border border-white/20 shadow-lg"
          aria-label="Next slide"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </section>

      {/* 2. SYM Husky ADV Interactive 3D Showcase Slider */}
      <section className="relative w-full h-[520px] sm:h-[640px] md:h-screen overflow-hidden bg-gradient-to-b from-[#c7c8cc] via-[#d9dadd] to-[#b4b5ba] select-none">
        {/* Studio Ambient Backlight Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(230, 0, 18, 0.05) 0%, rgba(0, 0, 0, 0.04) 55%, rgba(180, 181, 186, 0) 100%)',
          }}
        />

        {/* Base Studio Floor Spotlight */}
        <div
          className="absolute bottom-[-5%] left-1/2 -translate-x-1/2 w-[95%] max-w-[1300px] h-[55vh] pointer-events-none rounded-[50%]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.12) 0%, rgba(0, 0, 0, 0.06) 45%, rgba(255, 255, 255, 0) 78%)',
            filter: 'blur(35px)'
          }}
        />

        {/* Header Title & CTA Button */}
        <div className="absolute top-6 sm:top-10 md:top-14 left-1/2 -translate-x-1/2 z-30 text-center w-full px-4 flex flex-col items-center gap-2 sm:gap-4">
          <h2 className="text-[#111111] text-2xl sm:text-4xl md:text-6xl font-extrabold tracking-tight">
            HUSKY ADV 200
          </h2>

          <Link
            href="/scooter/husky-adv"
            className="inline-flex items-center justify-center px-6 sm:px-10 py-2.5 sm:py-3 bg-[#E30000] hover:bg-red-700 text-white rounded-full text-xs sm:text-base font-bold shadow-lg shadow-red-600/40 transition-all hover:scale-105"
          >
            Learn More
          </Link>
        </div>

        {/* Interactive 3-View Carousel */}
        <div className="relative h-full z-20">
          <div className="absolute bottom-0 left-0 right-0 h-[75vh] overflow-hidden">
            <div
              dir="ltr"
              className="flex h-full transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${huskySlide * 100}%)` }}
            >
              {/* View 1 - Side */}
              <div className="min-w-full h-full flex items-end justify-center relative pb-12 sm:pb-20">
                <Image
                  src="/assets/products/husky-slide-1.png"
                  alt="SYM Husky ADV Side View"
                  width={850}
                  height={850}
                  className="object-contain object-bottom h-[80%] sm:h-[88%] w-auto filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.5)]"
                  priority
                  quality={100}
                />
              </div>

              {/* View 2 - Front */}
              <div className="min-w-full h-full flex items-end justify-center relative pb-12 sm:pb-20">
                <Image
                  src="/assets/products/husky-slide-2.png"
                  alt="SYM Husky ADV Front View"
                  width={900}
                  height={900}
                  className="object-contain object-bottom h-[84%] sm:h-[92%] w-auto filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.5)]"
                  priority
                  quality={100}
                />
              </div>

              {/* View 3 - Angle */}
              <div className="min-w-full h-full flex items-end justify-center relative pb-12 sm:pb-20">
                <Image
                  src="/assets/products/husky-slide-3.png"
                  alt="SYM Husky ADV Angle View"
                  width={850}
                  height={850}
                  className="object-contain object-bottom h-[80%] sm:h-[88%] w-auto filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.5)]"
                  quality={100}
                />
              </div>
            </div>
          </div>

          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={prevHuskySlide}
            className="absolute left-3 sm:left-6 md:left-12 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/5 backdrop-blur-md flex items-center justify-center text-[#111111] hover:bg-black/10 transition-all duration-300 z-40 border border-black/10 shadow-lg"
            aria-label="Previous view"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={nextHuskySlide}
            className="absolute right-3 sm:right-6 md:right-12 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/5 backdrop-blur-md flex items-center justify-center text-[#111111] hover:bg-black/10 transition-all duration-300 z-40 border border-black/10 shadow-lg"
            aria-label="Next view"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Bottom Indicator Dots */}
          <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2">
            {[0, 1, 2].map((index) => (
              <button
                key={index}
                type="button"
                onClick={() => setHuskySlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${huskySlide === index ? 'bg-[#E60012] w-8' : 'bg-black/20 hover:bg-black/35 w-2'
                  }`}
                aria-label={`View ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3. Native Centered Smooth Video Carousel */}
      <section className="relative w-full h-[520px] sm:h-[640px] md:h-screen bg-black overflow-hidden py-8 select-none">
        <div className="relative h-full flex items-center">
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => scrollToVideo(activeVideoIndex - 1)}
            className="absolute left-3 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-[#E30000] transition-all z-30 shadow-2xl border border-white/20"
            aria-label="Previous video"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => scrollToVideo(activeVideoIndex + 1)}
            className="absolute right-3 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-[#E30000] transition-all z-30 shadow-2xl border border-white/20"
            aria-label="Next video"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Scrollable Container */}
          <div
            id="video-carousel"
            onScroll={handleVideoScroll}
            className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory w-full py-6 px-[10vw] sm:px-[14vw] lg:px-[17vw]"
            style={{
              scrollBehavior: 'smooth',
              scrollSnapType: 'x mandatory',
            }}
          >
            {videoSlides.map((slide, index) => (
              <div
                key={index}
                onClick={() => scrollToVideo(index)}
                className="video-card flex-shrink-0 w-[80vw] sm:w-[72vw] lg:w-[66vw] max-w-[1100px] h-[440px] sm:h-[540px] md:h-[calc(100vh-120px)] rounded-3xl overflow-hidden relative snap-center cursor-pointer transition-all duration-300 shadow-2xl"
                style={{ scrollSnapAlign: 'center' }}
              >
                <video
                  muted
                  loop
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src={slide.video} type="video/mp4" />
                </video>

                <div className={`absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent transition-opacity duration-300 ${
                  activeVideoIndex === index ? 'opacity-100' : 'opacity-60'
                }`} />

                <div className={`absolute top-8 sm:top-16 left-1/2 -translate-x-1/2 text-center z-10 w-full px-4 transition-all duration-300 ${
                  activeVideoIndex === index ? 'opacity-100 scale-100' : 'opacity-40 scale-95'
                }`}>
                  <h2 className="text-white text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-8 drop-shadow-md">
                    {slide.title}
                  </h2>
                  <Link
                    href={slide.link}
                    className="inline-block px-8 py-3 bg-white text-[#E30000] hover:bg-gray-100 rounded-full text-xs sm:text-base font-bold shadow-lg transition-all hover:scale-105"
                  >
                    {t('common.learnMore', 'Learn more')}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Indicator Dots */}
          <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5">
            {videoSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => scrollToVideo(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  activeVideoIndex === index ? 'bg-white w-8 sm:w-10' : 'bg-white/40 hover:bg-white/70 w-2.5'
                }`}
                aria-label={`Go to video ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. About Us Section — links to the full SEMOTIVE/SYM story page */}
      <section className="relative w-full bg-black py-10 sm:py-16 md:py-20">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-8">
          <div className="text-left mb-6 sm:mb-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
              {t('home.aboutTitle', 'About Us')}
            </h2>
            <p className="text-base sm:text-xl md:text-2xl text-gray-300 font-light">
              {t('home.aboutSubtitle', 'Discover the story behind SYM Egypt products')}
            </p>
          </div>

          <Link
            href="/about"
            className="group relative block w-full h-[260px] sm:h-[420px] md:h-[560px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl"
          >
            <Image
              src="/assets/about/docx_hero_banner.jpg"
              alt="SYM Egypt — SEMOTIVE industrial manufacturing facility"
              fill
              sizes="(max-width: 768px) 100vw, 1600px"
              className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
            <div className="absolute inset-0 flex flex-col items-start justify-end p-6 sm:p-10 md:p-14">
              <span className="px-3 py-1 rounded-full bg-[#E60012] text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3 sm:mb-4">
                {t('home.aboutBadge', 'Official SYM Manufacturing Partner')}
              </span>
              <h3 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white max-w-2xl leading-snug mb-4 sm:mb-6">
                {t('home.aboutTeaser', '25+ years of industrial heritage, licensed manufacturing with SYM Taiwan, and a 30,000 m² facility in 10th of Ramadan City.')}
              </h3>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-white text-black text-xs sm:text-sm font-bold group-hover:bg-[#E60012] group-hover:text-white transition-colors">
                {t('home.aboutCta', 'Discover Our Story')}
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* 5. Product Categories Section - 6 Cards */}
      <section className="relative w-full bg-black py-10 sm:py-16">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {[
              {
                title: 'Maxi Scooter',
                link: '/all-models?category=SCOOTER&cc=MAXI_300',
                image: '/assets/categories/maxiscooter 1.png',
                alt: 'SYM Maxi Scooter',
                position: 'object-center',
              },
              {
                title: 'Urban Daily',
                link: '/all-models?category=SCOOTER&cc=MID_150_200',
                image: '/assets/categories/urban daily.png',
                alt: 'SYM Urban Daily',
                position: 'object-center',
              },
              {
                title: 'Power Sport',
                link: '/all-models?category=BIKE&cc=ALL',
                image: '/assets/categories/power sport.png',
                alt: 'SYM Power Sport',
                position: 'object-center',
              },
              {
                title: 'Classic Scooter',
                link: '/all-models?category=SCOOTER&cc=ALL',
                image: '/assets/categories/classic scooter.png',
                alt: 'SYM Classic Scooter',
                position: 'object-[center_20%]',
              },
              {
                title: 'All-Road',
                link: '/all-models?category=SCOOTER&cc=ALL',
                image: '/assets/categories/all-road.png',
                alt: 'SYM All-Road',
                position: 'object-center',
              },
              {
                title: 'Casual',
                link: '/all-models?category=SCOOTER&cc=ALL',
                image: '/assets/categories/Casual.png',
                alt: 'SYM Casual Scooter',
                position: 'object-[center_15%]',
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className="relative group rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-950 h-[360px] sm:h-[460px] md:h-[520px] lg:h-[580px] w-full shadow-2xl transition-all duration-300 border border-white/5"
              >
                <Link href={card.link} className="block relative w-full h-full">
                  <Image
                    src={card.image}
                    alt={card.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className={`object-cover ${card.position} transition-transform duration-700 ease-out group-hover:scale-105`}
                    priority={idx === 0}
                  />
                  {/* Subtle bottom gradient so image remains bright & crisp */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                  {/* Card Content */}
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 md:bottom-8 md:left-8 md:right-8 flex items-center justify-between z-10">
                    <h3 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight drop-shadow-md">
                      {card.title}
                    </h3>
                    <span className="inline-block px-5 sm:px-7 py-2 sm:py-3 bg-[#E30000] hover:bg-red-700 text-white rounded-full text-xs sm:text-base font-semibold shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95">
                      {t('common.learnMore', 'Learn More')}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Explore More Section - Service and Where to Buy */}
      <section className="relative w-full bg-black py-12 md:py-20">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-8">
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              Explore More
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/service" className="group relative overflow-hidden rounded-3xl aspect-[16/12] min-h-[340px] sm:min-h-[400px] block bg-[#18181b]">
              <Image
                src="/service.webp"
                alt="Service and Support"
                fill
                className="object-cover object-bottom transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#18181b] via-[#18181b]/70 to-transparent pointer-events-none z-10 h-[60%]" />
              <div className="relative z-20 flex flex-col items-center justify-start text-center pt-6 sm:pt-9 px-6">
                <h3 className="text-white text-xl sm:text-3xl font-bold mb-1 tracking-tight">Service and Support</h3>
                <p className="text-white/80 text-xs sm:text-base mb-4 font-normal">Get help for all your SYM products</p>
                <span className="inline-block border border-white/80 text-white group-hover:bg-white group-hover:text-black px-5 sm:px-6 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300">
                  Learn more
                </span>
              </div>
            </Link>

            <Link href="/where-to-buy" className="group relative overflow-hidden rounded-3xl aspect-[16/12] min-h-[340px] sm:min-h-[400px] block bg-[#18181b]">
              <Image
                src="/where.webp"
                alt="Where To Buy"
                fill
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#18181b] via-[#18181b]/70 to-transparent pointer-events-none z-10 h-[60%]" />
              <div className="relative z-20 flex flex-col items-center justify-start text-center pt-6 sm:pt-9 px-6">
                <h3 className="text-white text-xl sm:text-3xl font-bold mb-1 tracking-tight">Where To Buy</h3>
                <p className="text-white/80 text-xs sm:text-base mb-4 font-normal">Shop our products and authorized dealers</p>
                <span className="inline-block border border-white/80 text-white group-hover:bg-white group-hover:text-black px-5 sm:px-6 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300">
                  Learn more
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
