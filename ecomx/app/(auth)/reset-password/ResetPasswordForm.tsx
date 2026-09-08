"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AUTH_ROUTES } from "@/lib/config";
import { getAuthErrorMessage } from "@/lib/api/auth-errors";
import AuthFormError from "@/components/auth/AuthFormError";
import {
  AuthPasswordField,
  AuthShell,
  AuthSubmitButton,
} from "@/components/auth/AuthShell";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { resetPassword, loading, clearError, setError } = useAuth();
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!token) {
      setError("Invalid or missing reset link. Request a new one.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await resetPassword({
        token,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        router.replace(AUTH_ROUTES.login);
      }, 1800);
    } catch (err) {
      setError(getAuthErrorMessage(err, "resetPassword"));
    }
  };

  if (!token) {
    return (
      <AuthShell
        title="Invalid reset link"
        subtitle="This password reset link is missing or invalid."
      >
        <p className="text-center text-sm text-muted-foreground">
          <Link
            href={AUTH_ROUTES.forgotPassword}
            className="font-semibold text-[#0a255d] hover:underline"
          >
            Request a new reset link
          </Link>
        </p>
      </AuthShell>
    );
  }

  if (success) {
    return (
      <AuthShell title="Password updated" subtitle="You can now sign in with your new password.">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Redirecting you to sign in…
        </div>
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
          onChange={(newPassword) => setForm((f) => ({ ...f, newPassword }))}
          placeholder="Enter new password"
          autoComplete="new-password"
        />

        <AuthPasswordField
          id="confirmPassword"
          label="Confirm New Password"
          value={form.confirmPassword}
          onChange={(confirmPassword) => setForm((f) => ({ ...f, confirmPassword }))}
          placeholder="Re-enter new password"
          autoComplete="new-password"
        />

        <AuthSubmitButton
          loading={loading}
          loadingLabel="Updating…"
          label="Update Password"
        />

        <p className="text-center text-sm text-muted-foreground">
          <Link href={AUTH_ROUTES.login} className="font-semibold text-[#0a255d] hover:underline">
            Back to Sign In
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
