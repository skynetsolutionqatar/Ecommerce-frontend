"use client";

import { useMemo } from "react";
import { useProducts } from "@/hooks/useProducts";
import { apiProductToStoreProduct } from "@/lib/store/product-mapper";
import { PRODUCT_STATUS } from "@/lib/Constant";
import type { Product } from "@/lib/types";

const RELATED_QUERY = {
  status: PRODUCT_STATUS.ACTIVE,
  limit: 12,
  sortBy: "totalSold" as const,
  sortOrder: "desc" as const,
};

export function useRelatedProducts(product: Product) {
  const { data: categoryData, isLoading: categoryLoading } = useProducts(
    { ...RELATED_QUERY, categoryId: product.categoryId },
    !!product.categoryId
  );

  const categoryProducts = useMemo(
    () =>
      (categoryData?.products ?? [])
        .filter((item) => item._id !== product.id)
        .map(apiProductToStoreProduct),
    [categoryData?.products, product.id]
  );

  const needsFallback = !product.categoryId || categoryProducts.length < 3;

  const { data: fallbackData, isLoading: fallbackLoading } = useProducts(
    RELATED_QUERY,
    needsFallback
  );

  const products = useMemo(() => {
    const seen = new Set<string>();
    const merged: Product[] = [];

    for (const item of [
      ...categoryProducts,
      ...(fallbackData?.products ?? []).map(apiProductToStoreProduct),
    ]) {
      if (item.id === product.id || seen.has(item.id)) continue;
      seen.add(item.id);
      merged.push(item);
      if (merged.length >= 6) break;
    }

    return merged;
  }, [categoryProducts, fallbackData?.products, product.id]);

  const isLoading =
    (!!product.categoryId && categoryLoading) || (needsFallback && fallbackLoading);

  return { products, isLoading };
}
