'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface Category {
    id: string;
    title: string;
    subtitle: string;
    buttonText: string;
    href: string;
    image: string;
    alt: string;
}

// ─────────────────────────────────────────────
// Category Data
// ─────────────────────────────────────────────
const categories: Category[] = [
    {
        id: 'scooters',
        title: 'SYM Scooters',
        subtitle: 'Urban Mobility Collection',
        buttonText: 'Explore Collection',
        href: '/all-models',
        image: '/assets/products/jet-x-200-black.png',
        alt: 'SYM Scooters – Urban Mobility Collection',
    },
    {
        id: 'motorcycles',
        title: 'SYM Motorcycles',
        subtitle: 'Performance Series',
        buttonText: 'Explore Collection',
        href: '/all-models',
        image: '/assets/products/husky.png',
        alt: 'SYM Motorcycles – Performance Series',
    },
    {
        id: 'spare-parts',
        title: 'Spare Parts',
        subtitle: 'Original Genuine Parts',
        buttonText: 'Explore Collection',
        href: '/service',
        image: '/assets/categories/service.webp',
        alt: 'SYM Spare Parts – Original Genuine Parts',
    },
    {
        id: 'accessories',
        title: 'Accessories',
        subtitle: 'Ride With Style',
        buttonText: 'Explore Collection',
        href: '/service',
        image: '/assets/categories/where.webp',
        alt: 'SYM Accessories – Ride With Style',
    },
];

// ─────────────────────────────────────────────
// Single Card Component
// ─────────────────────────────────────────────
interface CategoryCardProps {
    category: Category;
    index: number;
}

function CategoryCard({ category, index }: CategoryCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-80px 0px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
            whileHover={{ y: -8 }}
            style={{ transition: 'box-shadow 0.4s ease' }}
            className="group relative w-full overflow-hidden rounded-3xl cursor-pointer
                 h-[380px] md:h-[520px] xl:h-[650px]
                 shadow-[0_8px_32px_rgba(0,0,0,0.5)]
                 hover:shadow-[0_24px_64px_rgba(0,0,0,0.75)]"
        >
            <Link
                href={category.href}
                aria-label={`${category.title} – ${category.subtitle}`}
                className="block w-full h-full focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-3xl"
            >
                {/* ── Background Image ── */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl">
                    <Image
                        src={category.image}
                        alt={category.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 100vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
                        loading={index === 0 ? 'eager' : 'lazy'}
                    />
                </div>

                {/* ── Premium Dark Gradient Overlay ── */}
                <div
                    className="absolute inset-0 rounded-3xl pointer-events-none"
                    style={{
                        background:
                            'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.72) 100%)',
                    }}
                />

                {/* ── Bottom Content Row ── */}
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 p-6 md:p-10">
                    {/* LEFT – Title + Subtitle */}
                    <div className="flex flex-col gap-1">
                        <h2
                            className="text-white font-bold leading-tight
                         text-3xl md:text-4xl xl:text-[56px]"
                            style={{ textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}
                        >
                            {category.title}
                        </h2>
                        <p
                            className="font-medium leading-snug
                         text-base md:text-lg xl:text-[20px]"
                            style={{ color: '#D8D8D8' }}
                        >
                            {category.subtitle}
                        </p>
                    </div>

                    {/* RIGHT – CTA Button */}
                    <div className="flex-shrink-0">
                        <motion.span
                            className="group/btn inline-flex items-center gap-2
                         bg-white text-black font-semibold rounded-full
                         px-5 py-3 md:px-7 md:py-4
                         text-sm md:text-base
                         transition-all duration-300
                         hover:bg-[#E30613] hover:text-white
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            aria-label={`${category.buttonText} – ${category.title}`}
                            role="button"
                        >
                            {category.buttonText}
                            {/* Arrow icon */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="transition-transform duration-300 group-hover/btn:translate-x-1"
                                aria-hidden="true"
                            >
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </motion.span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

// ─────────────────────────────────────────────
// Section Component (exported)
// ─────────────────────────────────────────────
export default function ProductCategoriesSection() {
    return (
        <section
            aria-label="Product Categories"
            className="relative w-full bg-black"
            style={{ paddingTop: '80px', paddingBottom: '80px' }}
        >
            <div
                className="mx-auto flex flex-col gap-4 md:gap-5 xl:gap-6"
                style={{ maxWidth: '1440px', paddingLeft: '24px', paddingRight: '24px' }}
            >
                {categories.map((category, index) => (
                    <CategoryCard key={category.id} category={category} index={index} />
                ))}
            </div>
        </section>
    );
}
