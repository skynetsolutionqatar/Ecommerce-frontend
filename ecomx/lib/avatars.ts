export const AVATAR_COLORS = ["#15803D", "#166534", "#0D3B2E", "#052E16", "#16A34A", "#6B7280", "#0f766e", "#BE123C"];

export const AVATAR_BG_CLASSES = [
  "bg-yellow-700",
  "bg-stone-900",
  "bg-emerald-600",
  "bg-orange-700",
  "bg-violet-600",
  "bg-cyan-600",
  "bg-amber-800",
  "bg-rose-700",
] as const;

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return (parts[0]?.slice(0, 2) ?? "?").toUpperCase();
}

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash);
}

export function getAvatarColor(seed: string): string {
  return AVATAR_COLORS[hashSeed(seed) % AVATAR_COLORS.length];
}

export function getAvatarBgClass(seed: string): string {
  return AVATAR_BG_CLASSES[hashSeed(seed) % AVATAR_BG_CLASSES.length];
}
