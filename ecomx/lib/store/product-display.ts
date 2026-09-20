import type { Product } from "@/lib/types";

export interface ProductTrustBadge {
  icon: string;
  title: string;
  sub: string;
}

export function buildProductSpecs(
  product: Product
): { label: string; value: string }[] {
  const specs: { label: string; value: string }[] = [];

  if (product.sku) specs.push({ label: "SKU", value: product.sku });
  if (product.barcode) specs.push({ label: "Barcode", value: product.barcode });
  if (product.brand) specs.push({ label: "Brand", value: product.brand });
  if (product.category)
    specs.push({ label: "Category", value: product.category });

  if (product.stock != null) {
    specs.push({
      label: "Availability",
      value:
        product.stock > 0
          ? `In stock (${product.stock} units)`
          : "Out of stock",
    });
  }

  if (product.taxPercent != null) {
    specs.push({ label: "Tax", value: `${product.taxPercent}%` });
  }

  if (product.isFreeShipping) {
    specs.push({ label: "Shipping", value: "Free shipping included" });
  }

  if (product.isDigital) {
    specs.push({ label: "Product type", value: "Digital product" });
  }

  if (product.hasVariants) {
    specs.push({ label: "Variants", value: "Multiple options available" });
  }

  if (product.colors.length > 0) {
    const colorNames = product.colors.map((c) => c.name).filter(Boolean);
    if (colorNames.length) {
      specs.push({ label: "Colors", value: colorNames.join(", ") });
    }
  }

  if (product.sizes.length > 0) {
    specs.push({ label: "Sizes / variants", value: product.sizes.join(", ") });
  }

  const { dimensions } = product;
  if (dimensions?.weight)
    specs.push({ label: "Weight", value: `${dimensions.weight} g` });
  if (dimensions?.length)
    specs.push({ label: "Length", value: `${dimensions.length} cm` });
  if (dimensions?.width)
    specs.push({ label: "Width", value: `${dimensions.width} cm` });
  if (dimensions?.height)
    specs.push({ label: "Height", value: `${dimensions.height} cm` });

  if (product.totalSold != null && product.totalSold > 0) {
    specs.push({ label: "Total sold", value: String(product.totalSold) });
  }

  if (product.discountPct > 0) {
    specs.push({ label: "Discount", value: `${product.discountPct}% off` });
  }

  if (product.tags.length > 0) {
    specs.push({ label: "Tags", value: product.tags.join(", ") });
  }

  return specs;
}

export function getProductTrustBadges(product: Product): ProductTrustBadge[] {
  const badges: ProductTrustBadge[] = [];

  if (product.isFreeShipping) {
    badges.push({ icon: "🚚", title: "Free Shipping", sub: "On this product" });
  }

  if (product.isNew) {
    badges.push({ icon: "✨", title: "New Arrival", sub: "Recently added" });
  }

  if (product.isBestSeller) {
    badges.push({
      icon: "🔥",
      title: "Best Seller",
      sub: product.totalSold ? `${product.totalSold}+ sold` : "Popular choice",
    });
  } else if (product.totalSold && product.totalSold > 0) {
    badges.push({
      icon: "🔥",
      title: "Popular Choice",
      sub: `${product.totalSold}+ sold`,
    });
  }

  if (product.taxPercent != null && product.taxPercent > 0) {
    badges.push({
      icon: "📋",
      title: "VAT Ready",
      sub: `${product.taxPercent}% tax included`,
    });
  }

  if (product.stock != null && product.stock > 0) {
    badges.push({
      icon: "📦",
      title: "In Stock",
      sub: `${product.stock} units available`,
    });
  }

  if (product.brand) {
    badges.push({
      icon: "🏷️",
      title: product.brand,
      sub: "Official brand product",
    });
  }

  return badges.slice(0, 4);
}

export function getProductHighlights(product: Product): string[] {
  if (product.tags.length > 0) {
    return product.tags.slice(0, 6);
  }

  const highlights: string[] = [];

  if (product.shortDescription) highlights.push(product.shortDescription);
  if (product.isFreeShipping) highlights.push("Free shipping on this product");
  if (product.isNew) highlights.push("New arrival");
  if (product.isBestSeller) highlights.push("Best seller");
  if (product.brand) highlights.push(`Brand: ${product.brand}`);
  if (product.category) highlights.push(`Category: ${product.category}`);

  return highlights.slice(0, 6);
}

export function getRecommendedLabel(product: Product): string | null {
  if (product.reviews <= 0) return null;
  if (product.rating >= 4.5) return "Highly recommended";
  if (product.rating >= 4) return "Recommended";
  if (product.rating >= 3) return "Mixed reviews";
  return "Needs improvement";
}
