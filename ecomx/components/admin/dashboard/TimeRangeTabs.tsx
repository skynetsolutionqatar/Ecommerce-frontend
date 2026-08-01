"use client";

import { memo } from "react";
import type { TimeRange } from "@/lib/admin/data";
import { adminType } from "@/lib/admin/typography";

interface TimeRangeTabsProps {
  ranges: { key: TimeRange; label: string }[];
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

function TimeRangeTabs({ ranges, value, onChange }: TimeRangeTabsProps) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1 shadow-sm">
      {ranges.map((range) => (
        <button
          key={range.key}
          type="button"
          onClick={() => onChange(range.key)}
          className={`rounded-md px-3 py-1.5 sm:px-4 ${adminType.tabButton} transition ${
            value === range.key
              ? "bg-emerald-800 text-white shadow-sm dark:bg-emerald-700"
              : "bg-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}

export default memo(TimeRangeTabs);
