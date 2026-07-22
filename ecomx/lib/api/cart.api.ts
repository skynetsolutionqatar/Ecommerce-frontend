import { apiDelete, apiGet, apiPatch, apiPost } from "./client";
import type { PaginationMeta } from "@/types/api.types";
import type { AddToCartPayload, ApiCart, UpdateCartItemPayload } from "@/types/cart.types";

export const cartApi = {
  get: () => apiGet<{ cart: ApiCart }>("/cart"),

  add: (payload: AddToCartPayload) => apiPost<{ cart: ApiCart }>("/cart/add", payload),

  updateItem: (itemId: string, payload: UpdateCartItemPayload) =>
    apiPatch<{ cart: ApiCart }>(`/cart/items/${itemId}`, payload),

  removeItem: (itemId: string) => apiDelete<{ cart: ApiCart }>(`/cart/items/${itemId}`),

  clear: () => apiDelete<{ cart: ApiCart }>("/cart"),
};

export type CartResult = { cart: ApiCart; pagination?: PaginationMeta };

export async function fetchCart(): Promise<ApiCart> {
  const res = await cartApi.get();
  return res.data.cart;
}
