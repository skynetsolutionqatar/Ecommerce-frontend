import { apiDelete, apiGet, apiPatch, apiPost } from "./client";
import type { PaginationMeta } from "@/types/api.types";
import type {
  ApiContentPage,
  ContentPageQuery,
  CreateContentPagePayload,
  UpdateContentPagePayload,
} from "@/types/content-page.types";

export const contentPageApi = {
  getAll: (params?: ContentPageQuery) =>
    apiGet<{ contentPages: ApiContentPage[] }>(
      "/content-pages",
      params as Record<string, unknown>
    ),

  getById: (id: string) =>
    apiGet<{ contentPage: ApiContentPage }>(`/content-pages/${id}`),

  getBySlug: (slug: string) =>
    apiGet<{ contentPage: ApiContentPage }>(`/content-pages/slug/${slug}`),

  getManageBySlug: (slug: string) =>
    apiGet<{ contentPage: ApiContentPage }>(`/content-pages/manage/slug/${slug}`),

  create: (payload: CreateContentPagePayload) =>
    apiPost<{ contentPage: ApiContentPage }>("/content-pages/add", payload),

  update: (id: string, payload: UpdateContentPagePayload) =>
    apiPatch<{ contentPage: ApiContentPage }>(`/content-pages/${id}`, payload),

  delete: (id: string) =>
    apiDelete<{ contentPage: ApiContentPage }>(`/content-pages/${id}`),
};

export type ContentPagesResult = {
  contentPages: ApiContentPage[];
  pagination?: PaginationMeta;
};

export async function fetchContentPages(
  params?: ContentPageQuery
): Promise<ContentPagesResult> {
  const res = await contentPageApi.getAll(params);
  return {
    contentPages: res.data.contentPages ?? [],
    pagination: res.pagination,
  };
}

export async function fetchContentPage(id: string): Promise<ApiContentPage> {
  const res = await contentPageApi.getById(id);
  return res.data.contentPage;
}

export async function fetchContentPageBySlug(slug: string): Promise<ApiContentPage> {
  const res = await contentPageApi.getBySlug(slug);
  return res.data.contentPage;
}

export async function fetchAdminContentPageBySlug(slug: string): Promise<ApiContentPage> {
  const res = await contentPageApi.getManageBySlug(slug);
  return res.data.contentPage;
}
