"use client";

import { useMemo } from "react";
import { useProducts } from "@/hooks/useProducts";
import { PRODUCT_STATUS } from "@/lib/Constant";
import { FALLBACK_PRICE_MAX } from "@/lib/store/shop-filters";

export function useShopFilterMeta() {
  const { data: maxPriceData, isLoading: maxLoading } = useProducts({
    status: PRODUCT_STATUS.ACTIVE,
    sortBy: "price",
    sortOrder: "desc",
    limit: 1,
  });

  const { data: catalogData, isLoading: catalogLoading } = useProducts({
    status: PRODUCT_STATUS.ACTIVE,
    limit: 200,
    sortBy: "name",
    sortOrder: "asc",
  });

  const priceMax = maxPriceData?.products[0]?.price ?? FALLBACK_PRICE_MAX;

  const brands = useMemo(() => {
    const set = new Set<string>();
    for (const product of catalogData?.products ?? []) {
      if (product.brand?.trim()) set.add(product.brand.trim());
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [catalogData?.products]);

  return {
    priceMax,
    brands,
    isLoading: maxLoading || catalogLoading,
  };
}
