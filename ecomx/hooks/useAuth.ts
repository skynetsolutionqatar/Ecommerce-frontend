"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth.api";
import { ROLE } from "@/lib/Constant";
import { AUTH_ROUTES, canAccessAdminPanel, getPostAuthRedirect } from "@/lib/config";
import { getAuthErrorMessage } from "@/lib/api/auth-errors";
import { useAuthStore } from "@/store/auth.store";
import type {
  AuthUser,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from "@/types/auth.types";
import { authUserToStoreUser } from "@/lib/auth-utils";
import { linkGuestActivityToCustomer } from "@/lib/store/guest-activity-link";

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
  const { user, isHydrated, setAuth, clearAuth, setUser, authError, setAuthError, clearAuthError } =
    useAuthStore();
  const [loading, setLoading] = useState(false);

  const login = useCallback(
    async (payload: LoginPayload, redirectTo?: string | null) => {
      setLoading(true);
      clearAuthError();
      try {
        const res = await authApi.login(payload);
        const { customer, accessToken, refreshToken } = res.data;
        const normalized = normalizeAuthUser(customer as unknown as Record<string, unknown>);
        setAuth(normalized, accessToken, refreshToken);
        void linkGuestActivityToCustomer("login_linked");

        const destination = getPostAuthRedirect(normalized.role, redirectTo);
        if (destination) {
          router.replace(destination);
        }

        return { user: normalized, storeUser: authUserToStoreUser(normalized) };
      } catch (err) {
        setAuthError(getAuthErrorMessage(err, "login"));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [router, setAuth, setAuthError, clearAuthError]
  );

  const register = useCallback(
    async (payload: RegisterPayload, redirectTo?: string | null) => {
      setLoading(true);
      clearAuthError();
      try {
        const res = await authApi.register(payload);
        const { customer, accessToken, refreshToken } = res.data;
        const normalized = normalizeAuthUser(customer as unknown as Record<string, unknown>);
        setAuth(normalized, accessToken, refreshToken);
        void linkGuestActivityToCustomer("register_linked");

        const destination = getPostAuthRedirect(normalized.role, redirectTo);
        if (destination) {
          router.replace(destination);
        }

        return { user: normalized, storeUser: authUserToStoreUser(normalized) };
      } catch (err) {
        setAuthError(getAuthErrorMessage(err, "register"));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [router, setAuth, setAuthError, clearAuthError]
  );

  const logout = useCallback(async () => {
    const wasAdmin = canAccessAdminPanel(useAuthStore.getState().user?.role);
    try {
      await authApi.logout();
    } catch {
      // ignore — clear local state regardless
    } finally {
      clearAuth();
      if (wasAdmin) {
        router.push(AUTH_ROUTES.login);
      } else {
        router.replace("/");
      }
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

  const changePassword = useCallback(async (payload: ChangePasswordPayload) => {
    setLoading(true);
    clearAuthError();
    try {
      await authApi.changePassword(payload);
    } catch (err) {
      setAuthError(getAuthErrorMessage(err, "changePassword"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearAuthError, setAuthError]);

  const forgotPassword = useCallback(async (payload: ForgotPasswordPayload) => {
    setLoading(true);
    clearAuthError();
    try {
      const res = await authApi.forgotPassword(payload);
      return res.message;
    } catch (err) {
      setAuthError(getAuthErrorMessage(err, "forgotPassword"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearAuthError, setAuthError]);

  const resetPassword = useCallback(async (payload: ResetPasswordPayload) => {
    setLoading(true);
    clearAuthError();
    try {
      const res = await authApi.resetPassword(payload);
      return res.message;
    } catch (err) {
      setAuthError(getAuthErrorMessage(err, "resetPassword"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearAuthError, setAuthError]);

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
    isAdmin: canAccessAdminPanel(user?.role),
    isHydrated,
    loading,
    error: authError,
    setError: setAuthError,
    clearError: clearAuthError,
    login,
    register,
    logout,
    changePassword,
    forgotPassword,
    resetPassword,
    refreshMe,
    toStoreUser: authUserToStoreUser,
  };
}
