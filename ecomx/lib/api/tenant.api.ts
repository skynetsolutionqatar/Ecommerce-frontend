import { apiDelete, apiGet, apiPatch, apiPost } from "./client";
import type { PaginationMeta } from "@/types/api.types";
import type {
  ApiTenant,
  CreateTenantPayload,
  TenantQueryParams,
  UpdateTenantPayload,
} from "@/types/tenant.types";

export const tenantApi = {
  getBySlug: (slug: string) =>
    apiGet<{ tenant: ApiTenant }>(`/tenants/slug/${encodeURIComponent(slug)}`),

  getById: (id: string) => apiGet<{ tenant: ApiTenant }>(`/tenants/${id}`),

  /** GET /tenants — platform managers (developer, owner, superadmin) */
  getAll: (params?: TenantQueryParams) =>
    apiGet<{ tenants: ApiTenant[]; count?: number }>(
      "/tenants",
      params as Record<string, unknown>
    ),

  create: (payload: CreateTenantPayload) =>
    apiPost<{ tenant: ApiTenant }>("/tenants", payload),

  update: (id: string, payload: UpdateTenantPayload) =>
    apiPatch<{ tenant: ApiTenant }>(`/tenants/${id}`, payload),

  delete: (id: string) => apiDelete<Record<string, never>>(`/tenants/${id}`),
};

export type TenantsResult = {
  tenants: ApiTenant[];
  pagination?: PaginationMeta;
};

export async function fetchTenants(params?: TenantQueryParams): Promise<TenantsResult> {
  const res = await tenantApi.getAll(params);
  return { tenants: res.data.tenants, pagination: res.pagination };
}

export async function fetchTenantBySlug(slug: string): Promise<ApiTenant> {
  const res = await tenantApi.getBySlug(slug);
  return res.data.tenant;
}

export async function fetchTenantById(id: string): Promise<ApiTenant> {
  const res = await tenantApi.getById(id);
  return res.data.tenant;
}
