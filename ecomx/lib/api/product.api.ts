import { apiDelete, apiGet, apiPatch, apiPost } from "./client";
import type { PaginationMeta } from "@/types/api.types";
import type {
  ApiProduct,
  CreateProductPayload,
  ProductQueryParams,
  UpdateProductPayload,
} from "@/types/product.types";

export const productApi = {
  getAll: (params?: ProductQueryParams) =>
    apiGet<{ products: ApiProduct[] }>("/products", params as Record<string, unknown>),

  getById: (id: string) => apiGet<{ product: ApiProduct }>(`/products/${id}`),

  getBySlug: (slug: string) =>
    apiGet<{ product: ApiProduct }>(`/products/slug/${slug}`),

  getByCategory: (categoryId: string, params?: ProductQueryParams) =>
    apiGet<{ products: ApiProduct[] }>(
      `/products/category/${categoryId}`,
      params as Record<string, unknown>
    ),

  create: (payload: CreateProductPayload) =>
    apiPost<{ product: ApiProduct }>("/products/add", payload),

  update: (id: string, payload: UpdateProductPayload) =>
    apiPatch<{ product: ApiProduct }>(`/products/${id}`, payload),

  delete: (id: string) => apiDelete<{ product: ApiProduct }>(`/products/${id}`),
};

export type ProductsResult = {
  products: ApiProduct[];
  pagination?: PaginationMeta;
};

export async function fetchProducts(params?: ProductQueryParams): Promise<ProductsResult> {
  const res = await productApi.getAll(params);
  return { products: res.data.products, pagination: res.pagination };
}

export async function fetchProduct(id: string): Promise<ApiProduct> {
  const res = await productApi.getById(id);
  return res.data.product;
}

export async function fetchProductBySlug(slug: string): Promise<ApiProduct> {
  const res = await productApi.getBySlug(slug);
  return res.data.product;
}
