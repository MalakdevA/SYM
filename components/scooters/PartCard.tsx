'use client';

import React from 'react';
import { SparePartItem } from '@/lib/data/spareParts';
import { getCategoryById } from '@/lib/data/sparePartsCategories';
import { Tag, Hash, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { PURCHASING_ENABLED } from '@/lib/constants';

interface PartCardProps {
  part: SparePartItem;
  categoryId: string;
  language: 'ar' | 'en';
}

const WA_NUMBER = '201271384149';

export function PartCard({ part, categoryId, language }: PartCardProps) {
  const isAr = language === 'ar';
  const category = getCategoryById(categoryId);
  const { addItem } = useCart();

  const partObj = part as unknown as Record<string, unknown>;
  const isUnpriced = Boolean(!part.price || part.price <= 0 || partObj.unpriced);

  const handleAddToCart = () => {
    if (isUnpriced) return;
    const rawPrice = part.price ? Number(part.price) : 0;
    addItem({
      product_id: part.internalCode || part.externalCode1 || part.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      product_name: part.name,
      price: rawPrice,
      quantity: 1,
      image: part.image || '/SymLogo-S-red.png',
      item_type: 'spare_part',
    });
  };

  const handleWhatsApp = () => {
    const msg = isAr
      ? `مرحباً SYM مصر 👋\nأريد الاستفسار عن قطعة الغيار التالية:\n\n🔧 القطعة: ${part.name}\n📋 الكود الداخلي: ${part.internalCode}\n🔹 الكود الخارجي: ${part.externalCode1}\n🏍 الموديل: ${part.model}\n💰 السعر: ${isUnpriced ? 'بالطلب والحجز عبر الواتساب' : `${part.price} ج.م`}\n\nأرجو موافاتي بالتفاصيل والتوافر 🙏`
      : `Hello SYM Egypt 👋\nI would like to inquire about this spare part:\n\n🔧 Part: ${part.name}\n📋 Internal Code: ${part.internalCode}\n🔹 External Code: ${part.externalCode1}\n🏍 Model: ${part.model}\n💰 Price: ${isUnpriced ? 'Price on Request' : `${part.price} EGP`}\n\nPlease share availability and details 🙏`;

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const [imgError, setImgError] = React.useState(false);

  return (
    <div className="
      group relative flex flex-col bg-zinc-950 border border-zinc-800
      rounded-2xl overflow-hidden transition-all duration-200
      hover:border-[#E60012]/50 hover:shadow-xl hover:shadow-[#E60012]/10
    ">
      <div className="flex flex-col gap-3.5 p-4 sm:p-5 flex-1">

        {/* Badges: Category & Inquiry Status */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-zinc-900 text-zinc-300 border border-zinc-800">
            <span>{isAr ? category.nameAr : category.nameEn}</span>
          </span>
          {isUnpriced && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-950/60 text-amber-300 border border-amber-800/60">
              <span>{isAr ? '💬 بالطلب واتساب' : '💬 WhatsApp Only'}</span>
            </span>
          )}
        </div>

        {/* Part Image or Sleek Fallback Placeholder */}
        <div className="relative w-full h-40 sm:h-44 bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center p-3 border border-zinc-800/80">
          {part.image && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={part.image}
              alt={part.name}
              className="object-contain max-h-full max-w-full transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center gap-2 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/SymLogo-S-red.png" alt="SYM Genuine Part" className="h-10 w-auto opacity-80 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                {isAr ? 'قطعة غيار SYM أصيلة' : 'Genuine SYM Part'}
              </span>
            </div>
          )}
        </div>

        {/* Part Name */}
        <h3 className="text-base font-black text-white leading-snug tracking-wide group-hover:text-[#E60012] transition-colors line-clamp-2 min-h-[2.75rem]">
          {part.name}
        </h3>

        {/* Technical Details & Price box */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 space-y-2 mt-auto">
          {part.externalCode1 && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                <Tag className="w-3 h-3 text-[#E60012] flex-shrink-0" />
                {isAr ? 'الكود الخارجي:' : 'Ext Code:'}
              </span>
              <span className="font-mono text-xs font-bold text-zinc-100 tracking-wider bg-black/40 px-2 py-0.5 rounded border border-zinc-800" title={part.externalCode1}>
                {part.externalCode1}
              </span>
            </div>
          )}

          {part.internalCode && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                <Hash className="w-3 h-3 text-[#E60012] flex-shrink-0" />
                {isAr ? 'الكود الداخلي:' : 'Int Code:'}
              </span>
              <span className="font-mono text-xs font-bold text-zinc-200 tracking-wider bg-black/40 px-2 py-0.5 rounded border border-zinc-800" title={part.internalCode}>
                {part.internalCode}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 pt-1 border-t border-zinc-800">
            <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-[#E60012]" />
            <span>{isAr ? 'قطع غيار SYM أصيلة 100%' : '100% Genuine SYM Part'}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons: Add to Cart & WhatsApp (Or WhatsApp Only if unpriced) */}
      <div className="px-4 pb-4">
        {isUnpriced ? (
          <button
            type="button"
            onClick={handleWhatsApp}
            className="
              w-full flex items-center justify-center gap-2
              bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]
              text-white font-black text-xs uppercase tracking-wider
              py-3 rounded-xl transition-all duration-200 shadow-sm
            "
          >
            <svg className="w-4 h-4 flex-shrink-0 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>{isAr ? 'استفسر عن السعر والتوافر عبر الواتساب' : 'Inquire Price via WhatsApp'}</span>
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {PURCHASING_ENABLED ? (
              <button
                type="button"
                onClick={handleAddToCart}
                className="
                  flex items-center justify-center gap-1.5
                  bg-[#E60012] hover:bg-[#C4000F] active:scale-[0.98]
                  text-white font-black text-xs uppercase tracking-wider
                  py-2.5 rounded-xl transition-all duration-200 shadow-sm
                "
              >
                <ShoppingBag className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{isAr ? 'أضف للسلة' : 'Add to Cart'}</span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                title={isAr ? 'خاصية الشراء عبر الموقع قريباً' : 'Online purchasing is coming soon'}
                className="
                  flex items-center justify-center gap-1.5
                  bg-zinc-900 text-zinc-600
                  font-black text-xs uppercase tracking-wider
                  py-2.5 rounded-xl cursor-not-allowed border border-zinc-800
                "
              >
                <ShoppingBag className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{isAr ? 'قريباً' : 'Coming Soon'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleWhatsApp}
              className="
                flex items-center justify-center gap-1.5
                bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700
                active:scale-[0.98] text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider
                py-2.5 rounded-xl transition-all duration-200
              "
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>{isAr ? 'واتساب' : 'WhatsApp'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
