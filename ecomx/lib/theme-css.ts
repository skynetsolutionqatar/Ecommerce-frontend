import type { CSSProperties } from "react";
import type { ClientTheme } from "@/config/clients/types";

/** Inline CSS variables for <html> — ensures theme applies before client JS (fixes skynet.ts edits not showing) */
export function themeToCssProperties(theme: ClientTheme): CSSProperties {
  return {
    "--color-bg": theme.bg,
    "--color-bg-soft": theme.bgSoft,
    "--color-primary": theme.primary,
    "--color-primary-mid": theme.primaryMid,
    "--color-primary-light": theme.primaryLight,
    "--color-accent": theme.accent,
    "--color-accent-hover": theme.accentHover,
    "--color-accent-soft": theme.accentSoft,
    "--color-accent-light": theme.accentLight,
    "--color-muted": theme.muted,
    "--color-border": theme.border,
  } as CSSProperties;
}
