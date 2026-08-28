"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AUTH_ROUTES } from "@/lib/config";
import { getSessionExpiredMessage, isAuthSessionReason } from "@/lib/api/auth-errors";
import AuthFormError from "@/components/auth/AuthFormError";
import {
  AuthAltActions,
  AuthFormField,
  AuthPasswordField,
  AuthShell,
  AuthSubmitButton,
  authInputClass,
} from "@/components/auth/AuthShell";
import * as Icons from "@/components/Icons";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const { login, loading, setError, clearError } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });

  const registerHref = redirectParam
    ? `${AUTH_ROUTES.register}?redirect=${encodeURIComponent(redirectParam)}`
    : AUTH_ROUTES.register;

  useEffect(() => {
    if (isAuthSessionReason(searchParams.get("reason"))) {
      setError(getSessionExpiredMessage());
    }
  }, [searchParams, setError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(form, redirectParam ?? undefined);
    } catch {
      // Shown via AuthFormError
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to access your admin dashboard and manage your store.">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        <AuthFormError />

        <AuthFormField label="Email Address" icon={<Icons.Mail />}>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={authInputClass}
            placeholder="admin@skynetqatar.com"
            autoComplete="email"
          />
        </AuthFormField>

        <AuthPasswordField
          id="password"
          label="Password"
          value={form.password}
          onChange={(password) => setForm((f) => ({ ...f, password }))}
          placeholder="Enter your password"
          autoComplete="current-password"
        />

        <AuthSubmitButton loading={loading} loadingLabel="Signing in…" label="Sign In" />

        <AuthAltActions
          primary={{ href: registerHref, label: "Create Account" }}
          secondary={{ href: "/", label: "Go to Store" }}
        />
      </form>
    </AuthShell>
  );
}
