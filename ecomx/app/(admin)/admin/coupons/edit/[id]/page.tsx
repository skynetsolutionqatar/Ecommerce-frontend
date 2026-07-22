"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import BackPanel from "@/components/admin/utils/BackPanel";
import CouponForm, { COUPON_FORM_TABS } from "@/components/admin/coupons/CouponForm";
import { couponFormFooterButtons } from "@/lib/admin/form-footer";
import { adminType } from "@/lib/admin/typography";
import { ADMIN_ROUTES } from "@/lib/config";
import { useCoupon, useCouponMutations } from "@/hooks/useCoupons";
import type { UpdateCouponPayload } from "@/types/coupon.types";

export default function AdminCouponEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: coupon, isLoading, isError } = useCoupon(id);
  const { update } = useCouponMutations();

  if (isLoading) {
    return (
      <BackPanel>
        <p className={adminType.loading}>Loading coupon...</p>
      </BackPanel>
    );
  }

  if (isError || !coupon) {
    return (
      <BackPanel>
        <p className={adminType.error}>Coupon not found.</p>
      </BackPanel>
    );
  }

  return (
    <BackPanel
      // tabs={[...COUPON_FORM_TABS]}
      buttons={couponFormFooterButtons({
        isEdit: true,
        isPending: update.isPending,
        onCancel: () => router.back(),
      })}
    >
      <CouponForm
        initialCoupon={coupon}
        isEdit
        isPending={update.isPending}
        onSubmit={async (payload) => {
          await update.mutateAsync({ id, payload: payload as UpdateCouponPayload });
          toast.success("Coupon updated");
          router.push(ADMIN_ROUTES.coupon(id));
        }}
      />
    </BackPanel>
  );
}
