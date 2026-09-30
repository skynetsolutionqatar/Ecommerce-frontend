"use client";

import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import { FormInput, FormSection } from "@/components/admin/form";
import PageHeader from "@/components/admin/utils/PageHeader";
import { colors } from "@/components/admin/utils/Colors";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { deliverySettingsApi } from "@/lib/api/delivery-settings.api";
import {
  deliverySettingsToFormValues,
  deliverySettingsValidationSchema,
  formValuesToDeliveryPayload,
  type DeliverySettingsFormValues,
} from "@/lib/admin/delivery-settings-form";
import type {
  AdminDeliverySettings,
  UpdateDeliverySettingsPayload,
} from "@/types/delivery-settings.types";

const DELIVERY_FORM_ID = "delivery-settings-form";
const GEO_DEBOUNCE_MS = 700;

/** Same spacing pattern as Company / content admin forms. */
const deliveryGridClass = "grid grid-cols-1 gap-4 md:grid-cols-2";

interface DeliverySettingsFormProps {
  initial?: AdminDeliverySettings | null;
  isPending?: boolean;
  onSubmit: (payload: UpdateDeliverySettingsPayload) => Promise<void>;
}

export { DELIVERY_FORM_ID };

export default function DeliverySettingsForm({
  initial,
  isPending = false,
  onSubmit,
}: DeliverySettingsFormProps) {
  const skipGeocodeRef = useRef(true);
  const geocodeRequestRef = useRef(0);
  const [geocodeHint, setGeocodeHint] = useState<string | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  const formik = useFormik<DeliverySettingsFormValues>({
    initialValues: deliverySettingsToFormValues(initial),
    enableReinitialize: true,
    validationSchema: deliverySettingsValidationSchema,
    onSubmit: async (values) => {
      await onSubmit(formValuesToDeliveryPayload(values));
    },
  });

  useEffect(() => {
    if (skipGeocodeRef.current) {
      skipGeocodeRef.current = false;
      return;
    }

    const label = formik.values.originLabel.trim();
    if (label.length < 4) {
      setGeocodeHint(null);
      return;
    }

    const requestId = ++geocodeRequestRef.current;
    setGeocoding(true);
    setGeocodeHint(null);

    const timer = window.setTimeout(() => {
      void deliverySettingsApi
        .geocode(label)
        .then((res) => {
          if (requestId !== geocodeRequestRef.current) return;
          const data = res.data;
          if (!data.found || data.lat == null || data.lng == null) {
            setGeocodeHint(
              data.message ?? "Could not find coordinates for this label."
            );
            return;
          }
          void formik.setFieldValue(
            "originLat",
            String(Number(data.lat.toFixed(6)))
          );
          void formik.setFieldValue(
            "originLng",
            String(Number(data.lng.toFixed(6)))
          );
          setGeocodeHint("Coordinates updated from location label.");
        })
        .catch(() => {
          if (requestId !== geocodeRequestRef.current) return;
          setGeocodeHint(
            "Lookup failed. You can still enter latitude and longitude manually."
          );
        })
        .finally(() => {
          if (requestId === geocodeRequestRef.current) setGeocoding(false);
        });
    }, GEO_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- geocode only when label text changes
  }, [formik.values.originLabel]);

  const addBand = () => {
    const bands = formik.values.distanceBands;
    const last = bands[bands.length - 1];
    const nextFrom = last?.toKm ?? 0;
    formik.setFieldValue("distanceBands", [
      ...bands,
      { fromKm: nextFrom, toKm: nextFrom + 5, charge: last?.charge ?? 10 },
    ]);
  };

  const removeBand = (index: number) => {
    if (index === 0) return;
    if (formik.values.distanceBands.length <= 1) return;
    formik.setFieldValue(
      "distanceBands",
      formik.values.distanceBands.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="mx-auto w-full">
      <PageHeader
        title="Delivery zones & charges"
        description="Radius from your store, distance bands, and promotional free delivery."
      />

      <form
        id={DELIVERY_FORM_ID}
        onSubmit={formik.handleSubmit}
        className="space-y-8 pb-6"
        noValidate
      >
        <FormSection
          id="store-origin"
          title="Store location (delivery origin)"
          tabScrollAnchor={false}
        >
          <p className="mb-4 text-sm text-muted-foreground">
            Distance is measured from this point. Enter an address or plus code (e.g. 6FHR+8G Doha,
            Qatar) — latitude and longitude fill in automatically.
          </p>
          <div className={deliveryGridClass}>
            <div className="md:col-span-2">
              <FormInput
                label="Location label"
                name="originLabel"
                value={formik.values.originLabel}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.originLabel ? formik.errors.originLabel : undefined
                }
                touched={formik.touched.originLabel}
              />
              {geocoding ? (
                <p className="mt-1 text-xs text-muted-foreground">Looking up coordinates…</p>
              ) : geocodeHint ? (
                <p className="mt-1 text-xs text-muted-foreground">{geocodeHint}</p>
              ) : null}
            </div>
            <FormInput
              label="Max delivery radius (km)"
              name="maxRadiusKm"
              type="number"
              value={formik.values.maxRadiusKm}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.maxRadiusKm ? formik.errors.maxRadiusKm : undefined}
              touched={formik.touched.maxRadiusKm}
            />
            <div className="hidden md:block" aria-hidden />
            <FormInput
              label="Latitude"
              name="originLat"
              type="number"
              value={formik.values.originLat}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.originLat ? formik.errors.originLat : undefined}
              touched={formik.touched.originLat}
            />
            <FormInput
              label="Longitude"
              name="originLng"
              type="number"
              value={formik.values.originLng}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.originLng ? formik.errors.originLng : undefined}
              touched={formik.touched.originLng}
            />
          </div>
        </FormSection>

        <FormSection id="promos" title="Delivery promotions" tabScrollAnchor={false}>
          <div className="flex flex-col gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="enabled"
                checked={formik.values.enabled}
                onChange={formik.handleChange}
                className="h-4 w-4 rounded border-border"
              />
              Delivery enabled
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="fullFreeDelivery"
                checked={formik.values.fullFreeDelivery}
                onChange={formik.handleChange}
                className="h-4 w-4 rounded border-border"
              />
              Free delivery for all orders within radius
            </label>
            <FormInput
              label="Free delivery within (km) — 0 = off"
              name="freeDeliveryWithinKm"
              type="number"
              value={formik.values.freeDeliveryWithinKm}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.freeDeliveryWithinKm
                  ? formik.errors.freeDeliveryWithinKm
                  : undefined
              }
              touched={formik.touched.freeDeliveryWithinKm}
            />
            <FormInput
              label="Free delivery when order subtotal ≥ (QAR) — 0 = off"
              name="freeDeliveryMinOrderAmount"
              type="number"
              value={formik.values.freeDeliveryMinOrderAmount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.freeDeliveryMinOrderAmount
                  ? formik.errors.freeDeliveryMinOrderAmount
                  : undefined
              }
              touched={formik.touched.freeDeliveryMinOrderAmount}
            />
            <p className="text-xs text-muted-foreground">
              Promos waive the band charge — keep distance bands from 0 km. Example: 5 km free
              nearby + 100 QAR minimum subtotal for free delivery anywhere within your radius.
            </p>
          </div>
        </FormSection>

        <FormSection
          id="bands"
          title="Distance bands (QAR)"
          tabScrollAnchor={false}
          className="!mb-0"
        >
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="px-3 py-2 font-semibold">From (km)</th>
                  <th className="px-3 py-2 font-semibold">To (km)</th>
                  <th className="px-3 py-2 font-semibold">Charge (QAR)</th>
                  <th className="w-16 px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {formik.values.distanceBands.map((band, index) => (
                  <tr key={index} className="border-t border-border">
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        className="w-full rounded-md border border-border px-2 py-1"
                        value={band.fromKm}
                        onChange={(e) =>
                          formik.setFieldValue(
                            `distanceBands.${index}.fromKm`,
                            Number(e.target.value)
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        className="w-full rounded-md border border-border px-2 py-1"
                        value={band.toKm}
                        onChange={(e) =>
                          formik.setFieldValue(
                            `distanceBands.${index}.toKm`,
                            Number(e.target.value)
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        className="w-full rounded-md border border-border px-2 py-1"
                        value={band.charge}
                        onChange={(e) =>
                          formik.setFieldValue(
                            `distanceBands.${index}.charge`,
                            Number(e.target.value)
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => removeBand(index)}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button
            type="button"
            variant="link"
            onClick={addBand}
            className={cn("mt-3 h-auto px-0 text-sm font-semibold", colors.link)}
          >
            + Add band
          </Button>
        </FormSection>
      </form>
    </div>
  );
}
