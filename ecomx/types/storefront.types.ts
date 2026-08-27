import type { ApiCategory } from "@/types/category.types";
import type { ApiProduct } from "@/types/product.types";

export interface HeroSlide {
  id: number;
  productId?: string;
  eyebrow: string;
  title: string;
  sub: string;
  note: string;
  cta: string;
  img: string;
  price?: number;
  compareAtPrice?: number;
  discount?: number;
  slug?: string;
  category?: string;
  categorySlug?: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  slideKind?: "pos" | "thermal" | "barcode" | "printer";
}

export interface StorefrontConfig {
  heroSlides: HeroSlide[];
  featuredProducts: ApiProduct[];
  flashOffers: ApiProduct[];
  categories: ApiCategory[];
  newArrivals: ApiProduct[];
  bestSellers: ApiProduct[];
}
