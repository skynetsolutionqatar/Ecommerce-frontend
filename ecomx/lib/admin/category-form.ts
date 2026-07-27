import * as Yup from "yup";
import { positiveNumberOptional } from "@/components/admin/utils/Validations";
import type { ApiCategory, CreateCategoryPayload, UpdateCategoryPayload } from "@/types/category.types";

export type CategoryFormValues = {
  name: string;
  slug: string;
  description: string;
  image: string;
  color: string;
  imgKey: string;
  isParent: boolean;
  parent: string;
  displayOrder: number | "";
  isActive: boolean;
};

export const defaultCategoryFormValues: CategoryFormValues = {
  name: "",
  slug: "",
  description: "",
  image: "",
  color: "#111827",
  imgKey: "",
  isParent: false,
  parent: "",
  displayOrder: "",
  isActive: true,
};

export const categoryValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Category name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  slug: Yup.string()
    .trim()
    .required("Slug is required")
    .lowercase("Slug must be lowercase")
    .matches(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: Yup.string().max(500, "Description cannot exceed 500 characters"),
  isParent: Yup.boolean(),
  parent: Yup.string().when("isParent", {
    is: true,
    then: (schema) => schema.notRequired(),
    otherwise: (schema) =>
      schema.required("Select a parent category or mark as parent category"),
  }),
  displayOrder: positiveNumberOptional,
  isActive: Yup.boolean(),
});

export function resolveParentId(category?: ApiCategory): string {
  if (!category?.parent) return "";
  if (typeof category.parent === "object") return category.parent._id;
  return category.parent;
}

export function resolveParentName(category?: ApiCategory): string {
  if (!category?.parent) return "—";
  if (typeof category.parent === "object") return category.parent.name;
  return category.parent;
}

export function toCategoryFormValues(category?: ApiCategory): CategoryFormValues {
  if (!category) return defaultCategoryFormValues;

  return {
    name: category.name ?? "",
    slug: category.slug ?? "",
    description: category.description ?? "",
    image: category.image ?? "",
    color: category.color ?? "#111827",
    imgKey: category.imgKey ?? "",
    isParent: category.isParent ?? false,
    parent: category.isParent ? "" : resolveParentId(category),
    displayOrder: category.displayOrder ?? "",
    isActive: category.isActive ?? true,
  };
}

export function toCreateCategoryPayload(values: CategoryFormValues): CreateCategoryPayload {
  const payload: CreateCategoryPayload = {
    name: values.name.trim(),
    slug: values.slug.trim().toLowerCase(),
    description: values.description.trim() || undefined,
    image: values.image.trim() || undefined,
    color: values.color.trim() || undefined,
    imgKey: values.imgKey.trim() || undefined,
    isParent: values.isParent,
    displayOrder: values.displayOrder === "" ? undefined : Number(values.displayOrder),
    isActive: values.isActive,
  };

  if (!values.isParent && values.parent.trim()) {
    payload.parent = values.parent.trim();
  }

  return payload;
}

export function toUpdateCategoryPayload(values: CategoryFormValues): UpdateCategoryPayload {
  const payload = toCreateCategoryPayload(values);
  const { slug: _slug, ...rest } = payload;
  return rest;
}
