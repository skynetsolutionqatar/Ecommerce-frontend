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
import { getApiFieldErrors } from "@/lib/api/errors";
import { getRegisterFieldError, normalizeRegisterPhone } from "@/lib/utils";
import * as Icons from "@/components/Icons";

type RegisterField = "name" | "email" | "phone" | "password";

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
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<RegisterField, string>>>({});

  const clearFieldError = (field: RegisterField) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const loginHref = redirectParam
    ? `${AUTH_ROUTES.login}?redirect=${encodeURIComponent(redirectParam)}`
    : AUTH_ROUTES.login;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFieldErrors({});
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
    } catch (err) {
      const apiFieldErrors = getApiFieldErrors(err);
      if (Object.keys(apiFieldErrors).length > 0) {
        setFieldErrors(apiFieldErrors);
        clearError();
      }
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

        <AuthFormField label="Full Name" icon={<Icons.User />} error={fieldErrors.name}>
          <input
            id="name"
            type="text"
            required
            value={form.name}
            onChange={(e) => {
              clearFieldError("name");
              setForm((f) => ({ ...f, name: e.target.value }));
            }}
            className={`${authInputClass} ${fieldErrors.name ? "border-red-400 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]" : ""}`}
            placeholder="Mohammed Al-Thani"
            autoComplete="name"
          />
        </AuthFormField>

        <AuthFormField label="Email Address" icon={<Icons.Mail />} error={fieldErrors.email}>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => {
              clearFieldError("email");
              setForm((f) => ({ ...f, email: e.target.value }));
            }}
            className={`${authInputClass} ${fieldErrors.email ? "border-red-400 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]" : ""}`}
            placeholder="you@company.com"
            autoComplete="email"
          />
        </AuthFormField>

        <AuthPhoneField
          value={form.phone}
          error={fieldErrors.phone}
          onChange={(phone) => {
            clearFieldError("phone");
            setForm((f) => ({ ...f, phone }));
          }}
        />

        <AuthPasswordField
          id="password"
          label="Password"
          value={form.password}
          error={fieldErrors.password}
          onChange={(password) => {
            clearFieldError("password");
            setForm((f) => ({ ...f, password }));
          }}
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
