import { apiGet } from "./client";
import type {
  ApiArea,
  ApiAreaSearchResult,
  ApiCountry,
  ApiDeliverableArea,
  ApiDistrict,
  LocationValidationResult,
} from "@/types/location.types";

export const locationApi = {
  getCountries: () => apiGet<{ countries: ApiCountry[] }>("/locations/countries"),

  getDistricts: (countryId: string, deliverableOnly = true) =>
    apiGet<{ districts: ApiDistrict[] }>("/locations/districts", {
      countryId,
      deliverableOnly: deliverableOnly ? "true" : "false",
    }),

  getAreas: (districtId: string, deliverableOnly = true) =>
    apiGet<{ areas: ApiArea[] }>("/locations/areas", {
      districtId,
      deliverableOnly: deliverableOnly ? "true" : "false",
    }),

  getDeliverableAreas: (countryId: string) =>
    apiGet<{ areas: ApiDeliverableArea[] }>("/locations/deliverable-areas", { countryId }),

  searchAreas: (districtId: string, q: string) =>
    apiGet<{ areas: ApiAreaSearchResult[] }>("/locations/search", { districtId, q }),

  validate: (lat: number, lng: number) =>
    apiGet<LocationValidationResult>("/locations/validate", { lat, lng }),
};

export async function fetchCountries(): Promise<ApiCountry[]> {
  const res = await locationApi.getCountries();
  return res.data.countries;
}

export async function fetchDistricts(
  countryId: string,
  deliverableOnly = true
): Promise<ApiDistrict[]> {
  const res = await locationApi.getDistricts(countryId, deliverableOnly);
  return res.data.districts;
}

export async function fetchAreas(
  districtId: string,
  deliverableOnly = true
): Promise<ApiArea[]> {
  const res = await locationApi.getAreas(districtId, deliverableOnly);
  return res.data.areas;
}

export async function fetchDeliverableAreas(countryId: string): Promise<ApiDeliverableArea[]> {
  const res = await locationApi.getDeliverableAreas(countryId);
  return res.data.areas;
}

export async function searchAreas(
  districtId: string,
  q: string
): Promise<ApiAreaSearchResult[]> {
  const res = await locationApi.searchAreas(districtId, q);
  return res.data.areas;
}

export async function validateLocation(
  lat: number,
  lng: number
): Promise<LocationValidationResult> {
  const res = await locationApi.validate(lat, lng);
  return res.data;
}
