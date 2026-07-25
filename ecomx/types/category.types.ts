import type { PaginationParams } from "@/types/api.types";

/** Populated parent category reference from backend `.populate("parent")`. */
export interface ApiCategoryRef {
  _id: string;
  name: string;
  slug: string;
}

/** GET /categories query — matches backend category.service filters. */
export interface CategoryQuery extends PaginationParams {
  tree?: boolean;
  isParent?: boolean;
  isActive?: boolean;
  /** MongoId, or `"null"` / `"root"` for root categories */
  parent?: string;
  sortBy?: "displayOrder" | "name" | "createdAt";
}

/** Category document shape from SKYNET ECOMMERCE B backend. */
export interface ApiCategory {
  _id: string;
  tenantId: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  color?: string;
  imgKey?: string;
  parent?: string | ApiCategoryRef | null;
  isParent?: boolean;
  displayOrder?: number;
  isActive?: boolean;
  children?: ApiCategory[];
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** POST /categories/add body — keys match backend model + validation. */
export interface CreateCategoryPayload {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  color?: string;
  imgKey?: string;
  parent?: string | null;
  isParent?: boolean;
  displayOrder?: number;
  isActive?: boolean;
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export type CategorySubmitPayload = CreateCategoryPayload | UpdateCategoryPayload;
