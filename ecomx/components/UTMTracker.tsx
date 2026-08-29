"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { captureAndStoreUTMs } from "@/lib/utm";

function UTMTrackerInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams) {
      captureAndStoreUTMs(searchParams);
    }
  }, [searchParams]);

  return null;
}

export default function UTMTracker() {
  return (
    <Suspense fallback={null}>
      <UTMTrackerInner />
    </Suspense>
  );
}
