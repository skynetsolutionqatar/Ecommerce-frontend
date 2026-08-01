import type { ApiProduct } from "@/types/product.types";

export interface ApiCartItem {
  _id: string;
  productId: string | Pick<ApiProduct, "_id" | "name" | "slug" | "price" | "thumbnail" | "images" | "stock">;
  name: string;
  thumbnail?: string;
  slug?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface ApiCart {
  _id: string;
  customerId: string;
  tenantId: string;
  items: ApiCartItem[];
  totalItems?: number;
  totalAmount?: number;
  finalAmount?: number;
  couponCode?: string | null;
  discountAmount?: number;
}

export interface AddToCartPayload {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}

export interface CartGetResponse {
  cart: ApiCart;
}

export interface CartMutationResponse {
  cart: ApiCart;
}
