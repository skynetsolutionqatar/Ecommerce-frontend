"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchContentPages,
  fetchContentPage,
  fetchContentPageBySlug,
  fetchAdminContentPageBySlug,
  contentPageApi,
} from "@/lib/api/content-page.api";
import type {
  ContentPageQuery,
  CreateContentPagePayload,
  UpdateContentPagePayload,
} from "@/types/content-page.types";

export const CONTENT_PAGES_KEY = "content-pages";
export const CONTENT_PAGE_KEY = "content-page";

export const FOOTER_CONTENT_QUERY: ContentPageQuery = {
  footer: true,
  sortBy: "displayOrder",
  sortOrder: "asc",
  limit: 20,
};

export function useContentPages(params?: ContentPageQuery, enabled = true) {
  return useQuery({
    queryKey: [CONTENT_PAGES_KEY, params],
    queryFn: () => fetchContentPages(params),
    staleTime: 300_000,
    placeholderData: (prev) => prev,
    enabled,
  });
}

export function useFooterContentPages(enabled = true) {
  return useContentPages(FOOTER_CONTENT_QUERY, enabled);
}

export function useContentPage(id: string, enabled = true) {
  return useQuery({
    queryKey: [CONTENT_PAGE_KEY, id],
    queryFn: () => fetchContentPage(id),
    enabled: !!id && enabled,
    staleTime: 120_000,
  });
}

export function useContentPageBySlug(slug: string, enabled = true) {
  return useQuery({
    queryKey: [CONTENT_PAGE_KEY, "slug", slug],
    queryFn: () => fetchContentPageBySlug(slug),
    enabled: !!slug && enabled,
    staleTime: 300_000,
  });
}

export function useAdminContentPageBySlug(slug: string, enabled = true) {
  return useQuery({
    queryKey: [CONTENT_PAGE_KEY, "manage", slug],
    queryFn: () => fetchAdminContentPageBySlug(slug),
    enabled: !!slug && enabled,
    staleTime: 120_000,
  });
}

export function useContentPageMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [CONTENT_PAGES_KEY] });
    void queryClient.invalidateQueries({ queryKey: [CONTENT_PAGE_KEY] });
  };

  const create = useMutation({
    mutationFn: (payload: CreateContentPagePayload) => contentPageApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateContentPagePayload }) =>
      contentPageApi.update(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => contentPageApi.delete(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
