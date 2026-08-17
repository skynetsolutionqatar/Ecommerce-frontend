import { apiDelete, apiGet, apiPatch, apiPost } from "./client";
import type { PaginationMeta } from "@/types/api.types";
import type {
  ApiReview,
  CreateReviewPayload,
  ModerateReviewPayload,
  MyReviewQuery,
  ProductReviewQuery,
  ReviewQueryParams,
} from "@/types/review.types";

/** Requires /reviews route mounted on backend */
export const reviewApi = {
  getProductReviews: (productId: string, params?: ProductReviewQuery) =>
    apiGet<{ reviews: ApiReview[]; ratingBreakdown?: Record<number, number> }>(
      `/reviews/products/${productId}`,
      params as Record<string, unknown>
    ),

  getMyReviews: (params?: MyReviewQuery) =>
    apiGet<{ reviews: ApiReview[] }>("/reviews/my", params as Record<string, unknown>),

  getAll: (params?: ReviewQueryParams) =>
    apiGet<{ reviews: ApiReview[] }>("/reviews", params as Record<string, unknown>),

  moderate: (id: string, payload: ModerateReviewPayload) =>
    apiPatch<{ review: ApiReview }>(`/reviews/${id}/moderate`, payload),

  adminDelete: (id: string) => apiDelete<{ review: ApiReview }>(`/reviews/${id}/admin`),

  create: (payload: CreateReviewPayload) =>
    apiPost<{ review: ApiReview }>("/reviews", payload),
};

export type ReviewsResult = {
  reviews: ApiReview[];
  pagination?: PaginationMeta;
  ratingBreakdown?: Record<number, number>;
};

export async function fetchReviews(params?: ReviewQueryParams): Promise<ReviewsResult> {
  const res = await reviewApi.getAll(params);
  return { reviews: res.data.reviews, pagination: res.pagination };
}

export async function fetchProductReviews(
  productId: string,
  params?: ProductReviewQuery
): Promise<ReviewsResult> {
  const res = await reviewApi.getProductReviews(productId, params);
  return {
    reviews: res.data.reviews,
    pagination: res.pagination,
    ratingBreakdown: res.data.ratingBreakdown,
  };
}

export async function fetchMyReviews(params?: MyReviewQuery): Promise<ReviewsResult> {
  const res = await reviewApi.getMyReviews(params);
  return { reviews: res.data.reviews, pagination: res.pagination };
}
