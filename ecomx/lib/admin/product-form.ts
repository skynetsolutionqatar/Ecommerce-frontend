import * as Yup from "yup";
import { PRODUCT_STATUS } from "@/lib/Constant";
import { positiveNumber, positiveNumberOptional } from "@/components/admin/utils/Validations";
import { resolveRefId, resolveRefName } from "@/lib/api/populated-ref";
import type { ApiProduct, CreateProductPayload } from "@/types/product.types";

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
  return resolveRefId(product?.categoryId);
}

export function resolveCategoryName(product?: ApiProduct): string {
  return resolveRefName(product?.categoryId);
}

function formatListField(values?: string[]): string {
  return values?.join(", ") ?? "";
}

function resolveImageUrl(value: unknown): string | null {
  if (value == null) return null;

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.url === "string") return resolveImageUrl(record.url);
  }

  return null;
}

function collectImageUrls(thumbnail?: unknown, images?: unknown): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();

  const add = (value: unknown) => {
    const url = resolveImageUrl(value);
    if (!url || seen.has(url)) return;
    seen.add(url);
    urls.push(url);
  };

  add(thumbnail);

  if (Array.isArray(images)) {
    for (const item of images) add(item);
  } else if (typeof images === "string") {
    for (const part of images.split(/[\n,]+/)) add(part);
  }

  return urls;
}

export function sameImageUrl(a: string, b: string): boolean {
  const left = resolveImageUrl(a);
  const right = resolveImageUrl(b);
  return Boolean(left && right && left === right);
}

function formatImagesField(values?: unknown): string {
  if (!values) return "";
  if (Array.isArray(values)) {
    return collectImageUrls(undefined, values).join("\n");
  }
  if (typeof values === "string") return values;
  return "";
}

function parseCommaList(value: string): string[] | undefined {
  const items = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length ? items : undefined;
}

export function productMediaUrls(thumbnail?: unknown, images?: unknown): string[] {
  return collectImageUrls(thumbnail, images);
}

export function parseImagesField(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function appendImagesToField(current: string, urls: string[]): string {
  const merged = [...parseImagesField(current), ...urls.filter(Boolean)];
  const unique: string[] = [];
  const seen = new Set<string>();

  for (const url of merged) {
    const resolved = resolveImageUrl(url) ?? url;
    if (seen.has(resolved)) continue;
    seen.add(resolved);
    unique.push(resolved);
  }

  return unique.join("\n");
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
    thumbnail: resolveImageUrl(product.thumbnail) ?? "",
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

  const imageUrls = parseImagesField(values.images);
  const thumbnail = values.thumbnail.trim();

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
    thumbnail: thumbnail || imageUrls[0] || "",
    images: imageUrls,
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
