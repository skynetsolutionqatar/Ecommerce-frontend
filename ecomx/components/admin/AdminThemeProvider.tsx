"use client";

import { useEffect } from "react";
import { useAdminTheme } from "@/hooks/useAdminTheme";

interface AdminThemeProviderProps {
  children: React.ReactNode;
}

export default function AdminThemeProvider({ children }: AdminThemeProviderProps) {
  const theme = useAdminTheme((state) => state.theme);
  const isDark = theme === "dark";

  useEffect(() => {
    const root = document.documentElement;

    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    return () => {
      root.classList.remove("dark");
    };
  }, [isDark]);

  return (
    <div
      className={`admin-shell h-screen w-full overflow-hidden antialiased font-sans ${isDark ? "dark" : ""}`}
    >
      {children}
    </div>
  );
}
