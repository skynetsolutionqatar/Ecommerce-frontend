import type { PublicDeliverySettings } from "@/types/delivery-settings.types";

type PromoSettings = Pick<
  PublicDeliverySettings,
  "enabled" | "fullFreeDelivery" | "freeDeliveryWithinKm" | "freeDeliveryMinOrderAmount" | "maxRadiusKm"
>;

/** Shown while settings load or if they fail to load (no promo claims). */
export const DELIVERY_PROMO_FALLBACK = "Delivery across Qatar";

/** Promo text for the top bar, derived from the admin delivery settings. */
export function getDeliveryPromoText(settings?: PromoSettings | null): string {
  if (!settings) return DELIVERY_PROMO_FALLBACK;
  if (!settings.enabled) return "Delivery temporarily unavailable";

  const km = Number(settings.freeDeliveryWithinKm) || 0;
  const min = Number(settings.freeDeliveryMinOrderAmount) || 0;

  if (settings.fullFreeDelivery) return "Free Delivery on all orders";
  // Both promos set: backend requires both conditions.
  if (km > 0 && min > 0) {
    return `Free Delivery within ${km} km on orders over QAR ${min.toLocaleString()}`;
  }
  if (min > 0) return `Free Delivery on orders over QAR ${min.toLocaleString()}`;
  if (km > 0) return `Free Delivery within ${km} km`;
  return `Delivery within ${Number(settings.maxRadiusKm) || 0} km of our store`;
}
