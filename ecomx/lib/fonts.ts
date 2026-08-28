import { Urbanist } from "next/font/google";

/** Matches skynet.com — used across storefront, auth, and admin. */
export const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-urbanist",
  display: "swap",
});

export const FONT_STACK =
  'var(--font-urbanist), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export const fontCssVariables = {
  sans: FONT_STACK,
  display: FONT_STACK,
  label: FONT_STACK,
  heading: FONT_STACK,
  mono: FONT_STACK,
} as const;

/** @deprecated Use urbanist.className */
export const adminFontClassName = urbanist.className;
