"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "@/lib/api/cart.api";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import type { AddToCartPayload, UpdateCartItemPayload } from "@/types/cart.types";

export const CART_QUERY_KEY = ["cart"] as const;

export function useCart() {
  const queryClient = useQueryClient();
  const isAuthenticated = !!useAuthStore((s) => s.accessToken);
  const { setCart, setLoading } = useCartStore();

  const query = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => {
      const res = await cartApi.get();
      return res.data.cart;
    },
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const syncCart = (cart: Awaited<ReturnType<typeof cartApi.get>>["data"]["cart"]) => {
    setCart(cart);
    queryClient.setQueryData(CART_QUERY_KEY, cart);
  };

  const addMutation = useMutation({
    mutationFn: (payload: AddToCartPayload) => cartApi.add(payload),
    onSuccess: (res) => syncCart(res.data.cart),
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: UpdateCartItemPayload }) =>
      cartApi.updateItem(itemId, payload),
    onSuccess: (res) => syncCart(res.data.cart),
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: (res) => syncCart(res.data.cart),
  });

  const clearMutation = useMutation({
    mutationFn: () => cartApi.clear(),
    onSuccess: (res) => syncCart(res.data.cart),
  });

  return {
    cart: query.data ?? useCartStore.getState().cart,
    isLoading: query.isLoading || addMutation.isPending,
    error: query.error,
    refetch: query.refetch,
    addToCart: addMutation.mutateAsync,
    updateItem: (itemId: string, payload: UpdateCartItemPayload) =>
      updateMutation.mutateAsync({ itemId, payload }),
    removeItem: removeMutation.mutateAsync,
    clearCart: clearMutation.mutateAsync,
    itemCount:
      query.data?.items?.reduce((sum, i) => sum + i.quantity, 0) ??
      useCartStore.getState().itemCount(),
  };
}
