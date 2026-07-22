import { apiGet, apiPatch } from "./client";
import type {
  AddStockPayload,
  LowStockProduct,
  ProductStock,
  ReduceStockPayload,
  StockHistoryEntry,
} from "@/types/inventory.types";
import type { PaginationMeta } from "@/types/api.types";

export const inventoryApi = {
  getLowStock: () =>
    apiGet<{ products: LowStockProduct[]; count: number }>("/inventory/alerts/low-stock"),

  getStock: (productId: string) => apiGet<ProductStock>(`/inventory/${productId}`),

  getHistory: (productId: string, params?: Record<string, unknown>) =>
    apiGet<{ logs: StockHistoryEntry[] }>(`/inventory/${productId}/history`, params),

  addStock: (productId: string, payload: AddStockPayload) =>
    apiPatch<{ product: { stock: number }; log: StockHistoryEntry }>(
      `/inventory/${productId}/add`,
      payload
    ),

  reduceStock: (productId: string, payload: ReduceStockPayload) =>
    apiPatch<{ product: { stock: number }; log: StockHistoryEntry }>(
      `/inventory/${productId}/reduce`,
      payload
    ),
};

export async function fetchLowStockProducts(): Promise<LowStockProduct[]> {
  const res = await inventoryApi.getLowStock();
  return res.data.products;
}

export type StockHistoryResult = {
  logs: StockHistoryEntry[];
  pagination?: PaginationMeta;
};

export async function fetchStockHistory(
  productId: string,
  params?: Record<string, unknown>
): Promise<StockHistoryResult> {
  const res = await inventoryApi.getHistory(productId, params);
  return { logs: res.data.logs, pagination: res.pagination };
}
