"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StoreProductCard from "@/components/store/StoreProductCard";
import MobileTabTitleHeader from "@/components/store/mobile/MobileTabTitleHeader";
import { useProducts } from "@/hooks/useProducts";
import { apiProductDiscountPercent } from "@/lib/store/api-product-display";
import { MOBILE_TAB_BAR_HEIGHT_PX } from "@/lib/store/mobile-chrome";
import { ROUTES } from "@/lib/routes";
import { PRODUCT_STATUS } from "@/lib/Constant";
import type { ApiProduct } from "@/types/product.types";

type DealSort = "discount" | "price-asc" | "price-desc" | "newest";

const SORTS: { value: DealSort; label: string }[] = [
  { value: "discount", label: "Biggest discount" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "newest", label: "Newest" },
];

const DEALS_QUERY = {
  status: PRODUCT_STATUS.ACTIVE,
  hasDiscount: true,
  limit: 60,
  sortBy: "createdAt" as const,
  sortOrder: "desc" as const,
};

function sortDeals(products: readonly ApiProduct[], sort: DealSort): ApiProduct[] {
  const list = [...products];
  switch (sort) {
    case "discount":
      return list.sort((a, b) => apiProductDiscountPercent(b) - apiProductDiscountPercent(a));
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "newest":
      return list;
  }
}

export default function MobileDealsTab({
  cartCount,
  onCartOpen,
  onProductClick,
  onAddToCart,
  onWishlistToggle,
  isWishlisted,
}: {
  cartCount: number;
  onCartOpen: () => void;
  onProductClick: (product: ApiProduct) => void;
  onAddToCart: (product: ApiProduct) => void;
  onWishlistToggle: (product: ApiProduct) => void;
  isWishlisted: (id: string) => boolean;
}) {
  const router = useRouter();
  const [sort, setSort] = useState<DealSort>("discount");
  const { data, isLoading, isError, refetch } = useProducts(DEALS_QUERY);
  const products = useMemo(
    () => sortDeals(data?.products ?? [], sort),
    [data?.products, sort]
  );
  const count = products.length;

  const handleOpen = useCallback(
    (product: ApiProduct) => {
      if (product.slug) {
        router.push(ROUTES.product(product.slug));
        return;
      }
      onProductClick(product);
    },
    [onProductClick, router]
  );

  return (
    <div className="min-h-[100dvh] bg-[#f1f3f6] md:hidden">
      <MobileTabTitleHeader title="Deals" cartCount={cartCount} onCartOpen={onCartOpen}>
        {count > 0 ? (
          <p className="-mt-1 text-[13px] text-gray-500">
            {count} {count === 1 ? "offer" : "offers"} · prices include VAT
          </p>
        ) : null}
        <div
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5"
          role="radiogroup"
          aria-label="Sort deals"
        >
          {SORTS.map((option) => {
            const selected = sort === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setSort(option.value)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold ${
                  selected
                    ? "border-[#0a255d] bg-[#0a255d] text-white"
                    : "border-gray-200 bg-white text-gray-700"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </MobileTabTitleHeader>

      <div
        className="px-4 pt-4"
        style={{ paddingBottom: MOBILE_TAB_BAR_HEIGHT_PX + 16 }}
      >
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
        ) : isError ? (
          <div className="py-12 text-center">
            <p className="text-sm font-semibold text-gray-900">Could not load deals</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 text-sm font-bold text-[#0a255d]"
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-base font-extrabold text-gray-900">No deals right now</p>
            <p className="mt-2 text-sm text-gray-600">
              New offers are added often. Browse the full catalogue in the meantime.
            </p>
            <button
              type="button"
              onClick={() => router.push(ROUTES.shop)}
              className="mt-4 rounded-lg bg-[#0a255d] px-6 py-2.5 text-sm font-bold text-white"
            >
              Browse categories
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product, index) => (
              <StoreProductCard
                key={product._id}
                product={product}
                index={index}
                onClick={handleOpen}
                onAddToCart={onAddToCart}
                onWishlistToggle={onWishlistToggle}
                isWishlisted={isWishlisted(product._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}