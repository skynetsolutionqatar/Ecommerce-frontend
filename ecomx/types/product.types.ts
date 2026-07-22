import type { ProductStatus } from "@/lib/Constant";

export type { ProductStatus };

/** Populated category reference from backend `.populate("categoryId")`. */
export interface ApiCategoryRef {
  _id: string;
  name: string;
  slug: string;
}

export interface ProductVariant {
  name: string;
  value: string;
  price?: number;
  sku?: string;
  stock?: number;
  image?: string;
}

export interface ProductColor {
  name?: string;
  hex?: string;
}

export interface ProductDimensions {
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
}

/** Product document shape from SKYNET ECOMMERCE B backend. */
export interface ApiProduct {
  _id: string;
  tenantId: string;
  name: string;
  slug: string;
  sku?: string;
  barcode?: string;
  shortDescription?: string;
  description?: string;
  categoryId?: string | ApiCategoryRef;
  tags?: string[];
  brand?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  taxPercent?: number;
  badge?: string;
  badgeColor?: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  colors?: ProductColor[];
  displaySizes?: string[];
  images?: string[];
  thumbnail?: string;
  hasVariants?: boolean;
  variants?: ProductVariant[];
  stock?: number;
  lowStockAlert?: number;
  trackInventory?: boolean;
  isFreeShipping?: boolean;
  dimensions?: ProductDimensions;
  status: ProductStatus;
  isFeatured?: boolean;
  isDigital?: boolean;
  totalSold?: number;
  averageRating?: number;
  reviewCount?: number;
  isLowStock?: boolean;
  isInStock?: boolean;
  discountPercent?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  brand?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/** POST /products/add body — keys match backend model + validation. */
export interface CreateProductPayload {
  name: string;
  slug: string;
  categoryId: string;
  price: number;
  sku?: string;
  barcode?: string;
  shortDescription?: string;
  description?: string;
  tags?: string[];
  brand?: string;
  compareAtPrice?: number;
  costPrice?: number;
  taxPercent?: number;
  badge?: string;
  badgeColor?: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  colors?: ProductColor[];
  displaySizes?: string[];
  images?: string[];
  thumbnail?: string;
  hasVariants?: boolean;
  variants?: ProductVariant[];
  stock?: number;
  lowStockAlert?: number;
  trackInventory?: boolean;
  isFreeShipping?: boolean;
  dimensions?: ProductDimensions;
  status?: ProductStatus;
  isFeatured?: boolean;
  isDigital?: boolean;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;
