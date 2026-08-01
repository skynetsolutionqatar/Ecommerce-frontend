import { ORDER_STATUS } from "@/lib/Constant";
import type { ApiOrder } from "@/types/order.types";
import type { ApiReview } from "@/types/review.types";

export function reviewedProductIds(reviews: ApiReview[]): Set<string> {
  const ids = new Set<string>();
  for (const review of reviews) {
    const productId =
      typeof review.productId === "object" ? review.productId._id : review.productId;
    if (productId) ids.add(productId);
  }
  return ids;
}

export function findReviewableOrder(
  orders: ApiOrder[],
  productId: string,
  alreadyReviewed: Set<string>
): ApiOrder | null {
  if (alreadyReviewed.has(productId)) return null;

  return (
    orders.find(
      (order) =>
        order.status === ORDER_STATUS.DELIVERED &&
        order.items.some((item) => item.productId === productId)
    ) ?? null
  );
}

export function canReviewProduct(
  orders: ApiOrder[],
  productId: string,
  alreadyReviewed: Set<string>
): boolean {
  return findReviewableOrder(orders, productId, alreadyReviewed) != null;
}
