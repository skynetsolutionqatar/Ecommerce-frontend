import type { ApiHeroSlider } from "@/types/hero-slider.types";

export type HeroSliderLifecycle = "live" | "ready" | "archived";

export function getHeroSliderLifecycle(slide: Pick<ApiHeroSlider, "isArchived" | "isPublished">): HeroSliderLifecycle {
  if (slide.isArchived) return "archived";
  if (slide.isPublished) return "live";
  return "ready";
}

export function heroSliderLifecycleLabel(slide: Pick<ApiHeroSlider, "isArchived" | "isPublished">): string {
  const state = getHeroSliderLifecycle(slide);
  if (state === "live") return "Live";
  if (state === "archived") return "Archived";
  return "Ready (unpublished)";
}

export const HERO_SLIDER_ARCHIVE_FILTER_OPTIONS = [
  { label: "Active workspace", value: "active" },
  { label: "Archived", value: "archived" },
  { label: "All slides", value: "all" },
] as const;
