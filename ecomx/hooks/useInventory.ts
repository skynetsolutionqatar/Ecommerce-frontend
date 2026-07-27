"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchLowStockProducts,
  fetchStockHistory,
  inventoryApi,
} from "@/lib/api/inventory.api";
import type {
  AddStockPayload,
  LowStockQuery,
  ReduceStockPayload,
  StockHistoryQuery,
} from "@/types/inventory.types";

export const INVENTORY_KEY = "inventory";

export function useLowStock(params?: LowStockQuery) {
  return useQuery({
    queryKey: [INVENTORY_KEY, "low-stock", params],
    queryFn: () => fetchLowStockProducts(params),
    staleTime: 60_000,
    select: (data) => data.products,
  });
}

export function useLowStockWithMeta(params?: LowStockQuery) {
  return useQuery({
    queryKey: [INVENTORY_KEY, "low-stock", params],
    queryFn: () => fetchLowStockProducts(params),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
}

export function useProductStock(productId: string) {
  return useQuery({
    queryKey: [INVENTORY_KEY, "stock", productId],
    queryFn: async () => {
      const res = await inventoryApi.getStock(productId);
      return res.data;
    },
    enabled: !!productId,
  });
}

export function useStockHistory(productId: string, params?: StockHistoryQuery) {
  return useQuery({
    queryKey: [INVENTORY_KEY, "history", productId, params],
    queryFn: () => fetchStockHistory(productId, params),
    enabled: !!productId,
  });
}

export function useInventoryMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: [INVENTORY_KEY] });

  const addStock = useMutation({
    mutationFn: ({ productId, payload }: { productId: string; payload: AddStockPayload }) =>
      inventoryApi.addStock(productId, payload),
    onSuccess: invalidate,
  });

  const reduceStock = useMutation({
    mutationFn: ({ productId, payload }: { productId: string; payload: ReduceStockPayload }) =>
      inventoryApi.reduceStock(productId, payload),
    onSuccess: invalidate,
  });

  return { addStock, reduceStock };
}
