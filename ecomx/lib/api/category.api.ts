import { apiDelete, apiGet, apiPatch, apiPost } from "./client";
import type { PaginationMeta } from "@/types/api.types";
import type {
  ApiCategory,
  CategoryQuery,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types/category.types";

export const categoryApi = {
  getAll: (params?: CategoryQuery) =>
    apiGet<{ categories: ApiCategory[] }>("/categories", params as Record<string, unknown>),

  getById: (id: string) => apiGet<{ category: ApiCategory }>(`/categories/${id}`),

  getBySlug: (slug: string) =>
    apiGet<{ category: ApiCategory }>(`/categories/slug/${slug}`),

  create: (payload: CreateCategoryPayload) =>
    apiPost<{ category: ApiCategory }>("/categories/add", payload),

  update: (id: string, payload: UpdateCategoryPayload) =>
    apiPatch<{ category: ApiCategory }>(`/categories/${id}`, payload),

  delete: (id: string) => apiDelete<{ category: ApiCategory }>(`/categories/${id}`),
};

export type CategoriesResult = {
  categories: ApiCategory[];
  pagination?: PaginationMeta;
};

export async function fetchCategories(params?: CategoryQuery): Promise<CategoriesResult> {
  const res = await categoryApi.getAll(params);
  return {
    categories: res.data.categories ?? (res.data as unknown as ApiCategory[]),
    pagination: res.pagination,
  };
}

export async function fetchCategory(id: string): Promise<ApiCategory> {
  const res = await categoryApi.getById(id);
  return res.data.category;
}
