import type { Product } from "@/lib/types";
import type { ApiProduct } from "@/types/product.types";

export function resolveApiCategoryName(product: ApiProduct): string {
  if (!product.categoryId) return "";
  if (typeof product.categoryId === "object") return product.categoryId.name;
  return "";
}

export function resolveApiCategoryId(product: ApiProduct): string {
  if (!product.categoryId) return "";
  if (typeof product.categoryId === "object") return product.categoryId._id;
  return product.categoryId;
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
    colors: (product.colors ?? []).map((c) => ({
      name: c.name ?? "Default",
      hex: c.hex ?? "#D1D5DB",
    })),
    sizes: product.displaySizes ?? [],
    badge: product.badge ?? "",
    badgeColor: product.badgeColor ?? "#111827",
    images,
    tags: product.tags ?? [],
    description: product.description ?? product.shortDescription ?? "",
    category: resolveApiCategoryName(product),
    stock: product.stock,
    sku: product.sku,
    discountPct,
  };
}
