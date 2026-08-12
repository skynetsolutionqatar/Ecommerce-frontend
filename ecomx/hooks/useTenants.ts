"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTenantBySlug, fetchTenants, tenantApi } from "@/lib/api/tenant.api";
import type {
  CreateTenantPayload,
  TenantQueryParams,
  UpdateTenantPayload,
} from "@/types/tenant.types";

export const TENANTS_KEY = "tenants";
export const TENANT_KEY = "tenant";

export function useTenants(params?: TenantQueryParams, enabled = true) {
  return useQuery({
    queryKey: [TENANTS_KEY, params],
    queryFn: () => fetchTenants(params),
    staleTime: 60_000,
    retry: false,
    enabled,
    placeholderData: (prev) => prev,
  });
}

export function useTenantBySlug(slug: string, enabled = true) {
  return useQuery({
    queryKey: [TENANT_KEY, "slug", slug],
    queryFn: () => fetchTenantBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: 300_000,
    retry: false,
  });
}

export function useTenantMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [TENANTS_KEY] });
    void queryClient.invalidateQueries({ queryKey: [TENANT_KEY] });
  };

  const create = useMutation({
    mutationFn: (payload: CreateTenantPayload) => tenantApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTenantPayload }) =>
      tenantApi.update(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => tenantApi.delete(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
