import { apiDelete, apiGet, apiPatch, apiPost } from "./client";
import type {
  ApiCoupon,
  CreateCouponPayload,
  UpdateCouponPayload,
} from "@/types/coupon.types";

/** Requires /coupons route mounted on backend */
export const couponApi = {
  getAll: () => apiGet<{ coupons: ApiCoupon[] }>("/coupons"),

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

export async function fetchCoupons(): Promise<ApiCoupon[]> {
  const res = await couponApi.getAll();
  return res.data.coupons;
}
