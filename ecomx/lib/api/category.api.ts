import { apiDelete, apiGet, apiPatch, apiPost } from "./client";
import type {
  ApiCategory,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types/category.types";

export const categoryApi = {
  getAll: () => apiGet<{ categories: ApiCategory[] }>("/categories"),

  getById: (id: string) => apiGet<{ category: ApiCategory }>(`/categories/${id}`),

  getBySlug: (slug: string) =>
    apiGet<{ category: ApiCategory }>(`/categories/slug/${slug}`),

  create: (payload: CreateCategoryPayload) =>
    apiPost<{ category: ApiCategory }>("/categories/add", payload),

  update: (id: string, payload: UpdateCategoryPayload) =>
    apiPatch<{ category: ApiCategory }>(`/categories/${id}`, payload),

  delete: (id: string) => apiDelete<{ category: ApiCategory }>(`/categories/${id}`),
};

export async function fetchCategories(): Promise<ApiCategory[]> {
  const res = await categoryApi.getAll();
  return res.data.categories ?? (res.data as unknown as ApiCategory[]);
}

export async function fetchCategory(id: string): Promise<ApiCategory> {
  const res = await categoryApi.getById(id);
  return res.data.category;
}
