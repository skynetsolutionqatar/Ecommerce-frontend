import type { Product, WishlistItem } from "@/lib/types";
import type { ApiProduct } from "@/types/product.types";
import type { ApiWishlist } from "@/types/wishlist.types";

export function apiProductToWishlistItem(product: ApiProduct): WishlistItem {
  return {
    id: product._id,
    name: product.name,
    brand: product.brand ?? "",
    price: product.price,
    img: product.thumbnail ?? product.images?.[0] ?? "",
  };
}

export function productToWishlistItem(product: Product): WishlistItem {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    img: product.images[0] ?? "",
  };
}

export function wishlistDocumentToItems(wishlist?: ApiWishlist | null): WishlistItem[] {
  if (!wishlist?.products?.length) return [];
  return wishlist.products.filter(Boolean).map(apiProductToWishlistItem);
}

export function wishlistDocumentToIds(wishlist?: ApiWishlist | null): string[] {
  return wishlistDocumentToItems(wishlist).map((item) => item.id);
}
