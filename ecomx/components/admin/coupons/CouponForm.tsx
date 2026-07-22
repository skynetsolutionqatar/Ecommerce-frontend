"use client";

import React from "react";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import {
  FormCheckbox,
  FormDateInput,
  FormInput,
  FormNumberInput,
  FormSection,
  FormSelect,
  FormTextarea,
} from "@/components/admin/form";
import PageHeader from "@/components/admin/utils/PageHeader";
import {
  COUPON_DISCOUNT_TYPE,
  COUPON_STATUS,
  COUPON_STATUS_LIST,
} from "@/lib/Constant";
import {
  couponCreateValidationSchema,
  couponEditValidationSchema,
  defaultCouponFormValues,
  toCouponFormValues,
  toCreateCouponPayload,
  toUpdateCouponPayload,
} from "@/lib/admin/coupon-form";
import { COUPON_FORM_ID } from "@/lib/admin/form-footer";
import type { ApiCoupon, CreateCouponPayload, UpdateCouponPayload } from "@/types/coupon.types";

export const COUPON_FORM_TABS = [
  { key: "identity", label: "Identity" },
  { key: "discount", label: "Discount" },
  { key: "rules", label: "Rules" },
  { key: "validity", label: "Validity" },
] as const;

const formGridClass =
  "grid grid-cols-1 gap-x-16 gap-y-6 md:grid-cols-2 lg:grid-cols-3";

const typeOptions = [
  { label: "Percentage", value: COUPON_DISCOUNT_TYPE.PERCENTAGE },
  { label: "Fixed amount", value: COUPON_DISCOUNT_TYPE.FIXED },
  { label: "Free shipping", value: COUPON_DISCOUNT_TYPE.FREE_SHIPPING },
];

const statusOptions = COUPON_STATUS_LIST.filter((s) => s !== COUPON_STATUS.EXPIRED).map(
  (status) => ({
    label: status.charAt(0).toUpperCase() + status.slice(1),
    value: status,
  })
);

interface CouponFormProps {
  initialCoupon?: ApiCoupon;
  isEdit?: boolean;
  isPending?: boolean;
  onSubmit: (payload: CreateCouponPayload | UpdateCouponPayload) => void | Promise<void>;
}

function CouponForm({
  initialCoupon,
  isEdit = false,
  isPending = false,
  onSubmit,
}: CouponFormProps) {
  const formik = useFormik({
    initialValues: initialCoupon ? toCouponFormValues(initialCoupon) : defaultCouponFormValues,
    validationSchema: isEdit ? couponEditValidationSchema : couponCreateValidationSchema,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        const payload = isEdit ? toUpdateCouponPayload(values) : toCreateCouponPayload(values);
        await onSubmit(payload);
      } catch {
        toast.error(isEdit ? "Failed to update coupon" : "Failed to create coupon");
      }
    },
  });

  const { handleChange, handleBlur, values, errors, touched, handleSubmit } = formik;
  const isFreeShipping = values.type === COUPON_DISCOUNT_TYPE.FREE_SHIPPING;
  const isPercentage = values.type === COUPON_DISCOUNT_TYPE.PERCENTAGE;

  return (
    <div className="mx-auto w-full">
      <PageHeader
        title={isEdit ? "Edit Coupon" : "Add Coupon"}
        description="Configure discount code and eligibility rules"
      />

      <form id={COUPON_FORM_ID} onSubmit={handleSubmit} className="space-y-8">
        <FormSection id="identity" title="Identity">
          <div className={formGridClass}>
            <FormInput
              label="Code"
              name="code"
              value={values.code}
              placeholder="SUMMER20"
              required
              readOnly={isEdit}
              error={errors.code}
              touched={touched.code}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormInput
              label="Title"
              name="title"
              value={values.title}
              placeholder="Summer sale"
              required
              error={errors.title}
              touched={touched.title}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormSelect
              label="Status"
              name="status"
              value={values.status}
              options={statusOptions}
              error={errors.status}
              touched={touched.status}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormTextarea
              label="Description"
              name="description"
              value={values.description}
              placeholder="Optional description"
              rows={3}
              error={errors.description}
              touched={touched.description}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
        </FormSection>

        <FormSection id="discount" title="Discount">
          <div className={formGridClass}>
            {!isEdit && (
              <FormSelect
                label="Type"
                name="type"
                value={values.type}
                options={typeOptions}
                required
                error={errors.type}
                touched={touched.type}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            )}
            {!isEdit && !isFreeShipping && (
              <FormNumberInput
                label={isPercentage ? "Percentage (%)" : "Fixed amount"}
                name="value"
                value={values.value}
                placeholder={isPercentage ? "10" : "5"}
                required
                min={isPercentage ? 1 : 0}
                max={isPercentage ? 100 : undefined}
                step={isPercentage ? 1 : 0.01}
                blockNegative
                error={errors.value as string}
                touched={touched.value}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            )}
            {!isEdit && isPercentage && (
              <FormNumberInput
                label="Max discount cap"
                name="maximumDiscount"
                value={values.maximumDiscount}
                placeholder="Optional cap"
                min={0}
                step={0.01}
                blockNegative
                error={errors.maximumDiscount}
                touched={touched.maximumDiscount}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            )}
            {isEdit && initialCoupon && (
              <>
                <FormInput label="Type" name="type-display" value={initialCoupon.type} readOnly onChange={() => {}} onBlur={() => {}} />
                <FormInput
                  label="Value"
                  name="value-display"
                  value={
                    initialCoupon.type === COUPON_DISCOUNT_TYPE.PERCENTAGE
                      ? `${initialCoupon.value}%`
                      : initialCoupon.type === COUPON_DISCOUNT_TYPE.FREE_SHIPPING
                        ? "Free shipping"
                        : String(initialCoupon.value)
                  }
                  readOnly
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </>
            )}
          </div>
        </FormSection>

        <FormSection id="rules" title="Eligibility & Limits">
          <div className={formGridClass}>
            {!isEdit && (
              <FormNumberInput
                label="Min order amount"
                name="minimumOrderAmount"
                value={values.minimumOrderAmount}
                placeholder="0"
                min={0}
                step={0.01}
                blockNegative
                error={errors.minimumOrderAmount}
                touched={touched.minimumOrderAmount}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            )}
            <FormNumberInput
              label="Usage limit"
              name="usageLimit"
              value={values.usageLimit}
              placeholder="Unlimited"
              min={1}
              step={1}
              blockNegative
              error={errors.usageLimit}
              touched={touched.usageLimit}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {!isEdit && (
              <>
                <FormNumberInput
                  label="Per customer limit"
                  name="perCustomerLimit"
                  value={values.perCustomerLimit}
                  placeholder="1"
                  min={1}
                  step={1}
                  blockNegative
                  error={errors.perCustomerLimit}
                  touched={touched.perCustomerLimit}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <FormCheckbox
                  label="First order only"
                  name="firstOrderOnly"
                  checked={values.firstOrderOnly}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </>
            )}
          </div>
        </FormSection>

        <FormSection id="validity" title="Validity">
          <div className={`${formGridClass} lg:grid-cols-2`}>
            {!isEdit && (
              <FormDateInput
                label="Start date"
                name="startDate"
                value={values.startDate}
                error={errors.startDate}
                touched={touched.startDate}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            )}
            <FormDateInput
              label="Expiry date"
              name="expiryDate"
              value={values.expiryDate}
              error={errors.expiryDate}
              touched={touched.expiryDate}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
        </FormSection>

        {isPending && (
          <p className="text-sm text-gray-500">Saving coupon...</p>
        )}
      </form>
    </div>
  );
}

export default React.memo(CouponForm);
