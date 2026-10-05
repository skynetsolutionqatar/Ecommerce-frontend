import type { UserRole } from "./auth.types";
import type { PaginationParams } from "@/types/api.types";

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

// export type CustomerAuthProvider = "email" | "phone" | "google";
export type CustomerAuthProvider = "email" | "google";

export interface ApiCustomer {
  _id: string;
  tenantId: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  authProvider?: CustomerAuthProvider;
  role: UserRole;
  isActive: boolean;
  isEmailVerified?: boolean;
  addresses?: CustomerAddress[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerQueryParams extends PaginationParams {
  role?: UserRole;
  isActive?: boolean;
  isEmailVerified?: boolean;
  authProvider?: CustomerAuthProvider;
  sortBy?: "name" | "email" | "createdAt";
}

export interface UpdateCustomerPayload {
  name?: string;
  phone?: string;
  isAdmin?: boolean;
}
