"use client";

import { Moon, Sun } from "lucide-react";
import { useAdminTheme } from "@/hooks/useAdminTheme";

export default function AdminThemeToggle() {
  const { theme, toggleTheme } = useAdminTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-muted hover:text-foreground"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
