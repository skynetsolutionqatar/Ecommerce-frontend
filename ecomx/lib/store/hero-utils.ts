import type { HeroSlide } from "@/types/storefront.types";
import { HERO_SLIDER_SLIDES } from "@/lib/data";
import { getHeroBannerImage, HERO_BANNER_KINDS } from "@/lib/images";

export type HeroAccent = {
  color: string;
  soft: string;
  dark: string;
  glow: string;
  neon: string;
  mesh1: string;
  mesh2: string;
  mesh3: string;
  gradient: string;
  gradientBold: string;
};

export const HERO_ACCENTS: HeroAccent[] = [
  {
    color: "#111827",
    soft: "#E5E7EB",
    dark: "#030712",
    glow: "rgba(17,24,39,0.35)",
    neon: "#3b82f6",
    mesh1: "rgba(59,130,246,0.22)",
    mesh2: "rgba(17,24,39,0.18)",
    mesh3: "rgba(99,102,241,0.16)",
    gradient: "linear-gradient(135deg, #111827 0%, #2563eb 100%)",
    gradientBold: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 40%, #6366f1 100%)",
  },
  {
    color: "#0891b2",
    soft: "#cffafe",
    dark: "#0e7490",
    glow: "rgba(6,182,212,0.40)",
    neon: "#22d3ee",
    mesh1: "rgba(6,182,212,0.24)",
    mesh2: "rgba(8,145,178,0.20)",
    mesh3: "rgba(34,211,238,0.18)",
    gradient: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
    gradientBold: "linear-gradient(135deg, #0e7490 0%, #06b6d4 50%, #22d3ee 100%)",
  },
  {
    color: "#1F2937",
    soft: "#F3F4F6",
    dark: "#111827",
    glow: "rgba(71,85,105,0.35)",
    neon: "#94a3b8",
    mesh1: "rgba(71,85,105,0.20)",
    mesh2: "rgba(100,116,139,0.18)",
    mesh3: "rgba(148,163,184,0.14)",
    gradient: "linear-gradient(135deg, #1F2937 0%, #64748b 100%)",
    gradientBold: "linear-gradient(135deg, #0f172a 0%, #475569 50%, #94a3b8 100%)",
  },
  {
    color: "#7c3aed",
    soft: "#ede9fe",
    dark: "#4c1d95",
    glow: "rgba(124,58,237,0.40)",
    neon: "#a78bfa",
    mesh1: "rgba(124,58,237,0.24)",
    mesh2: "rgba(167,139,250,0.20)",
    mesh3: "rgba(192,132,252,0.16)",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
    gradientBold: "linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #c084fc 100%)",
  },
];

export type EyebrowBadgeStyle = {
  bg: string;
  color: string;
  border: string;
  dot: string;
};

export function getEyebrowBadgeStyle(eyebrow: string, fallback: HeroAccent): EyebrowBadgeStyle {
  const text = eyebrow.toUpperCase();

  if (text.includes("SALE") || text.includes("FLASH") || text.includes("MEGA") || text.includes("OFF")) {
    return { bg: "rgba(239,68,68,0.15)", color: "#dc2626", border: "rgba(239,68,68,0.45)", dot: "#ef4444" };
  }
  if (text.includes("BEST") || text.includes("SELLER") || text.includes("TOP PICK")) {
    return { bg: "rgba(37,99,235,0.12)", color: "#1d4ed8", border: "rgba(37,99,235,0.45)", dot: "#2563eb" };
  }
  if (text.includes("THERMAL") || text.includes("PRINTER") || text.includes("BARCODE")) {
    return { bg: "rgba(6,182,212,0.12)", color: "#0891b2", border: "rgba(6,182,212,0.45)", dot: "#06b6d4" };
  }
  if (text.includes("FEATURED") || text.includes("NEW")) {
    return { bg: "rgba(124,58,237,0.12)", color: "#7c3aed", border: "rgba(124,58,237,0.45)", dot: "#8b5cf6" };
  }
  return { bg: `${fallback.color}18`, color: fallback.dark, border: `${fallback.color}55`, dot: fallback.neon };
}

export function getSlideAccent(slideIndex: number, slideKind?: HeroSlide["slideKind"]): HeroAccent {
  const kindIndex =
    slideKind === "pos" ? 0 : slideKind === "thermal" ? 1 : slideKind === "barcode" ? 2 : slideKind === "printer" ? 3 : slideIndex;
  return HERO_ACCENTS[kindIndex % HERO_ACCENTS.length];
}

