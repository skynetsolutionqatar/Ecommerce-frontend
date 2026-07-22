import dynamic from "next/dynamic";
import type { ComponentType } from "react";

type LazyOptions = {
  ssr?: boolean;
};

/** Next.js dynamic import with invisible loading state (no layout shift). */
export function lazyClient<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>,
  options: LazyOptions = {}
) {
  return dynamic(loader, {
    ssr: options.ssr ?? true,
    loading: () => null,
  });
}

/** Prefetch route/modal chunks during browser idle time. */
export function prefetchModules(...loaders: Array<() => Promise<unknown>>) {
  if (typeof window === "undefined") return;

  const run = () => {
    loaders.forEach((loader) => {
      void loader();
    });
  };

  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(run, { timeout: 2000 });
  } else {
    setTimeout(run, 200);
  }
}
