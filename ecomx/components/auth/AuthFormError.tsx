"use client";

import { useAuthStore } from "@/store/auth.store";
import { AuthError } from "@/components/auth/AuthShell";

/** Single inline auth error — login, register, and related auth actions. */
export default function AuthFormError() {
  const error = useAuthStore((s) => s.authError);
  if (!error) return null;
  return <AuthError message={error} />;
}
