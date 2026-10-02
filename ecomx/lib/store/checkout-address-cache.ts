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

export interface PersistedDeliveryStatus {
  deliverable: boolean;
  message: string;
  districtId: string;
  areaId: string;
  districtName: string;
  areaName: string;
  distanceKm?: number | null;
  deliveryCharge?: number | null;
}

type CheckoutStoragePayload = CheckoutFormData & {
  checkoutStep?: number;
  locationQuery?: string;
  deliveryStatus?: PersistedDeliveryStatus | null;
  savedAddressId?: string | null;
};

function readPayload(): CheckoutStoragePayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHECKOUT_ADDRESS);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CheckoutStoragePayload>;
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
      checkoutStep: parsed.checkoutStep,
      locationQuery: parsed.locationQuery ?? "",
      deliveryStatus: parsed.deliveryStatus ?? null,
      savedAddressId: parsed.savedAddressId ?? null,
    };
  } catch {
    return null;
  }
}

function writePayload(payload: CheckoutStoragePayload): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.CHECKOUT_ADDRESS, JSON.stringify(payload));
}

function formFromPayload(payload: CheckoutStoragePayload): CheckoutFormData {
  return {
    fullName: payload.fullName,
    email: payload.email,
    phone: payload.phone,
    line1: payload.line1,
    countryId: payload.countryId,
    districtId: payload.districtId,
    areaId: payload.areaId,
    locationMode: payload.locationMode,
    mapLat: payload.mapLat,
    mapLng: payload.mapLng,
    districtName: payload.districtName,
    areaName: payload.areaName,
  };
}

export function loadCheckoutAddress(): CheckoutFormData | null {
  const payload = readPayload();
  if (!payload) return null;
  return formFromPayload(payload);
}

export function loadCheckoutProgress(): {
  form: CheckoutFormData;
  step: number;
  locationQuery: string;
  deliveryStatus: PersistedDeliveryStatus | null;
  savedAddressId: string | null;
} | null {
  const payload = readPayload();
  if (!payload) return null;
  const step = payload.checkoutStep;
  return {
    form: formFromPayload(payload),
    step: typeof step === "number" && step >= 1 && step <= 3 ? step : 1,
    locationQuery: payload.locationQuery ?? "",
    deliveryStatus: payload.deliveryStatus ?? null,
    savedAddressId: payload.savedAddressId ?? null,
  };
}

export function saveCheckoutAddress(form: CheckoutFormData): void {
  const existing = readPayload();
  writePayload({
    ...(existing ?? EMPTY_FORM),
    ...form,
    checkoutStep: existing?.checkoutStep,
    locationQuery: existing?.locationQuery,
    deliveryStatus: existing?.deliveryStatus,
  });
}

export function saveCheckoutProgress(input: {
  form: CheckoutFormData;
  step: number;
  locationQuery: string;
  deliveryStatus: PersistedDeliveryStatus | null;
  savedAddressId?: string | null;
}): void {
  writePayload({
    ...input.form,
    checkoutStep: input.step,
    locationQuery: input.locationQuery,
    deliveryStatus: input.deliveryStatus,
    savedAddressId: input.savedAddressId ?? null,
  });
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
  const existing = readPayload() ?? { ...EMPTY_FORM };
  writePayload({
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
  const existing = readPayload();
  if (!existing) return;
  writePayload({
    ...existing,
    districtId: "",
    areaId: "",
    locationMode: "list",
    mapLat: null,
    mapLng: null,
    districtName: "",
    areaName: "",
    locationQuery: "",
    deliveryStatus: null,
  });
}

export function hasVerifiedDeliverySelection(
  cached: Pick<CheckoutFormData, "districtId" | "areaId" | "mapLat" | "mapLng">
): boolean {
  return (
    (cached.mapLat != null && cached.mapLng != null) ||
    (!!cached.districtId && !!cached.areaId)
  );
}
