import { apiGet, apiPatch, apiPost } from "./client";
import type { PaginationMeta } from "@/types/api.types";
import type {
  ApiOrder,
  OrderQueryParams,
  OrderStats,
  PlaceOrderPayload,
  UpdateOrderStatusPayload,
} from "@/types/order.types";

export const orderApi = {
  place: (payload: PlaceOrderPayload) =>
    apiPost<{ order: ApiOrder }>("/orders", payload),

  getMyOrders: (params?: OrderQueryParams) =>
    apiGet<{ orders: ApiOrder[] }>("/orders/my", params as Record<string, unknown>),

  getMyOrder: (id: string) => apiGet<{ order: ApiOrder }>(`/orders/my/${id}`),

  track: (orderNumber: string) =>
    apiGet<{ order: ApiOrder }>(`/orders/my/track/${orderNumber}`),

  cancel: (id: string) => apiPatch<{ order: ApiOrder }>(`/orders/my/${id}/cancel`),

  // Admin
  getStats: () => apiGet<OrderStats>("/orders/stats"),

  getAll: (params?: OrderQueryParams) =>
    apiGet<{ orders: ApiOrder[] }>("/orders", params as Record<string, unknown>),

  getById: (id: string) => apiGet<{ order: ApiOrder }>(`/orders/${id}`),

  updateStatus: (id: string, payload: UpdateOrderStatusPayload) =>
    apiPatch<{ order: ApiOrder }>(`/orders/${id}/status`, payload),
};

export type OrdersResult = { orders: ApiOrder[]; pagination?: PaginationMeta };

export async function fetchOrders(params?: OrderQueryParams): Promise<OrdersResult> {
  const res = await orderApi.getAll(params);
  return { orders: res.data.orders, pagination: res.pagination };
}

export async function fetchOrderStats(): Promise<OrderStats> {
  const res = await orderApi.getStats();
  return res.data;
}
