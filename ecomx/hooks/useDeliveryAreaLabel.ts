"use client";

import { useCallback, useSyncExternalStore } from "react";
import { DEFAULT_DELIVERY_AREA_LABEL } from "@/lib/store/delivery-area-label";
import {
  getDeliveryAreaLabelClientSnapshot,
  getDeliveryAreaLabelServerSnapshot,
  notifyDeliveryAreaLabelChanged,
  subscribeDeliveryAreaLabel,
} from "@/lib/store/delivery-area-store";

/**
 * Delivery area from checkout cache. SSR / hydration use `fallback`; storage is read after hydrate.
 */
export function useDeliveryAreaLabel(fallback = DEFAULT_DELIVERY_AREA_LABEL) {
  const getClientSnapshot = useCallback(
    () => getDeliveryAreaLabelClientSnapshot(fallback),
    [fallback]
  );
  const getServerSnapshot = useCallback(
    () => getDeliveryAreaLabelServerSnapshot(fallback),
    [fallback]
  );

  const areaLabel = useSyncExternalStore(
    subscribeDeliveryAreaLabel,
    getClientSnapshot,
    getServerSnapshot
  );

  const refreshAreaLabel = useCallback(() => {
    notifyDeliveryAreaLabelChanged();
  }, []);

  return { areaLabel, refreshAreaLabel };
}