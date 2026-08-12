import { STORAGE_KEYS } from "@/lib/Constant";
import type { CheckoutFormData } from "@/components/CheckoutPage";

export function loadCheckoutAddress(): CheckoutFormData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHECKOUT_ADDRESS);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CheckoutFormData;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      fullName: parsed.fullName ?? "",
      email: parsed.email ?? "",
      phone: parsed.phone ?? "",
      line1: parsed.line1 ?? "",
      line2: parsed.line2 ?? "",
      city: parsed.city ?? "",
      country: parsed.country ?? "Qatar",
    };
  } catch {
    return null;
  }
}

export function saveCheckoutAddress(form: CheckoutFormData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.CHECKOUT_ADDRESS, JSON.stringify(form));
}
