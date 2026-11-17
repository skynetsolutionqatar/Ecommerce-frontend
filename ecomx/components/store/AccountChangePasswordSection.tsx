"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Icons from "@/components/Icons";
import {
  changePasswordValidationSchema,
  defaultChangePasswordFormValues,
} from "@/lib/admin/change-password-form";
import { authApi } from "@/lib/api/auth.api";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/api/errors";
import { showError, showSuccess } from "@/lib/toast";
import { tw } from "@/lib/theme";

function PasswordField({
  id,
  label,
  value,
  error,
  placeholder,
  autoComplete,
  onChange,
  onBlur,
  visibility = true,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  placeholder: string;
  autoComplete: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  visibility?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-semibold text-gray-600"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full rounded-lg border bg-white px-3 py-2.5 pr-11 text-sm text-gray-900 outline-none focus:border-primary ${
            error ? "border-red-400" : "border-gray-200"
          }`}
        />
        {visibility && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-800"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <Icons.EyeOff /> : <Icons.Eye />}
          </button>
        )}
      </div>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export default function AccountChangePasswordSection() {
  const formik = useFormik({
    initialValues: defaultChangePasswordFormValues,
    validationSchema: changePasswordValidationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, helpers) => {
      try {
        await authApi.changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        });
        showSuccess("Password updated successfully");
        helpers.resetForm();
      } catch (err) {
        const apiFieldErrors = getApiFieldErrors(err);
        if (Object.keys(apiFieldErrors).length > 0) {
          const mapped: Partial<typeof defaultChangePasswordFormValues> = {};
          if (apiFieldErrors.currentPassword)
            mapped.currentPassword = apiFieldErrors.currentPassword;
          if (apiFieldErrors.newPassword)
            mapped.newPassword = apiFieldErrors.newPassword;
          if (apiFieldErrors.confirmPassword)
            mapped.confirmPassword = apiFieldErrors.confirmPassword;
          if (apiFieldErrors.password)
            mapped.newPassword = apiFieldErrors.password;
          helpers.setErrors(mapped);
          return;
        }
        showError(getApiErrorMessage(err, "Could not change password"));
      }
    },
  });

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
  } = formik;

  return (
    <div className="px-4 py-4 sm:px-5 sm:py-5">
      <p className="mb-4 text-xs text-gray-500">
        Enter your current password and choose a new one. New password must
        differ from the current password.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex max-w-md flex-col gap-3"
        noValidate
      >
        <PasswordField
          id="account-currentPassword"
          label="Current password"
          value={values.currentPassword}
          error={touched.currentPassword ? errors.currentPassword : undefined}
          placeholder="Enter current password"
          autoComplete="current-password"
          onChange={(value) => void setFieldValue("currentPassword", value)}
          onBlur={() => void setFieldTouched("currentPassword", true)}
          visibility={false}
        />

        <PasswordField
          id="account-newPassword"
          label="New password"
          value={values.newPassword}
          error={touched.newPassword ? errors.newPassword : undefined}
          placeholder="Enter new password"
          autoComplete="new-password"
          onChange={(value) => void setFieldValue("newPassword", value)}
          onBlur={() => void setFieldTouched("newPassword", true)}
        />

        <PasswordField
          id="account-confirmPassword"
          label="Confirm new password"
          value={values.confirmPassword}
          error={touched.confirmPassword ? errors.confirmPassword : undefined}
          placeholder="Re-enter new password"
          autoComplete="new-password"
          onChange={(value) => void setFieldValue("confirmPassword", value)}
          onBlur={() => void setFieldTouched("confirmPassword", true)}
        />

        <div className="pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`${tw.btnPrimary} w-full justify-center text-sm disabled:opacity-50 sm:w-auto`}
          >
            {isSubmitting ? "Updating..." : "Update password"}
          </button>
        </div>
      </form>
    </div>
  );
}
