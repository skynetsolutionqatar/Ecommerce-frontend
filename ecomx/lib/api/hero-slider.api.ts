import { apiDelete, apiGet, apiPatch, apiPost } from "./client";
import type { PaginationMeta } from "@/types/api.types";
import type {
  ApiHeroSlider,
  CreateHeroSliderPayload,
  HeroSliderQuery,
  UpdateHeroSliderPayload,
} from "@/types/hero-slider.types";

export const heroSliderApi = {
  getAll: (params?: HeroSliderQuery) =>
    apiGet<{ heroSliders: ApiHeroSlider[]; count?: number }>("/hero-sliders", {
      ...(params as Record<string, unknown>),
    }),

  getById: (id: string) => apiGet<{ heroSlider: ApiHeroSlider }>(`/hero-sliders/${id}`),

  create: (payload: CreateHeroSliderPayload) =>
    apiPost<{ heroSlider: ApiHeroSlider }>("/hero-sliders", payload),

  update: (id: string, payload: UpdateHeroSliderPayload) =>
    apiPatch<{ heroSlider: ApiHeroSlider }>(`/hero-sliders/${id}`, payload),

  delete: (id: string) => apiDelete<Record<string, never>>(`/hero-sliders/${id}`),
};

export type HeroSlidersResult = {
  heroSliders: ApiHeroSlider[];
  pagination?: PaginationMeta;
};

export async function fetchHeroSliders(params?: HeroSliderQuery): Promise<HeroSlidersResult> {
  const res = await heroSliderApi.getAll(params);
  return { heroSliders: res.data.heroSliders, pagination: res.pagination };
}

export async function fetchHeroSlider(id: string): Promise<ApiHeroSlider> {
  const res = await heroSliderApi.getById(id);
  return res.data.heroSlider;
}
