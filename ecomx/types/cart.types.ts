export interface CartItemVariant {
  name: string;
  value: string;
}

export interface ApiCartItem {
  _id: string;
  productId: string | { _id: string; name: string; slug: string; price: number; images?: string[]; thumbnail?: string };
  quantity: number;
  variant?: CartItemVariant;
  price: number;
  subtotal?: number;
}

export interface ApiCart {
  _id: string;
  customerId: string;
  tenantId: string;
  items: ApiCartItem[];
  subtotal?: number;
  itemCount?: number;
}

export interface AddToCartPayload {
  productId: string;
  quantity: number;
  variant?: CartItemVariant;
}

export interface UpdateCartItemPayload {
  quantity: number;
}
