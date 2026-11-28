"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import StoreProductCard from "@/components/store/StoreProductCard";
import MobileTabTitleHeader from "@/components/store/mobile/MobileTabTitleHeader";
import { useCategories, STORE_CATEGORY_QUERY } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { MOBILE_TAB_BAR_HEIGHT_PX } from "@/lib/store/mobile-chrome";
import { resolveCategoryId } from "@/lib/store/category-utils";
import { ROUTES, shopUrl } from "@/lib/routes";
import { PRODUCT_STATUS } from "@/lib/Constant";
import type { ApiProduct } from "@/types/product.types";

export default function MobileShopListingTab({
  cartCount,
  onCartOpen,
  onProductClick,
  onAddToCart,
  onWishlistToggle,
  isWishlisted,
}: {
  cartCount: number;
  onCartOpen: () => void;
  onProductClick: (product: ApiProduct) => void;
  onAddToCart: (product: ApiProduct) => void;
  onWishlistToggle: (product: ApiProduct) => void;
  isWishlisted: (id: string) => boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") ?? undefined;
  const search = searchParams.get("search")?.trim() || undefined;
  const brand = searchParams.get("brand")?.trim() || undefined;

  const { data: categoryData } = useCategories(STORE_CATEGORY_QUERY);
  const categories = categoryData?.categories ?? [];
  const categoryId = categoryParam ? resolveCategoryId(categories, categoryParam) : undefined;
  const categoryName = categoryId
    ? categories.find((c) => c._id === categoryId)?.name
    : undefined;

  const query = useMemo(
    () => ({
      status: PRODUCT_STATUS.ACTIVE,
      limit: 40,
      page: 1,
      sortBy: "createdAt" as const,
      sortOrder: "desc" as const,
      ...(categoryId ? { categoryId } : {}),
      ...(search ? { search } : {}),
      ...(brand ? { brand } : {}),
      ...(searchParams.get("sale") === "1" ? { hasDiscount: true } : {}),
      ...(searchParams.get("new") === "1" ? { isNew: true } : {}),
      ...(searchParams.get("bestseller") === "1" ? { isBestSeller: true } : {}),
      ...(searchParams.get("maxPrice")
        ? { maxPrice: Number(searchParams.get("maxPrice")) }
        : {}),
    }),
    [brand, categoryId, search, searchParams]
  );

  const { data, isLoading, isError, refetch } = useProducts(query);
  const products = data?.products ?? [];
  const title = categoryName ?? (search ? `“${search}”` : "Products");

  const openProduct = (product: ApiProduct) => {
    if (product.slug) {
      router.push(ROUTES.product(product.slug));
      return;
    }
    onProductClick(product);
  };

  return (
    <div className="min-h-[100dvh] bg-[#f1f3f6] md:hidden">
      <MobileTabTitleHeader title={title} cartCount={cartCount} onCartOpen={onCartOpen}>
        <button
          type="button"
          onClick={() => router.push(shopUrl({ categoryId }))}
          className="inline-flex items-center gap-1 border-0 bg-transparent p-0 text-sm font-bold text-[#0a255d]"
        >
          <ChevronLeft className="h-4 w-4" />
          Categories
        </button>
      </MobileTabTitleHeader>

      <div className="px-4 pt-2" style={{ paddingBottom: MOBILE_TAB_BAR_HEIGHT_PX + 16 }}>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
        ) : isError ? (
          <div className="py-12 text-center">
            <button type="button" onClick={() => void refetch()} className="text-sm font-bold text-[#0a255d]">
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product, index) => (
              <StoreProductCard
                key={product._id}
                product={product}
                index={index}
                onClick={openProduct}
                onAddToCart={onAddToCart}
                onWishlistToggle={onWishlistToggle}
                isWishlisted={isWishlisted(product._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}