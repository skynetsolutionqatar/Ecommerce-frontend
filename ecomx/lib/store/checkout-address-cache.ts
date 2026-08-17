import { STORAGE_KEYS } from "@/lib/Constant";
import type { CheckoutFormData } from "@/components/CheckoutPage";
import { DEFAULT_COUNTRY_ID } from "@/types/location.types";

export function loadCheckoutAddress(): CheckoutFormData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHECKOUT_ADDRESS);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CheckoutFormData>;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      fullName: parsed.fullName ?? "",
      email: parsed.email ?? "",
      phone: parsed.phone ?? "",
      line1: parsed.line1 ?? "",
      countryId: parsed.countryId ?? DEFAULT_COUNTRY_ID,
      districtId: parsed.districtId ?? "",
      areaId: parsed.areaId ?? "",
      locationMode: parsed.locationMode ?? "list",
      mapLat: parsed.mapLat ?? null,
      mapLng: parsed.mapLng ?? null,
    };
  } catch {
    return null;
  }
}

export function saveCheckoutAddress(form: CheckoutFormData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.CHECKOUT_ADDRESS, JSON.stringify(form));
}
