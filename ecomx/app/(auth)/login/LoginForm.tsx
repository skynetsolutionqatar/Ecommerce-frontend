"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AUTH_ROUTES } from "@/lib/config";
import { tw } from "@/lib/theme";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const { login, loading, error } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [localError, setLocalError] = useState<string | null>(null);

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
    <div className="rounded-2xl border border-border bg-white p-8 shadow-[0_8px_32px_color-mix(in_srgb,var(--color-primary)_8%,transparent)]">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold text-primary">Admin Login</h1>
        <p className="mt-1 text-sm text-muted">Sign in to manage your store</p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-xs font-semibold text-muted">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full rounded-xl border border-border bg-bg-soft px-4 py-3 text-sm outline-none focus:border-primary"
            placeholder="admin@skynetqatar.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-xs font-semibold text-muted">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="w-full rounded-xl border border-border bg-bg-soft px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </div>

        {(localError || error) && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {localError ?? error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`${tw.btnPrimary} w-full disabled:opacity-60`}
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href={AUTH_ROUTES.register} className="font-semibold text-accent hover:underline">
          Register
        </Link>
      </p>

      <p className="mt-3 text-center">
        <Link href="/" className="text-xs text-muted hover:text-primary">
          ← Back to store
        </Link>
      </p>
    </div>
  );
}
