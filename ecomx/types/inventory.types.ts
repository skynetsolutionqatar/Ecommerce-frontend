import type { InventoryMovementType } from "@/lib/Constant";
import type { PaginationParams } from "@/types/api.types";

export type { InventoryMovementType };

export interface LowStockProduct {
  _id: string;
  name: string;
  slug?: string;
  sku?: string;
  stock: number;
  lowStockAlert?: number;
  thumbnail?: string;
  categoryId?: { _id: string; name: string; slug?: string } | string;
}

export interface StockProduct extends LowStockProduct {}

export interface ProductStock {
  productId: string;
  productName: string;
  currentStock: number;
  lowStockAlert: number;
  isInStock: boolean;
  isLowStock: boolean;
}

export interface StockHistoryEntry {
  _id: string;
  productId: string;
  type: InventoryMovementType;
  quantity: number;
  stockAfter: number;
  note?: string;
  orderId?: string;
  doneBy?: string | { _id: string; name: string; email?: string };
  createdAt: string;
}

export interface AddStockPayload {
  quantity: number;
  note?: string;
}

export interface ReduceStockPayload {
  quantity: number;
  type?: InventoryMovementType;
  note?: string;
}

export interface SetStockPayload {
  stock: number;
  note?: string;
}

/** GET /inventory/alerts/low-stock */
export interface LowStockQuery extends PaginationParams {
  categoryId?: string;
}

/** GET /inventory/stock */
export interface StockProductsQuery extends PaginationParams {
  categoryId?: string;
  stockStatus?: "low" | "ok" | "";
}

/** GET /inventory/:productId/history */
export interface StockHistoryQuery extends PaginationParams {
  type?: InventoryMovementType;
  sortBy?: "createdAt";
}
