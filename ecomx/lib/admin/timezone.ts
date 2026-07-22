/** Clock timezone helpers — auto-detect user location or optional fixed override. */

const TIMEZONE_COUNTRY_LABELS: Record<string, string> = {
  "Asia/Qatar": "Qatar",
  "Asia/Dubai": "UAE",
  "Asia/Muscat": "Oman",
  "Asia/Kolkata": "India",
  "Asia/Calcutta": "India",
  "Asia/Karachi": "Pakistan",
  "Asia/Dhaka": "Bangladesh",
  "Asia/Colombo": "Sri Lanka",
  "Asia/Riyadh": "Saudi Arabia",
  "Asia/Kuwait": "Kuwait",
  "Asia/Bahrain": "Bahrain",
  "Asia/Tehran": "Iran",
  "Asia/Baghdad": "Iraq",
  "Asia/Amman": "Jordan",
  "Asia/Beirut": "Lebanon",
  "Asia/Jerusalem": "Israel",
  "Asia/Singapore": "Singapore",
  "Asia/Kuala_Lumpur": "Malaysia",
  "Asia/Bangkok": "Thailand",
  "Asia/Jakarta": "Indonesia",
  "Asia/Manila": "Philippines",
  "Asia/Hong_Kong": "Hong Kong",
  "Asia/Shanghai": "China",
  "Asia/Tokyo": "Japan",
  "Asia/Seoul": "South Korea",
  "Europe/London": "UK",
  "Europe/Paris": "France",
  "Europe/Berlin": "Germany",
  "America/New_York": "USA (East)",
  "America/Chicago": "USA (Central)",
  "America/Denver": "USA (Mountain)",
  "America/Los_Angeles": "USA (West)",
  "Australia/Sydney": "Australia",
};

/** Fixed timezone from env — when set, overrides auto-detect. */
export function getFixedClockTimezone(): string | null {
  return process.env.NEXT_PUBLIC_CLOCK_TIMEZONE?.trim() || null;
}

export function getFixedClockLabel(): string | null {
  return process.env.NEXT_PUBLIC_CLOCK_TIMEZONE_LABEL?.trim() || null;
}

/** Browser/device timezone (where the user logged in from). */
export function getBrowserTimezone(): string {
  if (typeof window === "undefined") return "UTC";
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function resolveTimezoneLabel(timeZone: string): string {
  const fixed = getFixedClockLabel();
  if (fixed && timeZone === getFixedClockTimezone()) return fixed;

  if (TIMEZONE_COUNTRY_LABELS[timeZone]) {
    return TIMEZONE_COUNTRY_LABELS[timeZone];
  }

  const city = timeZone.split("/").pop()?.replace(/_/g, " ");
  return city ?? timeZone;
}

export function resolveClockTimezone(): string {
  return getFixedClockTimezone() ?? getBrowserTimezone();
}

export function formatClockTime(date: Date, timeZone: string) {
  return date.toLocaleTimeString("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export function formatClockDate(date: Date, timeZone: string) {
  return date.toLocaleDateString("en-GB", {
    timeZone,
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Short offset label, e.g. GMT+5:30 */
export function formatClockOffset(date: Date, timeZone: string) {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      timeZoneName: "shortOffset",
    }).formatToParts(date);
    return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  } catch {
    return "";
  }
}
