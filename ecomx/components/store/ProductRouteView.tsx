"use client";

import ProductPage from "@/components/ProductPage";
import { useProductBySlug } from "@/hooks/useProducts";
import { apiProductToStoreProduct } from "@/lib/store/product-mapper";
import type { StorePage } from "@/lib/routes";
import type { Product, WishlistItem } from "@/lib/types";

interface ProductRouteViewProps {
  page: Extract<StorePage, { type: "product" }>;
  onAddToCart: (product: Product, color: string, size: string) => void;
  onWishlistToggle: (item: WishlistItem) => void;
  wishlist: WishlistItem[];
  onBack: () => void;
  onProductClick: (product: Product) => void;
}

export default function ProductRouteView({
  page,
  onAddToCart,
  onWishlistToggle,
  wishlist,
  onBack,
  onProductClick,
}: ProductRouteViewProps) {
  const staticProduct = page.product;
  const { data, isLoading, isError } = useProductBySlug(page.slug, !staticProduct);

  const product = staticProduct ?? (data ? apiProductToStoreProduct(data) : null);

  if (!staticProduct && isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center pt-24">
        <p className="text-sm text-gray-500">Loading product...</p>
      </div>
    );
  }

  if (!product || isError) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 pt-24">
        <p className="text-sm text-gray-600">Product not found.</p>
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
        >
          Back to shop
        </button>
      </div>
    );
  }

  return (
    <ProductPage
      key={product.id}
      product={product}
      onAddToCart={onAddToCart}
      onWishlistToggle={onWishlistToggle}
      isWishlisted={wishlist.some((w) => w.id === product.id)}
      onBack={onBack}
      onProductClick={onProductClick}
      wishlist={wishlist}
    />
  );
}
