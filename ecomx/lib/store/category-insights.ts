import { apiProductDiscountPercent } from "@/lib/store/api-product-display";
import type { ApiProduct } from "@/types/product.types";

export function topBrands(products: ApiProduct[], max = 8): string[] {
  const counts = new Map<string, number>();
  for (const p of products) {
    const brand = p.brand?.trim();
    if (brand) counts.set(brand, (counts.get(brand) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, max)
    .map(([brand]) => brand);
}

function popularityScore(p: ApiProduct): number {
  const outOfStock = (p.stock ?? 0) <= 0;
  return (
    (p.isBestSeller ? 1000 : 0) +
    (p.reviewCount ?? 0) * 10 +
    (p.averageRating ?? 0) +
    (outOfStock ? -5000 : 0)
  );
}

export function popularProducts(products: ApiProduct[], max = 3): ApiProduct[] {
  return products
    .map((p, i) => ({ p, i, s: popularityScore(p) }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, max)
    .map(({ p }) => p);
}

export function categoryOfferLine(products: ApiProduct[], total?: number): string {
  const parts: string[] = [];
  const count = total ?? products.length;
  if (count) parts.push(`${count} ${count === 1 ? "product" : "products"}`);
  const maxDiscount = products.reduce((max, p) => Math.max(max, apiProductDiscountPercent(p)), 0);
  if (maxDiscount > 0) parts.push(`up to ${maxDiscount}% off`);
  return parts.join(" · ");
}