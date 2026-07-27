"use client";

import { useCategories } from "@/hooks/useCategories";

/** Parent categories for store header, filters, and navigation. */
export function useStoreCategories() {
  return useCategories({
    isParent: false,
    isActive: true,
    limit: 50,
    sortBy: "displayOrder",
    sortOrder: "asc",
  });
}