/** Base surface tint — layered under animated mesh orbs in HeroSection. */
export function getHeroSurfaceStyle(accent: HeroAccent) {
  return {
    backgroundColor: "#f8fafc",
    backgroundImage: [
      `radial-gradient(ellipse 80% 60% at 20% 20%, ${accent.mesh1} 0%, transparent 55%)`,
      `radial-gradient(ellipse 70% 50% at 85% 75%, ${accent.mesh2} 0%, transparent 50%)`,
      `radial-gradient(circle at 50% 50%, ${accent.mesh3} 0%, transparent 42%)`,
      `radial-gradient(circle, ${accent.color}0d 1px, transparent 1px)`,
    ].join(", "),
    backgroundSize: "100% 100%, 100% 100%, 100% 100%, 28px 28px",
  };
}

/** Floating orb configs — kept to two large orbs for smoother GPU compositing. */
export function getHeroMeshOrbs(accent: HeroAccent) {
  return [
    { color: accent.mesh1, size: "min(55vw, 420px)", x: "-8%", y: "-12%", duration: 16, depth: 1 },
    { color: accent.mesh2, size: "min(48vw, 360px)", x: "72%", y: "58%", duration: 20, depth: -0.6 },
  ] as const;
}

/** Rotating aurora sweep layered above the mesh orbs. */
export function getHeroAuroraGradient(accent: HeroAccent) {
  return `conic-gradient(from 180deg at 50% 50%, transparent 0deg, ${accent.mesh1} 60deg, transparent 130deg, ${accent.mesh3} 210deg, transparent 280deg, ${accent.mesh2} 330deg, transparent 360deg)`;
}

/** Light sweep that travels around the container edge. */
export function getHeroBeamGradient(accent: HeroAccent) {
  return `conic-gradient(from 0deg, transparent 0%, ${accent.neon} 8%, ${accent.color} 15%, transparent 26%, transparent 100%)`;
}

/** Film-grain overlay — softens gradient banding on large blurred surfaces. */
export const HERO_NOISE_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E\")";

export const HERO_SLIDE_LABELS = ["POS", "Thermal", "Barcode", "Printer"] as const;

export function glassPanel(accent: HeroAccent, opacity = 0.88) {
  return {
    background: `linear-gradient(145deg, rgba(255,255,255,${opacity}) 0%, rgba(255,255,255,${Math.min(opacity + 0.04, 0.98)}) 100%)`,
    backdropFilter: "blur(20px) saturate(160%)",
    WebkitBackdropFilter: "blur(20px) saturate(160%)",
    border: "1px solid rgba(255,255,255,0.92)",
    boxShadow: [
      `0 0 0 1px ${accent.color}10`,
      "0 8px 24px rgba(15,23,42,0.07)",
      "inset 0 1px 0 rgba(255,255,255,1)",
    ].join(", "),
  };
}

export function neonCardBorder(accent: HeroAccent) {
  return {
    background: `linear-gradient(135deg, ${accent.neon}45 0%, ${accent.color}25 100%)`,
    padding: 1.5,
    borderRadius: 24,
    boxShadow: "0 4px 16px rgba(15,23,42,0.06)",
  };
}

export function claySurface(accent: HeroAccent) {
  return {
    background: `linear-gradient(160deg, #ffffff 0%, ${accent.soft} 55%, ${accent.neon}20 100%)`,
    boxShadow: [
      `0 0 0 3px rgba(255,255,255,0.9)`,
      `0 0 40px ${accent.neon}35`,
      `0 20px 50px ${accent.glow}`,
      "inset 0 4px 12px rgba(255,255,255,0.95)",
      "inset 0 -6px 16px rgba(15,23,42,0.06)",
    ].join(", "),
    border: `2px solid ${accent.neon}30`,
  };
}

export function neoButton(active = false) {
  return active
    ? {
        background: "linear-gradient(145deg, #ffffff, #e2e8f0)",
        boxShadow: "inset 4px 4px 8px rgba(15,23,42,0.1), inset -3px -3px 6px rgba(255,255,255,1)",
        border: "1px solid rgba(148,163,184,0.3)",
      }
    : {
        background: "linear-gradient(145deg, #ffffff, #eef2f7)",
        boxShadow: "5px 5px 14px rgba(15,23,42,0.1), -4px -4px 10px rgba(255,255,255,1), inset 0 1px 0 rgba(255,255,255,0.9)",
        border: "1px solid rgba(255,255,255,0.9)",
      };
}

/**
 * Centered hero image frame. Below `sm` the slide stacks vertically, so the
 * frame flexes into whatever height is left; from `sm` up it is a fixed size
 * because the copy overlays it instead of sitting above it.
 */
export const HERO_IMAGE_INNER =
  "relative flex h-full w-full items-center justify-center";

