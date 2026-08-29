export interface UTMAttribution {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term?: string;
  utm_content?: string;
  timestamp?: string;
}

export const UTM_STORAGE_KEY = "skynet_attribution";

export const DEFAULT_ATTRIBUTION: UTMAttribution = {
  utm_source: "direct",
  utm_medium: "none",
  utm_campaign: "none",
};

/**
 * Extracts UTM parameters from URL search parameters and stores them in localStorage.
 * Only saves if utm_source is present in the current URL.
 */
export function captureAndStoreUTMs(searchParams: URLSearchParams | ReadonlyURLSearchParams): void {
  if (typeof window === "undefined") return;

  const utmSource = searchParams.get("utm_source");
  if (!utmSource) return;

  const utmMedium = searchParams.get("utm_medium") || "";
  const utmCampaign = searchParams.get("utm_campaign") || "";
  const utmTerm = searchParams.get("utm_term") || "";
  const utmContent = searchParams.get("utm_content") || "";

  const utmData: UTMAttribution = {
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    utm_term: utmTerm,
    utm_content: utmContent,
    timestamp: new Date().toISOString(),
  };

  try {
    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmData));
  } catch {
    // Ignore storage quota or access errors
  }
}

type ReadonlyURLSearchParams = {
  get(name: string): string | null;
};

/**
 * Retrieves the stored UTM attribution from localStorage.
 * Returns default fallback attribution if no valid data is found.
 */
export function getStoredAttribution(): UTMAttribution {
  if (typeof window === "undefined") {
    return DEFAULT_ATTRIBUTION;
  }

  try {
    const raw = localStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return DEFAULT_ATTRIBUTION;

    const parsed = JSON.parse(raw) as Partial<UTMAttribution>;
    if (parsed && typeof parsed.utm_source === "string" && parsed.utm_source.trim() !== "") {
      return {
        utm_source: parsed.utm_source,
        utm_medium: parsed.utm_medium || "",
        utm_campaign: parsed.utm_campaign || "",
        utm_term: parsed.utm_term || "",
        utm_content: parsed.utm_content || "",
        timestamp: parsed.timestamp,
      };
    }
  } catch {
    // Fallback on JSON parse error or security restriction
  }

  return DEFAULT_ATTRIBUTION;
}
