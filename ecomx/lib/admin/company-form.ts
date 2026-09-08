import * as Yup from "yup";
import { SKYNET_COMPANY } from "@/lib/invoice/invoice-config";
import type { ApiCompany, UpdateCompanyPayload } from "@/types/company.types";

export type CompanyFormValues = {
  nameEn: string;
  nameAr: string;
  taglineEn: string;
  taglineAr: string;
  addressEn: string;
  addressAr: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
};

export const defaultCompanyFormValues: CompanyFormValues = {
  nameEn: SKYNET_COMPANY.nameEn,
  nameAr: SKYNET_COMPANY.nameAr,
  taglineEn: SKYNET_COMPANY.taglineEn,
  taglineAr: SKYNET_COMPANY.taglineAr,
  addressEn: SKYNET_COMPANY.addressEn,
  addressAr: SKYNET_COMPANY.addressAr,
  phone: SKYNET_COMPANY.phone,
  whatsapp: SKYNET_COMPANY.whatsapp,
  email: SKYNET_COMPANY.email,
  website: SKYNET_COMPANY.website,
};

export const companyValidationSchema = Yup.object({
  nameEn: Yup.string()
    .trim()
    .required("Company name (English) is required")
    .max(120, "Name must be at most 120 characters"),
  nameAr: Yup.string().trim().max(120, "Name must be at most 120 characters"),
  taglineEn: Yup.string().trim().max(200, "Tagline must be at most 200 characters"),
  taglineAr: Yup.string().trim().max(200, "Tagline must be at most 200 characters"),
  addressEn: Yup.string().trim().max(300, "Address must be at most 300 characters"),
  addressAr: Yup.string().trim().max(300, "Address must be at most 300 characters"),
  phone: Yup.string().trim().max(30, "Phone must be at most 30 characters"),
  whatsapp: Yup.string().trim().max(30, "WhatsApp must be at most 30 characters"),
  email: Yup.string()
    .trim()
    .email("Enter a valid email")
    .max(120, "Email must be at most 120 characters"),
  website: Yup.string().trim().max(120, "Website must be at most 120 characters"),
});

export function toCompanyFormValues(company?: ApiCompany): CompanyFormValues {
  if (!company) return defaultCompanyFormValues;

  return {
    nameEn: company.nameEn ?? "",
    nameAr: company.nameAr ?? "",
    taglineEn: company.taglineEn ?? "",
    taglineAr: company.taglineAr ?? "",
    addressEn: company.addressEn ?? "",
    addressAr: company.addressAr ?? "",
    phone: company.phone ?? "",
    whatsapp: company.whatsapp ?? "",
    email: company.email ?? "",
    website: company.website ?? "",
  };
}

export function toUpdateCompanyPayload(values: CompanyFormValues): UpdateCompanyPayload {
  return {
    nameEn: values.nameEn.trim(),
    nameAr: values.nameAr.trim() || undefined,
    taglineEn: values.taglineEn.trim() || undefined,
    taglineAr: values.taglineAr.trim() || undefined,
    addressEn: values.addressEn.trim() || undefined,
    addressAr: values.addressAr.trim() || undefined,
    phone: values.phone.trim() || undefined,
    whatsapp: values.whatsapp.trim() || undefined,
    email: values.email.trim() || undefined,
    website: values.website.trim() || undefined,
  };
}
