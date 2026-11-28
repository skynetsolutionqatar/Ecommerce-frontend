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

const MAX_CATALOG_PAGES = 40;

/** Walk pagination so tail catalog items are not dropped on page 1 only. */
export async function fetchProductsAllPages(params?: ProductQueryParams): Promise<ProductsResult> {
  const limit = params?.limit ?? 100;
  let page = 1;
  const products: ApiProduct[] = [];
  let pagination: PaginationMeta | undefined;

  for (;;) {
    const res = await fetchProducts({ ...params, page, limit });
    products.push(...res.products);
    pagination = res.pagination;
    if (!res.pagination?.hasNextPage) break;
    page += 1;
    if (page > MAX_CATALOG_PAGES) break;
  }

  return { products, pagination };
}

/** Parent department scope: merge products for each category id (exact API match per id). */
export async function fetchProductsForCategoryScope(
  scopeIds: string[],
  params?: ProductQueryParams,
  allPages = false
): Promise<ProductsResult> {
  const uniqueScope = [...new Set(scopeIds.filter(Boolean))];
  const base: ProductQueryParams = { ...(params ?? {}) };

  if (uniqueScope.length === 0) {
    return allPages ? fetchProductsAllPages(base) : fetchProducts(base);
  }

  if (uniqueScope.length === 1) {
    const single = { ...base, categoryId: uniqueScope[0] };
    return allPages ? fetchProductsAllPages(single) : fetchProducts(single);
  }

  const pages = await Promise.all(
    uniqueScope.map((categoryId) => fetchProductsAllPages({ ...base, categoryId }))
  );
  const seen = new Set<string>();
  const products: ApiProduct[] = [];
  for (const page of pages) {
    for (const product of page.products) {
      if (seen.has(product._id)) continue;
      seen.add(product._id);
      products.push(product);
    }
  }
  return {
    products,
    pagination: {
      total: products.length,
      page: 1,
      limit: products.length || (params?.limit ?? 100),
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
  };
}
