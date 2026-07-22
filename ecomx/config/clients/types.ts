/** Brand theme tokens — applied as CSS variables on :root */
export interface ClientTheme {
  bg: string;
  bgSoft: string;
  primary: string;
  primaryMid: string;
  primaryLight: string;
  accent: string;
  accentHover: string;
  accentSoft: string;
  accentLight: string;
  muted: string;
  border: string;
}

export interface ClientConfig {
  id: string;
  name: string;
  tagline: string;
  siteUrl: string;
  phone: string;
  /** IANA timezone for admin navbar clock, e.g. Asia/Qatar */
  timezone: string;
  /** Short label shown next to the clock, e.g. Qatar */
  timezoneLabel: string;
  theme: ClientTheme;
}

/** Optional per-page theme overrides (merge on top of client theme) */
export interface PageThemeOverride {
  pageId: string;
  theme: Partial<ClientTheme>;
}
