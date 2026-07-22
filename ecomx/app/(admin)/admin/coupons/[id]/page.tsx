"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import BackPanel from "@/components/admin/utils/BackPanel";
import ViewSection from "@/components/admin/utils/ViewSection";
import ViewField from "@/components/admin/utils/ViewField";
import { COUPON_DISCOUNT_TYPE } from "@/lib/Constant";
import { adminType } from "@/lib/admin/typography";
import { ADMIN_ROUTES } from "@/lib/config";
import { useCoupon, useCouponMutations } from "@/hooks/useCoupons";
import { formatDate, formatPrice } from "@/lib/utils";

const TABS = [
  { key: "identity", label: "Identity" },
  { key: "discount", label: "Discount" },
  { key: "rules", label: "Rules" },
  { key: "validity", label: "Validity" },
];

function formatCouponValue(type: string, value: number) {
  if (type === COUPON_DISCOUNT_TYPE.PERCENTAGE) return `${value}%`;
  if (type === COUPON_DISCOUNT_TYPE.FREE_SHIPPING) return "Free shipping";
  return formatPrice(value);
}

export default function AdminCouponDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: coupon, isLoading, isError } = useCoupon(id);
  const { remove } = useCouponMutations();

  const handleDelete = async () => {
    if (!coupon) return;
    if (!window.confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) return;
    await remove.mutateAsync(id);
    toast.success("Coupon deleted");
    router.push(ADMIN_ROUTES.coupons);
  };

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
      tabs={TABS}
      editPath={`${ADMIN_ROUTES.coupons}/edit/${id}`}
      onDelete={() => void handleDelete()}
      deleting={remove.isPending}
    >
      <div className="space-y-6">
        <ViewSection id="identity" title="Identity">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ViewField label="Code" value={coupon.code} />
            <ViewField label="Title" value={coupon.title} />
            <ViewField label="Description" value={coupon.description} />
            <ViewField label="Status" value={coupon.status} badge badgeColor="blue" />
          </div>
        </ViewSection>

        <ViewSection id="discount" title="Discount">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ViewField label="Type" value={coupon.type} />
            <ViewField label="Value" value={formatCouponValue(coupon.type, coupon.value)} />
            <ViewField label="Max discount cap" value={coupon.maximumDiscount ?? "—"} />
          </div>
        </ViewSection>

        <ViewSection id="rules" title="Eligibility & Limits">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ViewField label="Min order amount" value={coupon.minimumOrderAmount ?? 0} />
            <ViewField
              label="Usage"
              value={`${coupon.usedCount ?? 0}${coupon.usageLimit ? ` / ${coupon.usageLimit}` : " (unlimited)"}`}
            />
            <ViewField label="Per customer limit" value={coupon.perCustomerLimit ?? 1} />
            <ViewField label="First order only" value={coupon.firstOrderOnly ? "Yes" : "No"} />
          </div>
        </ViewSection>

        <ViewSection id="validity" title="Validity">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ViewField label="Start date" value={coupon.startDate ? formatDate(coupon.startDate) : "—"} />
            <ViewField label="Expiry date" value={coupon.expiryDate ? formatDate(coupon.expiryDate) : "Never"} />
            <ViewField label="Created" value={coupon.createdAt ? formatDate(coupon.createdAt) : "—"} />
          </div>
        </ViewSection>
      </div>
    </BackPanel>
  );
}
