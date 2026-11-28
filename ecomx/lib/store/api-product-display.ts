import type { ApiProduct } from "@/types/product.types";

export function apiProductDiscountPercent(product: ApiProduct): number {
  if (product.discountPercent != null && product.discountPercent > 0) {
    return Math.round(product.discountPercent);
  }
  const mrp = product.compareAtPrice;
  if (mrp != null && mrp > product.price) {
    return Math.round(((mrp - product.price) / mrp) * 100);
  }
  return 0;
}

export function apiProductImage(product: ApiProduct): string | undefined {
  return product.thumbnail ?? product.images?.[0];
}