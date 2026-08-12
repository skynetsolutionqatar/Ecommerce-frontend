import type { PaginationParams } from "@/types/api.types";

export type TenantZone =
  | "MIDDLE_EAST"
  | "INDIA"
  | "EUROPE"
  | "USA"
  | "SOUTHEAST_ASIA"
  | "AFRICA";

export type TenantDepartment =
  | "electronics"
  | "grocery"
  | "fashion"
  | "pharmacy"
  | "furniture"
  | "general";

export type TenantPaymentGateway =
  | "stripe"
  | "razorpay"
  | "myfatoorah"
  | "cash_on_delivery";

export interface TenantTheme {
  primaryColor?: string;
  secondaryColor?: string;
  font?: string;
}

export interface TenantSettings {
  taxPercent?: number;
  freeShippingAbove?: number;
  supportEmail?: string;
  [key: string]: unknown;
}

export interface ApiTenant {
  _id: string;
  name: string;
  slug: string;
  zone: TenantZone;
  department: TenantDepartment;
  currency: string;
  paymentGateway?: TenantPaymentGateway;
  logo?: string;
  theme?: TenantTheme;
  settings?: TenantSettings;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantQueryParams extends PaginationParams {
  zone?: TenantZone;
  department?: TenantDepartment;
  paymentGateway?: TenantPaymentGateway;
  isActive?: boolean;
}

export interface CreateTenantPayload {
  name: string;
  slug: string;
  zone: TenantZone;
  department: TenantDepartment;
  currency: string;
  paymentGateway?: TenantPaymentGateway;
  logo?: string;
  theme?: TenantTheme;
  settings?: TenantSettings;
  isActive?: boolean;
}

export type UpdateTenantPayload = Partial<CreateTenantPayload>;
