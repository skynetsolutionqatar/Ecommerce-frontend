"use client";

import { Moon, Sun } from "lucide-react";
import { useAdminTheme } from "@/hooks/useAdminTheme";
import { runAdminThemeTransition } from "@/lib/admin/theme-transition";

export default function AdminThemeToggle({ tone = "default" }: { tone?: "default" | "primary" }) {
  const { theme, toggleTheme } = useAdminTheme();
  const isDark = theme === "dark";

  const handleToggle = () => {
    runAdminThemeTransition(toggleTheme);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={
        tone === "primary"
          ? "flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition-[color,background-color,border-color,transform] duration-300 hover:bg-white/15 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/15"
          : "flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-[color,background-color,border-color,transform] duration-300 hover:bg-muted/60 hover:text-foreground"
      }
    >
      <span
        key={theme}
        className="inline-flex animate-in fade-in zoom-in-95 duration-300"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </span>
    </button>
  );
}
