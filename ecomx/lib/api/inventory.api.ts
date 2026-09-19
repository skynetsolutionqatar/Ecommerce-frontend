import { apiGet, apiPatch } from "./client";
import type { PaginationMeta } from "@/types/api.types";
import type {
  AddStockPayload,
  LowStockProduct,
  LowStockQuery,
  ProductStock,
  ReduceStockPayload,
  SetStockPayload,
  StockHistoryEntry,
  StockHistoryQuery,
  StockProduct,
  StockProductsQuery,
} from "@/types/inventory.types";

export const inventoryApi = {
  getStockProducts: (params?: StockProductsQuery) =>
    apiGet<{ products: StockProduct[] }>(
      "/inventory/stock",
      params as Record<string, unknown>
    ),

  getLowStock: (params?: LowStockQuery) =>
    apiGet<{ products: LowStockProduct[]; count: number }>(
      "/inventory/alerts/low-stock",
      params as Record<string, unknown>
    ),

  getStock: (productId: string) => apiGet<ProductStock>(`/inventory/${productId}`),

  getHistory: (productId: string, params?: StockHistoryQuery) =>
    apiGet<{ logs: StockHistoryEntry[] }>(
      `/inventory/${productId}/history`,
      params as Record<string, unknown>
    ),

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

  setStock: (productId: string, payload: SetStockPayload) =>
    apiPatch<{ product: { stock: number }; log: StockHistoryEntry | null }>(
      `/inventory/${productId}/set`,
      payload
    ),
};

export type LowStockResult = {
  products: LowStockProduct[];
  count: number;
  pagination?: PaginationMeta;
};

export async function fetchLowStockProducts(params?: LowStockQuery): Promise<LowStockResult> {
  const res = await inventoryApi.getLowStock(params);
  return {
    products: res.data.products,
    count: res.data.count,
    pagination: res.pagination,
  };
}

export type StockProductsResult = {
  products: StockProduct[];
  pagination?: PaginationMeta;
};

export async function fetchStockProducts(
  params?: StockProductsQuery
): Promise<StockProductsResult> {
  const res = await inventoryApi.getStockProducts(params);
  return {
    products: res.data.products,
    pagination: res.pagination,
  };
}

export type StockHistoryResult = {
  logs: StockHistoryEntry[];
  pagination?: PaginationMeta;
};

export async function fetchStockHistory(
  productId: string,
  params?: StockHistoryQuery
): Promise<StockHistoryResult> {
  const res = await inventoryApi.getHistory(productId, params);
  return { logs: res.data.logs, pagination: res.pagination };
}
