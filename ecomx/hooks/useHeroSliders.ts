"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchHeroSlider,
  fetchHeroSliders,
  heroSliderApi,
} from "@/lib/api/hero-slider.api";
import { STOREFRONT_KEY } from "@/hooks/useStorefront";
import type {
  CreateHeroSliderPayload,
  HeroSliderQuery,
  UpdateHeroSliderPayload,
} from "@/types/hero-slider.types";

export const HERO_SLIDERS_KEY = "hero-sliders";

export function useHeroSliders(params?: HeroSliderQuery) {
  return useQuery({
    queryKey: [HERO_SLIDERS_KEY, params],
    queryFn: () => fetchHeroSliders(params),
    staleTime: 60_000,
  });
}

export function useHeroSlider(id: string, enabled = true) {
  return useQuery({
    queryKey: [HERO_SLIDERS_KEY, id],
    queryFn: () => fetchHeroSlider(id),
    enabled: Boolean(id) && enabled,
    staleTime: 30_000,
  });
}

export function useHeroSliderMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [HERO_SLIDERS_KEY] });
    void queryClient.invalidateQueries({ queryKey: [STOREFRONT_KEY] });
  };

  const create = useMutation({
    mutationFn: (payload: CreateHeroSliderPayload) => heroSliderApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateHeroSliderPayload }) =>
      heroSliderApi.update(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => heroSliderApi.delete(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
