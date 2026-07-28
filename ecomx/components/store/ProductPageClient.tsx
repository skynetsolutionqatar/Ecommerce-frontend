"use client";

import ProductRouteView from "@/components/store/ProductRouteView";
import { useStore } from "@/components/StoreProvider";

interface ProductPageClientProps {
  slug: string;
}

export default function ProductPageClient({ slug }: ProductPageClientProps) {
  const { addToCart, toggleWishlist, isWishlisted, openProduct } = useStore();

  return (
    <ProductRouteView
      slug={slug}
      onAddToCart={addToCart}
      onWishlistToggle={toggleWishlist}
      isWishlisted={isWishlisted}
      onProductClick={openProduct}
    />
  );
}
