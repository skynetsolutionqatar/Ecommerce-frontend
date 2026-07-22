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
  defaultProductFormValues,
  productValidationSchema,
  toCreateProductPayload,
  toProductFormValues,
} from "@/lib/admin/product-form";
import { PRODUCT_FORM_ID } from "@/lib/admin/form-footer";
import { PRODUCT_STATUS } from "@/lib/Constant";
import { slugify } from "@/lib/utils";
import type { ApiProduct, CreateProductPayload } from "@/types/product.types";

export const PRODUCT_FORM_TABS = [
  { key: "identity", label: "Identity" },
  { key: "description", label: "Description" },
  { key: "pricing", label: "Pricing" },
  { key: "inventory", label: "Inventory" },
  { key: "media", label: "Media" },
  { key: "shipping", label: "Shipping" },
  { key: "status", label: "Status" },
] as const;

const formGridClass =
  "grid grid-cols-1 gap-x-16 gap-y-6 md:grid-cols-2 lg:grid-cols-3";

interface ProductFormProps {
  initialProduct?: ApiProduct;
  isEdit?: boolean;
  isPending?: boolean;
  onSubmit: (payload: CreateProductPayload) => void | Promise<void>;
}

function ProductForm({
  initialProduct,
  isEdit = false,
  isPending = false,
  onSubmit,
}: ProductFormProps) {
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const categoryOptions = useMemo(
    () => categories.map((cat) => ({ label: cat.name, value: cat._id })),
    [categories]
  );

  const statusOptions = useMemo(
    () =>
      Object.values(PRODUCT_STATUS).map((status) => ({
        label: status.charAt(0).toUpperCase() + status.slice(1),
        value: status,
      })),
    []
  );

  const formik = useFormik({
    initialValues: initialProduct ? toProductFormValues(initialProduct) : defaultProductFormValues,
    validationSchema: productValidationSchema,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        await onSubmit(toCreateProductPayload(values));
      } catch {
        toast.error(isEdit ? "Failed to update product" : "Failed to create product");
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
        title={isEdit ? "Edit Product" : "Add Product"}
        description="Enter product details"
      />

      <form id={PRODUCT_FORM_ID} onSubmit={handleSubmit} className="space-y-8">
        <FormSection id="identity" title="Identity">
          <div className={formGridClass}>
            <FormInput
              label="Name"
              name="name"
              value={values.name}
              placeholder="Product name"
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
              placeholder="product-slug"
              required
              error={errors.slug}
              touched={touched.slug}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormSelect
              label="Category"
              name="categoryId"
              value={values.categoryId}
              placeholder={categoriesLoading ? "Loading..." : "Select category"}
              required
              disabled={categoriesLoading}
              options={categoryOptions}
              error={errors.categoryId}
              touched={touched.categoryId}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput
              label="SKU"
              name="sku"
              value={values.sku}
              placeholder="Stock keeping unit"
              error={errors.sku}
              touched={touched.sku}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput
              label="Barcode"
              name="barcode"
              value={values.barcode}
              placeholder="Barcode"
              error={errors.barcode}
              touched={touched.barcode}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput
              label="Brand"
              name="brand"
              value={values.brand}
              placeholder="Brand name"
              error={errors.brand}
              touched={touched.brand}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput
              label="Tags"
              name="tags"
              value={values.tags}
              placeholder="tag-one, tag-two"
              error={errors.tags}
              touched={touched.tags}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
        </FormSection>

        <FormSection id="description" title="Description">
          <div className={`${formGridClass} lg:grid-cols-2`}>
            <FormTextarea
              label="Short Desc"
              name="shortDescription"
              value={values.shortDescription}
              placeholder="Brief summary"
              rows={2}
              error={errors.shortDescription}
              touched={touched.shortDescription}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormTextarea
              label="Description"
              name="description"
              value={values.description}
              placeholder="Full product description"
              rows={4}
              error={errors.description}
              touched={touched.description}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
        </FormSection>

        <FormSection id="pricing" title="Pricing">
          <div className={formGridClass}>
            <FormNumberInput
              label="Price"
              name="price"
              value={values.price}
              placeholder="0.00"
              required
              min={0}
              step={0.01}
              error={errors.price}
              touched={touched.price}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormNumberInput
              label="Compare At"
              name="compareAtPrice"
              value={values.compareAtPrice}
              placeholder="Original price"
              min={0}
              step={0.01}
              error={errors.compareAtPrice}
              touched={touched.compareAtPrice}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormNumberInput
              label="Cost Price"
              name="costPrice"
              value={values.costPrice}
              placeholder="Purchase cost"
              min={0}
              step={0.01}
              error={errors.costPrice}
              touched={touched.costPrice}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormNumberInput
              label="Tax %"
              name="taxPercent"
              value={values.taxPercent}
              placeholder="0"
              min={0}
              max={100}
              step={0.01}
              error={errors.taxPercent}
              touched={touched.taxPercent}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput
              label="Badge"
              name="badge"
              value={values.badge}
              placeholder="e.g. Sale"
              error={errors.badge}
              touched={touched.badge}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput
              label="Badge Color"
              name="badgeColor"
              value={values.badgeColor}
              placeholder="e.g. #E53935"
              error={errors.badgeColor}
              touched={touched.badgeColor}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
        </FormSection>

        <FormSection id="inventory" title="Inventory">
          <div className={formGridClass}>
            <FormNumberInput
              label="Stock"
              name="stock"
              value={values.stock}
              placeholder="0"
              min={0}
              step={1}
              blockNegative
              error={errors.stock}
              touched={touched.stock}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormNumberInput
              label="Low Stock"
              name="lowStockAlert"
              value={values.lowStockAlert}
              placeholder="5"
              min={0}
              step={1}
              blockNegative
              error={errors.lowStockAlert}
              touched={touched.lowStockAlert}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormCheckbox
              label="Track Stock"
              name="trackInventory"
              checked={values.trackInventory}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormCheckbox
              label="Has Variants"
              name="hasVariants"
              checked={values.hasVariants}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
        </FormSection>

        <FormSection id="media" title="Media">
          <div className={`${formGridClass} lg:grid-cols-2`}>
            <FormInput
              label="Thumbnail"
              name="thumbnail"
              value={values.thumbnail}
              placeholder="https://..."
              error={errors.thumbnail}
              touched={touched.thumbnail}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormTextarea
              label="Images"
              name="images"
              value={values.images}
              placeholder="One image URL per line"
              rows={4}
              error={errors.images}
              touched={touched.images}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
        </FormSection>

        <FormSection id="shipping" title="Shipping">
          <div className={formGridClass}>
            <FormCheckbox
              label="Free Ship"
              name="isFreeShipping"
              checked={values.isFreeShipping}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormNumberInput
              label="Weight (g)"
              name="weight"
              value={values.weight}
              placeholder="0"
              min={0}
              error={errors.weight}
              touched={touched.weight}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormNumberInput
              label="Length (cm)"
              name="length"
              value={values.length}
              placeholder="0"
              min={0}
              error={errors.length}
              touched={touched.length}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormNumberInput
              label="Width (cm)"
              name="width"
              value={values.width}
              placeholder="0"
              min={0}
              error={errors.width}
              touched={touched.width}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormNumberInput
              label="Height (cm)"
              name="height"
              value={values.height}
              placeholder="0"
              min={0}
              error={errors.height}
              touched={touched.height}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
        </FormSection>

        <FormSection id="status" title="Status & Flags">
          <div className={formGridClass}>
            <FormSelect
              label="Status"
              name="status"
              value={values.status}
              required
              options={statusOptions}
              error={errors.status}
              touched={touched.status}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormCheckbox
              label="Featured"
              name="isFeatured"
              checked={values.isFeatured}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormCheckbox
              label="New"
              name="isNew"
              checked={values.isNew}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormCheckbox
              label="Best Seller"
              name="isBestSeller"
              checked={values.isBestSeller}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormCheckbox
              label="Digital"
              name="isDigital"
              checked={values.isDigital}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
        </FormSection>
      </form>
    </div>
  );
}

export default React.memo(ProductForm);
