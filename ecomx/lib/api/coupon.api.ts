import { apiDelete, apiGet, apiPatch, apiPost } from "./client";
import type { CouponQueryParams, CreateCouponPayload, UpdateCouponPayload, ApiCoupon } from "@/types/coupon.types";
import type { PaginationMeta } from "@/types/api.types";

/** Requires /coupons route mounted on backend */
export const couponApi = {
  getAll: (params?: CouponQueryParams) =>
    apiGet<{ coupons: ApiCoupon[] }>("/coupons", params as Record<string, unknown>),

  getById: (id: string) => apiGet<{ coupon: ApiCoupon }>(`/coupons/${id}`),

  getStats: (id: string) => apiGet<Record<string, unknown>>(`/coupons/${id}/stats`),

  create: (payload: CreateCouponPayload) =>
    apiPost<{ coupon: ApiCoupon }>("/coupons", payload),

  update: (id: string, payload: UpdateCouponPayload) =>
    apiPatch<{ coupon: ApiCoupon }>(`/coupons/${id}`, payload),

  delete: (id: string) => apiDelete<{ coupon: ApiCoupon }>(`/coupons/${id}`),

  apply: (code: string) => apiPost<{ discount: number }>("/coupons/apply", { code }),

  validate: (code: string) => apiPost<{ valid: boolean }>("/coupons/validate", { code }),
};

export type CouponsResult = {
  coupons: ApiCoupon[];
  pagination?: PaginationMeta;
};

export async function fetchCoupons(params?: CouponQueryParams): Promise<CouponsResult> {
  const res = await couponApi.getAll(params);
  return { coupons: res.data.coupons, pagination: res.pagination };
}
