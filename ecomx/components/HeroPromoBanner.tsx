"use client";

import { PRODUCTS } from "@/lib/data";
import StoreImage from "./StoreImage";
import { type } from "@/lib/theme";

interface HeroPromoBannerProps {
  onExplore?: () => void;
}

const SHOWCASE = PRODUCTS.slice(0, 3).map((p) => ({ img: p.images[0], name: p.name }));

export default function HeroPromoBanner({ onExplore }: HeroPromoBannerProps) {
  return (
    <div className="w-full pt-5 md:pt-6">
      <div className="relative flex flex-col items-start gap-6 overflow-hidden rounded-3xl bg-primary px-6 py-8 shadow-[0_16px_44px_rgba(10,10,10,0.24)] sm:px-9 md:flex-row md:items-center md:justify-between md:px-12 md:py-10">
        {/* gold glow accents */}
        <span className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-accent)_50%,transparent),transparent_70%)]" />
        <span className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-accent)_22%,transparent),transparent_70%)]" />

        {/* Copy */}
        <div className="relative z-[1] max-w-md">
          <span className={`${type.eyebrow} inline-block rounded-full bg-accent/20 px-3 py-1 text-[10px] tracking-widest text-accent-light`}>
            New this week
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-[1.1] text-white sm:text-4xl">
            Level up with our{" "}
            <span className="bg-gradient-to-r from-accent-light via-accent to-accent-light bg-clip-text text-transparent">
              latest hardware
            </span>
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-white/70">
            Explore fresh arrivals across POS systems, printers, scanners and more — built to run your business all day.
          </p>
          <button
            type="button"
            onClick={onExplore}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 font-label text-[13px] font-bold text-primary transition-all hover:bg-accent hover:text-white"
          >
            Learn more
          </button>
        </div>

        {/* Product image collage */}
        <div className="relative z-[1] flex shrink-0 items-center justify-center self-center md:self-auto">
          {SHOWCASE.map((item, i) => (
            <div
              key={item.name}
              className={`overflow-hidden rounded-2xl border border-white/10 bg-white shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-1 ${
                i === 1
                  ? "z-[2] h-32 w-28 sm:h-40 sm:w-36"
                  : "z-[1] h-24 w-24 sm:h-32 sm:w-28"
              } ${i === 0 ? "-mr-5 -rotate-6" : ""} ${i === 2 ? "-ml-5 rotate-6" : ""}`}
            >
              <StoreImage src={item.img} alt={item.name} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
