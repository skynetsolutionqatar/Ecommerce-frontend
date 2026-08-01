import type { FilterState } from "@/lib/types";
import type { ProductQueryParams } from "@/types/product.types";

export const FALLBACK_PRICE_MAX = 10000;

export function createDefaultFilters(priceMax = FALLBACK_PRICE_MAX): FilterState {
  return {
    categories: [],
    priceRange: [0, priceMax],
    minRating: null,
    brands: [],
    inStock: false,
    hasDiscount: false,
  };
}

export function countActiveFilters(filters: FilterState, priceMax: number): number {
  let count = 0;
  if (filters.categories.length) count++;
  if (filters.brands.length) count++;
  if (filters.inStock) count++;
  if (filters.hasDiscount) count++;
  if (filters.minRating != null) count++;
  if (filters.priceRange[0] > 0 || filters.priceRange[1] < priceMax) count++;
  return count;
}

export function filtersToProductQuery(
  filters: FilterState,
  priceMax: number
): Pick<
  ProductQueryParams,
  "categoryId" | "brand" | "minPrice" | "maxPrice" | "minRating" | "inStock" | "hasDiscount"
> {
  const query: Pick<
    ProductQueryParams,
    "categoryId" | "brand" | "minPrice" | "maxPrice" | "minRating" | "inStock" | "hasDiscount"
  > = {};

  if (filters.categories[0]) query.categoryId = filters.categories[0];
  if (filters.brands[0]) query.brand = filters.brands[0];
  if (filters.inStock) query.inStock = true;
  if (filters.hasDiscount) query.hasDiscount = true;
  if (filters.minRating != null) query.minRating = filters.minRating;
  if (filters.priceRange[0] > 0) query.minPrice = filters.priceRange[0];
  if (filters.priceRange[1] < priceMax) query.maxPrice = filters.priceRange[1];

  return query;
}
