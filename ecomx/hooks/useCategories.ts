"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCategories, fetchCategory, categoryApi } from "@/lib/api/category.api";
import type { CreateCategoryPayload, UpdateCategoryPayload } from "@/types/category.types";

export const CATEGORIES_KEY = "categories";
export const CATEGORY_KEY = "category";

export function useCategories() {
  return useQuery({
    queryKey: [CATEGORIES_KEY],
    queryFn: fetchCategories,
    staleTime: 120_000,
  });
}

export function useCategory(id: string, enabled = true) {
  return useQuery({
    queryKey: [CATEGORY_KEY, id],
    queryFn: () => fetchCategory(id),
    enabled: !!id && enabled,
    staleTime: 120_000,
  });
}

export function useCategoryMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
    void queryClient.invalidateQueries({ queryKey: [CATEGORY_KEY] });
  };

  const create = useMutation({
    mutationFn: (payload: CreateCategoryPayload) => categoryApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) =>
      categoryApi.update(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => categoryApi.delete(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
