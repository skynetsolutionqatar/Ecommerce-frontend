import type { InvoiceCompany } from "@/types/invoice.types";
import type {
  TenantCloudinaryConfig,
  TenantEmailConfig,
  TenantGoogleConfig,
} from "@/types/tenant.types";

export interface ApiCompany extends InvoiceCompany {
  _id?: string;
  updatedAt?: string;
  logo?: string;
  primaryColor?: string;
  clientUrl?: string;
  domains?: string[];
  emailConfig?: TenantEmailConfig;
  googleConfig?: TenantGoogleConfig;
  cloudinaryConfig?: TenantCloudinaryConfig;
}

export type UpdateCompanyPayload = Partial<
  InvoiceCompany & {
    logo?: string;
    primaryColor?: string;
    clientUrl?: string;
    domains?: string[];
    emailConfig?: TenantEmailConfig;
    googleConfig?: TenantGoogleConfig;
    cloudinaryConfig?: TenantCloudinaryConfig;
  }
>;
