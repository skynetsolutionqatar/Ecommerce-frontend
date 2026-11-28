"use client";

import ShopPage from "@/components/ShopPage";
import MobileCategoriesTab from "@/components/store/mobile/MobileCategoriesTab";
import MobileDealsTab from "@/components/store/mobile/MobileDealsTab";
import MobileShopListingTab from "@/components/store/mobile/MobileShopListingTab";
import { useStore } from "@/components/StoreProvider";
import {
  isMobileCategoriesTab,
  isMobileDealsTab,
  isMobileShopListingTab,
} from "@/lib/store/mobile-chrome";
import { apiProductToStoreProduct } from "@/lib/store/product-mapper";
import { apiProductToWishlistItem } from "@/lib/store/wishlist-helpers";
import { usePathname, useSearchParams } from "next/navigation";
import type { ApiProduct } from "@/types/product.types";

export default function ShopPageClient() {
  const searchParams = useSearchParams();
  const pathname = usePathname() ?? "/shop";
  const category = searchParams.get("category") ?? undefined;
  const {
    cart,
    addToCart,
    buyNow,
    toggleWishlist,
    isWishlisted,
    openProduct,
    goToShop,
    setCartOpen,
  } = useStore();

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const onProductClick = (product: ApiProduct) => {
    openProduct(apiProductToStoreProduct(product));
  };

  const onAddToCart = (product: ApiProduct) => {
    const mapped = apiProductToStoreProduct(product);
    addToCart(mapped, mapped.colors[0]?.name ?? "", mapped.sizes[0] ?? "");
  };

  const onWishlistToggle = (product: ApiProduct) => {
    toggleWishlist(apiProductToWishlistItem(product));
  };

  const showDeals = isMobileDealsTab(searchParams);
  const showListing = isMobileShopListingTab(searchParams);
  const showCategories = isMobileCategoriesTab(pathname, searchParams);

  return (
    <>
      <div className="md:hidden">
        {showDeals ? (
          <MobileDealsTab
            cartCount={cartCount}
            onCartOpen={() => setCartOpen(true)}
            onProductClick={onProductClick}
            onAddToCart={onAddToCart}
            onWishlistToggle={onWishlistToggle}
            isWishlisted={isWishlisted}
          />
        ) : showListing ? (
          <MobileShopListingTab
            cartCount={cartCount}
            onCartOpen={() => setCartOpen(true)}
            onProductClick={onProductClick}
            onAddToCart={onAddToCart}
            onWishlistToggle={onWishlistToggle}
            isWishlisted={isWishlisted}
          />
        ) : showCategories ? (
          <MobileCategoriesTab
            cartCount={cartCount}
            onCartOpen={() => setCartOpen(true)}
            onProductClick={onProductClick}
          />
        ) : null}
      </div>

      <div className="hidden md:block">
        <ShopPage
          onAddToCart={addToCart}
          onBuyNow={buyNow}
          onWishlistToggle={toggleWishlist}
          isWishlisted={isWishlisted}
          onProductClick={openProduct}
          initialCategory={category}
          onHomeClick={() => goToShop()}
        />
      </div>
    </>
  );
}