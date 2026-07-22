import type { UserRole } from "@/lib/Constant";

export type { UserRole };

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  tenantId: string;
  avatar?: string;
  isActive?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  customer: AuthUser;
  accessToken: string;
  refreshToken: string;
}
