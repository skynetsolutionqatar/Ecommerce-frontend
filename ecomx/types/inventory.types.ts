import type { InventoryMovementType } from "@/lib/Constant";

export type { InventoryMovementType };

export interface LowStockProduct {
  _id: string;
  name: string;
  slug?: string;
  sku?: string;
  stock: number;
  lowStockAlert?: number;
  thumbnail?: string;
}

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
