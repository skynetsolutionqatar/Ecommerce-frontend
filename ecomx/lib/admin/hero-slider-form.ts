import * as Yup from "yup";
import type { ApiHeroSlider, CreateHeroSliderPayload, UpdateHeroSliderPayload } from "@/types/hero-slider.types";

export const HERO_SLIDER_FORM_ID = "hero-slider-form";

const hexColor = Yup.string()
  .nullable()
  .matches(/^$|^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Use a hex color like #0a255d")
  .transform((v) => v ?? "");

export type HeroSliderFormValues = {
  offerLabel: string;
  eyebrow: string;
  title: string;
  sub: string;
  note: string;
  cta: string;
  img: string;
  posterImg: string;
  posterImgMobile: string;
  isPoster: boolean;
  productSlug: string;
  price: string;
  compareAtPrice: string;
  discount: string;
  surfaceColor: string;
  accentColor: string;
  accentNeon: string;
  displayOrder: string;
  isPublished: boolean;
  isArchived: boolean;
};

export const defaultHeroSliderFormValues: HeroSliderFormValues = {
  offerLabel: "",
  eyebrow: "FEATURED",
  title: "",
  sub: "",
  note: "",
  cta: "Shop Now",
  img: "",
  posterImg: "",
  posterImgMobile: "",
  isPoster: false,
  productSlug: "",
  price: "",
  compareAtPrice: "",
  discount: "",
  surfaceColor: "#f8fafc",
  accentColor: "#0a255d",
  accentNeon: "#3b82f6",
  displayOrder: "0",
  isPublished: true,
  isArchived: false,
};

export const heroSliderValidationSchema = Yup.object({
  offerLabel: Yup.string().max(80),
  eyebrow: Yup.string().max(80),
  title: Yup.string()
    .trim()
    .max(200)
    .when("isPoster", {
      is: true,
      then: (schema) => schema,
      otherwise: (schema) => schema.required("Title is required for content slides"),
    }),
  sub: Yup.string().max(500),
  note: Yup.string().max(200),
  cta: Yup.string().max(40),
  img: Yup.string(),
  posterImg: Yup.string(),
  posterImgMobile: Yup.string(),
  isPoster: Yup.boolean(),
  productSlug: Yup.string().max(120),
  price: Yup.string().matches(/^$|^\d+(\.\d{1,2})?$/, "Invalid price"),
  compareAtPrice: Yup.string().matches(/^$|^\d+(\.\d{1,2})?$/, "Invalid price"),
  discount: Yup.string().matches(/^$|^\d{1,3}$/, "0–100"),
  surfaceColor: hexColor,
  accentColor: hexColor,
  accentNeon: hexColor,
  displayOrder: Yup.string().matches(/^\d{1,3}$/, "0–999"),
  isPublished: Yup.boolean(),
  isArchived: Yup.boolean(),
})
  .test(
    "poster-desktop",
    "Desktop poster is required when poster mode is on",
    (values) => !values?.isPoster || Boolean(values.posterImg?.trim())
  )
  .test(
    "poster-mobile-partial",
    "Upload the desktop poster before saving a mobile poster",
    (values) => {
      if (!values?.isPoster) return true;
      const mobile = values.posterImgMobile?.trim() ?? "";
      const desktop = values.posterImg?.trim() ?? "";
      if (mobile && !desktop) return false;
      return true;
    }
  )
  .test(
    "poster-dual",
    "Upload both desktop (1920×620) and mobile (1080×1350) posters for responsive poster slides",
    (values) => {
      if (!values?.isPoster) return true;
      const mobile = values.posterImgMobile?.trim() ?? "";
      const desktop = values.posterImg?.trim() ?? "";
      if (!mobile) return true;
      return Boolean(desktop);
    }
  );

export function toHeroSliderFormValues(slide: ApiHeroSlider): HeroSliderFormValues {
  return {
    offerLabel: slide.offerLabel ?? "",
    eyebrow: slide.eyebrow ?? "",
    title: slide.title,
    sub: slide.sub ?? "",
    note: slide.note ?? "",
    cta: slide.cta ?? "Shop Now",
    img: slide.img ?? "",
    posterImg: slide.posterImg ?? "",
    posterImgMobile: slide.posterImgMobile ?? "",
    isPoster: slide.isPoster === true,
    productSlug: slide.productSlug ?? "",
    price: slide.price != null ? String(slide.price) : "",
    compareAtPrice: slide.compareAtPrice != null ? String(slide.compareAtPrice) : "",
    discount: slide.discount != null ? String(slide.discount) : "",
    surfaceColor: slide.surfaceColor ?? "#f8fafc",
    accentColor: slide.accentColor ?? "#0a255d",
    accentNeon: slide.accentNeon ?? "#3b82f6",
    displayOrder: String(slide.displayOrder ?? 0),
    isPublished: slide.isPublished !== false,
    isArchived: slide.isArchived === true,
  };
}

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
}

export function toCreateHeroSliderPayload(values: HeroSliderFormValues): CreateHeroSliderPayload {
  return {
    offerLabel: values.offerLabel.trim(),
    eyebrow: values.eyebrow.trim(),
    title: values.title.trim(),
    sub: values.sub.trim(),
    note: values.note.trim(),
    cta: values.cta.trim() || "Shop Now",
    img: values.img.trim(),
    posterImg: values.posterImg.trim(),
    posterImgMobile: values.posterImgMobile.trim(),
    isPoster: values.isPoster,
    productSlug: values.productSlug.trim() || undefined,
    price: parseOptionalNumber(values.price),
    compareAtPrice: parseOptionalNumber(values.compareAtPrice),
    discount: parseOptionalNumber(values.discount),
    surfaceColor: values.surfaceColor.trim() || undefined,
    accentColor: values.accentColor.trim() || undefined,
    accentNeon: values.accentNeon.trim() || undefined,
    displayOrder: Number(values.displayOrder) || 0,
    isPublished: values.isPublished,
    isArchived: values.isArchived,
  };
}

export function toUpdateHeroSliderPayload(values: HeroSliderFormValues): UpdateHeroSliderPayload {
  return toCreateHeroSliderPayload(values);
}
