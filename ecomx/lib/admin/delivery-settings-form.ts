import * as Yup from "yup";
import type {
  AdminDeliverySettings,
  DeliveryDistanceBand,
  UpdateDeliverySettingsPayload,
} from "@/types/delivery-settings.types";

export interface DeliverySettingsFormValues {
  originLabel: string;
  originLat: string;
  originLng: string;
  maxRadiusKm: string;
  fullFreeDelivery: boolean;
  freeDeliveryWithinKm: string;
  freeDeliveryMinOrderAmount: string;
  enabled: boolean;
  distanceBands: DeliveryDistanceBand[];
}

export const defaultDeliveryBands: DeliveryDistanceBand[] = [
  { fromKm: 0, toKm: 5, charge: 10 },
  { fromKm: 5, toKm: 10, charge: 15 },
  { fromKm: 10, toKm: 15, charge: 20 },
  { fromKm: 15, toKm: 20, charge: 25 },
];

export function deliverySettingsToFormValues(
  settings?: AdminDeliverySettings | null
): DeliverySettingsFormValues {
  return {
    originLabel: settings?.originLabel ?? "6FHR+8G Doha, Qatar",
    originLat: String(settings?.originLat ?? 25.176109),
    originLng: String(settings?.originLng ?? 51.456264),
    maxRadiusKm: String(settings?.maxRadiusKm ?? 20),
    fullFreeDelivery: settings?.fullFreeDelivery ?? false,
    freeDeliveryWithinKm: String(settings?.freeDeliveryWithinKm ?? 0),
    freeDeliveryMinOrderAmount: String(settings?.freeDeliveryMinOrderAmount ?? 0),
    enabled: settings?.enabled ?? true,
    distanceBands:
      settings?.distanceBands?.length ? settings.distanceBands : defaultDeliveryBands.map((b) => ({ ...b })),
  };
}

export const deliverySettingsValidationSchema = Yup.object({
  originLabel: Yup.string().trim().max(200).required("Store label is required"),
  originLat: Yup.number().typeError("Latitude is required").min(-90).max(90).required(),
  originLng: Yup.number().typeError("Longitude is required").min(-180).max(180).required(),
  maxRadiusKm: Yup.number().typeError("Max radius is required").min(0.1).max(500).required(),
  freeDeliveryWithinKm: Yup.number().typeError("Invalid value").min(0).max(500),
  freeDeliveryMinOrderAmount: Yup.number().typeError("Invalid value").min(0).max(1_000_000),
  distanceBands: Yup.array()
    .of(
      Yup.object({
        fromKm: Yup.number().min(0).required(),
        toKm: Yup.number().min(0).required(),
        charge: Yup.number().min(0).required(),
      })
    )
    .min(1)
    .test("bands-cover-radius", "Distance bands must start at 0 km and reach the max radius", function (bands) {
      if (!bands?.length) return false;
      const maxRadius = Number(this.parent.maxRadiusKm);
      const sorted = [...bands].sort((a, b) => a.fromKm - b.fromKm);
      const firstFrom = sorted[0]?.fromKm ?? -1;
      const lastTo = sorted[sorted.length - 1]?.toKm ?? 0;
      if (firstFrom > 0) {
        return this.createError({
          message:
            "The first band must start at 0 km (base pricing). Use “Free delivery within (km)” for promos.",
        });
      }
      if (lastTo < maxRadius) {
        return this.createError({
          message: `The last band must reach at least ${maxRadius} km (max delivery radius).`,
        });
      }
      for (let i = 0; i < sorted.length; i += 1) {
        const b = sorted[i];
        if (b.toKm <= b.fromKm) return false;
        if (i > 0 && sorted[i].fromKm !== sorted[i - 1].toKm) {
          return this.createError({ message: "Distance bands must connect with no gaps." });
        }
      }
      return true;
    }),
});

export function formValuesToDeliveryPayload(
  values: DeliverySettingsFormValues
): UpdateDeliverySettingsPayload {
  return {
    originLabel: values.originLabel.trim(),
    originLat: Number(values.originLat),
    originLng: Number(values.originLng),
    maxRadiusKm: Number(values.maxRadiusKm),
    fullFreeDelivery: values.fullFreeDelivery,
    freeDeliveryWithinKm: Number(values.freeDeliveryWithinKm) || 0,
    freeDeliveryMinOrderAmount: Number(values.freeDeliveryMinOrderAmount) || 0,
    enabled: values.enabled,
    distanceBands: normalizeDistanceBandsForSave(values.distanceBands),
  };
}

/** Match backend: prepend 0 → first band when the first row was removed by mistake. */
function normalizeDistanceBandsForSave(bands: DeliveryDistanceBand[]): DeliveryDistanceBand[] {
  const sorted = [...bands]
    .map((b) => ({
      fromKm: Number(b.fromKm),
      toKm: Number(b.toKm),
      charge: Number(b.charge),
    }))
    .sort((a, b) => a.fromKm - b.fromKm);

  if (sorted.length > 0 && sorted[0].fromKm > 0) {
    sorted.unshift({
      fromKm: 0,
      toKm: sorted[0].fromKm,
      charge: sorted[0].charge,
    });
  }

  return sorted;
}
