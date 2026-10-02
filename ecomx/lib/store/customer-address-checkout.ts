import type { CheckoutFormData } from "@/components/CheckoutPage";
import { formatAreaSearchLabel } from "@/components/store/LocationAreaSearchInput";
import { DEFAULT_COUNTRY_ID } from "@/types/location.types";
import type { CustomerAddress } from "@/types/customer.types";
import { normalizeRegisterPhone, sanitizeQatarPhoneInput } from "@/lib/utils";

const META_SEP = "::";

export type SavedAddressDeliveryMeta = {
  areaId: string;
  districtId: string;
  mapLat: number | null;
  mapLng: number | null;
};

/** Persist delivery ids/coords in existing address fields (no API shape change). */
export function encodeAddressDeliveryMeta(meta: SavedAddressDeliveryMeta): {
  state: string;
  zipCode: string;
} {
  const lat = meta.mapLat ?? "";
  const lng = meta.mapLng ?? "";
  return {
    state: meta.districtId,
    zipCode: [meta.areaId, lat, lng].join(META_SEP),
  };
}

export function decodeAddressDeliveryMeta(address: CustomerAddress): SavedAddressDeliveryMeta {
  const districtId = address.state?.trim() ?? "";
  const parts = (address.zipCode ?? "").split(META_SEP);
  const areaId = parts[0]?.trim() ?? "";
  const lat = parts[1] !== undefined && parts[1] !== "" ? Number(parts[1]) : null;
  const lng = parts[2] !== undefined && parts[2] !== "" ? Number(parts[2]) : null;
  return {
    areaId,
    districtId,
    mapLat: Number.isFinite(lat) ? lat : null,
    mapLng: Number.isFinite(lng) ? lng : null,
  };
}

export function customerAddressToCheckoutPatch(
  address: CustomerAddress,
  contactEmail: string
): Pick<
  CheckoutFormData,
  | "fullName"
  | "email"
  | "phone"
  | "line1"
  | "countryId"
  | "districtId"
  | "areaId"
  | "mapLat"
  | "mapLng"
  | "districtName"
  | "areaName"
  | "locationMode"
> & { locationQuery: string } {
  const meta = decodeAddressDeliveryMeta(address);
  const districtName = address.city?.trim() ?? "";
  const areaName = address.line2?.trim() ?? "";
  const locationQuery =
    areaName && districtName
      ? formatAreaSearchLabel({ name: areaName, districtName })
      : districtName || areaName;

  const phoneDigits = address.phone.replace(/\D/g, "");
  const localPhone =
    phoneDigits.startsWith("974") && phoneDigits.length >= 11
      ? sanitizeQatarPhoneInput(phoneDigits.slice(3))
      : sanitizeQatarPhoneInput(phoneDigits);

  return {
    fullName: address.fullName,
    email: contactEmail,
    phone: localPhone,
    line1: address.line1,
    countryId: DEFAULT_COUNTRY_ID,
    districtId: meta.districtId,
    areaId: meta.areaId,
    mapLat: meta.mapLat,
    mapLng: meta.mapLng,
    districtName,
    areaName,
    locationMode: meta.mapLat != null && meta.mapLng != null ? "map" : "list",
    locationQuery,
  };
}

export function buildCustomerAddressPayload(input: {
  label: "Home" | "Work" | "Other";
  fullName: string;
  phone: string;
  line1: string;
  districtName: string;
  areaName: string;
  districtId: string;
  areaId: string;
  mapLat: number | null;
  mapLng: number | null;
  countryName: string;
  isDefault?: boolean;
}): Omit<CustomerAddress, "_id"> {
  const meta = encodeAddressDeliveryMeta({
    areaId: input.areaId,
    districtId: input.districtId,
    mapLat: input.mapLat,
    mapLng: input.mapLng,
  });

  return {
    label: input.label,
    fullName: input.fullName.trim(),
    phone: normalizeRegisterPhone(input.phone),
    line1: input.line1.trim(),
    line2: input.areaName.trim(),
    city: input.districtName.trim(),
    state: meta.state,
    country: input.countryName.trim() || "Qatar",
    zipCode: meta.zipCode,
    isDefault: input.isDefault,
  };
}

export function formatCustomerAddressLines(address: CustomerAddress): string {
  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.state && !address.state.match(/^[a-f0-9]{24}$/i) ? address.state : null,
    address.country,
  ].filter(Boolean);
  return parts.join(", ");
}
