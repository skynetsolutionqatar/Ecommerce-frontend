"use client";

import React from "react";
import { useFormik } from "formik";
import {
  FormCheckbox,
  FormInput,
  FormNumberInput,
  FormSection,
  FormSelect,
} from "@/components/admin/form";
import PageHeader from "@/components/admin/utils/PageHeader";
import {
  defaultTenantFormValues,
  TENANT_DEPARTMENTS,
  TENANT_PAYMENT_GATEWAYS,
  TENANT_ZONES,
  tenantValidationSchema,
  toCreateTenantPayload,
  toTenantFormValues,
} from "@/lib/admin/tenant-form";
import { TENANT_FORM_ID } from "@/lib/admin/form-footer";
import { slugify } from "@/lib/utils";
import type { ApiTenant, CreateTenantPayload } from "@/types/tenant.types";

export const TENANT_FORM_TABS = [
  { key: "identity", label: "Identity" },
  { key: "config", label: "Configuration" },
  { key: "branding", label: "Branding" },
  { key: "settings", label: "Settings" },
] as const;

const formGridClass =
  "grid grid-cols-1 gap-x-16 gap-y-6 md:grid-cols-2 lg:grid-cols-3";

interface TenantFormProps {
  initialTenant?: ApiTenant;
  isEdit?: boolean;
  isPending?: boolean;
  onSubmit: (payload: CreateTenantPayload) => void | Promise<void>;
}

function TenantForm({
  initialTenant,
  isEdit = false,
  isPending = false,
  onSubmit,
}: TenantFormProps) {
  const formik = useFormik({
    initialValues: initialTenant ? toTenantFormValues(initialTenant) : defaultTenantFormValues,
    validationSchema: tenantValidationSchema,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      await onSubmit(toCreateTenantPayload(values));
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
        title={isEdit ? "Edit Store" : "Add Store"}
        description="Configure tenant / store settings"
      />

      <form id={TENANT_FORM_ID} onSubmit={handleSubmit} className="space-y-8">
        <FormSection id="identity" title="Identity">
          <div className={formGridClass}>
            <FormInput
              label="Name"
              name="name"
              value={values.name}
              placeholder="Store name"
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
              placeholder="store-slug"
              required
              readOnly={isEdit}
              error={errors.slug}
              touched={touched.slug}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
        </FormSection>

        <FormSection id="config" title="Configuration">
          <div className={formGridClass}>
            <FormSelect
              label="Zone"
              name="zone"
              value={values.zone}
              placeholder="Select zone"
              required
              disabled={isEdit}
              options={TENANT_ZONES}
              error={errors.zone}
              touched={touched.zone}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormSelect
              label="Department"
              name="department"
              value={values.department}
              placeholder="Select department"
              required
              disabled={isEdit}
              options={TENANT_DEPARTMENTS}
              error={errors.department}
              touched={touched.department}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput
              label="Currency"
              name="currency"
              value={values.currency}
              placeholder="QAR"
              required
              error={errors.currency}
              touched={touched.currency}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormSelect
              label="Payment"
              name="paymentGateway"
              value={values.paymentGateway}
              required
              options={TENANT_PAYMENT_GATEWAYS}
              error={errors.paymentGateway}
              touched={touched.paymentGateway}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
        </FormSection>

        <FormSection id="branding" title="Branding">
          <div className={formGridClass}>
            <FormInput
              label="Logo URL"
              name="logo"
              value={values.logo}
              placeholder="https://..."
              error={errors.logo}
              touched={touched.logo}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput
              label="Primary Color"
              name="primaryColor"
              value={values.primaryColor}
              placeholder="#111827"
              error={errors.primaryColor}
              touched={touched.primaryColor}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
        </FormSection>

        <FormSection id="settings" title="Settings">
          <div className={formGridClass}>
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
            <FormNumberInput
              label="Free Ship Above"
              name="freeShippingAbove"
              value={values.freeShippingAbove}
              placeholder="500"
              min={0}
              step={0.01}
              error={errors.freeShippingAbove}
              touched={touched.freeShippingAbove}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput
              label="Support Email"
              name="supportEmail"
              value={values.supportEmail}
              placeholder="support@store.com"
              error={errors.supportEmail}
              touched={touched.supportEmail}
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
      </form>
    </div>
  );
}

export default React.memo(TenantForm);
