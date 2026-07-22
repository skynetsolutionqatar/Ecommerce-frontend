"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchReviews, reviewApi } from "@/lib/api/review.api";
import type { ModerateReviewPayload, ReviewQueryParams } from "@/types/review.types";

export const REVIEWS_KEY = "reviews";
export const REVIEW_KEY = "review";

export function useReviews(params?: ReviewQueryParams) {
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
      const reviews = await fetchReviews({ limit: 200 });
      const review = reviews.find((item) => item._id === id);
      if (!review) throw new Error("Review not found");
      return review;
    },
    enabled: !!id,
    retry: false,
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
