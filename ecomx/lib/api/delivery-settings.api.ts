import { apiGet, apiPatch } from "./client";
import type {
  AdminDeliverySettings,
  DeliveryQuote,
  PublicDeliverySettings,
  UpdateDeliverySettingsPayload,
} from "@/types/delivery-settings.types";

export const deliverySettingsApi = {
  getPublic: () =>
    apiGet<{ deliverySettings: PublicDeliverySettings }>("/delivery-settings/public"),

  quote: (lat: number, lng: number, subtotal?: number) =>
    apiGet<DeliveryQuote>("/delivery-settings/quote", {
      lat,
      lng,
      ...(subtotal != null && subtotal > 0 ? { subtotal: String(subtotal) } : {}),
    }),

  getAdmin: () =>
    apiGet<{ deliverySettings: AdminDeliverySettings }>("/delivery-settings"),

  update: (payload: UpdateDeliverySettingsPayload) =>
    apiPatch<{ deliverySettings: AdminDeliverySettings }>("/delivery-settings", payload),

  geocode: (q: string) =>
    apiGet<{
      found: boolean;
      lat?: number;
      lng?: number;
      displayName?: string;
      message?: string;
    }>("/delivery-settings/geocode", { q }),
};

export async function fetchPublicDeliverySettings(): Promise<PublicDeliverySettings> {
  const res = await deliverySettingsApi.getPublic();
  return res.data.deliverySettings;
}

export async function fetchAdminDeliverySettings(): Promise<AdminDeliverySettings> {
  const res = await deliverySettingsApi.getAdmin();
  return res.data.deliverySettings;
}

export async function quoteDelivery(
  lat: number,
  lng: number,
  subtotal?: number
): Promise<DeliveryQuote> {
  const res = await deliverySettingsApi.quote(lat, lng, subtotal);
  return res.data;
}