export const HERO_SLIDE_MIN_H =
  "min-h-[252px] sm:min-h-[320px] md:min-h-[350px] lg:min-h-[380px]";

/** Compact product image frame on stacked (mobile) hero layout. */
export const HERO_MOBILE_IMAGE_FRAME =
  "h-[88px] w-full max-w-[132px] sm:h-[72%] sm:max-w-[260px] md:max-w-[300px] lg:max-w-[340px] xl:max-w-[360px]";

export const HERO_MOBILE_IMAGE_AREA =
  "min-h-[96px] h-[96px] sm:absolute sm:inset-0 sm:mt-0 sm:min-h-0 sm:h-auto";

import { productImageClass } from "./product-image-utils";

/** Hero image sizing — explicit mobile height; desktop fills the right column frame. */
export function getHeroImageClass(): string {
  return "h-full w-auto max-h-full max-w-full object-contain object-center";
}

/** Hero image frame — no multiply here (transform + nested multiply breaks backdrop blending). */
export function getHeroImageWrapClass(): string {
  return "relative flex h-full w-full items-center justify-center";
}

export function formatHeroTitle(title: string, maxSingleLine = 22): string {
  const trimmed = title.trim();
  if (!trimmed) return "";
  if (trimmed.includes("\n")) return trimmed;
  if (trimmed.length <= maxSingleLine) return trimmed;
  const words = trimmed.split(/\s+/);
  if (words.length < 2) {
    const mid = Math.ceil(trimmed.length / 2);
    return `${trimmed.slice(0, mid)}\n${trimmed.slice(mid)}`;
  }
  const target = Math.ceil(trimmed.length / 2);
  let first = "";
  let splitAt = 0;
  for (let i = 0; i < words.length; i++) {
    const next = first ? `${first} ${words[i]}` : words[i];
    if (next.length > target && i > 0) break;
    first = next;
    splitAt = i + 1;
  }
  if (splitAt <= 0 || splitAt >= words.length) splitAt = Math.ceil(words.length / 2);
  return `${words.slice(0, splitAt).join(" ")}\n${words.slice(splitAt).join(" ")}`;
}

export const FEATURED_POS_HERO = {
  eyebrow: "BEST SELLER",
  title: "BoxPos Extreme\nWindows POS",
  sub: "Intel® Core i5 · 15″ touch · 8GB · 128GB SSD. Ultra-slim Windows POS for retail billing.",
  note: "*3-year onsite warranty · Free installation in Qatar",
  cta: "Shop Now",
  img: getHeroBannerImage("pos"),
} as const;

function pickApiSlide(apiSlides: HeroSlide[], kind: HeroSlide["slideKind"], index: number) {
  const byKind = apiSlides.find((s) => s.slideKind === kind);
  if (byKind) return byKind;
  if (kind === "pos") {
    return (
      apiSlides.find((s) => /boxpos/i.test(s.title) || /boxpos/i.test(s.slug ?? "")) ??
      apiSlides.find((s) => s.slideKind === "pos") ??
      apiSlides[index]
    );
  }
  return apiSlides[index] ?? null;
}

export function buildHeroSlides(apiSlides: HeroSlide[]): HeroSlide[] {
  return HERO_BANNER_KINDS.map((kind, i) => {
    const fallback = HERO_SLIDER_SLIDES[i];
    const api = pickApiSlide(apiSlides, kind, i);
    const posContent = kind === "pos" ? FEATURED_POS_HERO : null;
    return {
      id: i + 1,
      slideKind: kind,
      img: getHeroBannerImage(kind, i),
      eyebrow: posContent?.eyebrow ?? (api?.eyebrow?.trim() || fallback.eyebrow),
      title: posContent?.title ?? (api?.title?.trim() || fallback.title),
      sub: posContent?.sub ?? (api?.sub?.trim() || fallback.sub),
      note: posContent?.note ?? (api?.note?.trim() || fallback.note),
      cta: posContent?.cta ?? (api?.cta?.trim() || fallback.cta),
      price: api?.price,
      compareAtPrice: api?.compareAtPrice,
      discount: api?.discount,
      slug: api?.slug,
      productId: api?.productId,
    };
  });
}

export const mergeHeroSlides = buildHeroSlides;

/** Trust pills on hero — matches store.skynetqatar.com */
export const HERO_TRUST_BADGES = [
  { icon: "⚡", title: "Express Delivery", sub: "Fast & Reliable" },
  { icon: "🛡️", title: "Official Warranty", sub: "Brand Warranty Products" },
] as const;

export const AUTO_MS = 5500;
export const HERO_SLIDE_COUNT = 4;
