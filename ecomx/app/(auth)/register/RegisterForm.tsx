"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AUTH_ROUTES } from "@/lib/config";
import {
  AuthAltActions,
  AuthError,
  AuthFormField,
  AuthGoToStoreLink,
  AuthPasswordField,
  AuthPhoneField,
  AuthShell,
  AuthSubmitButton,
  AuthSuccessState,
  authInputClass,
} from "@/components/auth/AuthShell";
import { getErrorMessage, getRegisterFieldError, normalizeRegisterPhone } from "@/lib/utils";
import * as Icons from "@/components/Icons";

export default function RegisterForm() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const { register, loading, error } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const loginHref = redirectParam
    ? `${AUTH_ROUTES.login}?redirect=${encodeURIComponent(redirectParam)}`
    : AUTH_ROUTES.login;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccess(false);

    const validationError = getRegisterFieldError(form);
    if (validationError) {
      setLocalError(validationError);
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
    } catch (err) {
      setLocalError(getErrorMessage(err, "Registration failed"));
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

        {(localError || error) && (
          <AuthError message={localError ?? error ?? "Registration failed"} />
        )}

        <AuthSubmitButton loading={loading} loadingLabel="Creating account…" label="Create Account" />

        <AuthAltActions
          primary={{ href: loginHref, label: "Sign In" }}
          secondary={{ href: "/", label: "Go to Store" }}
        />
      </form>
    </AuthShell>
  );
}
