import { getClientConfig } from "@/config/clients";
import { Colors } from "@/lib/theme";

/** PDF palette aligned with store theme (skynet.ts + theme.ts Colors). */
export function getInvoicePdfTheme() {
  const t = getClientConfig().theme;
  return {
    primary: t.primary,
    primaryMid: t.primaryMid,
    primaryLight: t.primaryLight,
    accent: t.accent,
    accentSoft: t.bgSoft,
    bg: t.bg,
    text: t.primary,
    muted: t.muted,
    border: t.border,
    footerBg: Colors.base_color,
    white: "#FFFFFF",
    stripe: t.bgSoft,
  } as const;
}

export type InvoicePdfTheme = ReturnType<typeof getInvoicePdfTheme>;
