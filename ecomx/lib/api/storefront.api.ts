import { apiGet } from "./client";
import type { ApiProduct } from "@/types/product.types";
import type { HeroSlide, StorefrontConfig } from "@/types/storefront.types";

export type { HeroSlide, StorefrontConfig };

export const storefrontApi = {
  /** GET /storefront/config — homepage bundle in one call */
  getConfig: () => apiGet<StorefrontConfig>("/storefront/config"),

  /** GET /storefront/hero */
  getHeroSlides: () => apiGet<{ slides: HeroSlide[] }>("/storefront/hero"),

  /** GET /storefront/flash-offers?limit=8 */
  getFlashOffers: (limit = 8) =>
    apiGet<{ products: ApiProduct[] }>("/storefront/flash-offers", { limit }),

  /** GET /storefront/featured?limit=8 */
  getFeatured: (limit = 8) =>
    apiGet<{ products: ApiProduct[] }>("/storefront/featured", { limit }),
};

export async function fetchStorefrontConfig(): Promise<StorefrontConfig> {
  const res = await storefrontApi.getConfig();
  return res.data;
}

export async function fetchHeroSlides(): Promise<HeroSlide[]> {
  const res = await storefrontApi.getHeroSlides();
  return res.data.slides ?? [];
}

export async function fetchFlashOffers(limit = 8): Promise<ApiProduct[]> {
  const res = await storefrontApi.getFlashOffers(limit);
  return res.data.products ?? [];
}

export async function fetchFeaturedProducts(limit = 8): Promise<ApiProduct[]> {
  const res = await storefrontApi.getFeatured(limit);
  return res.data.products ?? [];
}
