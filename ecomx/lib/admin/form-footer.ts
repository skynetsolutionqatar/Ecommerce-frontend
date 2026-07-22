import type { FooterButton } from "@/components/admin/utils/BackPanel";
import { colors } from "@/components/admin/utils/Colors";

export const PRODUCT_FORM_ID = "product-form";
export const CATEGORY_FORM_ID = "category-form";
export const COUPON_FORM_ID = "coupon-form";

const primaryBtn = `rounded-lg px-6 py-2 ${colors.mainColor} text-white hover:bg-green-700`;

export function productFormFooterButtons({
  isEdit = false,
  isPending = false,
  onCancel,
}: {
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
      className: "rounded-lg px-6 py-2",
    },
    {
      label: isPending ? "Saving..." : isEdit ? "Update Product" : "Save Product",
      type: "submit",
      form: PRODUCT_FORM_ID,
      disabled: isPending,
      className: primaryBtn,
    },
  ];
}

export function categoryFormFooterButtons({
  isEdit = false,
  isPending = false,
  onCancel,
}: {
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
      className: "rounded-lg px-6 py-2",
    },
    {
      label: isPending ? "Saving..." : isEdit ? "Update Category" : "Save Category",
      type: "submit",
      form: CATEGORY_FORM_ID,
      disabled: isPending,
      className: primaryBtn,
    },
  ];
}

export function couponFormFooterButtons({
  isEdit = false,
  isPending = false,
  onCancel,
}: {
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
      className: "rounded-lg px-6 py-2",
    },
    {
      label: isPending ? "Saving..." : isEdit ? "Update Coupon" : "Save Coupon",
      type: "submit",
      form: COUPON_FORM_ID,
      disabled: isPending,
      className: primaryBtn,
    },
  ];
}
