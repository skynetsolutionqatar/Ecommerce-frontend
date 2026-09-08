"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { AUTH_ROUTES } from "@/lib/config";
import { getAuthErrorMessage } from "@/lib/api/auth-errors";
import AuthFormError from "@/components/auth/AuthFormError";
import {
  AuthFormField,
  AuthShell,
  AuthSubmitButton,
  authInputClass,
} from "@/components/auth/AuthShell";
import * as Icons from "@/components/Icons";

export default function ForgotPasswordForm() {
  const { forgotPassword, loading, clearError, setError } = useAuth();
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccess(false);

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    try {
      await forgotPassword({ email: email.trim() });
      setSuccess(true);
    } catch (err) {
      setError(getAuthErrorMessage(err, "forgotPassword"));
    }
  };

  if (success) {
    return (
      <AuthShell
        title="Check your email"
        subtitle="If an account exists for that address, we sent a password reset link."
      >
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Check your inbox for the reset link. It expires in 1 hour.
        </div>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          <Link href={AUTH_ROUTES.login} className="font-semibold text-[#0a255d] hover:underline">
            Back to Sign In
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your email and we'll send you a reset link."
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        <AuthFormError />

        <AuthFormField label="Email Address" icon={<Icons.Mail />}>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authInputClass}
            placeholder="admin@skynetqatar.com"
            autoComplete="email"
          />
        </AuthFormField>

        <AuthSubmitButton
          loading={loading}
          loadingLabel="Sending link…"
          label="Send Reset Link"
        />

        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href={AUTH_ROUTES.login} className="font-semibold text-[#0a255d] hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
