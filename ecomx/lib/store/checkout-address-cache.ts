import { STORAGE_KEYS } from "@/lib/Constant";
import type { CheckoutFormData } from "@/components/CheckoutPage";
import { DEFAULT_COUNTRY_ID } from "@/types/location.types";

const EMPTY_FORM: CheckoutFormData = {
  fullName: "",
  email: "",
  phone: "",
  line1: "",
  countryId: DEFAULT_COUNTRY_ID,
  districtId: "",
  areaId: "",
  locationMode: "list",
  mapLat: null,
  mapLng: null,
};

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
      districtName: parsed.districtName ?? "",
      areaName: parsed.areaName ?? "",
    };
  } catch {
    return null;
  }
}

export function saveCheckoutAddress(form: CheckoutFormData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.CHECKOUT_ADDRESS, JSON.stringify(form));
}

export type DeliverySelection = Pick<
  CheckoutFormData,
  | "countryId"
  | "districtId"
  | "areaId"
  | "locationMode"
  | "mapLat"
  | "mapLng"
  | "districtName"
  | "areaName"
>;

/** Persist verified delivery area from product page (or map) into checkout cache. */
export function saveDeliverySelection(selection: DeliverySelection): void {
  const existing = loadCheckoutAddress() ?? EMPTY_FORM;
  saveCheckoutAddress({
    ...existing,
    countryId: selection.countryId,
    districtId: selection.districtId,
    areaId: selection.areaId,
    locationMode: "list",
    mapLat: selection.mapLat ?? null,
    mapLng: selection.mapLng ?? null,
    districtName: selection.districtName ?? "",
    areaName: selection.areaName ?? "",
  });
}

/** Clear cached delivery location (keeps contact / street address fields). */
export function clearDeliverySelection(): void {
  if (typeof window === "undefined") return;
  const existing = loadCheckoutAddress();
  if (!existing) return;
  saveCheckoutAddress({
    ...existing,
    districtId: "",
    areaId: "",
    locationMode: "list",
    mapLat: null,
    mapLng: null,
    districtName: "",
    areaName: "",
  });
}

export function hasVerifiedDeliverySelection(
  cached: Pick<CheckoutFormData, "districtId" | "areaId">
): boolean {
  return !!cached.districtId && !!cached.areaId;
}
