import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AdminThemeMode = "light" | "dark";

interface AdminThemeStore {
  theme: AdminThemeMode;
  setTheme: (theme: AdminThemeMode) => void;
  toggleTheme: () => void;
}

export const useAdminTheme = create<AdminThemeStore>()(
  persist(
    (set, get) => ({
      theme: "light",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set({ theme: get().theme === "light" ? "dark" : "light" }),
    }),
    { name: "admin-theme" }
  )
);
