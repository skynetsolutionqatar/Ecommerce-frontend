import { STORAGE_KEYS } from "@/lib/Constant";

function randomGuestSuffix() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

export function getOrCreateGuestId(): string {
  if (typeof window === "undefined") return "";

  const existing = localStorage.getItem(STORAGE_KEYS.GUEST_ID);
  if (existing?.startsWith("guest_")) {
    return existing;
  }

  const guestId = `guest_${randomGuestSuffix()}`;
  localStorage.setItem(STORAGE_KEYS.GUEST_ID, guestId);
  return guestId;
}

export function getGuestId(): string | null {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem(STORAGE_KEYS.GUEST_ID);
  return id?.startsWith("guest_") ? id : null;
}

export function getOrCreateGuestSessionId(): string {
  if (typeof window === "undefined") return "";

  const existing = sessionStorage.getItem(STORAGE_KEYS.GUEST_SESSION);
  if (existing) return existing;

  const sessionId = `sess_${randomGuestSuffix()}`;
  sessionStorage.setItem(STORAGE_KEYS.GUEST_SESSION, sessionId);
  return sessionId;
}
