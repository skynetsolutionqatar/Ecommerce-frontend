import { apiDelete, apiGet, apiPost } from "./client";
import type { ApiProduct } from "@/types/product.types";
import type {
  WishlistCheckResponse,
  WishlistGetResponse,
  WishlistIdsResponse,
  WishlistMergeResponse,
  WishlistToggleResponse,
} from "@/types/wishlist.types";

export const wishlistApi = {
  getAll: () => apiGet<WishlistGetResponse>("/wishlist"),

  getIds: () => apiGet<WishlistIdsResponse>("/wishlist/ids"),

  check: (productId: string) => apiGet<WishlistCheckResponse>(`/wishlist/check/${productId}`),

  toggle: (productId: string) =>
    apiPost<WishlistToggleResponse>("/wishlist/toggle", { productId }),

  merge: (productIds: string[]) =>
    apiPost<WishlistMergeResponse>("/wishlist/merge", { productIds }),

  moveToCart: (productId: string) =>
    apiPost<{ product: ApiProduct }>(`/wishlist/move-to-cart/${productId}`),

  clear: () => apiDelete<Record<string, never>>("/wishlist"),
};
