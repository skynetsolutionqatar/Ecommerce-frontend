import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/lib/Constant";
import { canAccessAdminPanel } from "@/lib/config";
import { canManageTenants } from "@/lib/admin/tenant-access";
import { TOKEN_KEYS } from "@/lib/config";
import type { AuthUser } from "@/types/auth.types";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
  authError: string | null;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  setUser: (user: AuthUser | null) => void;
  setAuthError: (message: string | null) => void;
  clearAuthError: () => void;
  clearAuth: () => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isHydrated: false,
      authError: null,

      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== "undefined") {
          localStorage.setItem(TOKEN_KEYS.access, accessToken);
          localStorage.setItem(TOKEN_KEYS.refresh, refreshToken);
        }
        set({ user, accessToken, refreshToken });
      },

      setUser: (user) => set({ user }),

      setAuthError: (message) => set({ authError: message }),

      clearAuthError: () => set({ authError: null }),

      clearAuth: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem(TOKEN_KEYS.access);
          localStorage.removeItem(TOKEN_KEYS.refresh);
        }
        set({ user: null, accessToken: null, refreshToken: null, authError: null });
      },

      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: STORAGE_KEYS.AUTH,
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (typeof window !== "undefined" && state?.accessToken) {
          localStorage.setItem(TOKEN_KEYS.access, state.accessToken);
        }
        if (typeof window !== "undefined" && state?.refreshToken) {
          localStorage.setItem(TOKEN_KEYS.refresh, state.refreshToken);
        }
        state?.setHydrated(true);
      },
    }
  )
);

export const selectIsAuthenticated = (s: AuthState) => !!s.accessToken && !!s.user;
export const selectIsAdmin = (s: AuthState) => canAccessAdminPanel(s.user?.role);
export const selectCanManageTenants = (s: AuthState) => canManageTenants(s.user?.role);
