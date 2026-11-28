"use client";

import StoreImage from "@/components/StoreImage";
import { apiProductImage } from "@/lib/store/api-product-display";
import { HERO_CATALOG_BANNER_SURFACES } from "@/lib/store/category-banner-style";
import { productImageSurfaceClass } from "@/lib/store/product-image-utils";
import { formatPrice } from "@/lib/utils";
import type { ApiProduct } from "@/types/product.types";

function categoryLabel(product: ApiProduct): string {
  const cat = product.categoryId;
  if (cat && typeof cat === "object" && "name" in cat && cat.name) return cat.name;
  return product.brand?.trim() || "";
}

export default function HeroCatalogBanners({
  products,
  isLoading,
  onProductClick,
}: {
  products: ApiProduct[];
  isLoading?: boolean;
  onProductClick?: (product: ApiProduct) => void;
}) {
  if (!isLoading && products.length === 0) return null;

  return (
    <div
      className="grid h-full min-h-[7.5rem] w-full gap-2"
      style={{ gridTemplateColumns: `repeat(${Math.max(products.length, isLoading ? 3 : 1)}, minmax(0, 1fr))` }}
    >
      {isLoading
        ? [0, 1, 2].map((i) => (
            <div key={i} className="h-full animate-pulse rounded-xl bg-slate-200/80" />
          ))
        : products.map((product, index) => {
            const image = apiProductImage(product);
            const label = categoryLabel(product);
            const surface = HERO_CATALOG_BANNER_SURFACES[index % HERO_CATALOG_BANNER_SURFACES.length];
            return (
              <button
                key={product._id}
                type="button"
                onClick={() => onProductClick?.(product)}
                className="flex h-full w-full min-w-0 cursor-pointer items-center gap-2 overflow-hidden rounded-xl border-0 px-2.5 py-2 text-left"
                style={{ background: surface.background, color: surface.color }}
              >
                {image ? (
                  <span className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg p-1 ${productImageSurfaceClass}`}>
                    <StoreImage src={image} alt="" className="h-full w-full object-contain" />
                  </span>
                ) : null}
                <span className="min-w-0">
                  {label ? (
                    <span className="block truncate text-[10px] font-bold uppercase tracking-wide opacity-80">
                      {label}
                    </span>
                  ) : null}
                  <span className="mt-0.5 line-clamp-2 text-[13px] font-extrabold leading-tight">{product.name}</span>
                  <span className="mt-1 block text-xs font-bold">{formatPrice(product.price)}</span>
                </span>
              </button>
            );
          })}
    </div>
  );
}
