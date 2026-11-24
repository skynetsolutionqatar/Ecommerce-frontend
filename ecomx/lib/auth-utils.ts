import type { StoreUser } from "@/lib/types";
import type { AuthUser } from "@/types/auth.types";

export function authUserToStoreUser(user: AuthUser): StoreUser {
  return {
    name: user.name,
    email: user.email,
    avatarUrl: user.avatar,
  };
}

/** Phone OTP accounts get an internal mailbox the shopper never uses. */
export function isPhoneOnlyAccountEmail(email?: string | null): boolean {
  return typeof email === "string" && /\.phone\.local$/i.test(email.trim());
}

/** What to show as the account contact: phone for OTP accounts, otherwise email. */
export function accountContactLabel(email?: string | null, phone?: string | null): string {
  if (isPhoneOnlyAccountEmail(email)) return phone?.trim() || "Phone account";
  return email?.trim() || "";
}
