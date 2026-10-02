"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  customerApi,
  type CustomerAddressPayload,
} from "@/lib/api/customer.api";
import { selectIsAuthenticated, useAuthStore } from "@/store/auth.store";

export const CUSTOMER_ADDRESSES_KEY = ["customer-addresses"] as const;
export const CUSTOMER_PROFILE_KEY = ["customer-profile"] as const;

export function useCustomerAddresses() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isLoggedIn = useAuthStore(selectIsAuthenticated);

  return useQuery({
    queryKey: CUSTOMER_ADDRESSES_KEY,
    queryFn: async () => {
      const res = await customerApi.getAddresses();
      return res.data.addresses;
    },
    enabled: isHydrated && isLoggedIn,
  });
}

export function useCustomerAddressMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: CUSTOMER_ADDRESSES_KEY });
    void queryClient.invalidateQueries({ queryKey: CUSTOMER_PROFILE_KEY });
  };

  const addAddress = useMutation({
    mutationFn: (payload: CustomerAddressPayload) => customerApi.addAddress(payload),
    onSuccess: invalidate,
  });

  const updateAddress = useMutation({
    mutationFn: ({
      addressId,
      payload,
    }: {
      addressId: string;
      payload: Partial<CustomerAddressPayload>;
    }) => customerApi.updateAddress(addressId, payload),
    onSuccess: invalidate,
  });

  const deleteAddress = useMutation({
    mutationFn: (addressId: string) => customerApi.deleteAddress(addressId),
    onSuccess: invalidate,
  });

  const setDefaultAddress = useMutation({
    mutationFn: (addressId: string) => customerApi.setDefaultAddress(addressId),
    onSuccess: invalidate,
  });

  return { addAddress, updateAddress, deleteAddress, setDefaultAddress };
}
