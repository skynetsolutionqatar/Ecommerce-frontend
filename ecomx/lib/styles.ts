import type React from "react";

export const glassStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.55)",
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
  border: "1px solid var(--color-border-light)",
  boxShadow: "0 8px 32px color-mix(in srgb, var(--color-primary) 8%, transparent)",
};

export const glassCardStyle: React.CSSProperties = {
  background: "var(--color-surface)",
  backdropFilter: "blur(24px) saturate(200%)",
  WebkitBackdropFilter: "blur(24px) saturate(200%)",
  border: "1px solid var(--color-border-light)",
  boxShadow: "0 8px 32px color-mix(in srgb, var(--color-primary) 8%, transparent)",
};

export const clayStyle = (color = "var(--color-bg-soft)"): React.CSSProperties => ({
  background: color,
  borderRadius: 20,
  boxShadow:
    "0 8px 28px color-mix(in srgb, var(--color-primary) 8%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.95)",
  border: "1px solid var(--color-border-light)",
});

export const neoStyle = (bg = "var(--color-bg)"): React.CSSProperties => ({
  background: bg,
  borderRadius: 16,
  boxShadow:
    "0 4px 20px color-mix(in srgb, var(--color-primary) 6%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
  border: "1px solid var(--color-border-light)",
});
