"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth.api";
import { getAuthErrorMessage } from "@/lib/api/auth-errors";
import { TOKEN_KEYS } from "@/lib/config";
import { ROLE, sanitizeRedirectPath } from "@/lib/Constant";
import { useAuthStore } from "@/store/auth.store";
import type { AuthUser } from "@/types/auth.types";

function normalizeAuthUser(raw: Record<string, unknown>): AuthUser {
  return {
    id: String(raw.id ?? raw._id ?? ""),
    name: String(raw.name ?? ""),
    email: String(raw.email ?? ""),
    phone: raw.phone ? String(raw.phone) : undefined,
    role: (raw.role as AuthUser["role"]) ?? ROLE.CUSTOMER,
    tenantId: String(raw.tenantId ?? ""),
    avatar: raw.avatar ? String(raw.avatar) : undefined,
    isActive: raw.isActive as boolean | undefined,
  };
}

export default function GoogleOAuthCallbackPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setAuthError = useAuthStore((s) => s.setAuthError);
  const [message, setMessage] = useState("Completing Google sign-in…");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const returnTo = sanitizeRedirectPath(params.get("returnTo"));

    if (error) {
      const msg =
        error === "google_cancelled"
          ? "Google sign-in was cancelled."
          : "Google sign-in failed. Please try again.";
      setAuthError(msg);
      setMessage(msg);
      router.replace(`/?authError=${encodeURIComponent(msg)}`);
      return;
    }

    if (!accessToken || !refreshToken) {
      const msg = "Google sign-in failed. Missing authentication tokens.";
      setAuthError(msg);
      setMessage(msg);
      router.replace(`/?authError=${encodeURIComponent(msg)}`);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(TOKEN_KEYS.access, accessToken);
          localStorage.setItem(TOKEN_KEYS.refresh, refreshToken);
        }

        const res = await authApi.getMe();
        if (cancelled) return;

        const user = normalizeAuthUser(
          res.data.customer as unknown as Record<string, unknown>
        );
        setAuth(user, accessToken, refreshToken);
        router.replace(returnTo);
      } catch (err) {
        if (cancelled) return;
        const msg = getAuthErrorMessage(err, "googleLogin");
        setAuthError(msg);
        setMessage(msg);
        router.replace(`/?authError=${encodeURIComponent(msg)}`);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, setAuth, setAuthError]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f1f3f6] px-4">
      <div className="rounded-2xl border border-gray-200 bg-white px-8 py-10 text-center shadow-lg">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#0a255d]/20 border-t-[#0a255d]" />
        <p className="text-sm font-semibold text-gray-700">{message}</p>
      </div>
    </div>
  );
}
