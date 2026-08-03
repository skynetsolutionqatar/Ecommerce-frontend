"use client";

import { Toaster } from "react-hot-toast";

export default function AppToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: "#fff",
          color: "#111827",
          border: "1px solid #e5e7eb",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          fontSize: "14px",
          maxWidth: "420px",
        },
        success: {
          iconTheme: { primary: "#059669", secondary: "#fff" },
        },
        error: {
          iconTheme: { primary: "#dc2626", secondary: "#fff" },
        },
      }}
    />
  );
}
