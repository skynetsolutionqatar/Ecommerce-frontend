"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchStorefrontConfig } from "@/lib/api/storefront.api";

export const STOREFRONT_KEY = "storefront";

export function useStorefront() {
  const query = useQuery({
    queryKey: [STOREFRONT_KEY, "config"],
    queryFn: fetchStorefrontConfig,
    staleTime: 60_000,
  });

  const data = query.data;

  return {
    heroSlides: data?.heroSlides ?? [],
    featuredProducts: data?.featuredProducts ?? [],
    flashOffers: data?.flashOffers ?? [],
    newArrivals: data?.newArrivals ?? [],
    bestSellers: data?.bestSellers ?? [],
    categories: data?.categories ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
