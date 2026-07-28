"use client";

import { useRouter } from "next/navigation";
import ProductPage from "@/components/ProductPage";
import { useProductBySlug } from "@/hooks/useProducts";
import { apiProductToStoreProduct } from "@/lib/store/product-mapper";
import { ROUTES } from "@/lib/routes";
import type { Product, WishlistItem } from "@/lib/types";

interface ProductRouteViewProps {
  slug: string;
  onAddToCart: (product: Product, color: string, size: string) => void;
  onWishlistToggle: (item: WishlistItem) => void;
  isWishlisted: (productId: string) => boolean;
  onProductClick: (product: Product) => void;
}

export default function ProductRouteView({
  slug,
  onAddToCart,
  onWishlistToggle,
  isWishlisted,
  onProductClick,
}: ProductRouteViewProps) {
  const router = useRouter();
  const { data, isLoading, isError } = useProductBySlug(slug);
  const product = data ? apiProductToStoreProduct(data) : null;

  if (isLoading) {
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
          onClick={() => router.push(ROUTES.shop)}
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
      isWishlisted={isWishlisted}
      onBack={() => router.back()}
      onProductClick={onProductClick}
    />
  );
}
