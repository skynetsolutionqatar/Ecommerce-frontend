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
import type {
  ApiCategory,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types/category.types";
import ImageUpload from "@/components/ImageUpload";
import { UploadedImage } from "@/lib/api/upload.api";

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
  onSubmit: (
    payload: CreateCategoryPayload | UpdateCategoryPayload
  ) => void | Promise<void>;
}

function CategoryForm({
  initialCategory,
  isEdit = false,
  isPending = false,
  onSubmit,
}: CategoryFormProps) {
  const { data: categoryData, isLoading: categoriesLoading } = useCategories({
    limit: 100,
    sortBy: "name",
    sortOrder: "asc",
  });
  const categories = categoryData?.categories ?? [];

  const parentOptions = useMemo(
    () =>
      categories
        .filter(
          (cat) => cat._id !== initialCategory?._id && cat.isParent === true
        )
        .map((cat) => ({ label: cat.name, value: cat._id })),
    [categories, initialCategory?._id]
  );

  const formik = useFormik({
    initialValues: initialCategory
      ? toCategoryFormValues(initialCategory)
      : defaultCategoryFormValues,
    validationSchema: categoryValidationSchema,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        const payload = isEdit
          ? toUpdateCategoryPayload(values)
          : toCreateCategoryPayload(values);
        await onSubmit(payload);
      } catch {
        toast.error(
          isEdit ? "Failed to update category" : "Failed to create category"
        );
      }
    },
  });

  const {
    handleChange,
    handleBlur,
    values,
    errors,
    touched,
    handleSubmit,
    setFieldValue,
    setValues,
    submitCount,
  } = formik;

  const showParentError =
    Boolean(errors.parent) &&
    (touched.parent || touched.isParent || submitCount > 0);

  const handleNameBlur: React.FocusEventHandler<HTMLInputElement> = (event) => {
    handleBlur(event);
    if (!isEdit && !values.slug.trim() && values.name.trim()) {
      void setFieldValue("slug", slugify(values.name));
    }
  };

  const handleIsParentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    void setValues(
      {
        ...values,
        isParent: checked,
        parent: checked ? "" : values.parent,
      },
      true
    );
  };

  const handleParentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const parent = event.target.value;
    void setValues(
      {
        ...values,
        parent,
        isParent: parent ? false : values.isParent,
      },
      true
    );
  };

  const handleCategoryUpload = (uploaded: UploadedImage[]) => {
    const image = uploaded[0];
    if (!image) return;

    void setFieldValue("image", image.url);
    void setFieldValue("imgKey", image.publicId);
  };

  const handleRemoveCategoryImage = () => {
    void setFieldValue("image", "");
    void setFieldValue("imgKey", "");
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
            <FormCheckbox
              label="Is Parent Category"
              name="isParent"
              checked={values.isParent}
              onChange={handleIsParentChange}
              onBlur={handleBlur}
            />
            <FormSelect
              label="Parent"
              name="parent"
              value={values.parent}
              placeholder={
                categoriesLoading ? "Loading..." : "Select parent category"
              }
              required={!values.isParent}
              disabled={values.isParent || categoriesLoading}
              options={parentOptions}
              error={showParentError ? errors.parent : undefined}
              touched={showParentError}
              onChange={handleParentChange}
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
          <div className="space-y-6">
            <ImageUpload
              type="category"
              existingImages={values.image ? [values.image] : []}
              onRemoveExisting={handleRemoveCategoryImage}
              onUpload={handleCategoryUpload}
            />

            <div className={`${formGridClass} lg:grid-cols-2`}>
              <FormInput
                label="Image URL"
                name="image"
                value={values.image}
                placeholder="Filled automatically after upload"
                error={errors.image}
                touched={touched.image}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <FormInput
                label="Cloudinary Public ID"
                name="imgKey"
                value={values.imgKey}
                placeholder="Filled automatically after upload"
                error={errors.imgKey}
                touched={touched.imgKey}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
          </div>
        </FormSection>
      </form>
    </div>
  );
}

export default React.memo(CategoryForm);
