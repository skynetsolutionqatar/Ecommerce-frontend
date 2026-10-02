"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import LocationAreaSearchInput, {
  formatAreaSearchLabel,
} from "@/components/store/LocationAreaSearchInput";
import { Colors, tw } from "@/lib/theme";
import { showError } from "@/lib/toast";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  buildCustomerAddressPayload,
  decodeAddressDeliveryMeta,
} from "@/lib/store/customer-address-checkout";
import { useCheckDeliveryMutation, useValidateLocationMutation } from "@/hooks/useLocations";
import { usePublicDeliverySettings } from "@/hooks/useDeliverySettings";
import { DEFAULT_COUNTRY_ID, QATAR_ONLY_LOCATION_ERROR } from "@/types/location.types";
import type { ApiAreaSearchResult } from "@/types/location.types";
import type { CustomerAddress } from "@/types/customer.types";
import { isValidQatarPhone, sanitizeQatarPhoneInput } from "@/lib/utils";
import { getCurrentCoords } from "@/lib/geolocation";

const DeliveryMapPicker = dynamic(() => import("@/components/store/DeliveryMapPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-48 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500">
      Loading map...
    </div>
  ),
});

const LABELS = ["Home", "Work", "Other"] as const;

type LabelOption = (typeof LABELS)[number];

export type CustomerAddressFormSubmit = Omit<CustomerAddress, "_id">;

interface CustomerAddressFormProps {
  initial?: CustomerAddress | null;
  defaultFullName?: string;
  defaultPhone?: string;
  showDefaultToggle?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
  onSubmit: (payload: CustomerAddressFormSubmit) => Promise<void>;
}

