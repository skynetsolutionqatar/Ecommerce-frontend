import type { CouponDiscountType, CouponStatus } from "@/lib/Constant";

export type { CouponStatus, CouponDiscountType };

export interface ApiCoupon {
  _id: string;
  tenantId?: string;
  code: string;
  title: string;
  description?: string;
  type: CouponDiscountType;
  value: number;
  maximumDiscount?: number | null;
  minimumOrderAmount?: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  firstOrderOnly?: boolean;
  usageLimit?: number | null;
  perCustomerLimit?: number;
  usedCount?: number;
  startDate?: string;
  expiryDate?: string | null;
  status: CouponStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCouponPayload {
  code: string;
  title: string;
  type: CouponDiscountType;
  value?: number;
  description?: string;
  maximumDiscount?: number;
  minimumOrderAmount?: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  firstOrderOnly?: boolean;
  usageLimit?: number;
  perCustomerLimit?: number;
  startDate?: string;
  expiryDate?: string;
  status?: CouponStatus;
}

export interface UpdateCouponPayload {
  title?: string;
  status?: CouponStatus;
  expiryDate?: string | null;
  usageLimit?: number;
}

export interface CouponQueryParams {
  page?: number;
  limit?: number;
  status?: CouponStatus;
  search?: string;
}
