/** Shared password rules — matches backend auth + change-password validation */

export const PASSWORD_MIN_LENGTH = 8;

export function getNewPasswordError(password: string): string | undefined {
  const value = password.trim();
  if (!value) return "New password is required";
  if (value.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }
  if (!/[A-Z]/.test(value)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[0-9]/.test(value)) {
    return "Password must contain at least one number";
  }
  return undefined;
}

export function getConfirmPasswordError(
  confirmPassword: string,
  newPassword: string
): string | undefined {
  if (!confirmPassword.trim()) return "Please confirm your new password";
  if (confirmPassword !== newPassword) return "Passwords do not match";
  return undefined;
}

export function getResetPasswordFieldErrors(fields: {
  newPassword: string;
  confirmPassword: string;
}): Partial<Record<"newPassword" | "confirmPassword", string>> {
  const errors: Partial<Record<"newPassword" | "confirmPassword", string>> = {};
  const newPasswordError = getNewPasswordError(fields.newPassword);
  if (newPasswordError) errors.newPassword = newPasswordError;
  const confirmError = getConfirmPasswordError(fields.confirmPassword, fields.newPassword);
  if (confirmError) errors.confirmPassword = confirmError;
  return errors;
}
