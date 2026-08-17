export interface ApiCountry {
  _id: string;
  name: string;
  code: string;
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

export const MAP_DEFAULT_CENTER = { lat: 25.2854, lng: 51.531 };
