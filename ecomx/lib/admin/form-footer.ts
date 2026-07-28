import type { FooterButton } from "@/components/admin/utils/BackPanel";
import { colors } from "@/components/admin/utils/Colors";

export const PRODUCT_FORM_ID = "product-form";
export const CATEGORY_FORM_ID = "category-form";
export const COUPON_FORM_ID = "coupon-form";

const primaryBtn = `rounded-lg px-6 py-2 ${colors.mainColor} text-white hover:bg-green-700 cursor-pointer disabled:cursor-not-allowed`;
const cancelBtn = "rounded-lg px-6 py-2 cursor-pointer disabled:cursor-not-allowed";

export function createFormFooterButtons({
  formId,
  entityLabel,
  isEdit = false,
  isPending = false,
  onCancel,
}: {
  formId: string;
  entityLabel: string;
  isEdit?: boolean;
  isPending?: boolean;
  onCancel: () => void;
}): FooterButton[] {
  return [
    {
      label: "Cancel",
      variant: "outline",
      disabled: isPending,
      onClick: onCancel,
      className: cancelBtn,
    },
    {
      label: isPending ? "Saving..." : isEdit ? `Update ${entityLabel}` : `Save ${entityLabel}`,
      type: "submit",
      form: formId,
      disabled: isPending,
      className: primaryBtn,
    },
  ];
}

export const productFormFooterButtons = (opts: Omit<Parameters<typeof createFormFooterButtons>[0], "formId" | "entityLabel">) =>
  createFormFooterButtons({ ...opts, formId: PRODUCT_FORM_ID, entityLabel: "Product" });

export const categoryFormFooterButtons = (opts: Omit<Parameters<typeof createFormFooterButtons>[0], "formId" | "entityLabel">) =>
  createFormFooterButtons({ ...opts, formId: CATEGORY_FORM_ID, entityLabel: "Category" });

export const couponFormFooterButtons = (opts: Omit<Parameters<typeof createFormFooterButtons>[0], "formId" | "entityLabel">) =>
  createFormFooterButtons({ ...opts, formId: COUPON_FORM_ID, entityLabel: "Coupon" });
