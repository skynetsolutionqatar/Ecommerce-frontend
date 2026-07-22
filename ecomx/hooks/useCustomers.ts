"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCustomers, customerApi } from "@/lib/api/customer.api";
import type { CustomerQueryParams } from "@/types/customer.types";

export const CUSTOMERS_KEY = "customers";
export const CUSTOMER_KEY = "customer";

export function useCustomers(params?: CustomerQueryParams) {
  return useQuery({
    queryKey: [CUSTOMERS_KEY, params],
    queryFn: () => fetchCustomers(params),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: [CUSTOMER_KEY, id],
    queryFn: async () => {
      const res = await customerApi.getById(id);
      return res.data.customer;
    },
    enabled: !!id,
  });
}

export function useCustomerMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] });
    void queryClient.invalidateQueries({ queryKey: [CUSTOMER_KEY] });
  };

  const toggleStatus = useMutation({
    mutationFn: (id: string) => customerApi.toggleStatus(id),
    onSuccess: invalidate,
  });

  return { toggleStatus };
}
