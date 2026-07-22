"use client";

import { HARDWARE_SHOWCASE } from "@/lib/data";
import StoreImage from "./StoreImage";
import * as Icons from "./Icons";
import { type } from "@/lib/theme";

interface HardwarePromoBannerProps {
  onCategoryClick?: (category: string) => void;
}

export default function HardwarePromoBanner({ onCategoryClick }: HardwarePromoBannerProps) {
  const { eyebrow, title, description, img, shopCategory, cta, offer, price, oldPrice } =
    HARDWARE_SHOWCASE;

  return (
    <section className="w-full pb-10 md:pb-12">
      <div className="w-full">
        <div className="relative grid grid-cols-1 overflow-hidden rounded-3xl border border-border bg-bg-soft shadow-[0_10px_40px_rgba(17,24,39,0.07)] md:grid-cols-2">
          {/* Decorative gold wash */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_85%_30%,color-mix(in_srgb,var(--color-accent)_14%,transparent),transparent_60%)]" />

          {/* Copy side */}
          <div className="relative z-[1] flex flex-col justify-center gap-4 px-6 py-8 sm:px-9 sm:py-10 md:py-12">
            <div className="flex items-center gap-2">
              <span className={`${type.eyebrow} rounded-full bg-accent/12 px-3 py-1 text-[10px] text-accent`}>
                {eyebrow}
              </span>
              {offer && (
                <span className="font-label rounded-full bg-gradient-to-r from-accent-hover to-accent px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-[0_3px_10px_color-mix(in_srgb,var(--color-accent)_30%,transparent)]">
                  {offer}
                </span>
              )}
            </div>

            <h2 className="font-display text-3xl font-bold leading-[1.1] text-primary sm:text-4xl md:text-[2.75rem]">
              {title}
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-muted md:text-[15px]">{description}</p>

            <div className="flex items-end gap-2.5">
              <span className={`${type.price} text-2xl font-bold text-primary sm:text-3xl`}>{price}</span>
              {oldPrice && (
                <span className={`${type.price} pb-1 text-sm text-muted line-through`}>{oldPrice}</span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-primary/70">
              <span className="inline-flex items-center gap-1.5">
                <span className="text-accent">
                  <Icons.Truck />
                </span>
                Free delivery in Doha
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="text-accent">
                  <Icons.Shield />
                </span>
                1-year warranty
              </span>
            </div>

            <button
              type="button"
              onClick={() => onCategoryClick?.(shopCategory)}
              className="mt-3 inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border-0 bg-gradient-to-r from-accent-hover via-accent to-primary-light px-7 py-3 font-label text-sm font-bold text-white shadow-[0_6px_20px_color-mix(in_srgb,var(--color-accent)_32%,transparent)] transition-all hover:brightness-105 active:scale-[0.99]"
            >
              {cta}
              <Icons.ArrowRight />
            </button>
          </div>

          {/* Image side */}
          <div className="relative z-[1] flex items-center justify-center overflow-hidden bg-gradient-to-br from-accent-soft via-white to-bg-soft px-6 py-10 md:py-12">
            <div className="pointer-events-none absolute h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-accent)_18%,transparent),transparent_70%)] sm:h-[360px] sm:w-[360px]" />
            {offer && (
              <span className="absolute right-6 top-6 z-[2] flex h-16 w-16 flex-col items-center justify-center rounded-full bg-sale text-white shadow-[0_6px_18px_color-mix(in_srgb,var(--color-sale)_40%,transparent)] sm:right-9 sm:top-9">
                <span className="font-label text-[9px] font-semibold uppercase leading-none">Save</span>
                <span className="font-display text-lg font-bold leading-none">25%</span>
              </span>
            )}
            <StoreImage
              src={img}
              alt={title}
              className="relative h-[200px] w-full object-contain drop-shadow-[0_16px_28px_rgba(17,24,39,0.16)] sm:h-[240px] md:h-[300px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
