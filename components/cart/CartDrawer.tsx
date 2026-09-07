'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function CartDrawer() {
  const { items, subtotal, count, isOpen, setIsOpen, updateQuantity, removeItem, clearCart } = useCart();

  const hasScooter = items.some((i) => i.item_type === 'scooter' || i.price >= 40000);
  const hasSpareParts = items.some((i) => i.item_type === 'spare_part' || i.price < 40000);
  const isSparePartsOnly = hasSpareParts && !hasScooter;
  const isMixedCart = hasScooter && hasSpareParts;

  const vatRate = 0.14;
  const vatAmount = subtotal * vatRate;
  const grandTotal = subtotal + vatAmount;

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
          {/* Header */}
          <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-[#050505]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E60012]/10 border border-[#E60012]/30 flex items-center justify-center text-[#E60012]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">سلة التسوق</h3>
                <p className="text-xs text-zinc-400">({count}) منتجات في السلة</p>
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

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 space-y-4 py-12">
                <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-300 font-medium">سلة التسوق فارغة حالياً</p>
                  <p className="text-xs text-zinc-500 max-w-xs">قم بتصفح السكوترز وقطع الغيار واختيار ما يناسبك للشراء</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-2 px-6 py-2.5 bg-[#E60012] hover:bg-[#C4000F] text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(230,0,18,0.3)]"
                >
                  تصفح المنتجات
                </button>
              </div>
            ) : (
              items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl flex gap-3.5 items-center relative group"
                >
                  {/* Image */}
                  <div className="relative w-20 h-20 bg-zinc-950 rounded-xl border border-zinc-800/50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <Image
                      src={item.image || '/Husky ADV.png'}
                      alt={item.product_name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <h4 className="text-sm font-bold text-zinc-100 truncate">{item.product_name}</h4>
                    <p className="text-xs font-semibold text-[#E60012]">
                      {item.price.toLocaleString('ar-EG')} ج.م
                    </p>
                    {item.item_type === 'spare_part' && (
                      <p className="text-[9px] text-zinc-500">الحد الأقصى قطعتان (2) لكل عميل</p>
                    )}

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <span className="w-8 text-center text-xs font-bold text-white">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          disabled={item.item_type === 'spare_part' && item.quantity >= 2}
                          className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                        title="حذف من السلة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-5 border-t border-zinc-800/80 bg-[#050505] space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-zinc-400">
                  <span>المجموع الفرعي للمنتجات:</span>
                  <span className="font-semibold text-zinc-200">{subtotal.toLocaleString('ar-EG')} ج.م</span>
                </div>
                {isSparePartsOnly ? (
                  <>
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>تكلفة وطريقة الشحن:</span>
                      <span className="font-bold text-amber-400 text-end">
                        تُحدد وتنسق عبر الواتساب <span className="block text-[10px] text-zinc-400 font-normal">(تواصل مباشر فور تأكيد الدفع)</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                      <span>طريقة الدفع:</span>
                      <span className="font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-md">
                        بوابة فوري Fawry Pay & البطاقات البنكية
                      </span>
                    </div>
                  </>
                ) : isMixedCart ? (
                  <>
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>شحن السكوتر / البايك:</span>
                      <span className="font-bold text-emerald-400">مجاناً 🎉</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>شحن قطع الغيار:</span>
                      <span className="font-bold text-sky-400 text-end">
                        تُحدد عبر خدمة العملاء
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>موعد التسليم:</span>
                      <span className="font-bold text-[#E60012] bg-[#E60012]/10 border border-[#E60012]/30 px-2 py-0.5 rounded-md">
                        خلال 72 ساعة من تأكيد الطلب ⚡
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                      <span>طريقة الدفع:</span>
                      <span className="font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-md">
                        بوابة فوري Fawry Pay & البطاقات البنكية
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>شحن السكوتر / البايك:</span>
                      <span className="font-bold text-emerald-400">مجاناً 🎉</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>موعد التسليم:</span>
                      <span className="font-bold text-[#E60012] bg-[#E60012]/10 border border-[#E60012]/30 px-2 py-0.5 rounded-md">
                        خلال 72 ساعة من تأكيد الطلب ⚡
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                      <span>طريقة الدفع:</span>
                      <span className="font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-md">
                        بوابة فوري Fawry Pay & البطاقات البنكية
                      </span>
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>ضريبة القيمة المضافة (14%):</span>
                  <span className="font-semibold text-zinc-200">{vatAmount.toLocaleString('ar-EG', { maximumFractionDigits: 0 })} ج.م</span>
                </div>
                <div className="border-t border-zinc-800/60 pt-2 flex items-center justify-between text-base font-bold text-white">
                  <span>الإجمالي (شامل الضريبة):</span>
                  <span className="text-lg text-[#E60012]">{grandTotal.toLocaleString('ar-EG', { maximumFractionDigits: 0 })} ج.م</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 bg-zinc-900/60 border border-zinc-800/50 p-2.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  ضمان الوكيل الرسمي المعتمد SYM مصر — السداد إلكترونياً بأمان عبر بوابة فوري، البطاقات البنكية والمحافظ.
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2 pt-1">
                <button
                  onClick={clearCart}
                  className="col-span-1 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold rounded-xl flex items-center justify-center transition-colors"
                  title="تفريغ السلة"
                >
                  إلغاء
                </button>

                <Link
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="col-span-4 bg-[#E60012] hover:bg-[#C4000F] text-white py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(230,0,18,0.4)] text-sm"
                >
                  <span>إتمام طلب الشراء</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
