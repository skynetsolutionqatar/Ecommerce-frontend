"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deliverySettingsApi,
  fetchAdminDeliverySettings,
  fetchPublicDeliverySettings,
} from "@/lib/api/delivery-settings.api";
import type { UpdateDeliverySettingsPayload } from "@/types/delivery-settings.types";

export const DELIVERY_SETTINGS_KEY = "delivery-settings";

export function usePublicDeliverySettings() {
  return useQuery({
    queryKey: [DELIVERY_SETTINGS_KEY, "public"],
    queryFn: fetchPublicDeliverySettings,
    staleTime: 5 * 60_000,
  });
}

export function useAdminDeliverySettings() {
  return useQuery({
    queryKey: [DELIVERY_SETTINGS_KEY, "admin"],
    queryFn: fetchAdminDeliverySettings,
    staleTime: 60_000,
  });
}

export function useDeliverySettingsMutations() {
  const queryClient = useQueryClient();

  const update = useMutation({
    mutationFn: (payload: UpdateDeliverySettingsPayload) =>
      deliverySettingsApi.update(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [DELIVERY_SETTINGS_KEY] });
    },
  });

  return { update };
}
