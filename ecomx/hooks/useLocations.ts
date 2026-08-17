"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchAreas,
  fetchCountries,
  fetchDeliverableAreas,
  fetchDistricts,
  validateLocation,
} from "@/lib/api/location.api";
import { DEFAULT_COUNTRY_ID } from "@/types/location.types";

export const LOCATIONS_KEY = "locations";

export function useCountries() {
  return useQuery({
    queryKey: [LOCATIONS_KEY, "countries"],
    queryFn: fetchCountries,
    staleTime: 24 * 60 * 60_000,
  });
}

export function useDistricts(countryId: string = DEFAULT_COUNTRY_ID, deliverableOnly = true) {
  return useQuery({
    queryKey: [LOCATIONS_KEY, "districts", countryId, deliverableOnly],
    queryFn: () => fetchDistricts(countryId, deliverableOnly),
    enabled: !!countryId,
    staleTime: 24 * 60 * 60_000,
  });
}

export function useAreas(districtId: string, deliverableOnly = true) {
  return useQuery({
    queryKey: [LOCATIONS_KEY, "areas", districtId, deliverableOnly],
    queryFn: () => fetchAreas(districtId, deliverableOnly),
    enabled: !!districtId,
    staleTime: 24 * 60 * 60_000,
  });
}

export function useDeliverableAreas(countryId: string = DEFAULT_COUNTRY_ID) {
  return useQuery({
    queryKey: [LOCATIONS_KEY, "deliverable-areas", countryId],
    queryFn: () => fetchDeliverableAreas(countryId),
    enabled: !!countryId,
    staleTime: 24 * 60 * 60_000,
  });
}

export function useValidateLocationMutation() {
  return useMutation({
    mutationFn: ({ lat, lng }: { lat: number; lng: number }) => validateLocation(lat, lng),
  });
}
