import { apiDelete, apiGet, apiPatch, apiPost } from "./client";
import type {
  ApiReview,
  CreateReviewPayload,
  ModerateReviewPayload,
  ReviewQueryParams,
} from "@/types/review.types";

/** Requires /reviews route mounted on backend */
export const reviewApi = {
  getProductReviews: (productId: string) =>
    apiGet<{ reviews: ApiReview[] }>(`/reviews/products/${productId}`),

  getAll: (params?: ReviewQueryParams) =>
    apiGet<{ reviews: ApiReview[] }>("/reviews", params as Record<string, unknown>),

  moderate: (id: string, payload: ModerateReviewPayload) =>
    apiPatch<{ review: ApiReview }>(`/reviews/${id}/moderate`, payload),

  adminDelete: (id: string) => apiDelete<{ review: ApiReview }>(`/reviews/${id}/admin`),

  create: (payload: CreateReviewPayload) =>
    apiPost<{ review: ApiReview }>("/reviews", payload),
};

export async function fetchReviews(params?: ReviewQueryParams): Promise<ApiReview[]> {
  const res = await reviewApi.getAll(params);
  return res.data.reviews;
}
