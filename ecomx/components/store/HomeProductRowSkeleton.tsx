"use client";

export default function HomeProductRowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex gap-2 overflow-hidden px-4 pb-4 sm:gap-3 sm:px-5 md:px-6 sm:pb-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-[220px] shrink-0 animate-pulse rounded-[14px] bg-gray-100"
          style={{ width: "clamp(145px, 21vw, 188px)" }}
        />
      ))}
    </div>
  );
}
