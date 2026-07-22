"use client";

import BackPanel from "@/components/admin/utils/BackPanel";

interface ListPageShellProps {
  isLoading?: boolean;
  isError?: boolean;
  loadingMessage?: string;
  errorMessage?: string;
  children: React.ReactNode;
}

export default function ListPageShell({
  isLoading = false,
  isError = false,
  loadingMessage = "Loading...",
  errorMessage = "Failed to load data",
  children,
}: ListPageShellProps) {
  if (isLoading) {
    return (
      <BackPanel showBack={false}>
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-gray-400">{loadingMessage}</p>
        </div>
      </BackPanel>
    );
  }

  if (isError) {
    return (
      <BackPanel showBack={false}>
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-red-400">{errorMessage}</p>
        </div>
      </BackPanel>
    );
  }

  return (
    <BackPanel showBack={false}>
      <div className="space-y-6 p-6">{children}</div>
    </BackPanel>
  );
}
