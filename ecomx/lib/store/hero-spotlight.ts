import { apiProductDiscountPercent, apiProductImage } from "@/lib/store/api-product-display";
import type { ApiProduct } from "@/types/product.types";
import type { HeroSlide } from "@/types/storefront.types";

/** Poster fills. Offer frames use the retail red; day frames use the store navy. */
export const SPOTLIGHT_FILL = {
  offer: "#e21836",
  day: "#0a255d",
} as const;

/** Brighter coupon surfaces for the hero right column. */
export const SPOTLIGHT_COUPON_SURFACE = {
  offer: {
    gradient:
      "linear-gradient(145deg, #fff1f2 0%, #fda4af 32%, #fb7185 58%, #ffe4e6 100%)",
    mesh: "rgba(255, 255, 255, 0.85)",
    accent: "#be123c",
    border: "rgba(244, 63, 94, 0.7)",
    shadow: "0 10px 28px rgba(225, 29, 72, 0.28), inset 0 1px 0 rgba(255,255,255,0.85)",
  },
  day: {
    gradient:
      "linear-gradient(145deg, #f0f9ff 0%, #7dd3fc 32%, #38bdf8 58%, #e0f2fe 100%)",
    mesh: "rgba(255, 255, 255, 0.85)",
    accent: "#0369a1",
    border: "rgba(14, 165, 233, 0.7)",
    shadow: "0 10px 28px rgba(2, 132, 199, 0.28), inset 0 1px 0 rgba(255,255,255,0.85)",
  },
} as const;

export type SpotlightFrame = "offer" | "day";

export type HeroSpotlightItem = {
  id: string;
  frame: SpotlightFrame;
  /** Category (or offer) name shown under the discount line. */
  name: string;
  percent: number;
  categorySlug?: string;
  /** Optional catalog image (not shown in coupon UI). */
  image?: string;
};

function categoryFromProduct(product: ApiProduct): { name: string; slug?: string; image?: string } {
  const image = apiProductImage(product);
  const cat = product.categoryId;
  if (cat && typeof cat === "object" && cat.name) {
    return { name: cat.name, slug: cat.slug || cat._id, image };
  }
  if (typeof cat === "string" && cat) return { name: "Deals", slug: cat, image };
  return { name: product.brand?.trim() || "Store picks", image };
}

function categoryFromSlide(slide: HeroSlide): {
  name: string;
  slug?: string;
  percent: number;
  image?: string;
} {
  const percent =
    slide.discount != null && slide.discount > 0
      ? Math.round(slide.discount)
      : slide.compareAtPrice != null && slide.price != null && slide.compareAtPrice > slide.price
        ? Math.round(((slide.compareAtPrice - slide.price) / slide.compareAtPrice) * 100)
        : 30;
  const name =
    slide.category?.trim() ||
    slide.eyebrow?.trim() ||
    slide.title.replace(/\n/g, " ").trim() ||
    "Store picks";
  return {
    name,
    slug: slide.categorySlug,
    percent,
    image: slide.img?.trim() || slide.posterImg?.trim() || undefined,
  };
}

/**
 * Each category yields the two poster states. `image` is only used as a blurred color plate.
 */
export function buildHeroSpotlightItems(
  slides: HeroSlide[],
  dealProducts: ApiProduct[] = []
): HeroSpotlightItem[] {
  const byName = new Map<string, { name: string; percent: number; slug?: string; image?: string }>();

  for (const product of dealProducts) {
    const { name, slug, image } = categoryFromProduct(product);
    const percent = apiProductDiscountPercent(product);
    const prev = byName.get(name);
    if (!prev || percent > prev.percent) {
      byName.set(name, { name, percent: percent > 0 ? percent : 30, slug, image });
    }
  }

  if (byName.size === 0) {
    for (const slide of slides) {
      const row = categoryFromSlide(slide);
      const prev = byName.get(row.name);
      if (!prev || row.percent > prev.percent) byName.set(row.name, row);
    }
  }

  const categories = [...byName.values()].slice(0, 6);
  if (categories.length === 0) {
    return [
      { id: "fallback-offer", frame: "offer", name: "Store picks", percent: 30 },
      { id: "fallback-day", frame: "day", name: "Store picks", percent: 30 },
    ];
  }

  const items: HeroSpotlightItem[] = [];
  for (const cat of categories) {
    items.push({
      id: `offer-${cat.slug ?? cat.name}`,
      frame: "offer",
      name: cat.name,
      percent: cat.percent,
      categorySlug: cat.slug,
      image: cat.image,
    });
    items.push({
      id: `day-${cat.slug ?? cat.name}`,
      frame: "day",
      name: cat.name,
      percent: cat.percent,
      categorySlug: cat.slug,
      image: cat.image,
    });
  }
  return items;
}
