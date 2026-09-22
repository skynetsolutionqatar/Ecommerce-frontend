"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Colors } from "@/lib/theme";
import { showError } from "@/lib/toast";
import { getCurrentCoords } from "@/lib/geolocation";
import { saveDeliverySelection, clearDeliverySelection } from "@/lib/store/checkout-address-cache";
import {
  useCheckDeliveryMutation,
  useValidateLocationMutation,
} from "@/hooks/useLocations";
import { DEFAULT_COUNTRY_ID } from "@/types/location.types";
import type { ApiAreaSearchResult, LocationValidationResult } from "@/types/location.types";
import LocationAreaSearchInput, {
  formatAreaSearchLabel,
} from "@/components/store/LocationAreaSearchInput";

const DeliveryMapPicker = dynamic(
  () => import("@/components/store/DeliveryMapPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-56 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm text-gray-500">
        Loading map...
      </div>
    ),
  }
);

export default function DeliveryCheckPanel() {
  const [query, setQuery] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [mapLat, setMapLat] = useState<number | null>(null);
  const [mapLng, setMapLng] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isDeliverable, setIsDeliverable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [resolvingMap, setResolvingMap] = useState(false);
  const [locating, setLocating] = useState(false);

  const validateLocationMut = useValidateLocationMutation();
  const checkDeliveryMut = useCheckDeliveryMutation();

  const persistDelivery = (
    result: LocationValidationResult,
    coords?: { lat: number | null; lng: number | null }
  ) => {
    if (!result.deliverable || !result.area || !result.district) return;

    saveDeliverySelection({
      countryId: DEFAULT_COUNTRY_ID,
      districtId: result.district._id,
      areaId: result.area._id,
      locationMode: "list",
      mapLat: coords?.lat ?? null,
      mapLng: coords?.lng ?? null,
      districtName: result.district.name,
      areaName: result.area.name,
    });
  };

  const formatLocationLabel = (result: LocationValidationResult) => {
    if (!result.area || !result.district) return "";
    return formatAreaSearchLabel({
      name: result.area.name,
      districtName: result.district.name,
    });
  };

  const handleAreaSelect = (area: ApiAreaSearchResult) => {
    setMapLat(area.lat);
    setMapLng(area.lng);
    setMessage(null);
    setIsDeliverable(null);
    clearDeliverySelection();
  };

  const resolveMapLocation = async (lat: number, lng: number) => {
    setResolvingMap(true);
    try {
      const result = await validateLocationMut.mutateAsync({
        lat,
        lng,
        countryId: DEFAULT_COUNTRY_ID,
      });
      if (result.area && result.district) {
        setQuery(formatLocationLabel(result));
      }
    } catch {
      // Keep coords; user can still click Check
    } finally {
      setResolvingMap(false);
    }
  };

  const handleMapPick = (lat: number, lng: number) => {
    setMapLat(lat);
    setMapLng(lng);
    setMessage(null);
    setIsDeliverable(null);
    clearDeliverySelection();
    void resolveMapLocation(lat, lng);
  };

  const handleUseMyLocation = async () => {
    setLocating(true);
    try {
      const { lat, lng } = await getCurrentCoords();
      handleMapPick(lat, lng);
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "Could not get your location. Please pick a point on the map."
      );
    } finally {
      setLocating(false);
    }
  };

  const applyResult = (
    result: LocationValidationResult,
    coords?: { lat: number | null; lng: number | null }
  ) => {
    const label = formatLocationLabel(result);
    if (label) setQuery(label);
    setIsDeliverable(result.deliverable);
    setMessage(result.message);
    if (result.deliverable) persistDelivery(result, coords);
    else clearDeliverySelection();
  };

  const handleCheck = async () => {
    setChecking(true);
    setMessage(null);
    setIsDeliverable(null);
    setShowMap(false);

    try {
      if (mapLat != null && mapLng != null) {
        const result = await validateLocationMut.mutateAsync({
          lat: mapLat,
          lng: mapLng,
          countryId: DEFAULT_COUNTRY_ID,
        });
        applyResult(result, { lat: mapLat, lng: mapLng });
        return;
      }

      const term = query.trim();
      if (!term) {
        setIsDeliverable(false);
        setMessage("Enter your area or pick a location on the map.");
        return;
      }

      const result = await checkDeliveryMut.mutateAsync({
        countryId: DEFAULT_COUNTRY_ID,
        q: term,
      });
      applyResult(result);
    } catch {
      setIsDeliverable(false);
      setMessage("Could not verify delivery. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <div className="mb-2 text-[13px] font-bold text-gray-700 md:text-[12px]">
        🚚 Check Delivery to Qatar
      </div>

      <div className="flex gap-2">
        <LocationAreaSearchInput
          value={query}
          onChange={(value) => {
            setQuery(value);
            setMessage(null);
            setIsDeliverable(null);
            setMapLat(null);
            setMapLng(null);
            clearDeliverySelection();
          }}
          onSelect={handleAreaSelect}
          showSearchIcon
          wrapperClassName="flex-1"
          className="rounded-lg border border-gray-200 bg-white py-2.5 text-[13px] outline-none focus:border-blue-400 md:py-2 md:text-[12px]"
        />
        <button
          type="button"
          onClick={() => void handleCheck()}
          disabled={checking}
          className="shrink-0 rounded-lg border-0 px-4 py-2.5 text-[13px] font-bold text-white transition hover:opacity-90 disabled:opacity-50 md:py-2 md:text-[12px]"
          style={{ background: Colors.base_color }}
        >
          {checking ? "..." : "Check"}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowMap((v) => !v)}
        className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
      >
        {showMap ? "Hide map" : "Pick location on map"}
      </button>

      {showMap ? (
        <div className="mt-2 rounded-xl border border-gray-200 bg-white p-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-gray-600">
              {locating
                ? "Getting your location..."
                : resolvingMap
                  ? "Finding area..."
                  : "Search or tap the map, then click Check"}
            </p>
            <button
              type="button"
              onClick={() => void handleUseMyLocation()}
              disabled={locating}
              className="rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {locating ? "Locating..." : "Use my location"}
            </button>
          </div>
          <DeliveryMapPicker
            lat={mapLat}
            lng={mapLng}
            countryId={DEFAULT_COUNTRY_ID}
            onPick={handleMapPick}
          />
        </div>
      ) : null}

      {message ? (
        <p
          className={`mt-2 text-[12px] font-medium md:text-[11px] ${
            isDeliverable ? "text-green-600" : "text-red-600"
          }`}
        >
          {isDeliverable ? `✓ ${message}` : message}
        </p>
      ) : null}
    </div>
  );
}
