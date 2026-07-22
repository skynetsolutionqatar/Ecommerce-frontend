/** Tailwind class strings — use theme CSS variables via @theme tokens */
export const type = {
  eyebrow: "font-label font-bold uppercase tracking-[0.14em]",
  price: "font-mono tabular-nums",
  nav: "font-label tracking-wide",
  display: "font-display",
  body: "font-sans",
  label: "font-label",
  mono: "font-mono tabular-nums",
} as const;

export const tw = {
  pageTopOffset:
    "pt-[var(--page-top)] transition-[padding-top] duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
  heroSlider:
    "min-h-[320px] sm:min-h-[340px] md:min-h-[380px] lg:min-h-[420px] xl:min-h-[460px]",
  scrollbarHide:
    "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
  scrollbarThin:
    "[&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-track]:bg-bg-soft [&::-webkit-scrollbar-thumb]:rounded-[10px] [&::-webkit-scrollbar-thumb]:bg-[color-mix(in_srgb,var(--color-accent)_40%,var(--color-border))]",
  clayButton:
    "rounded-full font-label text-white transition-all duration-300 bg-gradient-to-br from-[#111827] to-[#374151] shadow-[0_4px_16px_rgba(17,24,39,0.35)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(17,24,39,0.45)] hover:from-[#1F2937] hover:to-[#4B5563] active:translate-y-0",
  glassPanel:
    "bg-white/65 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_color-mix(in_srgb,var(--color-primary)_7%,transparent)]",
  btnPrimary:
    "inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 font-label text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 bg-gradient-to-br from-[#0a255dff] to-accent shadow-[0_4px_20px_color-mix(in_srgb,var(--color-accent)_35%,transparent)] hover:from-accent-hover hover:to-primary-light",
  btnPrimarySm:
    "inline-flex items-center justify-center gap-1 rounded-full px-3.5 py-1.5 font-label text-[10px] font-semibold text-white whitespace-nowrap transition-all duration-300 bg-gradient-to-br from-[#0a255dff] to-accent max-w-full",
  btnDark:
    "inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 font-label text-sm font-semibold text-white bg-primary transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0a255dff]",
  btnOutline:
    "inline-flex items-center gap-2 rounded-full px-7 py-3 font-label text-sm font-semibold border border-border bg-white text-primary transition-all hover:border-accent hover:text-accent hover:-translate-y-0.5",
  glassCard:
    "bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_8px_32px_color-mix(in_srgb,var(--color-primary)_8%,transparent)]",
  productGrid:
    "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-5",
  saleBadge:
    "inline-flex items-center justify-center rounded-md bg-sale px-2 py-1 font-label text-[11px] font-black leading-none text-white shadow-[0_2px_8px_color-mix(in_srgb,var(--color-sale)_45%,transparent)]",
  card:
    "rounded-2xl border border-border bg-white shadow-[0_4px_16px_color-mix(in_srgb,var(--color-primary)_6%,transparent)]",
  cardHover:
    "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_color-mix(in_srgb,var(--color-primary)_12%,transparent)]",
  warmGradient:
    "bg-gradient-to-br from-accent-hover via-accent to-primary-light",
  warmGradientH:
    "bg-gradient-to-r from-accent-hover via-accent to-primary-light",
  footer:
    "bg-footer text-white/90",
  sectionBg:
    "bg-white",
} as const;

const BADGE_BG: Record<string, string> = {
  WAREHOUSE: "bg-teal-700",
  "MOBILE POS": "bg-violet-600",
  RETAIL: "bg-cyan-600",
  SECURITY: "bg-red-600",
  POWER: "bg-orange-600",
  SOFTWARE: "bg-cyan-600",
  SURVEILLANCE: "bg-red-600",
  STORAGE: "bg-primary",
  DISPLAY: "bg-cyan-600",
  PREMIUM: "bg-yellow-700",
};

/** Tailwind bg class for product badge labels; falls back to primary-mid. */
export function badgeBgClass(badge: string): string {
  return BADGE_BG[badge] ?? "bg-primary-mid";
}

const SWATCH_BG: Record<string, string> = {
  "#1A1208": "bg-[#1A1208]",
  "#E8E4DC": "bg-[#E8E4DC]",
  "#F5F0E8": "bg-[#F5F0E8]",
  "#D1D5DB": "bg-[#D1D5DB]",
  "#111827": "bg-[#111827]",
  "#A16207": "bg-[#A16207]",
  "#F8FAFC": "bg-[#F8FAFC]",
};

/** Tailwind bg class for product/filter color swatches. */
export function swatchBgClass(hex: string): string {
  return SWATCH_BG[hex] ?? "bg-primary-mid";
}

//#0a255dff" this is the actual color , if any changes needed in color should change here

export const Colors ={
base_color  : "#0a255dff"
}