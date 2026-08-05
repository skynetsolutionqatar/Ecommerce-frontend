"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import LazyMount from "@/components/LazyMount";
import WriteReviewModal from "@/components/store/WriteReviewModal";
import ProductBreadcrumb from "@/components/store/product/ProductBreadcrumb";
import ProductDetailTabs from "@/components/store/product/ProductDetailTabs";
import ProductGallery from "@/components/store/product/ProductGallery";
import ProductPurchasePanel from "@/components/store/product/ProductPurchasePanel";
import ProductReviewsSection from "@/components/store/product/ProductReviewsSection";
import RelatedProductsSection from "@/components/store/product/RelatedProductsSection";
import { useStore } from "@/components/StoreProvider";
import { useProductGallery } from "@/hooks/useProductGallery";
import { useProductPurchase } from "@/hooks/useProductPurchase";
import { useProductReviewEligibility } from "@/hooks/useProductReviewEligibility";
import { useProductReviews } from "@/hooks/useReviews";
import { useRelatedProducts } from "@/hooks/useRelatedProducts";
import {
  buildProductSpecs,
  getProductHighlights,
  getProductTrustBadges,
  getRecommendedLabel,
} from "@/lib/store/product-display";
import { tw } from "@/lib/theme";
import type { Product, WishlistItem } from "@/lib/types";

interface ProductPageProps {
  product: Product;
  onAddToCart: (product: Product, color: string, size: string, qty?: number) => void;
  onBuyNow: (product: Product, color: string, size: string, qty?: number) => Promise<boolean>;
  onWishlistToggle: (item: WishlistItem) => void;
  isWishlisted: (productId: string) => boolean;
  onBack: () => void;
  onProductClick: (product: Product) => void;
}

export default function ProductPage({
  product,
  onAddToCart,
  onBuyNow,
  onWishlistToggle,
  isWishlisted,
  onBack,
  onProductClick,
}: ProductPageProps) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const { user, setLoginOpen } = useStore();
  const isLoggedIn = !!user;

  const gallery = useProductGallery(product.id, product.images.length);
  const purchase = useProductPurchase({ product, onAddToCart, onBuyNow });
  const reviews = useProductReviews(product.id, {
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const reviewEligibility = useProductReviewEligibility(product.id, isLoggedIn);
  const { products: relatedProducts, isLoading: relatedLoading } = useRelatedProducts(product);

  const productSpecs = useMemo(() => buildProductSpecs(product), [product]);
  const trustBadges = useMemo(() => getProductTrustBadges(product), [product]);
  const productHighlights = useMemo(() => getProductHighlights(product), [product]);
  const recommendedLabel = useMemo(() => getRecommendedLabel(product), [product]);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const crumbs = ["Home", product.category || "Shop", product.name];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [product.id]);

  const handleWriteReview = () => {
    if (!isLoggedIn) {
      setLoginOpen(true);
      return;
    }
    if (reviewEligibility.alreadyReviewed) {
      toast("You already submitted a review for this product.", { icon: "ℹ️" });
      return;
    }
    if (!reviewEligibility.reviewableOrder) {
      toast.error("You can review this product after your order is delivered.");
      return;
    }
    setReviewOpen(true);
  };

  return (
    <div className={`${tw.pageTopOffset} min-h-screen pb-10`} style={{ background: "#f1f3f6" }}>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-3 pt-4 sm:px-5 md:px-8 lg:px-[50px]">
        <ProductBreadcrumb crumbs={crumbs} onNavigateBack={onBack} />

        <div className="rounded-2xl border border-gray-100 bg-white px-4 py-6 shadow-sm sm:px-6 md:px-8 lg:py-8">
          {product.sku ? (
            <div className="mb-2 flex justify-end">
              <span className="text-[12px] md:text-[11px] text-gray-400">SKU: {product.sku}</span>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[58%_42%] xl:grid-cols-[60%_40%]">
            <ProductGallery
              product={product}
              discount={discount}
              isWishlisted={isWishlisted(product.id)}
              onWishlistToggle={onWishlistToggle}
              gallery={gallery}
            />

            <ProductPurchasePanel
              product={product}
              discount={discount}
              recommendedLabel={recommendedLabel}
              trustBadges={trustBadges}
              purchase={purchase}
            />
          </div>
        </div>

        <LazyMount>
          <ProductDetailTabs
            product={product}
            productSpecs={productSpecs}
            productHighlights={productHighlights}
          />

          <ProductReviewsSection
            product={product}
            reviews={reviews}
            reviewEligibility={{
              alreadyReviewed: reviewEligibility.alreadyReviewed,
              isLoggedIn,
              hasReviewableOrder: !!reviewEligibility.reviewableOrder,
            }}
            onWriteReview={handleWriteReview}
          />

          <RelatedProductsSection
            products={relatedProducts}
            isLoading={relatedLoading}
            onProductClick={onProductClick}
            onAddToCart={onAddToCart}
            onWishlistToggle={onWishlistToggle}
            isWishlisted={isWishlisted}
          />
        </LazyMount>
      </div>

      {reviewEligibility.reviewableOrder ? (
        <WriteReviewModal
          open={reviewOpen}
          productId={product.id}
          orderId={reviewEligibility.reviewableOrder._id}
          productName={product.name}
          onClose={() => setReviewOpen(false)}
          onSuccess={() => {
            void reviewEligibility.refetchMyReviews();
            void reviews.refetch();
          }}
        />
      ) : null}
    </div>
  );
}
