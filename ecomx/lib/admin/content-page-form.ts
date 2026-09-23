import * as Yup from "yup";
import { positiveNumberOptional } from "@/components/admin/utils/Validations";
import type {
  ApiContentPage,
  CreateContentPagePayload,
  UpdateContentPagePayload,
} from "@/types/content-page.types";

export type ContentPageFormValues = {
  title: string;
  slug: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  footerLabel: string;
  showInFooter: boolean;
  displayOrder: number | "";
  isPublished: boolean;
};

export const defaultContentPageFormValues: ContentPageFormValues = {
  title: "",
  slug: "",
  titleAr: "",
  body: "",
  bodyAr: "",
  footerLabel: "",
  showInFooter: true,
  displayOrder: "",
  isPublished: true,
};

export const contentPageValidationSchema = Yup.object({
  title: Yup.string()
    .trim()
    .required("Title is required")
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be at most 200 characters"),
  slug: Yup.string()
    .trim()
    .required("Slug is required")
    .lowercase("Slug must be lowercase")
    .matches(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  titleAr: Yup.string().max(200, "Arabic title cannot exceed 200 characters"),
  body: Yup.string().max(50000, "Content is too long"),
  bodyAr: Yup.string().max(50000, "Arabic content is too long"),
  footerLabel: Yup.string().max(100, "Footer label cannot exceed 100 characters"),
  showInFooter: Yup.boolean(),
  displayOrder: positiveNumberOptional,
  isPublished: Yup.boolean(),
});

export function toContentPageFormValues(page?: ApiContentPage): ContentPageFormValues {
  if (!page) return defaultContentPageFormValues;
  return {
    title: page.title ?? "",
    slug: page.slug ?? "",
    titleAr: page.titleAr ?? "",
    body: page.body ?? "",
    bodyAr: page.bodyAr ?? "",
    footerLabel: page.footerLabel ?? "",
    showInFooter: page.showInFooter ?? true,
    displayOrder: page.displayOrder ?? "",
    isPublished: page.isPublished ?? true,
  };
}

export function toCreateContentPagePayload(
  values: ContentPageFormValues
): CreateContentPagePayload {
  return {
    title: values.title.trim(),
    slug: values.slug.trim(),
    titleAr: values.titleAr.trim() || undefined,
    body: values.body,
    bodyAr: values.bodyAr || undefined,
    footerLabel: values.footerLabel.trim() || values.title.trim(),
    showInFooter: values.showInFooter,
    displayOrder: values.displayOrder === "" ? 0 : Number(values.displayOrder),
    isPublished: values.isPublished,
  };
}

export function toUpdateContentPagePayload(
  values: ContentPageFormValues
): UpdateContentPagePayload {
  return toCreateContentPagePayload(values);
}

export const fixedContentPageValidationSchema = Yup.object({
  title: Yup.string()
    .trim()
    .required("Title is required")
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be at most 200 characters"),
  titleAr: Yup.string().max(200, "Arabic title cannot exceed 200 characters"),
  body: Yup.string().max(50000, "Content is too long"),
  bodyAr: Yup.string().max(50000, "Arabic content is too long"),
  footerLabel: Yup.string().max(100, "Footer label cannot exceed 100 characters"),
  showInFooter: Yup.boolean(),
  isPublished: Yup.boolean(),
});

export function toFixedContentPageUpdatePayload(
  values: ContentPageFormValues
): UpdateContentPagePayload {
  return {
    title: values.title.trim(),
    titleAr: values.titleAr.trim() || undefined,
    body: values.body,
    bodyAr: values.bodyAr || undefined,
    footerLabel: values.footerLabel.trim() || values.title.trim(),
    showInFooter: values.showInFooter,
    isPublished: values.isPublished,
  };
}
