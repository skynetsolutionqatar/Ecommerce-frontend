import { loadCheckoutProgress } from "@/lib/store/checkout-address-cache";

export const DEFAULT_DELIVERY_AREA_LABEL = "Select your area";

export function readDeliveryAreaLabel(fallback = DEFAULT_DELIVERY_AREA_LABEL): string {
  if (typeof window === "undefined") return fallback;
  const progress = loadCheckoutProgress();
  if (!progress) return fallback;
  const { form, deliveryStatus } = progress;
  const area = deliveryStatus?.areaName?.trim() || form.areaName?.trim();
  const district = deliveryStatus?.districtName?.trim() || form.districtName?.trim();
  if (area && district) return `${area}, ${district}`;
  if (area) return area;
  return fallback;
}