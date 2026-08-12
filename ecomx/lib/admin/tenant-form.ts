import * as Yup from "yup";
import type {
  ApiTenant,
  CreateTenantPayload,
  TenantDepartment,
  TenantPaymentGateway,
  TenantZone,
} from "@/types/tenant.types";

export const TENANT_ZONES: { label: string; value: TenantZone }[] = [
  { label: "Middle East", value: "MIDDLE_EAST" },
  { label: "India", value: "INDIA" },
  { label: "Europe", value: "EUROPE" },
  { label: "USA", value: "USA" },
  { label: "Southeast Asia", value: "SOUTHEAST_ASIA" },
  { label: "Africa", value: "AFRICA" },
];

export const TENANT_DEPARTMENTS: { label: string; value: TenantDepartment }[] = [
  { label: "Electronics", value: "electronics" },
  { label: "Grocery", value: "grocery" },
  { label: "Fashion", value: "fashion" },
  { label: "Pharmacy", value: "pharmacy" },
  { label: "Furniture", value: "furniture" },
  { label: "General", value: "general" },
];

export const TENANT_PAYMENT_GATEWAYS: { label: string; value: TenantPaymentGateway }[] = [
  { label: "Cash on Delivery", value: "cash_on_delivery" },
  { label: "Stripe", value: "stripe" },
  { label: "Razorpay", value: "razorpay" },
  { label: "MyFatoorah", value: "myfatoorah" },
];

export type TenantFormValues = {
  name: string;
  slug: string;
  zone: TenantZone | "";
  department: TenantDepartment | "";
  currency: string;
  paymentGateway: TenantPaymentGateway | "";
  logo: string;
  primaryColor: string;
  taxPercent: number | "";
  freeShippingAbove: number | "";
  supportEmail: string;
  isActive: boolean;
};

export const defaultTenantFormValues: TenantFormValues = {
  name: "",
  slug: "",
  zone: "",
  department: "",
  currency: "QAR",
  paymentGateway: "cash_on_delivery",
  logo: "",
  primaryColor: "#111827",
  taxPercent: "",
  freeShippingAbove: "",
  supportEmail: "",
  isActive: true,
};

export const tenantValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Store name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  slug: Yup.string()
    .trim()
    .required("Slug is required")
    .lowercase("Slug must be lowercase")
    .matches(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .max(60, "Slug must be at most 60 characters"),
  zone: Yup.string().required("Zone is required"),
  department: Yup.string().required("Department is required"),
  currency: Yup.string()
    .trim()
    .required("Currency is required")
    .length(3, "Currency must be a 3-letter code"),
  paymentGateway: Yup.string().required("Payment gateway is required"),
  taxPercent: Yup.number()
    .typeError("Must be a number")
    .min(0, "Cannot be negative")
    .max(100, "Cannot exceed 100")
    .nullable()
    .transform((value, original) => (original === "" ? undefined : value)),
  freeShippingAbove: Yup.number()
    .typeError("Must be a number")
    .min(0, "Cannot be negative")
    .nullable()
    .transform((value, original) => (original === "" ? undefined : value)),
  supportEmail: Yup.string().email("Invalid email").nullable(),
});

function toOptionalNumber(value: number | ""): number | undefined {
  return value === "" ? undefined : Number(value);
}

export function toTenantFormValues(tenant?: ApiTenant): TenantFormValues {
  if (!tenant) return defaultTenantFormValues;

  return {
    name: tenant.name ?? "",
    slug: tenant.slug ?? "",
    zone: tenant.zone ?? "",
    department: tenant.department ?? "",
    currency: tenant.currency ?? "",
    paymentGateway: tenant.paymentGateway ?? "cash_on_delivery",
    logo: tenant.logo ?? "",
    primaryColor: tenant.theme?.primaryColor ?? "#111827",
    taxPercent: tenant.settings?.taxPercent ?? "",
    freeShippingAbove: tenant.settings?.freeShippingAbove ?? "",
    supportEmail: tenant.settings?.supportEmail ?? "",
    isActive: tenant.isActive ?? true,
  };
}

export function toCreateTenantPayload(values: TenantFormValues): CreateTenantPayload {
  const settings: CreateTenantPayload["settings"] = {};
  const taxPercent = toOptionalNumber(values.taxPercent);
  const freeShippingAbove = toOptionalNumber(values.freeShippingAbove);

  if (taxPercent != null) settings.taxPercent = taxPercent;
  if (freeShippingAbove != null) settings.freeShippingAbove = freeShippingAbove;
  if (values.supportEmail.trim()) settings.supportEmail = values.supportEmail.trim();

  return {
    name: values.name.trim(),
    slug: values.slug.trim().toLowerCase(),
    zone: values.zone as TenantZone,
    department: values.department as TenantDepartment,
    currency: values.currency.trim().toUpperCase(),
    paymentGateway: values.paymentGateway as TenantPaymentGateway,
    logo: values.logo.trim() || undefined,
    theme: values.primaryColor.trim()
      ? { primaryColor: values.primaryColor.trim() }
      : undefined,
    settings: Object.keys(settings).length ? settings : undefined,
    isActive: values.isActive,
  };
}
