import type { Product } from "@/lib/types";
import type { ApiProduct } from "@/types/product.types";
import { resolveRefId, resolveRefName } from "@/lib/api/populated-ref";

export function resolveApiCategoryName(product: ApiProduct): string {
  return resolveRefName(product.categoryId, "");
}

export function resolveApiCategoryId(product: ApiProduct): string {
  return resolveRefId(product.categoryId);
}

export function apiProductToStoreProduct(product: ApiProduct): Product {
  const images = product.images?.length
    ? product.images
    : product.thumbnail
      ? [product.thumbnail]
      : ["/images/products/placeholder.png"];

  const compareAt = product.compareAtPrice;
  const discountPct =
    product.discountPercent ??
    (compareAt && compareAt > product.price
      ? Math.round(((compareAt - product.price) / compareAt) * 100)
      : 0);

  return {
    id: product._id,
    slug: product.slug,
    name: product.name,
    brand: product.brand ?? "",
    price: product.price,
    originalPrice: compareAt && compareAt > product.price ? compareAt : undefined,
    isNew: product.isNew ?? false,
    isBestSeller: product.isBestSeller ?? false,
    rating: product.averageRating ?? 0,
    reviews: product.reviewCount ?? 0,
    colors:
      (product.colors ?? []).length > 0
        ? (product.colors ?? []).map((c) => ({
            name: c.name ?? "Default",
            hex: c.hex ?? "#D1D5DB",
          }))
        : [{ name: "Default", hex: "#D1D5DB" }],
    sizes: product.displaySizes ?? [],
    badge: product.badge ?? "",
    badgeColor: product.badgeColor ?? "#111827",
    images,
    tags: product.tags ?? [],
    description: product.description ?? product.shortDescription ?? "",
    shortDescription: product.shortDescription,
    category: resolveApiCategoryName(product),
    categoryId: resolveApiCategoryId(product) || undefined,
    stock: product.stock,
    sku: product.sku,
    barcode: product.barcode,
    taxPercent: product.taxPercent,
    isFreeShipping: product.isFreeShipping,
    isDigital: product.isDigital,
    hasVariants: product.hasVariants,
    totalSold: product.totalSold,
    trackInventory: product.trackInventory,
    dimensions: product.dimensions,
    discountPct,
  };
}
