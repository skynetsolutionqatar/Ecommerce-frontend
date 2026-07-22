import type { OrderStatus } from "@/lib/Constant";

export type { OrderStatus };

export interface OrderItem {
  productId: string;
  name: string;
  slug?: string;
  thumbnail?: string;
  image?: string;
  sku?: string;
  price: number;
  quantity: number;
  variant?: string;
  subtotal?: number;
}

export interface OrderAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
}

export interface OrderStatusHistoryEntry {
  status: string;
  note?: string;
  timestamp?: string;
}

export interface ApiOrder {
  _id: string;
  tenantId: string;
  customerId: string | { _id: string; name: string; email: string };
  orderNumber: string;
  items: OrderItem[];
  deliveryAddress: OrderAddress;
  /** @deprecated use deliveryAddress */
  shippingAddress?: OrderAddress;
  status: OrderStatus;
  paymentStatus?: string;
  paymentMethod?: string;
  subtotal: number;
  shippingCharge?: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  /** @deprecated use totalAmount */
  total?: number;
  couponCode?: string;
  trackingNumber?: string;
  customerNote?: string;
  adminNote?: string;
  statusHistory?: OrderStatusHistoryEntry[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderStats {
  byStatus: Array<{
    _id: string;
    count: number;
    totalRevenue: number;
  }>;
  totalRevenue: number;
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
}

export interface UpdateOrderStatusPayload {
  status: string;
  note?: string;
  trackingNumber?: string;
}

export interface PlaceOrderPayload {
  deliveryAddress?: OrderAddress;
  shippingAddressId?: string;
  shippingAddress?: OrderAddress;
  paymentMethod?: string;
  customerNote?: string;
  couponCode?: string;
  notes?: string;
}

export function orderTotal(order: ApiOrder): number {
  return order.totalAmount ?? order.total ?? 0;
}

export function orderAddress(order: ApiOrder): OrderAddress {
  return order.deliveryAddress ?? order.shippingAddress!;
}
