"use client";

import StoreImage from "./StoreImage";
import { HARDWARE_SHOWCASE } from "@/lib/data";
import { type } from "@/lib/theme";

interface PromoBannerStripProps {
  onCategoryClick?: (cat: string) => void;
}

export default function PromoBannerStrip({ onCategoryClick }: PromoBannerStripProps) {
  const banners = [
    {
      bg: "linear-gradient(135deg, #0a255dff 0%, #1F2937 100%)",
      accent: "#9CA3AF",
      tag: "Best Seller",
      title: "Touch POS Systems",
      sub: "Fast. Reliable. Designed for Business.",
      cta: "Explore POS →",
      cat: "POS Systems",
      img: HARDWARE_SHOWCASE.img,
    },
    {
      bg: "linear-gradient(135deg, #0a255dff 0%, #203a43 50%, #2c5364 100%)",
      accent: "#60A5FA",
      tag: "New Arrivals",
      title: "Networking & Servers",
      sub: "Build a faster, stronger network.",
      cta: "Explore Now →",
      cat: "Storage",
      img: null,
    },
  ];

  return (
    <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-2">
      {banners.map((b, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onCategoryClick?.(b.cat)}
          className="group relative flex h-[150px] w-full cursor-pointer items-center justify-between overflow-hidden border-0 px-7 py-6 text-left md:h-[165px] md:px-9"
          style={{ background: b.bg }}
        >
          {/* Glow */}
          <span
            className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-20"
            style={{ background: `radial-gradient(circle, ${b.accent}, transparent 70%)` }}
          />
          {/* Bottom glow */}
          <span
            className="pointer-events-none absolute -bottom-10 left-1/4 h-32 w-32 rounded-full opacity-15"
            style={{ background: `radial-gradient(circle, ${b.accent}, transparent 70%)` }}
          />
          <div className="relative z-[1]">
            <span
              className={`mb-2 inline-block rounded-full px-2.5 py-0.5 ${type.eyebrow} text-[9px] font-bold tracking-widest`}
              style={{ background: `${b.accent}25`, color: b.accent, border: `1px solid ${b.accent}45` }}
            >
              {b.tag}
            </span>
            <div className="font-display text-[20px] font-extrabold leading-tight text-white md:text-[22px]">{b.title}</div>
            <div className="mt-1 font-label text-[12px] text-white/55">{b.sub}</div>
            <div
              className="mt-4 inline-flex items-center gap-1.5 rounded-full px-5 py-2 font-label text-[12px] font-bold transition-all group-hover:brightness-110"
              style={{ background: b.accent, color: "#0f172a" }}
            >
              {b.cta}
            </div>
          </div>
          {b.img && (
            <div className="relative z-[1] h-[110px] w-[110px] shrink-0 overflow-hidden rounded-xl opacity-75 transition-opacity group-hover:opacity-100 md:h-[130px] md:w-[130px]">
              <StoreImage src={b.img} alt={b.title} className="h-full w-full object-cover" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
