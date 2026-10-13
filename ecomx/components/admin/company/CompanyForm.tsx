"use client";

import React from "react";
import { useFormik } from "formik";
import {
  FormCheckbox,
  FormInput,
  FormSection,
  FormTextarea,
} from "@/components/admin/form";
import PageHeader from "@/components/admin/utils/PageHeader";
import {
  companyValidationSchema,
  defaultCompanyFormValues,
  normalizeCompanyFormValues,
  toCompanyFormValues,
  toUpdateCompanyPayload,
} from "@/lib/admin/company-form";
import { COMPANY_FORM_ID } from "@/lib/admin/form-footer";
import type { ApiCompany, UpdateCompanyPayload } from "@/types/company.types";

export const COMPANY_FORM_TABS = [
  { key: "name", label: "Company Name" },
  { key: "details", label: "Details" },
  { key: "contact", label: "Contact" },
  { key: "branding", label: "Branding" },
  { key: "integrations", label: "Integrations" },
] as const;

const formGridClass =
  "grid grid-cols-1 gap-x-16 gap-y-6 md:grid-cols-2 lg:grid-cols-3";

interface CompanyFormProps {
  initialCompany?: ApiCompany;
  isPending?: boolean;
  onSubmit: (payload: UpdateCompanyPayload) => void | Promise<void>;
}

function CompanyForm({
  initialCompany,
  isPending = false,
  onSubmit,
}: CompanyFormProps) {
  const formik = useFormik({
    initialValues: normalizeCompanyFormValues(
      initialCompany ? toCompanyFormValues(initialCompany) : defaultCompanyFormValues
    ),
    validationSchema: companyValidationSchema,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      await onSubmit(toUpdateCompanyPayload(values));
    },
  });

  const { handleChange, handleBlur, values, errors, touched, handleSubmit } = formik;

  return (
    <div className="mx-auto w-full">
      <PageHeader
        title="Company Profile"
        description="Manage this store’s company details and client configs (saved per tenant on the shared backend)"
      />

      <form id={COMPANY_FORM_ID} onSubmit={handleSubmit} className="space-y-8">
        <FormSection id="name" title="Company Name">
          <div className={formGridClass}>
            <FormInput
              label="Name (English)"
              name="nameEn"
              value={values.nameEn}
              placeholder="Enter company name"
              required
              error={errors.nameEn}
              touched={touched.nameEn}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput
              label="Name (Arabic)"
              name="nameAr"
              value={values.nameAr}
              placeholder="Enter company name in Arabic"
              error={errors.nameAr}
              touched={touched.nameAr}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput
              label="Code name"
              name="orderCode"
              value={values.orderCode}
              placeholder="Enter code name (e.g. SKY)"
              maxLength={12}
              error={errors.orderCode}
              touched={touched.orderCode}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
        </FormSection>

        <FormSection id="details" title="Details">
          <div className={formGridClass}>
            <FormInput
              label="Tagline (English)"
              name="taglineEn"
              value={values.taglineEn}
              placeholder="Enter tagline"
              error={errors.taglineEn}
              touched={touched.taglineEn}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput
              label="Tagline (Arabic)"
              name="taglineAr"
              value={values.taglineAr}
              placeholder="Enter tagline in Arabic"
              error={errors.taglineAr}
              touched={touched.taglineAr}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormTextarea
              label="Address (English)"
              name="addressEn"
              value={values.addressEn}
              placeholder="Enter business address"
              rows={3}
              error={errors.addressEn}
              touched={touched.addressEn}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormTextarea
              label="Address (Arabic)"
              name="addressAr"
              value={values.addressAr}
              placeholder="Enter business address in Arabic"
              rows={3}
              error={errors.addressAr}
              touched={touched.addressAr}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
        </FormSection>

        <FormSection id="contact" title="Contact">
          <div className={formGridClass}>
            <FormInput
              label="Phone"
              name="phone"
              value={values.phone}
              placeholder="Enter phone number"
              error={errors.phone}
              touched={touched.phone}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput
              label="WhatsApp"
              name="whatsapp"
              value={values.whatsapp}
              placeholder="Enter WhatsApp number"
              error={errors.whatsapp}
              touched={touched.whatsapp}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={values.email}
              placeholder="contact@example.com"
              error={errors.email}
              touched={touched.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput
              label="Website"
              name="website"
              value={values.website}
              placeholder="www.example.com"
              error={errors.website}
              touched={touched.website}
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
              placeholder="https://example.com/logo.png"
              error={errors.logo}
              touched={touched.logo}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput
              label="Primary Color"
              name="primaryColor"
              value={values.primaryColor}
              placeholder="#000000"
              error={errors.primaryColor}
              touched={touched.primaryColor}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
        </FormSection>

        <FormSection id="integrations" title="Integrations">
          <div className={formGridClass}>
            <FormInput
              label="Client URL"
              name="clientUrl"
              value={values.clientUrl}
              placeholder="https://store.example.com"
              error={errors.clientUrl}
              touched={touched.clientUrl}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput
              label="Domains"
              name="domainsText"
              value={values.domainsText}
              placeholder="store.example.com"
              error={errors.domainsText}
              touched={touched.domainsText}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput
              label="Email from name"
              name="emailFromName"
              value={values.emailFromName}
              placeholder="Your store name"
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput
              label="Email from address"
              name="emailFromEmail"
              value={values.emailFromEmail}
              placeholder="Store Name <noreply@example.com>"
              error={errors.emailFromEmail}
              touched={touched.emailFromEmail}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput
              label="Resend API key"
              name="resendApiKey"
              type="password"
              value={values.resendApiKey}
              placeholder="Leave blank to keep current"
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormCheckbox
              label="Google sign-in enabled"
              name="googleEnabled"
              checked={values.googleEnabled}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput
              label="Google client ID"
              name="googleClientId"
              value={values.googleClientId}
              placeholder="xxxxxxxxxx.apps.googleusercontent.com"
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput
              label="Google client secret"
              name="googleClientSecret"
              type="password"
              value={values.googleClientSecret}
              placeholder="Leave blank to keep current"
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput
              label="Cloudinary folder"
              name="cloudinaryFolder"
              value={values.cloudinaryFolder}
              placeholder="your-store-folder"
              error={errors.cloudinaryFolder}
              touched={touched.cloudinaryFolder}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
        </FormSection>
      </form>
    </div>
  );
}

export default React.memo(CompanyForm);
