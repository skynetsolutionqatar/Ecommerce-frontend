"use client";

import ProductRouteView from "@/components/store/ProductRouteView";
import { useStore } from "@/components/StoreProvider";

interface ProductPageClientProps {
  slug: string;
}

export default function ProductPageClient({ slug }: ProductPageClientProps) {
  const { addToCart, buyNow, toggleWishlist, isWishlisted, openProduct } = useStore();

  return (
    <ProductRouteView
      slug={slug}
      onAddToCart={addToCart}
      onBuyNow={buyNow}
      onWishlistToggle={toggleWishlist}
      isWishlisted={isWishlisted}
      onProductClick={openProduct}
    />
  );
}