export default function CustomerAddressForm({
  initial,
  defaultFullName = "",
  defaultPhone = "",
  showDefaultToggle = true,
  submitLabel = "Save address",
  onCancel,
  onSubmit,
}: CustomerAddressFormProps) {
  const { data: deliverySettings } = usePublicDeliverySettings();
  const checkDeliveryMut = useCheckDeliveryMutation();
  const validateLocationMut = useValidateLocationMutation();
  const checkDeliveryRef = useRef(checkDeliveryMut.mutateAsync);
  checkDeliveryRef.current = checkDeliveryMut.mutateAsync;
  const validateLocationRef = useRef(validateLocationMut.mutateAsync);
  validateLocationRef.current = validateLocationMut.mutateAsync;

  const meta = initial ? decodeAddressDeliveryMeta(initial) : null;

  const [label, setLabel] = useState<LabelOption>(
    (initial?.label as LabelOption) ?? "Home"
  );
  const [fullName, setFullName] = useState(initial?.fullName ?? defaultFullName);
  const [phone, setPhone] = useState(() => {
    const raw = initial?.phone ?? defaultPhone;
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("974") && digits.length >= 11) {
      return sanitizeQatarPhoneInput(digits.slice(3));
    }
    return sanitizeQatarPhoneInput(digits);
  });
  const [line1, setLine1] = useState(initial?.line1 ?? "");
  const [locationQuery, setLocationQuery] = useState(() => {
    if (!initial) return "";
    const district = initial.city?.trim() ?? "";
    const area = initial.line2?.trim() ?? "";
    if (area && district) return formatAreaSearchLabel({ name: area, districtName: district });
    return district || area;
  });
  const [districtId, setDistrictId] = useState(meta?.districtId ?? "");
  const [areaId, setAreaId] = useState(meta?.areaId ?? "");
  const [districtName, setDistrictName] = useState(initial?.city ?? "");
  const [areaName, setAreaName] = useState(initial?.line2 ?? "");
  const [mapLat, setMapLat] = useState<number | null>(meta?.mapLat ?? null);
  const [mapLng, setMapLng] = useState<number | null>(meta?.mapLng ?? null);
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);
  const [showMap, setShowMap] = useState(false);
  const [locationChecking, setLocationChecking] = useState(false);
  const [locating, setLocating] = useState(false);
  const [deliverable, setDeliverable] = useState<boolean | null>(
    initial ? true : null
  );
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const runDeliveryCheck = useCallback(
    async (coords?: { lat: number | null; lng: number | null }, query?: string) => {
      const q = (query ?? locationQuery).trim();
      const lat = coords?.lat ?? mapLat;
      const lng = coords?.lng ?? mapLng;
      if (!q && (lat == null || lng == null)) {
        setDeliverable(null);
        setDeliveryMessage("");
        return;
      }
      setLocationChecking(true);
      try {
        const result =
          lat != null && lng != null
            ? await validateLocationRef.current({
                lat,
                lng,
                countryId: DEFAULT_COUNTRY_ID,
                subtotal: 0,
              })
            : await checkDeliveryRef.current({
                countryId: DEFAULT_COUNTRY_ID,
                q: q,
                subtotal: 0,
              });
        if (result.deliverable && result.area && result.district) {
          setDistrictId(result.district._id);
          setAreaId(result.area._id);
          setDistrictName(result.district.name);
          setAreaName(result.area.name);
          const labelText = formatAreaSearchLabel({
            name: result.area.name,
            districtName: result.district.name,
          });
          setLocationQuery(labelText);
          if (result.lat != null && result.lng != null) {
            setMapLat(result.lat);
            setMapLng(result.lng);
          }
          setDeliverable(true);
          setDeliveryMessage(`Delivery available in ${labelText}`);
        } else {
          setDeliverable(false);
          setDeliveryMessage(result.message || QATAR_ONLY_LOCATION_ERROR);
        }
      } catch (err) {
        setDeliverable(false);
        setDeliveryMessage(getApiErrorMessage(err, QATAR_ONLY_LOCATION_ERROR));
      } finally {
        setLocationChecking(false);
      }
    },
    [locationQuery, mapLat, mapLng]
  );

  useEffect(() => {
    if (!initial) return;
    void runDeliveryCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- validate saved address once
  }, []);

  const inputClass = (hasError: boolean) =>
    `w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-primary ${
      hasError ? "border-red-400" : "border-gray-200"
    }`;

  const validate = () => {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = "Full name is required";
    if (!phone.trim()) next.phone = "Phone is required";
    else if (!isValidQatarPhone(phone)) next.phone = "Enter a valid 8-digit Qatar mobile";
    if (!line1.trim() || line1.trim().length < 5) next.line1 = "Street address is required";
    if (!locationQuery.trim() && mapLat == null) {
      next.location = "Select a delivery location";
    } else if (deliverable !== true) {
      next.location = deliveryMessage || QATAR_ONLY_LOCATION_ERROR;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = buildCustomerAddressPayload({
        label,
        fullName,
        phone,
        line1,
        districtName,
        areaName,
        districtId,
        areaId,
        mapLat,
        mapLng,
        countryName: "Qatar",
        isDefault: showDefaultToggle ? isDefault : undefined,
      });
      await onSubmit(payload);
    } catch (err) {
      showError(getApiErrorMessage(err, "Could not save address"));
    } finally {
      setSaving(false);
    }
  };

  const handleAreaSelect = (area: ApiAreaSearchResult) => {
    const labelText = formatAreaSearchLabel(area);
    setLocationQuery(labelText);
    setMapLat(area.lat);
    setMapLng(area.lng);
    setDistrictId("");
    setAreaId("");
    setErrors((prev) => ({ ...prev, location: "" }));
    void runDeliveryCheck({ lat: area.lat, lng: area.lng }, labelText);
  };

  const handleMapPick = (lat: number, lng: number) => {
    setMapLat(lat);
    setMapLng(lng);
    void runDeliveryCheck({ lat, lng });
  };

  const handleUseMyLocation = async () => {
    setLocating(true);
    try {
      const { lat, lng } = await getCurrentCoords();
      handleMapPick(lat, lng);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Could not get location");
    } finally {
      setLocating(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Address type</p>
        <div className="flex flex-wrap gap-2">
          {LABELS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setLabel(opt)}
              className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                label === opt
                  ? "border-primary bg-gray-100"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
              style={label === opt ? { color: Colors.base_color } : undefined}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-800">Full name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass(!!errors.fullName)}
          />
          {errors.fullName ? <p className="mt-1 text-xs text-red-600">{errors.fullName}</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-800">Phone (+974)</label>
          <div
            className={`flex overflow-hidden rounded-lg border ${
              errors.phone ? "border-red-400" : "border-gray-200"
            }`}
          >
            <span className="flex items-center border-r border-gray-200 bg-gray-50 px-3 text-sm font-semibold">
              +974
            </span>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={8}
              value={phone}
              onChange={(e) => setPhone(sanitizeQatarPhoneInput(e.target.value))}
              className="w-full border-0 px-3 py-2.5 text-sm outline-none"
            />
          </div>
          {errors.phone ? <p className="mt-1 text-xs text-red-600">{errors.phone}</p> : null}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-800">Street / building</label>
        <input
          value={line1}
          onChange={(e) => setLine1(e.target.value)}
          placeholder="House, building, street"
          className={inputClass(!!errors.line1)}
        />
        {errors.line1 ? <p className="mt-1 text-xs text-red-600">{errors.line1}</p> : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-800">Delivery location</label>
        <LocationAreaSearchInput
          value={locationQuery}
          onChange={(value) => {
            setLocationQuery(value);
            setDeliverable(null);
            setDistrictId("");
            setAreaId("");
            setMapLat(null);
            setMapLng(null);
          }}
          onSelect={handleAreaSelect}
          onBlur={() => void runDeliveryCheck()}
          showSearchIcon
          className={inputClass(!!errors.location)}
        />
        {locationChecking ? (
          <p className="mt-1 text-xs text-gray-500">Checking delivery...</p>
        ) : deliverable === true ? (
          <p className="mt-1 text-xs text-green-600">✓ {deliveryMessage}</p>
        ) : deliverable === false ? (
          <p className="mt-1 text-xs text-red-600">{errors.location || deliveryMessage}</p>
        ) : errors.location ? (
          <p className="mt-1 text-xs text-red-600">{errors.location}</p>
        ) : null}
        <button
          type="button"
          onClick={() => setShowMap((v) => !v)}
          className="mt-2 text-xs font-semibold hover:underline"
          style={{ color: Colors.base_color }}
        >
          {showMap ? "Hide map" : "Pick on map"}
        </button>
      </div>

      {showMap ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-2 sm:p-3">
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              onClick={() => void handleUseMyLocation()}
              disabled={locating || locationChecking}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-semibold disabled:opacity-50"
            >
              {locating ? "Locating..." : "Use my location"}
            </button>
          </div>
          <DeliveryMapPicker
            lat={mapLat}
            lng={mapLng}
            countryId={DEFAULT_COUNTRY_ID}
            storeOrigin={
              deliverySettings
                ? {
                    lat: deliverySettings.originLat,
                    lng: deliverySettings.originLng,
                    maxRadiusKm: deliverySettings.maxRadiusKm,
                    label: deliverySettings.originLabel,
                  }
                : undefined
            }
            onPick={handleMapPick}
          />
        </div>
      ) : null}

      {showDefaultToggle ? (
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          Set as default delivery address
        </label>
      ) : null}

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:flex-wrap">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className={`${tw.btnOutline} w-full flex-1 justify-center sm:w-auto`}
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          disabled={saving || locationChecking}
          className={`${tw.btnPrimary} w-full flex-1 justify-center disabled:opacity-50 sm:w-auto`}
        >
          {saving ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

/** Normalize phone for display in forms (exported for checkout). */
export function checkoutPhoneFromAddressPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("974") && digits.length >= 11) {
    return sanitizeQatarPhoneInput(digits.slice(3));
  }
  return sanitizeQatarPhoneInput(digits);
}
