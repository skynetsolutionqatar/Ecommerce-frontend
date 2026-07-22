"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/store/auth.store";

/** Ensures persisted auth rehydrates once for the whole app (store + admin). */
export default function AuthInitializer({ children }: { children: ReactNode }) {
  useEffect(() => {
    void useAuthStore.persist.rehydrate();
  }, []);

  return children;
}
