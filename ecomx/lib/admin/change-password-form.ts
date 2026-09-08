import * as Yup from "yup";

export type ChangePasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export const defaultChangePasswordFormValues: ChangePasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export const changePasswordValidationSchema = Yup.object({
  currentPassword: Yup.string().trim().required("Current password is required"),
  newPassword: Yup.string()
    .trim()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .notOneOf([Yup.ref("currentPassword")], "New password must differ from current password"),
  confirmPassword: Yup.string()
    .trim()
    .required("Please confirm your new password")
    .oneOf([Yup.ref("newPassword")], "Passwords do not match"),
});
