/**
 * Browser geolocation with an explicit timeout.
 *
 * getCurrentPosition defaults to an infinite timeout, so without these options
 * the "Use my location" button can hang silently on devices with a weak GPS fix.
 */

export interface GeoCoords {
  lat: number;
  lng: number;
}

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 12_000,
  maximumAge: 60_000,
};

export const GEO_ERRORS = {
  unsupported: "Location is not supported on this device. Please pick a point on the map.",
  insecure: "Location needs a secure (https) connection. Please pick a point on the map.",
  denied:
    "Location permission was blocked. Allow location in your browser settings, or pick a point on the map.",
  unavailable: "Your location could not be determined. Please pick a point on the map.",
  timeout: "Getting your location took too long. Please try again or pick a point on the map.",
};

function resolveErrorMessage(error: GeolocationPositionError) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return GEO_ERRORS.denied;
    case error.POSITION_UNAVAILABLE:
      return GEO_ERRORS.unavailable;
    case error.TIMEOUT:
      return GEO_ERRORS.timeout;
    default:
      return GEO_ERRORS.unavailable;
  }
}

/**
 * Resolves with coordinates, or rejects with an Error carrying a
 * user-facing message.
 */
export function getCurrentCoords(): Promise<GeoCoords> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error(GEO_ERRORS.unsupported));
      return;
    }

    if (!window.isSecureContext) {
      reject(new Error(GEO_ERRORS.insecure));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (error) => reject(new Error(resolveErrorMessage(error))),
      GEO_OPTIONS
    );
  });
}
