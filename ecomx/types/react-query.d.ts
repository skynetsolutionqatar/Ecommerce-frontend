import "@tanstack/react-query";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      /** Skip global mutation error toast (handled locally). */
      silentError?: boolean;
    };
    queryMeta: {
      /** Show toast when query fails. */
      toastOnError?: boolean;
    };
  }
}
