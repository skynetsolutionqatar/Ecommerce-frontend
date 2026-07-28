import type { ApiProduct } from "@/types/product.types";

export interface ApiWishlist {
  _id: string;
  customerId: string;
  tenantId: string;
  products: ApiProduct[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WishlistToggleResponse {
  wishlisted: boolean;
  productId: string;
}

export interface WishlistIdsResponse {
  productIds: string[];
}

export interface WishlistCheckResponse {
  wishlisted: boolean;
  productId: string;
}

export interface WishlistMergePayload {
  productIds: string[];
}

export interface WishlistMergeResponse {
  wishlist: ApiWishlist;
}

export interface WishlistGetResponse {
  wishlist: ApiWishlist;
  count: number;
}
