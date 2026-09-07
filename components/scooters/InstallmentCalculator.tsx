'use client';

import React, { useState } from 'react';
import { Calculator, ShieldCheck, Building2, Sparkles, ArrowRight } from 'lucide-react';
import { ProductItem } from '@/lib/data/products';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

interface InstallmentCalculatorProps {
  products: ProductItem[];
}

export function InstallmentCalculator({ products }: InstallmentCalculatorProps) {
  const { dir, t, language } = useLanguage();
  const isAr = language === 'ar';
  const [selectedScooterId, setSelectedScooterId] = useState<string>(products[0]?.id || 'husky-adv');
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(30);
  const [months, setMonths] = useState<number>(12) ;

  const selectedScooter = products.find((p) => p.id === selectedScooterId) || products[0];
  const scooterPrice = selectedScooter ? selectedScooter.price : 85000;

  const downPaymentAmount = (scooterPrice * downPaymentPercent) / 100;
  const remainingAmount = scooterPrice - downPaymentAmount;
  
  // Financing interest calculation (~14% annual interest rate)
  const annualInterestRate = 0.14;
  const totalInterest = remainingAmount * (annualInterestRate * (months / 12));
  const totalFinancedAmount = remainingAmount + totalInterest;
  const monthlyPayment = totalFinancedAmount / months;

  const getWhatsappMsg = () => {
    if (isAr) {
      return `مرحباً، قمت بحساب قسط سكوتر ${selectedScooter.name} بمقدم ${downPaymentPercent}% (${Math.round(downPaymentAmount).toLocaleString('en-US')} جنيه) على مدار ${months} شهراً.`;
    }
    return `Hello, I calculated an installment plan for ${selectedScooter.name} with ${downPaymentPercent}% down payment (${Math.round(downPaymentAmount)} EGP) over ${months} months.`;
  };

  return (
    <div className="bg-[#09090B] border border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6 text-start select-none" dir={dir}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-[#E60012]/10 text-[#E60012] border border-[#E60012]/30">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight">
            {t('compare.calcTitle', 'Interactive Financing & Installment Calculator')}
          </h3>
          <p className="text-xs text-zinc-400">
            {t('compare.calcSubtitle', 'Calculate instant monthly payment estimates with approved banking partners in Egypt')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        {/* Controls */}
        <div className="space-y-5 bg-zinc-950 p-5 rounded-2xl border border-zinc-800/80">
          {/* Scooter Selector */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
              {t('compare.selectScooter', 'Select Scooter Model:')}
            </label>
            <select
              value={selectedScooterId}
              onChange={(e) => setSelectedScooterId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-white focus:outline-none focus:border-[#E60012]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatPrice(p.price)}
                </option>
              ))}
            </select>
          </div>

          {/* Down payment slider */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-zinc-300 uppercase tracking-wider">{t('compare.downPaymentRatio', 'Down Payment Ratio:')}</span>
              <span className="text-[#E60012] font-mono">{downPaymentPercent}% ({formatPrice(Math.round(downPaymentAmount))})</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full accent-[#E60012]"
            />
          </div>

          {/* Months selector */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
              {t('compare.duration', 'Financing Duration:')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[6, 12, 24, 36].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMonths(m)}
                  className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                    months === m
                      ? 'bg-[#E60012] text-white shadow-md shadow-[#E60012]/30'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {m} {t('compare.months', 'Months')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calculation Result Card */}
        <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl space-y-4 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-black uppercase tracking-wider">
            {t('compare.instantEstimate', 'INSTANT ESTIMATE')}
          </span>

          <div className="space-y-1">
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">{t('compare.monthlyEst', 'Estimated Monthly Payment')}</p>
            <p className="text-4xl font-black text-white font-mono">
              {formatPrice(Math.round(monthlyPayment))} <span className="text-xs font-bold text-zinc-400">{t('compare.monthlyPer', '/ mo')}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-zinc-800/80">
            <div className="text-start space-y-0.5">
              <span className="text-zinc-500 text-[10px] uppercase font-bold">{t('compare.downPayment', 'Down Payment:')}</span>
              <p className="font-bold text-white font-mono">{formatPrice(Math.round(downPaymentAmount))}</p>
            </div>
            <div className="text-end space-y-0.5">
              <span className="text-zinc-500 text-[10px] uppercase font-bold">{t('compare.duration', 'Duration:')}</span>
              <p className="font-bold text-[#E60012]">{months} {t('compare.plan', 'Months Plan')}</p>
            </div>
          </div>

          <a
            href={`https://wa.me/201271384149?text=${encodeURIComponent(getWhatsappMsg())}`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3.5 rounded-xl bg-[#E60012] hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#E60012]/30 flex items-center justify-center gap-2"
          >
            <span>{t('compare.submitRequest', 'Submit Financing Request')}</span>
            <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          </a>
        </div>
      </div>
    </div>
  );
}
