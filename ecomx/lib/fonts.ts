/** App-wide Times New Roman stack — storefront + admin. */
export const TIMES_FONT_STACK =
  '"Times New Roman", Times, "Liberation Serif", "Nimbus Roman No9 L", serif';

export const timesFontVariables = {
  sans: TIMES_FONT_STACK,
  display: TIMES_FONT_STACK,
  label: TIMES_FONT_STACK,
  heading: TIMES_FONT_STACK,
  mono: TIMES_FONT_STACK,
} as const;

/** Legacy admin import — no next/font class names needed for system Times. */
export const adminFontClassName = "";
