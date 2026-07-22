import * as Yup from "yup";
import { PRODUCT_STATUS } from "@/lib/Constant";
import { positiveNumber, positiveNumberOptional } from "@/components/admin/utils/Validations";
import { slugify } from "@/lib/utils";
import type { ApiProduct, CreateProductPayload } from "@/types/product.types";

export { slugify };

export type ProductFormValues = {
  name: string;
  slug: string;
  sku: string;
  barcode: string;
  categoryId: string;
  shortDescription: string;
  description: string;
  brand: string;
  tags: string;
  price: number | "";
  compareAtPrice: number | "";
  costPrice: number | "";
  taxPercent: number | "";
  badge: string;
  badgeColor: string;
  thumbnail: string;
  images: string;
  stock: number | "";
  lowStockAlert: number | "";
  trackInventory: boolean;
  isFreeShipping: boolean;
  weight: number | "";
  length: number | "";
  width: number | "";
  height: number | "";
  status: string;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isDigital: boolean;
  hasVariants: boolean;
};

export const defaultProductFormValues: ProductFormValues = {
  name: "",
  slug: "",
  sku: "",
  barcode: "",
  categoryId: "",
  shortDescription: "",
  description: "",
  brand: "",
  tags: "",
  price: "",
  compareAtPrice: "",
  costPrice: "",
  taxPercent: "",
  badge: "",
  badgeColor: "",
  thumbnail: "",
  images: "",
  stock: "",
  lowStockAlert: "",
  trackInventory: true,
  isFreeShipping: false,
  weight: "",
  length: "",
  width: "",
  height: "",
  status: PRODUCT_STATUS.DRAFT,
  isFeatured: false,
  isNew: false,
  isBestSeller: false,
  isDigital: false,
  hasVariants: false,
};

export const productValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Product name is required")
    .min(2, "Name must be at least 2 characters")
    .max(200, "Name must be at most 200 characters"),
  slug: Yup.string()
    .trim()
    .required("Slug is required")
    .lowercase("Slug must be lowercase")
    .matches(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  categoryId: Yup.string().required("Category is required"),
  price: positiveNumber,
  compareAtPrice: positiveNumberOptional,
  costPrice: positiveNumberOptional,
  taxPercent: Yup.number()
    .typeError("Must be a number")
    .min(0, "Cannot be negative")
    .max(100, "Cannot exceed 100")
    .nullable()
    .transform((value, original) => (original === "" ? undefined : value)),
  stock: positiveNumberOptional,
  lowStockAlert: positiveNumberOptional,
  weight: positiveNumberOptional,
  length: positiveNumberOptional,
  width: positiveNumberOptional,
  height: positiveNumberOptional,
  status: Yup.string()
    .oneOf(Object.values(PRODUCT_STATUS), "Invalid status")
    .required("Status is required"),
});

export function resolveCategoryId(product?: ApiProduct): string {
  if (!product?.categoryId) return "";
  if (typeof product.categoryId === "object") return product.categoryId._id;
  return product.categoryId;
}

export function resolveCategoryName(product?: ApiProduct): string {
  if (!product?.categoryId) return "—";
  if (typeof product.categoryId === "object") return product.categoryId.name;
  return product.categoryId;
}

function formatListField(values?: string[]): string {
  return values?.join(", ") ?? "";
}

function formatImagesField(values?: string[]): string {
  return values?.join("\n") ?? "";
}

function parseCommaList(value: string): string[] | undefined {
  const items = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length ? items : undefined;
}

function parseLineList(value: string): string[] | undefined {
  const items = value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length ? items : undefined;
}

function toOptionalNumber(value: number | ""): number | undefined {
  return value === "" ? undefined : Number(value);
}

export function toProductFormValues(product?: ApiProduct): ProductFormValues {
  if (!product) return defaultProductFormValues;

  return {
    name: product.name ?? "",
    slug: product.slug ?? "",
    sku: product.sku ?? "",
    barcode: product.barcode ?? "",
    categoryId: resolveCategoryId(product),
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    brand: product.brand ?? "",
    tags: formatListField(product.tags),
    price: product.price ?? "",
    compareAtPrice: product.compareAtPrice ?? "",
    costPrice: product.costPrice ?? "",
    taxPercent: product.taxPercent ?? "",
    badge: product.badge ?? "",
    badgeColor: product.badgeColor ?? "",
    thumbnail: product.thumbnail ?? "",
    images: formatImagesField(product.images),
    stock: product.stock ?? "",
    lowStockAlert: product.lowStockAlert ?? "",
    trackInventory: product.trackInventory ?? true,
    isFreeShipping: product.isFreeShipping ?? false,
    weight: product.dimensions?.weight ?? "",
    length: product.dimensions?.length ?? "",
    width: product.dimensions?.width ?? "",
    height: product.dimensions?.height ?? "",
    status: product.status ?? PRODUCT_STATUS.DRAFT,
    isFeatured: product.isFeatured ?? false,
    isNew: product.isNew ?? false,
    isBestSeller: product.isBestSeller ?? false,
    isDigital: product.isDigital ?? false,
    hasVariants: product.hasVariants ?? false,
  };
}

export function toCreateProductPayload(values: ProductFormValues): CreateProductPayload {
  const dimensions =
    values.weight !== "" ||
    values.length !== "" ||
    values.width !== "" ||
    values.height !== ""
      ? {
          weight: toOptionalNumber(values.weight) ?? 0,
          length: toOptionalNumber(values.length) ?? 0,
          width: toOptionalNumber(values.width) ?? 0,
          height: toOptionalNumber(values.height) ?? 0,
        }
      : undefined;

  return {
    name: values.name.trim(),
    slug: values.slug.trim().toLowerCase(),
    categoryId: values.categoryId,
    price: Number(values.price),
    sku: values.sku.trim() || undefined,
    barcode: values.barcode.trim() || undefined,
    shortDescription: values.shortDescription.trim() || undefined,
    description: values.description.trim() || undefined,
    brand: values.brand.trim() || undefined,
    tags: parseCommaList(values.tags),
    compareAtPrice: toOptionalNumber(values.compareAtPrice),
    costPrice: toOptionalNumber(values.costPrice),
    taxPercent: toOptionalNumber(values.taxPercent),
    badge: values.badge.trim() || undefined,
    badgeColor: values.badgeColor.trim() || undefined,
    thumbnail: values.thumbnail.trim() || undefined,
    images: parseLineList(values.images),
    stock: toOptionalNumber(values.stock),
    lowStockAlert: toOptionalNumber(values.lowStockAlert),
    trackInventory: values.trackInventory,
    isFreeShipping: values.isFreeShipping,
    dimensions,
    status: values.status as CreateProductPayload["status"],
    isFeatured: values.isFeatured,
    isNew: values.isNew,
    isBestSeller: values.isBestSeller,
    isDigital: values.isDigital,
    hasVariants: values.hasVariants,
  };
}
