"use client";

import { useMemo } from "react";
import { useMyOrders } from "@/hooks/useOrders";
import { useMyReviews } from "@/hooks/useReviews";
import { ORDER_STATUS } from "@/lib/Constant";
import {
  findReviewableOrder,
  reviewedProductIds,
} from "@/lib/store/review-eligibility";

export function useProductReviewEligibility(productId: string, isLoggedIn: boolean) {
  const { data: ordersData } = useMyOrders(
    { status: ORDER_STATUS.DELIVERED, limit: 50 },
    isLoggedIn
  );

  const { data: myReviewsData, refetch: refetchMyReviews } = useMyReviews(
    { limit: 100 },
    isLoggedIn
  );

  const reviewedIds = useMemo(
    () => reviewedProductIds(myReviewsData?.reviews ?? []),
    [myReviewsData?.reviews]
  );

  const reviewableOrder = useMemo(
    () => findReviewableOrder(ordersData?.orders ?? [], productId, reviewedIds),
    [ordersData?.orders, productId, reviewedIds]
  );

  return {
    alreadyReviewed: reviewedIds.has(productId),
    reviewableOrder,
    refetchMyReviews,
  };
}
