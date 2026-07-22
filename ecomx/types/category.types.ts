/** Populated parent category reference from backend `.populate("parent")`. */
export interface ApiCategoryRef {
  _id: string;
  name: string;
  slug: string;
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
  displayOrder?: number;
  isActive?: boolean;
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export type CategorySubmitPayload = CreateCategoryPayload | UpdateCategoryPayload;
