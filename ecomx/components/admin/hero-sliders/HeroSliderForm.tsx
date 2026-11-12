"use client";

import { useFormik } from "formik";
import ImageUpload from "@/components/ImageUpload";
import {
  FormCheckbox,
  FormInput,
  FormNumberInput,
  FormSection,
  FormTextarea,
} from "@/components/admin/form";
import PageHeader from "@/components/admin/utils/PageHeader";
import HeroSliderModePanel from "@/components/admin/hero-sliders/HeroSliderModePanel";
import {
  defaultHeroSliderFormValues,
  heroSliderValidationSchema,
  HERO_SLIDER_FORM_ID,
  toCreateHeroSliderPayload,
  toHeroSliderFormValues,
  toUpdateHeroSliderPayload,
} from "@/lib/admin/hero-slider-form";
import { posterPairIsComplete } from "@/lib/admin/hero-poster-upload";
import type { ApiHeroSlider, CreateHeroSliderPayload, UpdateHeroSliderPayload } from "@/types/hero-slider.types";

const formGridClass = "grid grid-cols-1 gap-x-16 gap-y-6 md:grid-cols-2 lg:grid-cols-3";

interface HeroSliderFormProps {
  initialSlide?: ApiHeroSlider;
  isEdit?: boolean;
  isPending?: boolean;
  onSubmit: (payload: CreateHeroSliderPayload | UpdateHeroSliderPayload) => void | Promise<void>;
}

