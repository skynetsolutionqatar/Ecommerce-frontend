"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth.api";
import { ROLE } from "@/lib/Constant";
import { AUTH_ROUTES, getPostAuthRedirect, isAdminRole } from "@/lib/config";
import { getErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import type { AuthUser, LoginPayload, RegisterPayload } from "@/types/auth.types";
import { authUserToStoreUser } from "@/lib/auth-utils";

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

export function useAuth() {
  const router = useRouter();
  const { user, isHydrated, setAuth, clearAuth, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (payload: LoginPayload, redirectTo?: string | null) => {
      setLoading(true);
      setError(null);
      try {
        const res = await authApi.login(payload);
        const { customer, accessToken, refreshToken } = res.data;
        const normalized = normalizeAuthUser(customer as unknown as Record<string, unknown>);
        setAuth(normalized, accessToken, refreshToken);

        const destination = getPostAuthRedirect(normalized.role, redirectTo);
        if (destination) {
          router.replace(destination);
        }

        return { user: normalized, storeUser: authUserToStoreUser(normalized) };
      } catch (err) {
        const msg = getErrorMessage(err, "Login failed");
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [router, setAuth]
  );

  const register = useCallback(
    async (payload: RegisterPayload, redirectTo?: string | null) => {
      setLoading(true);
      setError(null);
      try {
        const res = await authApi.register(payload);
        const { customer, accessToken, refreshToken } = res.data;
        const normalized = normalizeAuthUser(customer as unknown as Record<string, unknown>);
        setAuth(normalized, accessToken, refreshToken);

        const destination = getPostAuthRedirect(normalized.role, redirectTo);
        if (destination) {
          router.replace(destination);
        }

        return { user: normalized, storeUser: authUserToStoreUser(normalized) };
      } catch (err) {
        const msg = getErrorMessage(err, "Registration failed");
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [router, setAuth]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore — clear local state regardless
    } finally {
      clearAuth();
      router.push(AUTH_ROUTES.login);
    }
  }, [clearAuth, router]);

  const refreshMe = useCallback(async () => {
    try {
      const res = await authApi.getMe();
      const customer = normalizeAuthUser(
        res.data.customer as unknown as Record<string, unknown>
      );
      setUser(customer);
      return customer;
    } catch {
      clearAuth();
      return null;
    }
  }, [clearAuth, setUser]);

  useEffect(() => {
    if (!isHydrated) return;
    const { accessToken, user: storedUser } = useAuthStore.getState();
    if (accessToken && !storedUser) {
      void refreshMe();
    }
  }, [isHydrated, refreshMe]);

  return {
    user,
    isAuthenticated: !!user && !!useAuthStore.getState().accessToken,
    isAdmin: isAdminRole(user?.role),
    isHydrated,
    loading,
    error,
    login,
    register,
    logout,
    refreshMe,
    toStoreUser: authUserToStoreUser,
  };
}
