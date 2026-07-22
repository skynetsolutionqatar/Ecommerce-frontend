"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AUTH_ROUTES } from "@/lib/config";
import { tw } from "@/lib/theme";

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
      <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-[0_8px_32px_color-mix(in_srgb,var(--color-primary)_8%,transparent)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
          ✓
        </div>
        <h1 className="font-display text-xl font-bold text-primary">Account Created!</h1>
        <p className="mt-2 text-sm text-muted">Redirecting you now…</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-8 shadow-[0_8px_32px_color-mix(in_srgb,var(--color-primary)_8%,transparent)]">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold text-primary">Create Account</h1>
        <p className="mt-1 text-sm text-muted">Register for store access</p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        {(["name", "email", "phone", "password"] as const).map((field) => (
          <div key={field}>
            <label htmlFor={field} className="mb-1 block text-xs font-semibold capitalize text-muted">
              {field}
            </label>
            <input
              id={field}
              type={field === "password" ? "password" : field === "email" ? "email" : "text"}
              required={field !== "phone"}
              value={form[field]}
              onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              className="w-full rounded-xl border border-border bg-bg-soft px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>
        ))}

        {(localError || error) && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {localError ?? error}
          </p>
        )}

        <button type="submit" disabled={loading} className={`${tw.btnPrimary} w-full disabled:opacity-60`}>
          {loading ? "Creating account…" : "Register"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href={AUTH_ROUTES.login} className="font-semibold text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
