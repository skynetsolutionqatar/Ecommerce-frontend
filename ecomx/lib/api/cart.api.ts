import { apiDelete, apiGet, apiPatch, apiPost } from "./client";
import type { PaginationMeta } from "@/types/api.types";
import type { AddToCartPayload, ApiCart, CartGetResponse, CartMutationResponse, UpdateCartItemPayload } from "@/types/cart.types";

export const cartApi = {
  get: () => apiGet<CartGetResponse>("/cart"),

  add: (payload: AddToCartPayload) => apiPost<CartMutationResponse>("/cart/add", payload),

  updateItem: (itemId: string, payload: UpdateCartItemPayload) =>
    apiPatch<CartMutationResponse>(`/cart/items/${itemId}`, payload),

  removeItem: (itemId: string) => apiDelete<CartMutationResponse>(`/cart/items/${itemId}`),

  clear: () => apiDelete<Record<string, never>>("/cart"),
};

export type CartResult = { cart: ApiCart; pagination?: PaginationMeta };

export async function fetchCart(): Promise<ApiCart> {
  const res = await cartApi.get();
  return res.data.cart;
}
