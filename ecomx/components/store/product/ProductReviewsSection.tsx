"use client";

import type { Product } from "@/lib/types";
import type { useProductReviews } from "@/hooks/useReviews";
import { reviewBody, type ApiReview } from "@/types/review.types";
import { formatDate } from "@/lib/utils";
import StarRating from "./StarRating";

export interface ProductReviewEligibility {
  alreadyReviewed: boolean;
  isLoggedIn: boolean;
  hasReviewableOrder: boolean;
}

interface ProductReviewsSectionProps {
  product: Product;
  reviews: ReturnType<typeof useProductReviews>;
  reviewEligibility: ProductReviewEligibility;
  onWriteReview: () => void;
}

function reviewCustomerName(customerId: ApiReview["customerId"]) {
  if (typeof customerId === "object" && customerId?.name) return customerId.name;
  return "Customer";
}

export default function ProductReviewsSection({
  product,
  reviews,
  reviewEligibility,
  onWriteReview,
}: ProductReviewsSectionProps) {
  const { data: reviewsData, isLoading: reviewsLoading } = reviews;
  const productReviews = reviewsData?.reviews ?? [];
  const displayedReviews = productReviews.slice(0, 5);
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: productReviews.filter((r) => r.rating === star).length,
  }));
  const ratingSampleTotal = productReviews.length || 1;

  const { alreadyReviewed, isLoggedIn, hasReviewableOrder } = reviewEligibility;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white px-4 py-6 shadow-sm sm:px-6 md:px-8">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-[19px] font-bold text-gray-900">
          Customer Reviews
        </h2>
        <button
          type="button"
          className="cursor-pointer border-0 bg-transparent text-[14px] md:text-[13px] font-semibold text-blue-600 hover:underline"
        >
          View All Reviews →
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[200px_1fr]">
        {/* Summary */}
        <div>
          <div className="flex items-end gap-2">
            <span className="font-display text-[52px] font-extrabold leading-none text-gray-900">
              {product.rating}
            </span>
            <div className="pb-1">
              <StarRating rating={product.rating} size={18} />
              <p className="mt-1 text-[12px] md:text-[11px] text-gray-500">
                Based on {product.reviews} reviews
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-1.5">
            {ratingCounts.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="w-3 text-right text-[12px] md:text-[11px] font-semibold text-gray-600">
                  {star}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round((count / ratingSampleTotal) * 100)}%`,
                      background:
                        star >= 4 ? "#1d4ed8" : star === 3 ? "#94a3b8" : "#e2e8f0",
                    }}
                  />
                </div>
                <span className="w-7 text-right text-[12px] md:text-[11px] text-gray-400">{count}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onWriteReview}
            className="mt-4 cursor-pointer rounded-lg border border-blue-600 bg-transparent px-4 py-2.5 md:py-2 text-[13px] md:text-[12px] font-bold text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={alreadyReviewed}
          >
            {alreadyReviewed ? "Review Submitted" : "Write a Review"}
          </button>
          {!isLoggedIn ? (
            <p className="mt-2 text-[12px] md:text-[11px] text-gray-400">Sign in to leave a review</p>
          ) : !alreadyReviewed && !hasReviewableOrder ? (
            <p className="mt-2 text-[12px] md:text-[11px] text-gray-400">
              Available after your order is delivered
            </p>
          ) : null}
        </div>

        {/* Review cards */}
        <div className="flex flex-col gap-4">
          {reviewsLoading ? (
            <p className="text-sm text-gray-400">Loading reviews...</p>
          ) : displayedReviews.length === 0 ? (
            <p className="text-sm text-gray-400">No reviews yet. Be the first to review.</p>
          ) : (
            displayedReviews.map((rev) => {
              const name = reviewCustomerName(rev.customerId);
              const body = reviewBody(rev);
              return (
                <div key={rev._id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[14px] font-bold text-orange-600">
                        {name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-gray-900">{name}</div>
                        {rev.location ? (
                          <div className="text-[11px] text-gray-500">{rev.location}</div>
                        ) : null}
                      </div>
                    </div>
                    <div className="text-right">
                      <StarRating rating={rev.rating} size={12} />
                      <div className="mt-0.5 text-[11px] md:text-[10.5px] text-gray-400">
                        {formatDate(rev.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    {rev.orderId ? (
                      <span className="mb-1.5 inline-block rounded-full bg-green-50 px-2 py-0.5 text-[11px] md:text-[10px] font-bold text-green-600">
                        ✓ Verified Purchase
                      </span>
                    ) : null}
                    {rev.title ? (
                      <p className="text-[13px] font-semibold text-gray-900">{rev.title}</p>
                    ) : null}
                    {body ? (
                      <p className="mt-1 text-[12.5px] leading-relaxed text-gray-600">{body}</p>
                    ) : null}
                    {(rev.helpfulCount ?? 0) > 0 ? (
                      <div className="mt-2 text-[11px] text-gray-400">
                        👍 Helpful ({rev.helpfulCount})
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
