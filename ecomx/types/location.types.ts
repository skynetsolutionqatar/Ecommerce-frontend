export interface ApiCountry {
  _id: string;
  name: string;
  code: string;
  deliveryEnabled?: boolean;
}

export interface ApiDistrict {
  _id: string;
  name: string;
  countryId: string;
}

export interface ApiArea {
  _id: string;
  name: string;
  districtId: string;
}

export interface ApiDeliverableArea extends ApiArea {
  districtName: string;
}

export interface ApiAreaSearchResult {
  _id: string;
  name: string;
  districtId: string;
  lat: number;
  lng: number;
  districtName?: string;
}

export interface LocationValidationResult {
  deliverable: boolean;
  message: string;
  area?: ApiArea;
  district?: ApiDistrict;
  lat?: number;
  lng?: number;
}

export const DEFAULT_COUNTRY_ID = "qa";
export const MAP_PICK_AREA_ID = "__map__";

export const QATAR_ONLY_LOCATION_ERROR =
  "Please choose a location inside Qatar only.";

export const MAP_DEFAULT_CENTER = { lat: 25.2854, lng: 51.531 };

export const DISTRICT_MAP_CENTERS: Record<string, { lat: number; lng: number; zoom: number }> = {
  doha: { lat: 25.285, lng: 51.531, zoom: 12 },
  "al-rayyan": { lat: 25.278, lng: 51.462, zoom: 12 },
  "al-wakrah": { lat: 25.168, lng: 51.574, zoom: 12 },
  "al-daayen": { lat: 25.408, lng: 51.498, zoom: 12 },
};
