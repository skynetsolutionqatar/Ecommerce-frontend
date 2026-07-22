import type { UserRole } from "./auth.types";

export interface CustomerAddress {
  _id?: string;
  label?: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  isDefault?: boolean;
}

export interface ApiCustomer {
  _id: string;
  tenantId: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified?: boolean;
  addresses?: CustomerAddress[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
}
