"use client";

import ShopPage from "@/components/ShopPage";
import { useStore } from "@/components/StoreProvider";
import { useSearchParams } from "next/navigation";

export default function ShopPageClient() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? undefined;
  const { addToCart, buyNow, toggleWishlist, isWishlisted, openProduct, goToShop } = useStore();

  return (
    <ShopPage
      onAddToCart={addToCart}
      onBuyNow={buyNow}
      onWishlistToggle={toggleWishlist}
      isWishlisted={isWishlisted}
      onProductClick={openProduct}
      initialCategory={category}
      onHomeClick={() => goToShop()}
    />
  );
}
