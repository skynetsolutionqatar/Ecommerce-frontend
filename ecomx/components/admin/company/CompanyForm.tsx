"use client";

import React from "react";
import { useFormik } from "formik";
import { FormInput, FormSection, FormTextarea } from "@/components/admin/form";
import PageHeader from "@/components/admin/utils/PageHeader";
import {
  companyValidationSchema,
  defaultCompanyFormValues,
  toCompanyFormValues,
  toUpdateCompanyPayload,
} from "@/lib/admin/company-form";
import { COMPANY_FORM_ID } from "@/lib/admin/form-footer";
import type { ApiCompany, UpdateCompanyPayload } from "@/types/company.types";

export const COMPANY_FORM_TABS = [
  { key: "name", label: "Company Name" },
  { key: "details", label: "Details" },
  { key: "contact", label: "Contact" },
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
    initialValues: initialCompany
      ? toCompanyFormValues(initialCompany)
      : defaultCompanyFormValues,
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
        description="Manage company name, details, and contact information"
      />

      <form id={COMPANY_FORM_ID} onSubmit={handleSubmit} className="space-y-8">
        <FormSection id="name" title="Company Name">
          <div className={formGridClass}>
            <FormInput
              label="Name (English)"
              name="nameEn"
              value={values.nameEn}
              placeholder="Skynet Solution Qatar"
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
              placeholder="سكاي نت سوليوشن قطر"
              error={errors.nameAr}
              touched={touched.nameAr}
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
              placeholder="POS Systems · ERP Software · IT Hardware"
              error={errors.taglineEn}
              touched={touched.taglineEn}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput
              label="Tagline (Arabic)"
              name="taglineAr"
              value={values.taglineAr}
              placeholder="أنظمة نقاط البيع · برامج تخطيط الموارد"
              error={errors.taglineAr}
              touched={touched.taglineAr}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormTextarea
              label="Address (English)"
              name="addressEn"
              value={values.addressEn}
              placeholder="Doha, State of Qatar"
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
              placeholder="الدوحة، دولة قطر"
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
              placeholder="+974 4431 1525"
              error={errors.phone}
              touched={touched.phone}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput
              label="WhatsApp"
              name="whatsapp"
              value={values.whatsapp}
              placeholder="+974 4431 1525"
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
              placeholder="info@skynetqatar.com"
              error={errors.email}
              touched={touched.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput
              label="Website"
              name="website"
              value={values.website}
              placeholder="www.skynetqatar.com"
              error={errors.website}
              touched={touched.website}
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
