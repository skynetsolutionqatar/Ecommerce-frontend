"use client";

import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { shouldSuppressStoreAuthFeedback } from "@/lib/api/errors";
import { showError } from "@/lib/toast";

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (!query.meta?.toastOnError) return;
            if (shouldSuppressStoreAuthFeedback(error)) return;
            showError(error, "Failed to load data");
          },
        }),
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            onError: (error, _variables, _context, mutation) => {
              if (mutation.meta?.silentError) return;
              if (shouldSuppressStoreAuthFeedback(error)) return;
              showError(error);
            },
          },
        },
      })
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
