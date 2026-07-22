"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProducts,
  fetchProduct,
  productApi,
} from "@/lib/api/product.api";
import type {
  CreateProductPayload,
  ProductQueryParams,
  UpdateProductPayload,
} from "@/types/product.types";

export const PRODUCTS_KEY = "products";
export const PRODUCT_KEY = "product";

export function useProducts(params?: ProductQueryParams) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, params],
    queryFn: () => fetchProducts(params),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
}

export function useProduct(id: string, enabled = true) {
  return useQuery({
    queryKey: [PRODUCT_KEY, id],
    queryFn: () => fetchProduct(id),
    enabled: !!id && enabled,
    staleTime: 60_000,
  });
}

export function useProductMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    void queryClient.invalidateQueries({ queryKey: [PRODUCT_KEY] });
  };

  const create = useMutation({
    mutationFn: (payload: CreateProductPayload) => productApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProductPayload }) =>
      productApi.update(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
