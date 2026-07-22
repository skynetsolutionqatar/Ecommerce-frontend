"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import BackPanel from "@/components/admin/utils/BackPanel";
import CouponForm, { COUPON_FORM_TABS } from "@/components/admin/coupons/CouponForm";
import { couponFormFooterButtons } from "@/lib/admin/form-footer";
import { ADMIN_ROUTES } from "@/lib/config";
import { useCouponMutations } from "@/hooks/useCoupons";
import type { CreateCouponPayload } from "@/types/coupon.types";

export default function AdminCouponAddPage() {
  const router = useRouter();
  const { create } = useCouponMutations();

  return (
    <BackPanel
      // tabs={[...COUPON_FORM_TABS]}
      buttons={couponFormFooterButtons({
        isPending: create.isPending,
        onCancel: () => router.back(),
      })}
    >
      <CouponForm
        isPending={create.isPending}
        onSubmit={async (payload) => {
          await create.mutateAsync(payload as CreateCouponPayload);
          toast.success("Coupon created");
          router.push(ADMIN_ROUTES.coupons);
        }}
      />
    </BackPanel>
  );
}
