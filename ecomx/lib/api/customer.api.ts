import { apiGet, apiPatch } from "./client";
import type { PaginationMeta } from "@/types/api.types";
import type { ApiCustomer, CustomerQueryParams } from "@/types/customer.types";

export const customerApi = {
  getProfile: () => apiGet<{ customer: ApiCustomer }>("/customers/profile"),

  getAll: (params?: CustomerQueryParams) =>
    apiGet<{ customers: ApiCustomer[] }>("/customers", params as Record<string, unknown>),

  getById: (id: string) => apiGet<{ customer: ApiCustomer }>(`/customers/${id}`),

  toggleStatus: (id: string) =>
    apiPatch<{ customer: ApiCustomer }>(`/customers/${id}/toggle-status`),
};

export type CustomersResult = {
  customers: ApiCustomer[];
  pagination?: PaginationMeta;
};

export async function fetchCustomers(params?: CustomerQueryParams): Promise<CustomersResult> {
  const res = await customerApi.getAll(params);
  return { customers: res.data.customers, pagination: res.pagination };
}
