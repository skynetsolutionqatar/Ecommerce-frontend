"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AUTH_ROUTES } from "@/lib/config";
import { getAuthErrorMessage } from "@/lib/api/auth-errors";
import { getApiFieldErrors } from "@/lib/api/errors";
import AuthFormError from "@/components/auth/AuthFormError";
import {
  AuthAltActions,
  AuthFormField,
  AuthShell,
  AuthSubmitButton,
  AuthSuccessState,
  authInputClass,
} from "@/components/auth/AuthShell";
import * as Icons from "@/components/Icons";

export default function ForgotPasswordForm() {
  const { forgotPassword, loading, clearError, setError } = useAuth();
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFieldError(undefined);
    setSuccess(false);

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    try {
      await forgotPassword({ email: email.trim() });
      setEmail("");
      setSuccess(true);
    } catch (err) {
      const apiFieldErrors = getApiFieldErrors(err);
      if (apiFieldErrors.email) {
        setFieldError(apiFieldErrors.email);
        clearError();
        return;
      }
      setError(getAuthErrorMessage(err, "forgotPassword"));
    }
  };

  if (success) {
    return (
      <AuthShell
        title="Check your email"
        subtitle="If an account exists for that address, we sent a password reset link."
      >
        <AuthSuccessState
          title="Reset link sent"
          message="Check your inbox for the reset link. It expires in 1 hour."
        />
        <AuthAltActions
          primary={{ href: AUTH_ROUTES.login, label: "Sign In" }}
          secondary={{ href: "/", label: "Go to Store" }}
        />
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

        <AuthFormField label="Email Address" icon={<Icons.Mail />} error={fieldError}>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setFieldError(undefined);
              setEmail(e.target.value);
            }}
            className={`${authInputClass} ${fieldError ? "border-red-400 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]" : ""}`}
            placeholder="you@company.com"
            autoComplete="email"
          />
        </AuthFormField>

        <AuthSubmitButton
          loading={loading}
          loadingLabel="Sending link…"
          label="Send Reset Link"
        />

        <AuthAltActions
          primary={{ href: AUTH_ROUTES.login, label: "Sign In" }}
          secondary={{ href: "/", label: "Go to Store" }}
        />
      </form>
    </AuthShell>
  );
}
