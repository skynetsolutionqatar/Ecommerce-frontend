"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AUTH_ROUTES } from "@/lib/config";
import {
  AuthError,
  AuthFormDivider,
  AuthFormField,
  AuthGoToStoreLink,
  AuthOutlineLink,
  AuthShell,
  AuthSubmitButton,
  authInputClass,
} from "@/components/auth/AuthShell";
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
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccess(false);
    try {
      await register(
        {
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
        },
        redirectParam ?? undefined
      );
      setSuccess(true);
    } catch {
      setLocalError(error ?? "Registration failed");
    }
  };

  if (success) {
    return (
      <AuthShell title="Account Created!" subtitle="Redirecting you to the dashboard…">
        <div className="py-4 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-[0_4px_16px_rgba(34,197,94,0.25)]">
            <Icons.Check />
          </div>
          <p className="mb-5 text-sm text-muted">Welcome to Skynet Management Suite.</p>
          <AuthGoToStoreLink />
        </div>
      </AuthShell>
    );
  }

  const loginHref = redirectParam
    ? `${AUTH_ROUTES.login}?redirect=${encodeURIComponent(redirectParam)}`
    : AUTH_ROUTES.login;

  return (
    <AuthShell title="Create Account" subtitle="Register for admin store access">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
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

        <AuthFormField label="Phone (optional)" icon={<Icons.Phone />}>
          <input
            id="phone"
            type="text"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className={authInputClass}
            placeholder="+974 XXXX XXXX"
            autoComplete="tel"
          />
        </AuthFormField>

        <AuthFormField label="Password" icon={<Icons.Lock />}>
          <div className="relative">
            <input
              id="password"
              type={showPass ? "text" : "password"}
              required
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className={`${authInputClass} pr-11`}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              className="absolute right-3.5 top-1/2 flex -translate-y-1/2 cursor-pointer items-center border-0 bg-transparent text-muted transition-colors hover:text-primary"
              aria-label={showPass ? "Hide password" : "Show password"}
            >
              {showPass ? <Icons.EyeOff /> : <Icons.Eye />}
            </button>
          </div>
        </AuthFormField>

        {(localError || error) && (
          <AuthError message={localError ?? error ?? "Registration failed"} />
        )}

        <AuthSubmitButton loading={loading} loadingLabel="Creating account…" label="Create Account →" />

        <AuthFormDivider />

        <div className="space-y-3">
          <AuthOutlineLink href={loginHref}>Sign In →</AuthOutlineLink>
          <AuthGoToStoreLink />
        </div>
      </form>
    </AuthShell>
  );
}
