"use client";

import Link from "next/link";
import MobileHomeDealCard from "@/components/store/mobile/MobileHomeDealCard";
import { shopDealsUrl } from "@/lib/store/mobile-chrome";
import { tw } from "@/lib/theme";
import type { ApiProduct } from "@/types/product.types";

const HEADER_NAVY = "#0a255d";
const HOT_DEALS_SUBTITLE = "Catalogue prices on printers, scanners and POS";

export default function MobileHotDealsBlock({
  products,
  loading,
  onProductPress,
}: {
  products: ApiProduct[];
  loading?: boolean;
  onProductPress: (product: ApiProduct) => void;
}) {
  if (!loading && products.length === 0) return null;

  return (
    <div className="bg-[#f1f3f6]">
      <section
        className="overflow-hidden rounded-b-[20px] pb-4"
        style={{ background: HEADER_NAVY }}
        aria-labelledby="mobile-hot-deals-title"
      >
        <div className="flex items-end justify-between px-5 pt-3">
          <div className="min-w-0 flex-1 pe-3">
            <h2
              id="mobile-hot-deals-title"
              className="text-[22px] font-extrabold leading-tight text-white"
            >
              Hot deals
            </h2>
            <p className="mt-1 text-[13px] font-bold text-white/90">{HOT_DEALS_SUBTITLE}</p>
          </div>
        </div>

        <div className={`flex gap-[10px] overflow-x-auto px-4 pb-1 pt-2 ${tw.scrollbarHide}`}>
          {loading
            ? [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[168px] shrink-0 animate-pulse rounded-lg bg-white/20"
                  style={{ width: 126 }}
                />
              ))
            : products.map((product) => (
                <MobileHomeDealCard
                  key={product._id}
                  product={product}
                  onPress={onProductPress}
                  variant="hero"
                />
              ))}
        </div>

        <Link
          href={shopDealsUrl()}
          className="mx-auto mt-3 flex w-fit rounded-lg bg-white px-8 py-2 text-base font-extrabold text-red-500"
        >
          View All
        </Link>
      </section>
    </div>
  );
}