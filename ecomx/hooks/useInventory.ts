"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchLowStockProducts,
  fetchStockHistory,
  inventoryApi,
} from "@/lib/api/inventory.api";
import type { AddStockPayload, ReduceStockPayload } from "@/types/inventory.types";

export const INVENTORY_KEY = "inventory";

export function useLowStock() {
  return useQuery({
    queryKey: [INVENTORY_KEY, "low-stock"],
    queryFn: fetchLowStockProducts,
    staleTime: 60_000,
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

export function useStockHistory(productId: string) {
  return useQuery({
    queryKey: [INVENTORY_KEY, "history", productId],
    queryFn: () => fetchStockHistory(productId),
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
