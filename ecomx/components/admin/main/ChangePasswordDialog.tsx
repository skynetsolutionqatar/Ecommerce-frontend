"use client";

import { useState } from "react";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { FormPasswordInput } from "@/components/admin/form";
import { colors } from "@/components/admin/utils/Colors";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAuthErrorMessage } from "@/lib/api/auth-errors";
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

const cancelBtnClass = "h-9 rounded-lg px-6";
const primaryBtnClass = `h-9 rounded-lg px-6 ${colors.mainColor} text-white hover:opacity-90`;

export default function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const { changePassword, loading } = useAuth();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const formik = useFormik({
    initialValues: defaultChangePasswordFormValues,
    validationSchema: changePasswordValidationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, helpers) => {
      try {
        await changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        });
        toast.success("Password updated successfully");
        helpers.resetForm();
        setShowCurrent(false);
        setShowNew(false);
        setShowConfirm(false);
        onOpenChange(false);
      } catch (err) {
        toast.error(getAuthErrorMessage(err, "changePassword"));
      }
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      formik.resetForm();
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    }
    onOpenChange(nextOpen);
  };

  const { handleChange, handleBlur, values, errors, touched, handleSubmit, isSubmitting } =
    formik;

  const pending = loading || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="z-[200] gap-0 overflow-hidden p-0 sm:max-w-md">
        <div className="space-y-4 p-4">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>

          <form
            id={CHANGE_PASSWORD_FORM_ID}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <FormPasswordInput
              label="Current Password"
              name="currentPassword"
              value={values.currentPassword}
              placeholder="Enter current password"
              required
              showPassword={showCurrent}
              setShowPassword={setShowCurrent}
              error={errors.currentPassword}
              touched={touched.currentPassword}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormPasswordInput
              label="New Password"
              name="newPassword"
              value={values.newPassword}
              placeholder="Enter new password"
              required
              showPassword={showNew}
              setShowPassword={setShowNew}
              error={errors.newPassword}
              touched={touched.newPassword}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormPasswordInput
              label="Confirm New Password"
              name="confirmPassword"
              value={values.confirmPassword}
              placeholder="Re-enter new password"
              required
              showPassword={showConfirm}
              setShowPassword={setShowConfirm}
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </form>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-muted/50 px-4 py-3">
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
