import type { FooterButton } from "@/components/admin/utils/BackPanel";
import { colors } from "@/components/admin/utils/Colors";

export const PRODUCT_FORM_ID = "product-form";
export const CATEGORY_FORM_ID = "category-form";
export const COUPON_FORM_ID = "coupon-form";
export const TENANT_FORM_ID = "tenant-form";
export const COMPANY_FORM_ID = "company-form";
export const CHANGE_PASSWORD_FORM_ID = "change-password-form";
export const CUSTOMER_FORM_ID = "customer-form";

const primaryBtn = `rounded-lg px-6 py-2 ${colors.mainColor} text-white hover:opacity-90`;
const cancelBtn = "rounded-lg px-6 py-2";

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

export const tenantFormFooterButtons = (opts: Omit<Parameters<typeof createFormFooterButtons>[0], "formId" | "entityLabel">) =>
  createFormFooterButtons({ ...opts, formId: TENANT_FORM_ID, entityLabel: "Store" });

export const companyFormFooterButtons = (opts: Omit<Parameters<typeof createFormFooterButtons>[0], "formId" | "entityLabel">) =>
  createFormFooterButtons({ ...opts, formId: COMPANY_FORM_ID, entityLabel: "Company" });

export function customerDetailFooterButtons({
  isPending = false,
  togglePending = false,
  isActive,
  onToggleStatus,
}: {
  isPending?: boolean;
  togglePending?: boolean;
  isActive: boolean;
  onToggleStatus: () => void;
}): FooterButton[] {
  return [
    {
      label: togglePending ? "Updating..." : isActive ? "Deactivate" : "Activate",
      type: "button",
      variant: "outline",
      disabled: togglePending || isPending,
      onClick: onToggleStatus,
      className: cancelBtn,
    },
    {
      label: isPending ? "Saving..." : "Save Customer",
      type: "submit",
      form: CUSTOMER_FORM_ID,
      disabled: isPending || togglePending,
      className: primaryBtn,
    },
  ];
}