export default function HeroSliderForm({
  initialSlide,
  isEdit = false,
  isPending = false,
  onSubmit,
}: HeroSliderFormProps) {
  const formik = useFormik({
    initialValues: initialSlide ? toHeroSliderFormValues(initialSlide) : defaultHeroSliderFormValues,
    validationSchema: heroSliderValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const payload = isEdit ? toUpdateHeroSliderPayload(values) : toCreateHeroSliderPayload(values);
      await onSubmit(payload);
    },
  });

  const { handleChange, handleBlur, values, errors, touched, setFieldValue, handleSubmit } = formik;
  const posterReady = posterPairIsComplete(values.posterImg, values.posterImgMobile);
  const posterLegacyReady = Boolean(values.posterImg?.trim());
  const posterFieldErrors = errors as Record<string, string | undefined>;
  const posterFormError = [
    posterFieldErrors["poster-desktop"],
    posterFieldErrors["poster-mobile-partial"],
    posterFieldErrors["poster-dual"],
  ]
    .filter(Boolean)
    .map(String)[0];
  return (
    <form id={HERO_SLIDER_FORM_ID} onSubmit={handleSubmit} className="space-y-6">
      <PageHeader
        title={isEdit ? "Edit hero slide" : "Add hero slide"}
        description="Content panel is your default hero copy and product image. Open the poster panel when you need a full-cover weekend offer."
      />

      <HeroSliderModePanel
        id="hero-content-mode"
        title="Content handling"
        description="Copy, pricing, colors, and product image for the standard hero layout. Stays saved when you use poster mode."
        defaultOpen
      >
        <FormSection id="identity" title="Identity & status" tabScrollAnchor={false}>
          <div className={formGridClass}>
            <FormInput
              label="Offer label (optional)"
              name="offerLabel"
              value={values.offerLabel}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.offerLabel}
              touched={touched.offerLabel}
              placeholder="e.g. Friday scanner offer"
            />
            <FormNumberInput
              label="Display order"
              name="displayOrder"
              value={values.displayOrder}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.displayOrder}
              touched={touched.displayOrder}
            />
            <FormCheckbox
              label="Published on storefront (live on site)"
              name="isPublished"
              checked={values.isPublished}
              onChange={handleChange}
              disabled={values.isArchived || isPending}
            />
            <FormCheckbox
              label="Archived (hide from storefront; keep all content & images)"
              name="isArchived"
              checked={values.isArchived}
              onChange={(e) => {
                const archived = e.target.checked;
                void setFieldValue("isArchived", archived);
                if (archived) void setFieldValue("isPublished", false);
              }}
            />
          </div>
        </FormSection>

        <FormSection id="content" title="Content" tabScrollAnchor={false}>
          <div className={formGridClass}>
            <FormInput
              label="Eyebrow"
              name="eyebrow"
              value={values.eyebrow}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.eyebrow}
              touched={touched.eyebrow}
            />
            <FormInput
              label="Title"
              name="title"
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.title}
              touched={touched.title}
              required={!values.isPoster}
            />
            <FormInput
              label="CTA label"
              name="cta"
              value={values.cta}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.cta}
              touched={touched.cta}
            />
            <FormTextarea
              label="Subtitle"
              name="sub"
              value={values.sub}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.sub}
              touched={touched.sub}
              fullWidth
              rows={4}
            />
            <FormTextarea
              label="Footnote"
              name="note"
              value={values.note}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.note}
              touched={touched.note}
            />
            <FormInput
              label="Product slug (CTA link)"
              name="productSlug"
              value={values.productSlug}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.productSlug}
              touched={touched.productSlug}
              placeholder="Optional"
            />
          </div>
        </FormSection>

        <FormSection id="pricing" title="Pricing (optional)" tabScrollAnchor={false}>
          <div className={formGridClass}>
            <FormInput label="Price (QAR)" name="price" value={values.price} onChange={handleChange} onBlur={handleBlur} />
            <FormInput
              label="Compare at"
              name="compareAtPrice"
              value={values.compareAtPrice}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput label="Discount %" name="discount" value={values.discount} onChange={handleChange} onBlur={handleBlur} />
          </div>
        </FormSection>

        <FormSection id="colors" title="Colors" tabScrollAnchor={false}>
          <div className={formGridClass}>
            <FormInput
              label="Surface / background"
              name="surfaceColor"
              value={values.surfaceColor}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.surfaceColor}
              touched={touched.surfaceColor}
              placeholder="#f8fafc"
            />
            <FormInput
              label="Accent"
              name="accentColor"
              value={values.accentColor}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.accentColor}
              touched={touched.accentColor}
              placeholder="#0a255d"
            />
            <FormInput
              label="Accent highlight"
              name="accentNeon"
              value={values.accentNeon}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.accentNeon}
              touched={touched.accentNeon}
              placeholder="#3b82f6"
            />
          </div>
        </FormSection>

        <FormSection id="image" title="Product / content image" tabScrollAnchor={false}>
          <ImageUpload
            type="slider"
            existingImages={values.img ? [values.img] : []}
            onUpload={(images) => {
              const url = images[0]?.url;
              if (url) void setFieldValue("img", url);
            }}
            onRemoveExisting={() => void setFieldValue("img", "")}
            onRemoveUploaded={() => void setFieldValue("img", "")}
          />
        </FormSection>
      </HeroSliderModePanel>

      <HeroSliderModePanel
        id="hero-poster-mode"
        title="Poster handling"
        description="Full-cover offer image and storefront poster toggle. Collapsed by default — expand when uploading Friday/Sunday posters."
        defaultOpen={false}
      >
        <FormSection id="display-mode" title="Storefront poster" tabScrollAnchor={false}>
          <div className="space-y-4">
            <FormCheckbox
              label="Show as full-cover poster on the live site"
              name="isPoster"
              checked={values.isPoster}
              onChange={handleChange}
            />
            {posterReady ? (
              <p className="text-xs text-emerald-700">
                Desktop and mobile posters are set — responsive poster layout on the live site.
              </p>
            ) : posterLegacyReady ? (
              <p className="text-xs text-emerald-700">
                Desktop poster is set (existing layout). Add a mobile poster for better phone layout.
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Poster mode needs a desktop image (1920×620). Add mobile (1080×1350) for responsive posters.
              </p>
            )}
            {values.isPoster && !posterLegacyReady && (posterFormError || touched.isPoster) ? (
              <p className="text-xs text-rose-600">
                {posterFormError ?? "Desktop poster is required when poster mode is on."}
              </p>
            ) : null}
            <div className="space-y-4 rounded-lg border border-dashed border-border bg-slate-50/80 p-4">
              <ImageUpload
                type="sliderPoster"
                existingImages={values.posterImg ? [values.posterImg] : []}
                onUpload={(images) => {
                  const url = images[0]?.url;
                  if (url) void setFieldValue("posterImg", url);
                }}
                onRemoveExisting={() => void setFieldValue("posterImg", "")}
                onRemoveUploaded={() => void setFieldValue("posterImg", "")}
              />
              <ImageUpload
                type="sliderPosterMobile"
                existingImages={values.posterImgMobile ? [values.posterImgMobile] : []}
                onUpload={(images) => {
                  const url = images[0]?.url;
                  if (url) void setFieldValue("posterImgMobile", url);
                }}
                onRemoveExisting={() => void setFieldValue("posterImgMobile", "")}
                onRemoveUploaded={() => void setFieldValue("posterImgMobile", "")}
              />
              <p className="text-xs text-slate-600">
                Removing a poster file only clears that asset. Content handling fields stay saved.
              </p>
            </div>
          </div>
        </FormSection>
      </HeroSliderModePanel>
    </form>
  );
}
