"use client";

import { adminType } from "@/lib/admin/typography";
import { adminStatusBadge } from "@/lib/admin/form-classes";

interface ViewFieldProps {
  label: string;
  value?: string | number | null;
  capitalize?: boolean;
  badge?: boolean;
  badgeColor?: "green" | "red" | "yellow" | "blue" | "gray";
}

export default function ViewField({
  label,
  value,
  capitalize = false,
  badge = false,
  badgeColor = "gray",
}: ViewFieldProps) {
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
      ) : (
        <span className={`flex-1 ${adminType.value} ${capitalize ? "capitalize" : ""}`}>
          {value || "—"}
        </span>
      )}
    </div>
  );
}
