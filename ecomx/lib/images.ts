import type { HeroSlide } from "@/types/storefront.types";

/** Local IT/hardware photos — run `npm run images:demo` to refresh from Unsplash */

export const heroImage = (name: string) => `/images/hero/${name}.jpg`;
export const heroCutout = (name: string) => `/images/hero/${name}-cutout.png`;
export const categoryImage = (name: string) => `/images/categories/${name}.jpg`;
export const productImage = (slug: string) => `/images/products/${slug}.jpg`;

/** Primary + hover/alt image for product cards and detail gallery */
export const productImages = (slug: string) => [
  productImage(slug),
  productImage(`${slug}-alt`),
];

export const IMAGE_FALLBACK = categoryImage("pos");

/** Store / admin brand mark */
export const BRAND_LOGO = "/images/skynet-logo.png";

/** Transparent-background logo for dark footer */
export const BRAND_LOGO_FOOTER = "/images/skynet-logo-footer.png";

/** Hero slide order — POS + printer promotions. */
export const HERO_BANNER_KINDS = ["pos", "thermal", "barcode", "printer"] as const;

export type HeroBannerKind = (typeof HERO_BANNER_KINDS)[number];

export const HERO_BANNER_IMAGES: Record<HeroBannerKind, string> = {
  pos: heroCutout("boxpos-extreme"),
  thermal: heroCutout("premium-thermal"),
  barcode: heroCutout("premium-barcode"),
  printer: heroCutout("premium-printer"),
};

export function getHeroBannerImage(
  slideKind?: HeroSlide["slideKind"],
  index = 0
): string {
  const kind =
    slideKind && slideKind in HERO_BANNER_IMAGES
      ? (slideKind as HeroBannerKind)
      : HERO_BANNER_KINDS[index % HERO_BANNER_KINDS.length];
  return HERO_BANNER_IMAGES[kind];
}
