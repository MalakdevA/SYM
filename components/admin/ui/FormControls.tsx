'use client';

import React, { forwardRef } from 'react';
import type { LucideIcon } from 'lucide-react';

const baseFieldClass =
  'w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border text-sm text-white placeholder-slate-600 transition-colors focus:outline-none overflow-hidden text-ellipsis';

// A plain focused field must never look like an error — error uses the rose accent at every
// state (resting + focused); a normal, valid field's focus ring is a neutral white, never rose,
// so the two states can't be confused for one another.
function fieldBorder(error?: string) {
  return error ? 'border-[#E11D48]/60 focus:border-[#E11D48]' : 'border-white/10 focus:border-white/30';
}

interface FieldChromeProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

function FieldChrome({ label, error, hint, required, children }: FieldChromeProps) {
  return (
    <div>
      {label && (
        <label className="block text-[11px] font-extrabold text-slate-400 mb-1.5">
          {label} {required && <span className="text-[#E11D48]">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <span className="block mt-1 text-[11px] font-bold text-[#E11D48]">{error}</span>
      ) : hint ? (
        <span className="block mt-1 text-[10px] text-slate-500">{hint}</span>
      ) : null}
    </div>
  );
}

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, hint, icon: Icon, className = '', required, ...rest }, ref) => (
    <FieldChrome label={label} error={error} hint={hint} required={required}>
      {/* Icon always sits on the physical left, for every field regardless of its own `dir` —
          the input's left padding is reserved to match, so an LTR field's text (phone numbers,
          SKUs) starts just to the right of the icon instead of underneath it. */}
      <div className="relative">
        {Icon && <Icon className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-slate-500 pointer-events-none" />}
        <input
          ref={ref}
          required={required}
          className={`${baseFieldClass} ${fieldBorder(error)} ${Icon ? 'pl-9' : ''} ${rest.dir === 'ltr' ? 'text-right' : ''} ${className}`}
          {...rest}
        />
      </div>
    </FieldChrome>
  )
);
TextField.displayName = 'TextField';

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, hint, className = '', required, rows = 3, ...rest }, ref) => (
    <FieldChrome label={label} error={error} hint={hint} required={required}>
      <textarea ref={ref} required={required} rows={rows} className={`${baseFieldClass} ${fieldBorder(error)} resize-none ${className}`} {...rest} />
    </FieldChrome>
  )
);
TextareaField.displayName = 'TextareaField';

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, hint, options, className = '', required, ...rest }, ref) => (
    <FieldChrome label={label} error={error} hint={hint} required={required}>
      <select ref={ref} required={required} className={`${baseFieldClass} ${fieldBorder(error)} ${className}`} {...rest}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldChrome>
  )
);
SelectField.displayName = 'SelectField';

interface ToggleFieldProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  icon?: LucideIcon;
}

export function ToggleField({ label, checked, onChange, icon: Icon }: ToggleFieldProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
        checked ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-[#0F172A] border-white/10 text-slate-500'
      }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </button>
  );
}
