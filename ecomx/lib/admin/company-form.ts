import * as Yup from "yup";
import { SKYNET_COMPANY } from "@/lib/invoice/invoice-config";
import type { ApiCompany, UpdateCompanyPayload } from "@/types/company.types";
import { TENANT_SECRET_MASK as SECRET_MASK } from "@/types/tenant.types";

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
  logo: string;
  primaryColor: string;
  clientUrl: string;
  domainsText: string;
  emailFromName: string;
  emailFromEmail: string;
  resendApiKey: string;
  googleEnabled: boolean;
  googleClientId: string;
  googleClientSecret: string;
  cloudinaryFolder: string;
};

const asFormString = (value: unknown): string =>
  value == null ? "" : String(value);

/** Keep Formik fields controlled (never undefined). */
export function normalizeCompanyFormValues(
  values: Partial<CompanyFormValues>
): CompanyFormValues {
  return {
    nameEn: asFormString(values.nameEn),
    nameAr: asFormString(values.nameAr),
    taglineEn: asFormString(values.taglineEn),
    taglineAr: asFormString(values.taglineAr),
    addressEn: asFormString(values.addressEn),
    addressAr: asFormString(values.addressAr),
    phone: asFormString(values.phone),
    whatsapp: asFormString(values.whatsapp),
    email: asFormString(values.email),
    website: asFormString(values.website),
    logo: asFormString(values.logo),
    primaryColor: asFormString(values.primaryColor) || "#111827",
    clientUrl: asFormString(values.clientUrl),
    domainsText: asFormString(values.domainsText),
    emailFromName: asFormString(values.emailFromName),
    emailFromEmail: asFormString(values.emailFromEmail),
    resendApiKey: asFormString(values.resendApiKey),
    googleEnabled: Boolean(values.googleEnabled),
    googleClientId: asFormString(values.googleClientId),
    googleClientSecret: asFormString(values.googleClientSecret),
    cloudinaryFolder: asFormString(values.cloudinaryFolder),
  };
}

export const defaultCompanyFormValues: CompanyFormValues = normalizeCompanyFormValues({
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
  logo: "",
  primaryColor: "#111827",
  clientUrl: "",
  domainsText: "",
  emailFromName: "",
  emailFromEmail: "",
  resendApiKey: "",
  googleEnabled: false,
  googleClientId: "",
  googleClientSecret: "",
  cloudinaryFolder: "",
});

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
  clientUrl: Yup.string()
    .trim()
    .url("Must be a valid URL (include https://)")
    .nullable()
    .transform((value, original) => (original === "" ? undefined : value)),
  emailFromEmail: Yup.string()
    .trim()
    .max(200, "From address is too long")
    .nullable()
    .transform((value, original) => (original === "" ? undefined : value)),
  cloudinaryFolder: Yup.string()
    .matches(/^[a-z0-9-]*$/i, "Letters, numbers, and hyphens only")
    .max(80)
    .nullable()
    .transform((value, original) => (original === "" ? undefined : value)),
});

function parseDomains(text: string): string[] | undefined {
  const parts = text
    .split(/[,;\n]+/)
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
  return parts.length ? [...new Set(parts)] : undefined;
}

function optionalSecret(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed || trimmed === SECRET_MASK) return undefined;
  return trimmed;
}

export function toCompanyFormValues(company?: ApiCompany): CompanyFormValues {
  if (!company) return defaultCompanyFormValues;

  return normalizeCompanyFormValues({
    ...defaultCompanyFormValues,
    nameEn: company.nameEn,
    nameAr: company.nameAr,
    taglineEn: company.taglineEn,
    taglineAr: company.taglineAr,
    addressEn: company.addressEn,
    addressAr: company.addressAr,
    phone: company.phone,
    whatsapp: company.whatsapp,
    email: company.email,
    website: company.website,
    logo: company.logo,
    primaryColor: company.primaryColor,
    clientUrl: company.clientUrl,
    domainsText: (company.domains ?? []).join(", "),
    emailFromName: company.emailConfig?.fromName,
    emailFromEmail: company.emailConfig?.fromEmail,
    resendApiKey:
      company.emailConfig?.apiKey === SECRET_MASK
        ? SECRET_MASK
        : company.emailConfig?.apiKey,
    googleEnabled: company.googleConfig?.enabled,
    googleClientId: company.googleConfig?.clientId,
    googleClientSecret:
      company.googleConfig?.clientSecret === SECRET_MASK
        ? SECRET_MASK
        : company.googleConfig?.clientSecret,
    cloudinaryFolder: company.cloudinaryConfig?.folder,
  });
}

export function toUpdateCompanyPayload(values: CompanyFormValues): UpdateCompanyPayload {
  const domains = parseDomains(values.domainsText);
  const resendApiKey = optionalSecret(values.resendApiKey);
  const googleClientSecret = optionalSecret(values.googleClientSecret);

  const emailConfig =
    values.emailFromName.trim() ||
    values.emailFromEmail.trim() ||
    resendApiKey
      ? {
          provider: "resend" as const,
          ...(values.emailFromName.trim()
            ? { fromName: values.emailFromName.trim() }
            : {}),
          ...(values.emailFromEmail.trim()
            ? { fromEmail: values.emailFromEmail.trim() }
            : {}),
          ...(resendApiKey ? { apiKey: resendApiKey } : {}),
        }
      : undefined;

  const googleConfig =
    values.googleEnabled ||
    values.googleClientId.trim() ||
    googleClientSecret
      ? {
          enabled: values.googleEnabled,
          ...(values.googleClientId.trim()
            ? { clientId: values.googleClientId.trim() }
            : {}),
          ...(googleClientSecret ? { clientSecret: googleClientSecret } : {}),
        }
      : undefined;

  const cloudinaryFolder = values.cloudinaryFolder.trim();

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
    logo: values.logo.trim() || undefined,
    primaryColor: values.primaryColor.trim() || undefined,
    clientUrl: values.clientUrl.trim() || undefined,
    domains,
    emailConfig,
    googleConfig,
    cloudinaryConfig: cloudinaryFolder ? { folder: cloudinaryFolder } : undefined,
  };
}
