"use client";

import { useState } from "react";
import { adminType } from "@/lib/admin/typography";
import { adminStatusBadge } from "@/lib/admin/form-classes";

interface ViewFieldProps {
  label: string;
  value?: string | number | null;
  capitalize?: boolean;
  badge?: boolean;
  badgeColor?: "green" | "red" | "yellow" | "blue" | "gray";
  maxLength?: number;
}

function ExpandableText({
  text,
  maxLength,
  className,
}: {
  text: string;
  maxLength: number;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncate = text.length > maxLength;
  const display =
    expanded || !needsTruncate ? text : `${text.slice(0, maxLength).trimEnd()}…`;

  return (
    <span className={className}>
      {display}
      {needsTruncate ? (
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          className="ml-1 border-0 bg-transparent p-0 text-[13px] font-semibold text-blue-600 hover:underline"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      ) : null}
    </span>
  );
}

export default function ViewField({
  label,
  value,
  capitalize = false,
  badge = false,
  badgeColor = "gray",
  maxLength,
}: ViewFieldProps) {
  const textValue = value == null || value === "" ? null : String(value);

  return (
    <div className="flex w-full items-center">
      <span className={`w-40 ${adminType.label}`}>{label}</span>
      <span className="mr-3 text-muted-foreground">:</span>
      {badge ? (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 ${adminType.badge} ${adminStatusBadge[badgeColor]}`}
        >
          {value || "—"}
        </span>
      ) : textValue && maxLength ? (
        <ExpandableText
          text={textValue}
          maxLength={maxLength}
          className={`flex-1 ${adminType.value} ${capitalize ? "capitalize" : ""}`}
        />
      ) : (
        <span className={`flex-1 ${adminType.value} ${capitalize ? "capitalize" : ""}`}>
          {textValue || "—"}
        </span>
      )}
    </div>
  );
}
