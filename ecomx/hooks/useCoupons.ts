"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCoupons, couponApi } from "@/lib/api/coupon.api";
import type { CreateCouponPayload, UpdateCouponPayload } from "@/types/coupon.types";

export const COUPONS_KEY = "coupons";
export const COUPON_KEY = "coupon";

export function useCoupons() {
  return useQuery({
    queryKey: [COUPONS_KEY],
    queryFn: fetchCoupons,
    staleTime: 60_000,
    retry: false,
  });
}

export function useCoupon(id: string) {
  return useQuery({
    queryKey: [COUPON_KEY, id],
    queryFn: async () => {
      const res = await couponApi.getById(id);
      return res.data.coupon;
    },
    enabled: !!id,
  });
}

export function useCouponMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [COUPONS_KEY] });
    void queryClient.invalidateQueries({ queryKey: [COUPON_KEY] });
  };

  const create = useMutation({
    mutationFn: (payload: CreateCouponPayload) => couponApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCouponPayload }) =>
      couponApi.update(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => couponApi.delete(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
