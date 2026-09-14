"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AUTH_ROUTES } from "@/lib/config";
import { getAuthErrorMessage } from "@/lib/api/auth-errors";
import { getApiFieldErrors } from "@/lib/api/errors";
import AuthFormError from "@/components/auth/AuthFormError";
import {
  AuthAltActions,
  AuthPasswordField,
  AuthShell,
  AuthSubmitButton,
  AuthSuccessState,
} from "@/components/auth/AuthShell";

type ResetField = "newPassword" | "confirmPassword";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { resetPassword, loading, clearError, setError } = useAuth();
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ResetField, string>>>({});
  const [success, setSuccess] = useState(false);

  const clearFieldError = (field: ResetField) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFieldErrors({});

    if (!token) {
      setError("Invalid or missing reset link. Request a new one.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    try {
      await resetPassword({
        token,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      setForm({ newPassword: "", confirmPassword: "" });
      setSuccess(true);
      setTimeout(() => {
        router.replace(AUTH_ROUTES.login);
      }, 1800);
    } catch (err) {
      const apiFieldErrors = getApiFieldErrors(err);
      const mappedErrors: Partial<Record<ResetField, string>> = {};
      if (apiFieldErrors.newPassword) mappedErrors.newPassword = apiFieldErrors.newPassword;
      if (apiFieldErrors.confirmPassword) mappedErrors.confirmPassword = apiFieldErrors.confirmPassword;
      if (apiFieldErrors.password) mappedErrors.newPassword = apiFieldErrors.password;

      if (Object.keys(mappedErrors).length > 0) {
        setFieldErrors(mappedErrors);
        clearError();
        return;
      }

      setError(getAuthErrorMessage(err, "resetPassword"));
    }
  };

  if (!token) {
    return (
      <AuthShell
        title="Invalid reset link"
        subtitle="This password reset link is missing or invalid."
      >
        <AuthAltActions
          primary={{ href: AUTH_ROUTES.forgotPassword, label: "Request New Link" }}
          secondary={{ href: AUTH_ROUTES.login, label: "Sign In" }}
        />
      </AuthShell>
    );
  }

  if (success) {
    return (
      <AuthShell title="Password updated" subtitle="You can now sign in with your new password.">
        <AuthSuccessState
          title="Password updated"
          message="Redirecting you to sign in…"
        />
        <AuthAltActions
          primary={{ href: AUTH_ROUTES.login, label: "Sign In" }}
          secondary={{ href: "/", label: "Go to Store" }}
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Reset password" subtitle="Choose a new password for your account.">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        <AuthFormError />

        <AuthPasswordField
          id="newPassword"
          label="New Password"
          value={form.newPassword}
          error={fieldErrors.newPassword}
          onChange={(newPassword) => {
            clearFieldError("newPassword");
            setForm((f) => ({ ...f, newPassword }));
          }}
          placeholder="Enter new password"
          autoComplete="new-password"
        />

        <AuthPasswordField
          id="confirmPassword"
          label="Confirm New Password"
          value={form.confirmPassword}
          error={fieldErrors.confirmPassword}
          onChange={(confirmPassword) => {
            clearFieldError("confirmPassword");
            setForm((f) => ({ ...f, confirmPassword }));
          }}
          placeholder="Re-enter new password"
          autoComplete="new-password"
        />

        <AuthSubmitButton
          loading={loading}
          loadingLabel="Updating…"
          label="Update Password"
        />

        <AuthAltActions
          primary={{ href: AUTH_ROUTES.login, label: "Sign In" }}
          secondary={{ href: AUTH_ROUTES.forgotPassword, label: "Request New Link" }}
        />
      </form>
    </AuthShell>
  );
}
