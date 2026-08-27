"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { productImageSurfaceClass } from "@/lib/store/product-image-utils";
import StoreImage from "./StoreImage";
import { useCategories } from "@/hooks/useCategories";
import { categoryApi } from "@/lib/api/category.api";
import { HERO_BANNER_IMAGES } from "@/lib/images";
import { resolveCategoryId } from "@/lib/store/category-utils";
import { shopUrl } from "@/lib/routes";
import { type } from "@/lib/theme";

interface PromoBannerStripProps {
  onCategoryClick?: (categoryId: string) => void;
}

/** Include parent + child categories so promo labels resolve to real Mongo ids. */
const PROMO_CATEGORY_QUERY = {
  isActive: true,
  limit: 100,
  sortBy: "displayOrder" as const,
  sortOrder: "asc" as const,
};

const PROMO_BANNERS = [
  {
    bg: "linear-gradient(135deg, #0a255dff 0%, #1F2937 100%)",
    accent: "#9CA3AF",
    tag: "Best Seller",
    title: "Touch POS Systems",
    sub: "Fast. Reliable. Designed for Business.",
    cta: "Explore POS →",
    cat: "POS Systems",
    slug: "pos-systems",
    aliases: ["POS", "pos"],
    img: HERO_BANNER_IMAGES.pos,
  },
  {
    bg: "linear-gradient(135deg, #0a255dff 0%, #203a43 50%, #2c5364 100%)",
    accent: "#60A5FA",
    tag: "New Arrivals",
    title: "Thermal Printers",
    sub: "High-speed receipts. Built for retail.",
    cta: "Explore Now →",
    cat: "Printers",
    slug: "printers",
    aliases: ["Printer", "Thermal Printers"],
    img: HERO_BANNER_IMAGES.printer,
  },
] as const;

export default function PromoBannerStrip({ onCategoryClick }: PromoBannerStripProps) {
  const router = useRouter();
  const { data } = useCategories(PROMO_CATEGORY_QUERY);
  const categories = data?.categories ?? [];

  const handleBannerClick = useCallback(
    async (banner: (typeof PROMO_BANNERS)[number]) => {
      let categoryId = resolveCategoryId(categories, banner.cat, [...banner.aliases]);

      if (!categoryId && banner.slug) {
        try {
          const res = await categoryApi.getBySlug(banner.slug);
          categoryId = res.data.category._id;
        } catch {
          // slug lookup failed — fall through to search
        }
      }

      if (categoryId) {
        onCategoryClick?.(categoryId);
        return;
      }

      router.push(shopUrl({ search: banner.cat }));
    },
    [categories, onCategoryClick, router]
  );

  return (
    <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-2">
      {PROMO_BANNERS.map((b) => (
        <button
          key={b.cat}
          type="button"
          onClick={() => void handleBannerClick(b)}
          className="group relative flex h-[150px] w-full cursor-pointer items-center justify-between overflow-hidden rounded-xl border-0 px-7 py-6 text-left md:h-[165px] md:px-9"
          style={{ background: b.bg }}
        >
          <span
            className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-20"
            style={{ background: `radial-gradient(circle, ${b.accent}, transparent 70%)` }}
          />
          <span
            className="pointer-events-none absolute -bottom-10 left-1/4 h-32 w-32 rounded-full opacity-15"
            style={{ background: `radial-gradient(circle, ${b.accent}, transparent 70%)` }}
          />

          <div className="relative z-[1] min-w-0 flex-1 pr-4">
            <span
              className={`mb-2 inline-block rounded-full px-2.5 py-0.5 ${type.eyebrow} text-[11px] font-bold tracking-widest md:text-[9px]`}
              style={{
                background: `${b.accent}25`,
                color: b.accent,
                border: `1px solid ${b.accent}45`,
              }}
            >
              {b.tag}
            </span>
            <div className="font-display text-[20px] font-extrabold leading-tight text-white md:text-[22px]">
              {b.title}
            </div>
            <div className="mt-1 font-label text-[12px] text-white/55">{b.sub}</div>
            <div
              className="mt-4 inline-flex items-center gap-1.5 rounded-full px-5 py-2 font-label text-[12px] font-bold transition-all group-hover:brightness-110"
              style={{ background: b.accent, color: "#0f172a" }}
            >
              {b.cta}
            </div>
          </div>

          <div className={`relative z-[1] flex h-[110px] w-[110px] shrink-0 items-center justify-center overflow-hidden rounded-xl p-2 shadow-[0_8px_24px_rgba(0,0,0,0.22)] transition-transform duration-300 group-hover:scale-[1.03] md:h-[130px] md:w-[130px] ${productImageSurfaceClass}`}>
            <StoreImage src={b.img} alt={b.title} className="h-full w-full object-contain object-center" />
          </div>
        </button>
      ))}
    </div>
  );
}
