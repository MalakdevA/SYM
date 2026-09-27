'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Plus, Minus, Trash2, ShieldCheck, AlertCircle, Package, Bike } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const WA_NUMBER = '201279881123';

/* ─────────────────────────────────────────────────────────────────────────────
   Professional WhatsApp order message — groups scooters & spare parts,
   includes all per-item detail fields (codes, model, capacity, shipping)
   ───────────────────────────────────────────────────────────────────────────── */
const divider = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

function buildWhatsAppMessage(
  items: {
    product_name: string;
    quantity: number;
    price: number;
    item_type?: string;
    meta?: { capacity?: string; internalCode?: string; externalCode?: string; model?: string };
  }[],
  subtotal: number,
): string {
  const isScooter = (i: typeof items[0]) =>
    i.item_type === 'scooter' || (i.item_type !== 'spare_part' && i.price >= 40000);

  const scooterItems = items.filter(isScooter);
  const spareItems   = items.filter((i) => !isScooter(i));

  const fmtPrice = (item: { price: number; quantity: number }) => {
    if (item.price <= 0) return 'بالتفاوض';
    const unit  = item.price.toLocaleString('ar-EG');
    const total = (item.price * item.quantity).toLocaleString('ar-EG');
    return item.quantity > 1
      ? `${unit} ج.م × ${item.quantity} = *${total} ج.م*`
      : `*${unit} ج.م*`;
  };

  const scooterLines = scooterItems.map((item, i) => {
    const lines = [
      `🛵 *${i + 1}. ${item.product_name}*`,
      `   💰 السعر: ${fmtPrice(item)}`,
      `   📦 الكمية: ${item.quantity} وحدة`,
    ];
    if (item.meta?.capacity) lines.push(`   🔩 المحرك: ${item.meta.capacity}`);
    lines.push(`   🚚 الشحن: يُحدد ويُنسّق مع خدمة العملاء`);
    return lines.join('\n');
  }).join('\n\n');

  const spareLines = spareItems.map((item, i) => {
    const lines = [
      `🔧 *${i + 1}. ${item.product_name}*`,
      `   💰 السعر: ${fmtPrice(item)}`,
      `   📦 الكمية: ${item.quantity} قطعة`,
    ];
    if (item.meta?.internalCode) lines.push(`   📋 الكود الداخلي: ${item.meta.internalCode}`);
    if (item.meta?.externalCode) lines.push(`   🔹 الكود الخارجي: ${item.meta.externalCode}`);
    if (item.meta?.model)        lines.push(`   🏍️ الموديل المتوافق: ${item.meta.model}`);
    lines.push(`   🚚 الشحن: يُحدد ويُنسّق مع خدمة العملاء`);
    lines.push(`   ✅ قطعة غيار SYM أصيلة 100%`);
    return lines.join('\n');
  }).join('\n\n');

  const sections: string[] = [];
  if (scooterItems.length > 0)
    sections.push(`🏍️ *السكوترز / الدراجات (${scooterItems.length})*\n${divider}\n${scooterLines}`);
  if (spareItems.length > 0)
    sections.push(`🔧 *قطع الغيار (${spareItems.length})*\n${divider}\n${spareLines}`);

  const totalLine =
    subtotal > 0
      ? `\n\n${divider}\n💰 *الإجمالي التقريبي: ${subtotal.toLocaleString('ar-EG')} ج.م*`
      : `\n\n${divider}\n💬 *الأسعار تُحدد عبر الواتساب حسب الطلب*`;

  return (
    `*مرحباً SYM مصر 👋*\n` +
    `أريد تأكيد طلب المنتجات التالية من موقعكم الرسمي:\n\n` +
    sections.join('\n\n') +
    totalLine +
    `\n\n${divider}\n` +
    `✅ أرجو التواصل معايا لتأكيد التوافر وتفاصيل الشحن والأسعار النهائية وترتيب التسليم.\n` +
    `📍 *الوكيل الرسمي المعتمد — SYM مصر*`
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CartDrawer Component
   ───────────────────────────────────────────────────────────────────────────── */
export function CartDrawer() {
  const { items, subtotal, count, isOpen, setIsOpen, updateQuantity, removeItem, clearCart } =
    useCart();

  const isScooterItem = (i: typeof items[0]) =>
    i.item_type === 'scooter' || (i.item_type !== 'spare_part' && i.price >= 40000);

  const hasSpareParts = items.some((i) => !isScooterItem(i));

  const scooterItems = items.filter(isScooterItem);
  const spareItems   = items.filter((i) => !isScooterItem(i));

  const handleWhatsAppOrder = () => {
    const msg = buildWhatsAppMessage(items, subtotal);
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md bg-[#0A0A0A] border-r border-zinc-800 text-white h-full flex flex-col shadow-2xl z-10"
          dir="rtl"
        >
          {/* ── Header ── */}
          <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-[#050505]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E60012]/10 border border-[#E60012]/30 flex items-center justify-center text-[#E60012]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">سلة التسوق</h3>
                <p className="text-xs text-zinc-400">
                  {count === 0 ? 'السلة فارغة' : `${count} ${count === 1 ? 'منتج' : 'منتجات'} في السلة`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/60 transition-colors"
              aria-label="إغلاق السلة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Items List ── */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 space-y-4 py-12">
                <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-300 font-medium">سلة التسوق فارغة حالياً</p>
                  <p className="text-xs text-zinc-500 max-w-xs">تصفح السكوترز وقطع الغيار واختر ما يناسبك</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-2 px-6 py-2.5 bg-[#E60012] hover:bg-[#C4000F] text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(230,0,18,0.3)]"
                >
                  تصفح المنتجات
                </button>
              </div>
            ) : (
              <>
                {/* Scooters section */}
                {scooterItems.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                      <Bike className="w-3.5 h-3.5 text-[#E60012]" />
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        السكوترز والدراجات
                      </span>
                    </div>
                    {scooterItems.map((item) => (
                      <CartItemRow key={item.id} item={item} updateQuantity={updateQuantity} removeItem={removeItem} />
                    ))}
                  </div>
                )}

                {/* Spare Parts section */}
                {spareItems.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-1 mt-1">
                      <Package className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        قطع الغيار
                      </span>
                      <span className="text-[9px] font-black text-amber-400 bg-amber-900/30 border border-amber-800/50 px-1.5 py-0.5 rounded-full">
                        حد أقصى 2 لكل صنف
                      </span>
                    </div>
                    {spareItems.map((item) => (
                      <CartItemRow key={item.id} item={item} updateQuantity={updateQuantity} removeItem={removeItem} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Footer ── */}
          {items.length > 0 && (
            <div className="p-5 border-t border-zinc-800/80 bg-[#050505] space-y-3.5">
              {/* Summary */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">المجموع التقريبي</span>
                  <span className="font-bold text-white text-base">
                    {subtotal > 0 ? `${subtotal.toLocaleString('ar-EG')} ج.م` : 'يُحدد عبر الواتساب'}
                  </span>
                </div>
              </div>

              {/* WhatsApp notice */}
              <div className="flex items-start gap-2.5 text-[11px] text-zinc-400 bg-emerald-900/20 border border-emerald-800/40 p-3 rounded-xl">
                <WhatsAppSVG className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" />
                <span>
                  سيتم إرسال طلبك عبر الواتساب مع كافة التفاصيل — وسيتواصل معك فريق خدمة العملاء
                  لتأكيد التوافر وتفاصيل الشحن والسعر النهائي وترتيب التسليم.
                </span>
              </div>

              {/* Spare parts limit notice */}
              {hasSpareParts && (
                <div className="flex items-start gap-2 text-[11px] text-amber-300 bg-amber-900/20 border border-amber-800/40 p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    قطع الغيار: الحد الأقصى <strong>2 قطعة لكل صنف</strong> لضمان التوافر للجميع
                    ومنع الشراء بالجملة.
                  </span>
                </div>
              )}

              {/* Trust badge */}
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 bg-zinc-900/60 border border-zinc-800/50 p-2.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>الوكيل الرسمي المعتمد SYM مصر — ضمان سنتين على جميع المنتجات</span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-5 gap-2 pt-1">
                <button
                  onClick={clearCart}
                  className="col-span-1 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold rounded-xl flex items-center justify-center transition-colors py-3"
                  title="تفريغ السلة"
                >
                  مسح
                </button>

                <button
                  onClick={handleWhatsAppOrder}
                  className="col-span-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(34,197,94,0.35)] text-sm"
                >
                  <WhatsAppSVG className="w-5 h-5 flex-shrink-0" />
                  <span>اطلب عبر الواتساب الآن</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CartItemRow — single item card inside the drawer
   ───────────────────────────────────────────────────────────────────────────── */
interface CartItemRowProps {
  item: {
    id: string;
    product_id: string;
    product_name: string;
    price: number;
    quantity: number;
    image: string;
    item_type?: 'scooter' | 'spare_part';
  };
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
}

function CartItemRow({ item, updateQuantity, removeItem }: CartItemRowProps) {
  const isSparePart =
    item.item_type === 'spare_part' || (item.item_type !== 'scooter' && item.price < 40000);
  const atLimit = isSparePart && item.quantity >= 2;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl flex gap-3 items-center"
    >
      {/* Image */}
      <div className="relative w-16 h-16 bg-zinc-950 rounded-xl border border-zinc-800/50 overflow-hidden flex-shrink-0">
        <Image src={item.image || '/Husky ADV.png'} alt={item.product_name} fill className="object-contain p-1" />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 space-y-1">
        <h4 className="text-xs font-bold text-zinc-100 leading-snug line-clamp-2">{item.product_name}</h4>
        <p className="text-xs font-semibold text-[#E60012]">
          {item.price > 0 ? `${item.price.toLocaleString('ar-EG')} ج.م` : 'السعر بالتفاوض'}
        </p>
        {atLimit && (
          <p className="text-[9px] text-amber-400 font-bold flex items-center gap-1">
            <AlertCircle className="w-2.5 h-2.5" />
            وصلت الحد الأقصى (2 قطعة)
          </p>
        )}

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 pt-0.5">
          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
              className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
              aria-label="تقليل الكمية"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-7 text-center text-xs font-bold text-white">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
              disabled={atLimit}
              className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              title={atLimit ? 'الحد الأقصى 2 قطعة لكل صنف' : undefined}
              aria-label="زيادة الكمية"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {item.price > 0 && item.quantity > 1 && (
            <span className="text-[10px] text-zinc-500 font-medium">
              = {(item.price * item.quantity).toLocaleString('ar-EG')} ج.م
            </span>
          )}

          <button
            onClick={() => removeItem(item.product_id)}
            className="mr-auto text-zinc-600 hover:text-red-400 transition-colors p-1 rounded"
            title="حذف من السلة"
            aria-label="حذف المنتج"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   WhatsApp SVG icon
   ───────────────────────────────────────────────────────────────────────────── */
function WhatsAppSVG({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
