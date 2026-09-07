
/**
 * SYM Egypt Enterprise Platform — Pure Pitch Black & Red Theme Tokens
 * Matches SYM Egypt brand identity: Pitch Black (#000000), Dark Cards (#0A0A0A), SYM Official Crimson (#E60012).
 */

export const DESIGN_TOKENS = {
  colors: {
    background: {
      canvas: '#000000',      // Pure Pitch Black Base
      surface: '#0A0A0A',     // Deep Obsidian Card Fill
      overlay: '#121212',     // Modal / Dialog Fill
      subtle: '#18181B',      // Hover / Elevated Fill
    },
    border: {
      subtle: 'rgba(255, 255, 255, 0.08)',
      default: '#27272A',     // Zinc 800 Border
      strong: '#3F3F46',      // Zinc 700 Border
      brand: 'rgba(230, 0, 18, 0.50)',
    },
    brand: {
      primary: '#E60012',     // SYM Official Crimson
      primaryHover: '#C4000F',
      glow: 'rgba(230, 0, 18, 0.30)',
    },
    status: {
      success: { bg: 'rgba(34, 197, 94, 0.12)', text: '#4ADE80', border: 'rgba(34, 197, 94, 0.30)' },
      warning: { bg: 'rgba(245, 158, 11, 0.12)', text: '#FBBF24', border: 'rgba(245, 158, 11, 0.30)' },
      danger:  { bg: 'rgba(239, 68, 68, 0.12)',  text: '#F87171', border: 'rgba(239, 68, 68, 0.30)' },
      info:    { bg: 'rgba(59, 130, 246, 0.12)', text: '#60A5FA', border: 'rgba(59, 130, 246, 0.30)' },
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#A1A1AA',   // Zinc 400
      muted: '#71717A',       // Zinc 500
      onBrand: '#FFFFFF',
    },
  },
  typography: {
    display: 'text-2xl md:text-3xl font-black tracking-tight text-white',
    sectionTitle: 'text-base font-extrabold tracking-tight text-white',
    cardHeading: 'text-xs font-bold uppercase tracking-wider text-zinc-400',
    body: 'text-xs font-medium text-zinc-400',
    badge: 'text-[11px] font-bold',
  },
  radius: {
    button: 'rounded-xl',
    card: 'rounded-2xl',
    modal: 'rounded-3xl',
  },
} as const;
