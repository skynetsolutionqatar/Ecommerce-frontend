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

export default function LoginForm() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const { login, loading, error } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await login(form, redirectParam ?? undefined);
    } catch {
      setLocalError(error ?? "Login failed");
    }
  };

  return (
    <AuthShell title="Admin Login" subtitle="Sign in to manage your store">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
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
              autoComplete="current-password"
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

        {(localError || error) && <AuthError message={localError ?? error ?? "Login failed"} />}

        <AuthSubmitButton loading={loading} loadingLabel="Signing in…" label="Sign In →" />

        <AuthFormDivider />

        <div className="space-y-3">
          <AuthGoToStoreLink />
          <AuthOutlineLink
            href={
              redirectParam
                ? `${AUTH_ROUTES.register}?redirect=${encodeURIComponent(redirectParam)}`
                : AUTH_ROUTES.register
            }
          >
            Register →
          </AuthOutlineLink>
        </div>
      </form>
    </AuthShell>
  );
}
