import { apiGet, apiPatch, apiPost, apiGetBlob, triggerBrowserDownload } from "./client";
import type { PaginationMeta } from "@/types/api.types";
import type {
  ApiOrder,
  OrderQueryParams,
  OrderStats,
  PlaceOrderPayload,
  UpdateOrderStatusPayload,
} from "@/types/order.types";

function toOrderQueryParams(params?: OrderQueryParams): Record<string, unknown> | undefined {
  if (!params) return undefined;
  const { startDate, endDate, ...rest } = params;
  return {
    ...rest,
    from: rest.from ?? startDate,
    to: rest.to ?? endDate,
  };
}

export const orderApi = {
  place: (payload: PlaceOrderPayload) =>
    apiPost<{ order: ApiOrder }>("/orders", payload),

  getMyOrders: (params?: OrderQueryParams) =>
    apiGet<{ orders: ApiOrder[] }>("/orders/my", toOrderQueryParams(params)),

  getMyOrder: (id: string) => apiGet<{ order: ApiOrder }>(`/orders/my/${id}`),

  track: (orderNumber: string) =>
    apiGet<{ order: ApiOrder }>(`/orders/my/track/${orderNumber}`),

  cancel: (id: string) => apiPatch<{ order: ApiOrder }>(`/orders/my/${id}/cancel`),

  // Admin
  getStats: () => apiGet<OrderStats>("/orders/stats"),

  getAll: (params?: OrderQueryParams) =>
    apiGet<{ orders: ApiOrder[] }>("/orders", toOrderQueryParams(params)),

  getById: (id: string) => apiGet<{ order: ApiOrder }>(`/orders/${id}`),

  updateStatus: (id: string, payload: UpdateOrderStatusPayload) =>
    apiPatch<{ order: ApiOrder }>(`/orders/${id}/status`, payload),

  downloadMyInvoice: async (id: string, orderNumber: string) => {
    const { blob, filename } = await apiGetBlob(
      `/orders/my/${id}/invoice`,
      `invoice-${orderNumber}.pdf`
    );
    triggerBrowserDownload(blob, filename);
  },

  downloadInvoice: async (id: string, orderNumber: string) => {
    const { blob, filename } = await apiGetBlob(
      `/orders/${id}/invoice`,
      `invoice-${orderNumber}.pdf`
    );
    triggerBrowserDownload(blob, filename);
  },
};

export type OrdersResult = { orders: ApiOrder[]; pagination?: PaginationMeta };

export async function fetchMyOrders(params?: OrderQueryParams): Promise<OrdersResult> {
  const res = await orderApi.getMyOrders(params);
  return { orders: res.data.orders, pagination: res.pagination };
}

export async function fetchOrders(params?: OrderQueryParams): Promise<OrdersResult> {
  const res = await orderApi.getAll(params);
  return { orders: res.data.orders, pagination: res.pagination };
}

export async function fetchOrderStats(): Promise<OrderStats> {
  const res = await orderApi.getStats();
  return res.data;
}
