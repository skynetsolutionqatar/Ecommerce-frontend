"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface LazyMountProps {
  children: ReactNode;
  /** Start loading before the element enters the viewport */
  rootMargin?: string;
  /** Estimated min height to reserve space and prevent layout shifts (CLS) */
  minHeight?: number | string;
  className?: string;
}

/** Mount children only when near the viewport — defers below-fold work without CLS. */
export default function LazyMount({
  children,
  rootMargin = "240px",
  minHeight,
  className = "",
}: LazyMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  const minHStyle = minHeight
    ? typeof minHeight === "number"
      ? `${minHeight}px`
      : minHeight
    : undefined;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        minHeight: !visible ? minHStyle : undefined,
        contentVisibility: "auto",
        containIntrinsicSize: minHStyle ? `1px ${minHStyle}` : undefined,
      }}
    >
      {visible ? children : null}
    </div>
  );
}
