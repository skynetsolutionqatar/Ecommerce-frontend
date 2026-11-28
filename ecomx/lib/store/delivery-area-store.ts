import {
  DEFAULT_DELIVERY_AREA_LABEL,
  readDeliveryAreaLabel,
} from "@/lib/store/delivery-area-label";

const listeners = new Set<() => void>();
let clientHydrated = false;

export function subscribeDeliveryAreaLabel(listener: () => void): () => void {
  listeners.add(listener);

  if (typeof window !== "undefined") {
    const hydrate = () => {
      if (clientHydrated) return;
      clientHydrated = true;
      listeners.forEach((notify) => notify());
    };
    queueMicrotask(hydrate);

    const onStorage = (event: StorageEvent) => {
      if (event.key?.includes("checkout") || event.key == null) {
        listeners.forEach((notify) => notify());
      }
    };
    const onFocus = () => listeners.forEach((notify) => notify());

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }

  return () => listeners.delete(listener);
}

export function notifyDeliveryAreaLabelChanged(): void {
  clientHydrated = true;
  listeners.forEach((notify) => notify());
}

export function getDeliveryAreaLabelServerSnapshot(
  fallback = DEFAULT_DELIVERY_AREA_LABEL
): string {
  return fallback;
}

export function getDeliveryAreaLabelClientSnapshot(
  fallback = DEFAULT_DELIVERY_AREA_LABEL
): string {
  if (typeof window === "undefined" || !clientHydrated) return fallback;
  return readDeliveryAreaLabel(fallback);
}