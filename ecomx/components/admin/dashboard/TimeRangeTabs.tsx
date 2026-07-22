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
    <div className="inline-flex rounded-lg bg-gray-100 p-1">
      {ranges.map((range) => (
        <button
          key={range.key}
          type="button"
          onClick={() => onChange(range.key)}
          className={`rounded-md px-4 py-1.5 ${adminType.tabButton} transition ${
            value === range.key
              ? "bg-emerald-900 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}

export default memo(TimeRangeTabs);
