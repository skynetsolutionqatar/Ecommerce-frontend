"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AUTH_ROUTES } from "@/lib/config";
import AuthFormError from "@/components/auth/AuthFormError";
import {
  AuthAltActions,
  AuthFormField,
  AuthGoToStoreLink,
  AuthPasswordField,
  AuthPhoneField,
  AuthShell,
  AuthSubmitButton,
  AuthSuccessState,
  authInputClass,
} from "@/components/auth/AuthShell";
import { getRegisterFieldError, normalizeRegisterPhone } from "@/lib/utils";
import * as Icons from "@/components/Icons";

export default function RegisterForm() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const { register, loading, clearError, setError } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [success, setSuccess] = useState(false);

  const loginHref = redirectParam
    ? `${AUTH_ROUTES.login}?redirect=${encodeURIComponent(redirectParam)}`
    : AUTH_ROUTES.login;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccess(false);

    const validationError = getRegisterFieldError(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await register(
        {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: normalizeRegisterPhone(form.phone),
        },
        redirectParam ?? undefined
      );
      setSuccess(true);
    } catch {
      // Shown via AuthFormError
    }
  };

  if (success) {
    return (
      <AuthShell title="You're all set!" subtitle="Your account has been created successfully.">
        <AuthSuccessState
          title="Account created"
          message="Redirecting you to the dashboard…"
        />
        <div className="mt-2">
          <AuthGoToStoreLink />
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Create account" subtitle="Register with your email and Qatar mobile number.">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        <AuthFormError />

        <AuthFormField label="Full Name" icon={<Icons.User />}>
          <input
            id="name"
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={authInputClass}
            placeholder="Mohammed Al-Thani"
            autoComplete="name"
          />
        </AuthFormField>

        <AuthFormField label="Email Address" icon={<Icons.Mail />}>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={authInputClass}
            placeholder="you@company.com"
            autoComplete="email"
          />
        </AuthFormField>

        <AuthPhoneField
          value={form.phone}
          onChange={(phone) => setForm((f) => ({ ...f, phone }))}
        />

        <AuthPasswordField
          id="password"
          label="Password"
          value={form.password}
          onChange={(password) => setForm((f) => ({ ...f, password }))}
          placeholder="Create a strong password"
          autoComplete="new-password"
        />

        <AuthSubmitButton loading={loading} loadingLabel="Creating account…" label="Create Account" />

        <AuthAltActions
          primary={{ href: loginHref, label: "Sign In" }}
          secondary={{ href: "/", label: "Go to Store" }}
        />
      </form>
    </AuthShell>
  );
}
