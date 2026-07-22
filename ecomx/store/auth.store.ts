import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS, isAdminRole } from "@/lib/Constant";
import { TOKEN_KEYS } from "@/lib/config";
import type { AuthUser } from "@/types/auth.types";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  setUser: (user: AuthUser | null) => void;
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

      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== "undefined") {
          localStorage.setItem(TOKEN_KEYS.access, accessToken);
          localStorage.setItem(TOKEN_KEYS.refresh, refreshToken);
        }
        set({ user, accessToken, refreshToken });
      },

      setUser: (user) => set({ user }),

      clearAuth: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem(TOKEN_KEYS.access);
          localStorage.removeItem(TOKEN_KEYS.refresh);
        }
        set({ user: null, accessToken: null, refreshToken: null });
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
export const selectIsAdmin = (s: AuthState) => isAdminRole(s.user?.role);
