"use client";

import React, { useMemo } from "react";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import {
  FormCheckbox,
  FormInput,
  FormNumberInput,
  FormSection,
  FormSelect,
  FormTextarea,
} from "@/components/admin/form";
import PageHeader from "@/components/admin/utils/PageHeader";
import { useCategories } from "@/hooks/useCategories";
import {
  categoryValidationSchema,
  defaultCategoryFormValues,
  toCategoryFormValues,
  toCreateCategoryPayload,
  toUpdateCategoryPayload,
} from "@/lib/admin/category-form";
import { CATEGORY_FORM_ID } from "@/lib/admin/form-footer";
import { slugify } from "@/lib/utils";
import type { ApiCategory, CreateCategoryPayload, UpdateCategoryPayload } from "@/types/category.types";

export const CATEGORY_FORM_TABS = [
  { key: "basic", label: "Basic Info" },
  { key: "display", label: "Display" },
  { key: "media", label: "Media" },
] as const;

const formGridClass =
  "grid grid-cols-1 gap-x-16 gap-y-6 md:grid-cols-2 lg:grid-cols-3";

interface CategoryFormProps {
  initialCategory?: ApiCategory;
  isEdit?: boolean;
  isPending?: boolean;
  onSubmit: (payload: CreateCategoryPayload | UpdateCategoryPayload) => void | Promise<void>;
}

function CategoryForm({
  initialCategory,
  isEdit = false,
  isPending = false,
  onSubmit,
}: CategoryFormProps) {
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const parentOptions = useMemo(
    () =>
      categories
        .filter((cat) => cat._id !== initialCategory?._id)
        .map((cat) => ({ label: cat.name, value: cat._id })),
    [categories, initialCategory?._id]
  );

  const formik = useFormik({
    initialValues: initialCategory ? toCategoryFormValues(initialCategory) : defaultCategoryFormValues,
    validationSchema: categoryValidationSchema,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        const payload = isEdit ? toUpdateCategoryPayload(values) : toCreateCategoryPayload(values);
        await onSubmit(payload);
      } catch {
        toast.error(isEdit ? "Failed to update category" : "Failed to create category");
      }
    },
  });

  const { handleChange, handleBlur, values, errors, touched, handleSubmit, setFieldValue } =
    formik;

  const handleNameBlur: React.FocusEventHandler<HTMLInputElement> = (event) => {
    handleBlur(event);
    if (!isEdit && !values.slug.trim() && values.name.trim()) {
      void setFieldValue("slug", slugify(values.name));
    }
  };

  return (
    <div className="mx-auto w-full">
      <PageHeader
        title={isEdit ? "Edit Category" : "Add Category"}
        description="Enter category details"
      />

      <form id={CATEGORY_FORM_ID} onSubmit={handleSubmit} className="space-y-8">
        <FormSection id="basic" title="Basic Info">
          <div className={formGridClass}>
            <FormInput
              label="Name"
              name="name"
              value={values.name}
              placeholder="Category name"
              required
              error={errors.name}
              touched={touched.name}
              onChange={handleChange}
              onBlur={handleNameBlur}
            />
            <FormInput
              label="Slug"
              name="slug"
              value={values.slug}
              placeholder="category-slug"
              required
              readOnly={isEdit}
              error={errors.slug}
              touched={touched.slug}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormSelect
              label="Parent"
              name="parent"
              value={values.parent}
              placeholder={categoriesLoading ? "Loading..." : "None (root category)"}
              disabled={categoriesLoading}
              options={parentOptions}
              error={errors.parent}
              touched={touched.parent}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormTextarea
              label="Description"
              name="description"
              value={values.description}
              placeholder="Optional description"
              rows={3}
              error={errors.description}
              touched={touched.description}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
        </FormSection>

        <FormSection id="display" title="Display">
          <div className={formGridClass}>
            <FormNumberInput
              label="Order"
              name="displayOrder"
              value={values.displayOrder}
              placeholder="0"
              min={0}
              step={1}
              blockNegative
              error={errors.displayOrder}
              touched={touched.displayOrder}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput
              label="Color"
              name="color"
              value={values.color}
              placeholder="#111827"
              error={errors.color}
              touched={touched.color}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormCheckbox
              label="Active"
              name="isActive"
              checked={values.isActive}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
        </FormSection>

        <FormSection id="media" title="Media">
          <div className={`${formGridClass} lg:grid-cols-2`}>
            <FormInput
              label="Image URL"
              name="image"
              value={values.image}
              placeholder="https://..."
              error={errors.image}
              touched={touched.image}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput
              label="Img Key"
              name="imgKey"
              value={values.imgKey}
              placeholder="Storage key or asset id"
              error={errors.imgKey}
              touched={touched.imgKey}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
        </FormSection>
      </form>
    </div>
  );
}

export default React.memo(CategoryForm);
