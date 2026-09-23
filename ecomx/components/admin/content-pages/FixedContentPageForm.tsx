"use client";

import { useFormik } from "formik";
import {
  FormCheckbox,
  FormInput,
  FormSection,
  FormTextarea,
} from "@/components/admin/form";
import PageHeader from "@/components/admin/utils/PageHeader";
import {
  fixedContentPageValidationSchema,
  toContentPageFormValues,
  toFixedContentPageUpdatePayload,
} from "@/lib/admin/content-page-form";
import type { FixedContentPageResource } from "@/lib/admin/content-page-resources";
import { CONTENT_PAGE_FORM_ID } from "@/lib/admin/form-footer";
import type { ApiContentPage, UpdateContentPagePayload } from "@/types/content-page.types";

const formGridClass =
  "grid grid-cols-1 gap-x-16 gap-y-6 md:grid-cols-2 lg:grid-cols-3";

interface FixedContentPageFormProps {
  resource: FixedContentPageResource;
  initialPage?: ApiContentPage;
  isPending?: boolean;
  onSubmit: (payload: UpdateContentPagePayload) => void | Promise<void>;
}

export default function FixedContentPageForm({
  resource,
  initialPage,
  isPending = false,
  onSubmit,
}: FixedContentPageFormProps) {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: toContentPageFormValues(initialPage),
    validationSchema: fixedContentPageValidationSchema,
    onSubmit: (values) => {
      void onSubmit(toFixedContentPageUpdatePayload(values));
    },
  });

  return (
    <form id={CONTENT_PAGE_FORM_ID} onSubmit={formik.handleSubmit} className="space-y-8">
      <PageHeader title={resource.title} description={resource.description} />

      <FormSection id="settings" title="Display Settings">
        <div className={formGridClass}>
          <FormInput
            label="Title"
            name="title"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.title ? formik.errors.title : undefined}
            required
          />
          <FormInput
            label="Footer label"
            name="footerLabel"
            value={formik.values.footerLabel}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.footerLabel ? formik.errors.footerLabel : undefined}
            placeholder="Shown in footer link bar"
          />
          <FormCheckbox
            label="Show in footer"
            name="showInFooter"
            checked={formik.values.showInFooter}
            onChange={formik.handleChange}
          />
          <FormCheckbox
            label="Published"
            name="isPublished"
            checked={formik.values.isPublished}
            onChange={formik.handleChange}
          />
        </div>
      </FormSection>

      <FormSection id="content-en" title="English Content">
        <FormTextarea
          label="Body"
          name="body"
          value={formik.values.body}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.body ? formik.errors.body : undefined}
          rows={14}
          fullWidth
        />
      </FormSection>

      <FormSection id="content-ar" title="Arabic Content (optional)">
        <div className={formGridClass}>
          <FormInput
            label="Title (Arabic)"
            name="titleAr"
            value={formik.values.titleAr}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.titleAr ? formik.errors.titleAr : undefined}
          />
        </div>
        <FormTextarea
          label="Body (Arabic)"
          name="bodyAr"
          value={formik.values.bodyAr}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.bodyAr ? formik.errors.bodyAr : undefined}
          rows={14}
          fullWidth
          dir="rtl"
        />
      </FormSection>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Saving...</p>
      ) : null}
    </form>
  );
}
