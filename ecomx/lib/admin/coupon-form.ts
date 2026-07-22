import * as Yup from "yup";
import { COUPON_DISCOUNT_TYPE, COUPON_STATUS } from "@/lib/Constant";
import { positiveNumberOptional } from "@/components/admin/utils/Validations";
import type { ApiCoupon, CreateCouponPayload, UpdateCouponPayload } from "@/types/coupon.types";

export type CouponFormValues = {
  code: string;
  title: string;
  description: string;
  type: string;
  value: number | "";
  maximumDiscount: number | "";
  minimumOrderAmount: number | "";
  usageLimit: number | "";
  perCustomerLimit: number | "";
  firstOrderOnly: boolean;
  startDate: string;
  expiryDate: string;
  status: string;
};

export const defaultCouponFormValues: CouponFormValues = {
  code: "",
  title: "",
  description: "",
  type: COUPON_DISCOUNT_TYPE.PERCENTAGE,
  value: "",
  maximumDiscount: "",
  minimumOrderAmount: "",
  usageLimit: "",
  perCustomerLimit: 1,
  firstOrderOnly: false,
  startDate: "",
  expiryDate: "",
  status: COUPON_STATUS.ACTIVE,
};

export const couponCreateValidationSchema = Yup.object({
  code: Yup.string()
    .trim()
    .required("Coupon code is required")
    .min(3, "Code must be at least 3 characters")
    .max(20, "Code must be at most 20 characters")
    .matches(/^[A-Za-z0-9_-]+$/, "Code can only contain letters, numbers, hyphens and underscores"),
  title: Yup.string()
    .trim()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters"),
  description: Yup.string().max(300, "Description cannot exceed 300 characters"),
  type: Yup.string()
    .required("Type is required")
    .oneOf(
      [COUPON_DISCOUNT_TYPE.PERCENTAGE, COUPON_DISCOUNT_TYPE.FIXED, COUPON_DISCOUNT_TYPE.FREE_SHIPPING],
      "Invalid coupon type"
    ),
  value: Yup.mixed().when("type", {
    is: COUPON_DISCOUNT_TYPE.FREE_SHIPPING,
    then: () => Yup.mixed().notRequired(),
    otherwise: () =>
      Yup.number()
        .required("Value is required")
        .min(0, "Value must be positive")
        .when("type", {
          is: COUPON_DISCOUNT_TYPE.PERCENTAGE,
          then: (schema) => schema.min(1, "Percentage must be at least 1").max(100, "Percentage cannot exceed 100"),
        }),
  }),
  maximumDiscount: positiveNumberOptional,
  minimumOrderAmount: positiveNumberOptional,
  usageLimit: positiveNumberOptional,
  perCustomerLimit: positiveNumberOptional,
  status: Yup.string().oneOf([COUPON_STATUS.DRAFT, COUPON_STATUS.ACTIVE, COUPON_STATUS.PAUSED]),
});

export const couponEditValidationSchema = Yup.object({
  title: Yup.string()
    .trim()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters"),
  status: Yup.string().oneOf([COUPON_STATUS.DRAFT, COUPON_STATUS.ACTIVE, COUPON_STATUS.PAUSED]),
  expiryDate: Yup.string(),
  usageLimit: positiveNumberOptional,
});

function toDateInput(value?: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export function toCouponFormValues(coupon?: ApiCoupon): CouponFormValues {
  if (!coupon) return defaultCouponFormValues;

  return {
    code: coupon.code ?? "",
    title: coupon.title ?? "",
    description: coupon.description ?? "",
    type: coupon.type,
    value: coupon.value ?? "",
    maximumDiscount: coupon.maximumDiscount ?? "",
    minimumOrderAmount: coupon.minimumOrderAmount ?? "",
    usageLimit: coupon.usageLimit ?? "",
    perCustomerLimit: coupon.perCustomerLimit ?? 1,
    firstOrderOnly: coupon.firstOrderOnly ?? false,
    startDate: toDateInput(coupon.startDate),
    expiryDate: toDateInput(coupon.expiryDate),
    status: coupon.status ?? COUPON_STATUS.ACTIVE,
  };
}

export function toCreateCouponPayload(values: CouponFormValues): CreateCouponPayload {
  const payload: CreateCouponPayload = {
    code: values.code.trim().toUpperCase(),
    title: values.title.trim(),
    type: values.type as CreateCouponPayload["type"],
    description: values.description.trim() || undefined,
    minimumOrderAmount:
      values.minimumOrderAmount === "" ? undefined : Number(values.minimumOrderAmount),
    maximumDiscount: values.maximumDiscount === "" ? undefined : Number(values.maximumDiscount),
    usageLimit: values.usageLimit === "" ? undefined : Number(values.usageLimit),
    perCustomerLimit: values.perCustomerLimit === "" ? undefined : Number(values.perCustomerLimit),
    firstOrderOnly: values.firstOrderOnly,
    startDate: values.startDate || undefined,
    expiryDate: values.expiryDate || undefined,
    status: values.status as CreateCouponPayload["status"],
  };

  if (values.type !== COUPON_DISCOUNT_TYPE.FREE_SHIPPING && values.value !== "") {
    payload.value = Number(values.value);
  }

  return payload;
}

export function toUpdateCouponPayload(values: CouponFormValues): UpdateCouponPayload {
  return {
    title: values.title.trim(),
    status: values.status as UpdateCouponPayload["status"],
    expiryDate: values.expiryDate || null,
    usageLimit: values.usageLimit === "" ? undefined : Number(values.usageLimit),
  };
}
