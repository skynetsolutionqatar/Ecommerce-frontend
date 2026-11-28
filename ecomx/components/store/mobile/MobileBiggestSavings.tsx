"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import StoreImage from "@/components/StoreImage";
import { apiProductDiscountPercent, apiProductImage } from "@/lib/store/api-product-display";
import { shopDealsUrl } from "@/lib/store/mobile-chrome";
import { formatPrice } from "@/lib/utils";
import type { ApiProduct } from "@/types/product.types";

const HEADER_NAVY = "#0a255d";

export default function MobileBiggestSavings({
  products,
  onProductPress,
}: {
  products: ApiProduct[];
  onProductPress: (product: ApiProduct) => void;
}) {
  const deals = products.slice(0, 3);
  if (!deals.length) return null;
  const best = Math.max(...deals.map(apiProductDiscountPercent));

  return (
    <div className="mx-4 flex flex-col gap-3 overflow-hidden rounded-2xl p-4" style={{ background: HEADER_NAVY }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-[18px] font-extrabold leading-[22px] text-white">Biggest savings</h3>
          <p className="text-[13px] leading-[18px] text-white/85">Up to {best}% off catalogue prices</p>
        </div>
        <Link
          href={shopDealsUrl()}
          className="flex shrink-0 items-center gap-0.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white"
        >
          See all
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.4} />
        </Link>
      </div>
      <div className="flex gap-2.5">
        {deals.map((product) => {
          const pct = apiProductDiscountPercent(product);
          const img = apiProductImage(product);
          return (
            <button
              key={product._id}
              type="button"
              onClick={() => onProductPress(product)}
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-left"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl bg-white">
                {img ? (
                  <StoreImage src={img} alt="" className="h-full w-full object-contain p-2 mix-blend-multiply" />
                ) : null}
                {pct > 0 ? (
                  <span className="absolute left-1.5 top-1.5 rounded-md bg-orange-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    -{pct}%
                  </span>
                ) : null}
              </div>
              <p className="mt-1.5 text-[13px] font-extrabold text-white">{formatPrice(product.price)}</p>
              <p className="line-clamp-2 text-[11px] leading-[14px] text-white/80">{product.name}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}