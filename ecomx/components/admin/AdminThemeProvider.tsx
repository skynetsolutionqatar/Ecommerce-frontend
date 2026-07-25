"use client";

import { useEffect } from "react";
import { useAdminTheme } from "@/hooks/useAdminTheme";
import { applyAdminThemeOnDocument } from "@/lib/admin/theme-transition";

interface AdminThemeProviderProps {
  children: React.ReactNode;
}

export default function AdminThemeProvider({ children }: AdminThemeProviderProps) {
  const theme = useAdminTheme((state) => state.theme);
  const isDark = theme === "dark";

  useEffect(() => {
    applyAdminThemeOnDocument(isDark);
  }, [isDark]);

  useEffect(() => {
    return () => {
      document.documentElement.classList.remove("dark", "admin-theme-transition");
    };
  }, []);

  return (
    <div
      className={`admin-shell h-screen w-full overflow-hidden antialiased font-sans ${isDark ? "dark" : ""}`}
    >
      {children}
    </div>
  );
}
