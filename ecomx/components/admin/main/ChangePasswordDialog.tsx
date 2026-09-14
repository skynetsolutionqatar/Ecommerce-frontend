"use client";

import { useFormik } from "formik";
import toast from "react-hot-toast";
import { AuthPasswordField } from "@/components/auth/AuthShell";
import AuthFormError from "@/components/auth/AuthFormError";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAuthErrorMessage } from "@/lib/api/auth-errors";
import { getApiFieldErrors } from "@/lib/api/errors";
import {
  changePasswordValidationSchema,
  defaultChangePasswordFormValues,
} from "@/lib/admin/change-password-form";
import { CHANGE_PASSWORD_FORM_ID } from "@/lib/admin/form-footer";
import { useAuth } from "@/hooks/useAuth";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const cancelBtnClass = "h-10 rounded-xl px-6";
const primaryBtnClass =
  "h-10 rounded-xl bg-gradient-to-r from-[#0a255d] to-[#1e40af] px-6 text-sm font-bold text-white shadow-[0_4px_16px_rgba(10,37,93,0.35)] hover:opacity-90 disabled:opacity-60";

export default function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const { changePassword, loading, clearError, setError } = useAuth();

  const formik = useFormik({
    initialValues: defaultChangePasswordFormValues,
    validationSchema: changePasswordValidationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, helpers) => {
      clearError();
      try {
        await changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        });
        toast.success("Password updated successfully");
        helpers.resetForm();
        onOpenChange(false);
      } catch (err) {
        const apiFieldErrors = getApiFieldErrors(err);
        if (Object.keys(apiFieldErrors).length > 0) {
          const mapped: Partial<typeof defaultChangePasswordFormValues> = {};
          if (apiFieldErrors.currentPassword) mapped.currentPassword = apiFieldErrors.currentPassword;
          if (apiFieldErrors.newPassword) mapped.newPassword = apiFieldErrors.newPassword;
          if (apiFieldErrors.confirmPassword) mapped.confirmPassword = apiFieldErrors.confirmPassword;
          if (apiFieldErrors.password) mapped.newPassword = apiFieldErrors.password;
          helpers.setErrors(mapped);
          clearError();
          return;
        }
        setError(getAuthErrorMessage(err, "changePassword"));
      }
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    clearError();
    if (!nextOpen) {
      formik.resetForm();
    }
    onOpenChange(nextOpen);
  };

  const { setFieldValue, setFieldTouched, values, errors, touched, handleSubmit, isSubmitting } =
    formik;

  const pending = loading || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="z-[200] gap-0 overflow-hidden p-0 sm:max-w-md">
        <div className="space-y-4 p-5 sm:p-6">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display text-xl text-primary">Change Password</DialogTitle>
            <DialogDescription className="text-sm text-muted">
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>

          <form
            id={CHANGE_PASSWORD_FORM_ID}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <AuthFormError />

            <AuthPasswordField
              id="currentPassword"
              label="Current Password"
              value={values.currentPassword}
              error={touched.currentPassword ? errors.currentPassword : undefined}
              onChange={(value) => void setFieldValue("currentPassword", value)}
              onBlur={() => void setFieldTouched("currentPassword", true)}
              placeholder="Enter current password"
              autoComplete="current-password"
            />

            <AuthPasswordField
              id="newPassword"
              label="New Password"
              value={values.newPassword}
              error={touched.newPassword ? errors.newPassword : undefined}
              onChange={(value) => void setFieldValue("newPassword", value)}
              onBlur={() => void setFieldTouched("newPassword", true)}
              placeholder="Enter new password"
              autoComplete="new-password"
            />

            <AuthPasswordField
              id="confirmPassword"
              label="Confirm New Password"
              value={values.confirmPassword}
              error={touched.confirmPassword ? errors.confirmPassword : undefined}
              onChange={(value) => void setFieldValue("confirmPassword", value)}
              onBlur={() => void setFieldTouched("confirmPassword", true)}
              placeholder="Re-enter new password"
              autoComplete="new-password"
            />
          </form>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-muted/50 px-5 py-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => handleOpenChange(false)}
            className={cancelBtnClass}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={CHANGE_PASSWORD_FORM_ID}
            disabled={pending}
            className={primaryBtnClass}
          >
            {pending ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
