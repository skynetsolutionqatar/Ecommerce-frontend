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
    <div className={`min-w-0 flex-1 ${className ?? ""}`}>
      <p className="whitespace-pre-wrap break-words">{display}</p>
      {needsTruncate ? (
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          className="mt-1 border-0 bg-transparent p-0 text-[13px] font-semibold text-blue-600 hover:underline dark:text-blue-400"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      ) : null}
    </div>
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

  const isExpandable = Boolean(maxLength && textValue);

  return (
    <div className={`flex w-full min-w-0 ${isExpandable ? "items-start" : "items-center"}`}>
      <span className={`w-40 shrink-0 ${adminType.label} ${isExpandable ? "pt-0.5" : ""}`}>
        {label}
      </span>
      <span className="mr-3 shrink-0 text-muted-foreground">:</span>
      {badge ? (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 ${adminType.badge} ${adminStatusBadge[badgeColor]}`}
        >
          {value || "—"}
        </span>
      ) : isExpandable ? (
        <ExpandableText
          text={textValue!}
          maxLength={maxLength!}
          className={`${adminType.value} ${capitalize ? "capitalize" : ""}`}
        />
      ) : (
        <span
          className={`min-w-0 flex-1 whitespace-pre-wrap break-words ${adminType.value} ${capitalize ? "capitalize" : ""}`}
        >
          {textValue || "—"}
        </span>
      )}
    </div>
  );
}
