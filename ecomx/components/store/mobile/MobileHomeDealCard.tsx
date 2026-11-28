"use client";

import { Tag } from "lucide-react";
import StoreImage from "@/components/StoreImage";
import { apiProductDiscountPercent, apiProductImage } from "@/lib/store/api-product-display";
import { productImageSurfaceClass } from "@/lib/store/product-image-utils";
import { formatPrice } from "@/lib/utils";
import type { ApiProduct } from "@/types/product.types";

const CARD_W = 126;

function unitLabel(product: ApiProduct): string {
  return product.displaySizes?.[0]?.trim() || product.variants?.[0]?.value?.trim() || "";
}

export default function MobileHomeDealCard({
  product,
  onPress,
  variant = "default",
}: {
  product: ApiProduct;
  onPress: (product: ApiProduct) => void;
  /** `hero` — Hot deals navy row (native `offer` cards). */
  variant?: "default" | "hero";
}) {
  const discount = apiProductDiscountPercent(product);
  const image = apiProductImage(product);
  const ribbon =
    discount > 0 ? `Save ${discount}%` : product.isBestSeller ? "Best seller" : product.badge?.trim() || "";
  const unit = unitLabel(product);
  const ribbonClass =
    variant === "hero"
      ? "bg-red-500"
      : "bg-orange-600";

  return (
    <button
      type="button"
      onClick={() => onPress(product)}
      className="shrink-0 overflow-hidden rounded-lg border-0 bg-white p-0 text-left shadow-[0_2px_8px_rgba(14,27,51,0.08)]"
      style={{ width: CARD_W }}
    >
      <div className={`relative h-[126px] w-full p-2 ${productImageSurfaceClass}`}>
        {ribbon ? (
          <span
            className={`absolute left-1.5 top-1.5 z-10 flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold text-white ${ribbonClass}`}
          >
            {variant === "hero" ? <Tag className="h-2.5 w-2.5" strokeWidth={2.2} aria-hidden /> : null}
            {ribbon}
          </span>
        ) : null}
        {image ? (
          <StoreImage src={image} alt="" className="h-full w-full object-contain mix-blend-multiply" />
        ) : null}
      </div>
      <div className="space-y-0.5 px-2 pb-2.5">
        <p className="line-clamp-2 h-[30px] text-[11px] leading-[15px] text-gray-800">{product.name}</p>
        <div className="flex flex-wrap items-baseline gap-x-1">
          <span className="text-[13px] font-extrabold text-gray-900">{formatPrice(product.price)}</span>
          {product.compareAtPrice != null && product.compareAtPrice > product.price ? (
            <span className="text-[10px] text-gray-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          ) : null}
        </div>
        {unit ? (
          <p className="line-clamp-1 h-[14px] text-[10px] leading-[14px] text-gray-400">{unit}</p>
        ) : null}
      </div>
    </button>
  );
}

export const MOBILE_HOME_DEAL_CARD_WIDTH = CARD_W;