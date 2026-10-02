import { apiDelete, apiGet, apiPatch, apiPost } from "./client";
import type { PaginationMeta } from "@/types/api.types";
import type {
  ApiCustomer,
  CustomerAddress,
  CustomerQueryParams,
  UpdateCustomerPayload,
} from "@/types/customer.types";

export type CustomerAddressPayload = Omit<CustomerAddress, "_id">;

export const customerApi = {
  getProfile: () => apiGet<{ customer: ApiCustomer }>("/customers/profile"),

  updateProfile: (payload: Pick<UpdateCustomerPayload, "name" | "phone">) =>
    apiPatch<{ customer: ApiCustomer }>("/customers/profile", payload),

  getAddresses: () =>
    apiGet<{ addresses: CustomerAddress[]; count: number }>("/customers/addresses"),

  addAddress: (payload: CustomerAddressPayload) =>
    apiPost<{ addresses: CustomerAddress[] }>("/customers/addresses", payload),

  updateAddress: (addressId: string, payload: Partial<CustomerAddressPayload>) =>
    apiPatch<{ addresses: CustomerAddress[] }>(`/customers/addresses/${addressId}`, payload),

  deleteAddress: (addressId: string) =>
    apiDelete<{ addresses: CustomerAddress[] }>(`/customers/addresses/${addressId}`),

  setDefaultAddress: (addressId: string) =>
    apiPatch<{ addresses: CustomerAddress[] }>(
      `/customers/addresses/${addressId}/set-default`,
      undefined
    ),

  getAll: (params?: CustomerQueryParams) =>
    apiGet<{ customers: ApiCustomer[] }>("/customers", params as Record<string, unknown>),

  getById: (id: string) => apiGet<{ customer: ApiCustomer }>(`/customers/${id}`),

  toggleStatus: (id: string) =>
    apiPatch<{ customer: ApiCustomer }>(`/customers/${id}/toggle-status`),

  update: (id: string, payload: UpdateCustomerPayload) =>
    apiPatch<{ customer: ApiCustomer }>(`/customers/${id}`, payload),
};

export type CustomersResult = {
  customers: ApiCustomer[];
  pagination?: PaginationMeta;
};

export async function fetchCustomers(params?: CustomerQueryParams): Promise<CustomersResult> {
  const res = await customerApi.getAll(params);
  return { customers: res.data.customers, pagination: res.pagination };
}
