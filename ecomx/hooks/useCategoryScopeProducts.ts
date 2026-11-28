"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProductsForCategoryScope } from "@/lib/api/product.api";
import { PRODUCTS_KEY } from "@/hooks/useProducts";
import type { ProductQueryParams } from "@/types/product.types";

export function useCategoryScopeProducts(
  scopeIds: string[] | undefined,
  params: ProductQueryParams | undefined,
  enabled: boolean
) {
  const scope = scopeIds?.filter(Boolean) ?? [];
  const useScope = scope.length > 0;

  return useQuery({
    queryKey: [PRODUCTS_KEY, params, "scope", ...scope],
    queryFn: () => fetchProductsForCategoryScope(scope, params, false),
    staleTime: 120_000,
    enabled: enabled && params != null && useScope,
    placeholderData: undefined,
  });
}