import { z } from 'zod';

/**
 * SYM Egypt Enterprise Platform - Strict Checkout Validation Schema
 * Enforces Egyptian national address standards and anti-spam verification
 */

export const checkoutCustomerSchema = z.object({
  customer_name: z
    .string()
    .min(8, 'الاسم قصير جداً، يرجى كتابة الاسم الثلاثي بالكامل')
    .refine((val) => {
      const words = val.trim().split(/\s+/).filter((w) => w.length >= 2);
      return words.length >= 3;
    }, 'يرجى كتابة الاسم ثلاثياً بالكامل (مثال: أحمد محمد عبد العزيز)')
    .refine(
      (val) => /^[\u0600-\u06FFa-zA-Z\s.'-]+$/.test(val.trim()),
      'الاسم يجب أن يحتوي على أحرف هجائية صحيحة فقط'
    ),

  customer_phone: z
    .string()
    .refine((val) => {
      const clean = val.replace(/[^0-9]/g, '');
      return /^01[0125][0-9]{8}$/.test(clean);
    }, 'رقم الموبايل غير صحيح (يجب أن يكون 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015)'),

  customer_email: z
    .string()
    .email('صيغة البريد الإلكتروني غير صحيحة (مثال: name@example.com)')
    .optional()
    .or(z.literal('')),

  street: z
    .string()
    .min(5, 'اسم الشارع قصير جداً، يرجى كتابة اسم الشارع والحي بالتفصيل')
    .refine((val) => {
      const dummy = [
        'cairo', 'القاهرة', 'شارع', 'test', 'aaa', 'asd', 'مصر', 'عنوان',
        'shubra', 'shubra el khima', 'شبرا', 'شبرا الخيمة', 'الشارع', 'شارعي'
      ];
      return !dummy.includes(val.trim().toLowerCase());
    }, 'يرجى كتابة اسم شارع وحي حقيقي بالتفصيل (مثال: شارع مصطفى النحاس - متفرع من عباس العقاد)'),

  building: z
    .string()
    .min(1, 'رقم العمارة / المبنى مطلوب بالأرقام')
    .refine((val) => {
      const trimmed = val.trim();
      const hasDigits = /[0-9\u0660-\u0669]/.test(trimmed);
      const isVillaOrTower = /^(فيلا|برج|عمارة|مبنى|قطعة|بلوك|مجاورة|villa|tower|building|block)\s+[0-9\u0660-\u0669\w]/i.test(trimmed);
      return hasDigits || isVillaOrTower;
    }, 'رقم العمارة غير صحيح، يجب أن يحتوي على رقم (مثال: 14 أو عمارة 14 أو فيلا 5)'),

  apartment: z
    .string()
    .min(1, 'رقم الشقة والدور مطلوب')
    .refine((val) => {
      const trimmed = val.trim();
      const hasDigits = /[0-9\u0660-\u0669]/.test(trimmed);
      const isGroundOrVilla = /^(أرضي|ارضي|دور ارضي|دور أرضي|ground|villa|كامل|الفيلا بالكامل|الدور بالكامل)/i.test(trimmed);
      return hasDigits || isGroundOrVilla;
    }, 'رقم الشقة والدور غير صحيح، يجب أن يحتوي على أرقام (مثال: الدور الرابع - شقة 8 أو دور أرضي)'),

  landmark: z
    .string()
    .min(3, 'العلامة المميزة مطلوبة لتسهيل وصول مندوب الشحن بدقة')
    .refine((val) => {
      const dummy = ['قريب', 'جنب', 'معروف', 'عادي', 'شارع', 'مصر', 'test', 'no', 'none'];
      return !dummy.includes(val.trim().toLowerCase());
    }, 'يرجى كتابة علامة مميزة حقيقية واضحة (مثال: بجوار صيدلية العزبي أو أمام مسجد النور)'),

  notes: z.string().optional(),
});

export type CheckoutCustomerFormData = z.infer<typeof checkoutCustomerSchema>;
