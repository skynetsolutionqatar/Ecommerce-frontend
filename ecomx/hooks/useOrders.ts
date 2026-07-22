"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchOrders, fetchOrderStats, orderApi } from "@/lib/api/order.api";
import type { OrderQueryParams, UpdateOrderStatusPayload } from "@/types/order.types";

export const ORDERS_KEY = "orders";
export const ORDER_STATS_KEY = "order-stats";
export const ORDER_KEY = "order";

export function useOrders(params?: OrderQueryParams) {
  return useQuery({
    queryKey: [ORDERS_KEY, params],
    queryFn: () => fetchOrders(params),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: [ORDER_KEY, id],
    queryFn: async () => {
      const res = await orderApi.getById(id);
      return res.data.order;
    },
    enabled: !!id,
  });
}

export function useOrderStats() {
  return useQuery({
    queryKey: [ORDER_STATS_KEY],
    queryFn: fetchOrderStats,
    staleTime: 60_000,
  });
}

export function useOrderMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    void queryClient.invalidateQueries({ queryKey: [ORDER_STATS_KEY] });
    void queryClient.invalidateQueries({ queryKey: [ORDER_KEY] });
  };

  const updateStatus = useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & UpdateOrderStatusPayload) =>
      orderApi.updateStatus(id, payload),
    onSuccess: invalidate,
  });

  return { updateStatus };
}
