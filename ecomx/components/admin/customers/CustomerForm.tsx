"use client";

import { useFormik } from "formik";
import { FormCheckbox, FormInput, FormSection } from "@/components/admin/form";
import ViewField from "@/components/admin/utils/ViewField";
import {
  customerValidationSchema,
  isCustomerRoleLocked,
  toCustomerFormValues,
  toUpdateCustomerPayload,
} from "@/lib/admin/customer-form";
import { formatDate } from "@/lib/utils";
import { CUSTOMER_FORM_ID } from "@/lib/admin/form-footer";
import type { ApiCustomer, UpdateCustomerPayload } from "@/types/customer.types";

const formGridClass =
  "grid grid-cols-1 gap-x-16 gap-y-6 md:grid-cols-2 lg:grid-cols-3";

interface CustomerFormProps {
  customer: ApiCustomer;
  isPending?: boolean;
  onSubmit: (payload: UpdateCustomerPayload) => void | Promise<void>;
}

export default function CustomerForm({
  customer,
  isPending = false,
  onSubmit,
}: CustomerFormProps) {
  const roleLocked = isCustomerRoleLocked(customer);

  const formik = useFormik({
    initialValues: toCustomerFormValues(customer),
    validationSchema: customerValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      await onSubmit(toUpdateCustomerPayload(values));
    },
  });

  const { handleChange, handleBlur, values, errors, touched, handleSubmit, setFieldValue } =
    formik;

  return (
    <form id={CUSTOMER_FORM_ID} onSubmit={handleSubmit} className="space-y-6">
      <FormSection id="profile" title="Profile">
        <div className={formGridClass}>
          <FormInput
            label="Name"
            name="name"
            value={values.name}
            required
            error={errors.name}
            touched={touched.name}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <ViewField label="Email" value={customer.email} />
          <FormInput
            label="Phone"
            name="phone"
            value={values.phone}
            error={errors.phone}
            touched={touched.phone}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <ViewField
            label="Status"
            value={customer.isActive ? "Active" : "Inactive"}
            badge
            badgeColor={customer.isActive ? "green" : "gray"}
          />
          <ViewField
            label="Email verified"
            value={customer.isEmailVerified ? "Yes" : "No"}
          />
          <ViewField
            label="Joined"
            value={customer.createdAt ? formatDate(customer.createdAt) : "—"}
          />
        </div>
      </FormSection>

      <FormSection id="access" title="Access">
        <div className="space-y-4">
          <FormCheckbox
            label="Is Admin"
            name="isAdmin"
            checked={values.isAdmin}
            disabled={roleLocked || isPending}
            onChange={(e) => void setFieldValue("isAdmin", e.target.checked)}
            onBlur={handleBlur}
          />
          {roleLocked ? (
            <p className="text-sm text-muted-foreground">
              Superadmin role cannot be changed from this form.
            </p>
          ) : null}
        </div>
      </FormSection>
    </form>
  );
}
