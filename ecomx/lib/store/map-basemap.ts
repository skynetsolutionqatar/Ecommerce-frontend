/**
 * Leaflet raster basemap — no API key (CARTO Voyager now requires a token on production referrers).
 * Esri World Street Map: Latin / English labels in Qatar; same picker flow as before.
 */
export const STORE_MAP_TILE = {
  url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
  attribution:
    "Tiles &copy; Esri &mdash; Source: Esri, TomTom, Garmin, FAO, NOAA, USGS, &copy; OpenStreetMap contributors",
  maxZoom: 19,
} as const;
