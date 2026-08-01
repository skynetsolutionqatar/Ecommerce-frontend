"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchReviews, fetchProductReviews, fetchMyReviews, reviewApi } from "@/lib/api/review.api";
import type {
  CreateReviewPayload,
  ModerateReviewPayload,
  MyReviewQuery,
  ProductReviewQuery,
  ReviewQueryParams,
} from "@/types/review.types";

export const REVIEWS_KEY = "reviews";
export const REVIEW_KEY = "review";

export function useReviews(params?: ReviewQueryParams) {
  return useQuery({
    queryKey: [REVIEWS_KEY, params],
    queryFn: () => fetchReviews(params),
    staleTime: 60_000,
    retry: false,
    placeholderData: (prev) => prev,
    select: (data) => data.reviews,
  });
}

export function useReviewsWithMeta(params?: ReviewQueryParams) {
  return useQuery({
    queryKey: [REVIEWS_KEY, params],
    queryFn: () => fetchReviews(params),
    staleTime: 60_000,
    retry: false,
    placeholderData: (prev) => prev,
  });
}

export function useReview(id: string) {
  return useQuery({
    queryKey: [REVIEW_KEY, id],
    queryFn: async () => {
      const result = await fetchReviews({ limit: 200 });
      const review = result.reviews.find((item) => item._id === id);
      if (!review) throw new Error("Review not found");
      return review;
    },
    enabled: !!id,
    retry: false,
  });
}

export function useProductReviews(productId: string, params?: ProductReviewQuery) {
  return useQuery({
    queryKey: [REVIEWS_KEY, "product", productId, params],
    queryFn: () => fetchProductReviews(productId, params),
    enabled: !!productId,
    staleTime: 60_000,
    retry: false,
  });
}

export function useMyReviews(params?: MyReviewQuery, enabled = true) {
  return useQuery({
    queryKey: [REVIEWS_KEY, "my", params],
    queryFn: () => fetchMyReviews(params),
    enabled,
    staleTime: 60_000,
    retry: false,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => reviewApi.create(payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: [REVIEWS_KEY] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      void queryClient.invalidateQueries({ queryKey: ["product"] });
      void queryClient.invalidateQueries({ queryKey: [REVIEWS_KEY, "product", variables.productId] });
    },
  });
}

export function useReviewMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [REVIEWS_KEY] });
    void queryClient.invalidateQueries({ queryKey: [REVIEW_KEY] });
  };

  const moderate = useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & ModerateReviewPayload) =>
      reviewApi.moderate(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => reviewApi.adminDelete(id),
    onSuccess: invalidate,
  });

  return { moderate, remove };
}
