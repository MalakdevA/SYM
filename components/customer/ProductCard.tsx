'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { shouldFlipImageToFaceLeft, getProductImageScale } from '@/lib/utils';
import { PURCHASING_ENABLED } from '@/lib/constants';
import type { ProductCardProps } from '@/types';

import { PRODUCTS } from '@/lib/data/products';

export default function ProductCard({
  name,
  slug,
  image,
  price,
  capacity,
  specifications,
}: ProductCardProps) {
  const { addItem } = useCart();
  const displayCapacity = capacity || specifications?.capacity || '150 cc';
  const isFlipped = shouldFlipImageToFaceLeft(image || '');

  const matched = PRODUCTS.find((p) => p.slug === slug || p.id === slug || p.name.toLowerCase() === name.toLowerCase());
  const actualPrice = price || matched?.price || 0;

  return (
    <article className="group relative w-full flex flex-col items-center text-center p-3 transition-all duration-300">
      <Link
        href={`/products/${slug}`}
        className="block w-full flex flex-col items-center text-center"
        aria-label={`View details for ${name}`}
      >
        {/* Image Container */}
        <div className="relative w-full h-48 sm:h-56 md:h-64 max-w-[380px] mx-auto overflow-visible flex items-center justify-center p-3">
          <Image
            src={image || '/placeholder.png'}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-0 transition-transform duration-500 ease-out filter drop-shadow-md group-hover:scale-110"
            style={{ transform: isFlipped ? 'scaleX(-1)' : 'none' }}
            loading="lazy"
          />
        </div>

        {/* Product Name & Capacity */}
        <div className="mt-4 text-center">
          <h3 className="text-lg sm:text-xl font-extrabold text-[#E60012] group-hover:text-red-500 uppercase tracking-wide transition-colors">
            {name}
          </h3>

          <p className="text-sm font-medium text-zinc-400 font-sans mt-1 tracking-wide">
            {displayCapacity}
          </p>
        </div>
      </Link>

      {PURCHASING_ENABLED ? (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addItem({
              product_id: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              product_name: name,
              price: actualPrice,
              quantity: 1,
              image: image || '/Husky ADV.png',
              item_type: 'scooter',
            });
          }}
          className="mt-3 bg-[#E60012] hover:bg-[#C4000F] text-white text-xs font-bold px-5 py-2 rounded-full transition-all shadow-md flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer z-10"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>شراء / أضف للسلة</span>
        </button>
      ) : (
        <button
          type="button"
          disabled
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="mt-3 bg-gray-200 text-gray-500 text-xs font-bold px-5 py-2 rounded-full flex items-center justify-center gap-1.5 cursor-not-allowed z-10"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>قريباً</span>
        </button>
      )}
    </article>
  );
}
