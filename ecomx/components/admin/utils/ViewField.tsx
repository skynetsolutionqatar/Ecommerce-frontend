"use client";

import { adminType } from "@/lib/admin/typography";

interface ViewFieldProps {
  label: string;
  value?: string | number | null;
  capitalize?: boolean;
  badge?: boolean;
  badgeColor?: "green" | "red" | "yellow" | "blue" | "gray";
}

const badgeClasses = {
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-600",
  yellow: "bg-yellow-100 text-yellow-700",
  blue: "bg-blue-100 text-blue-700",
  gray: "bg-gray-100 text-gray-600",
};

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
      <span className="mr-3 text-gray-400">:</span>
      {badge ? (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 ${adminType.badge} ${badgeClasses[badgeColor]}`}
        >
          {value || "—"}
        </span>
      ) : (
        <span
          className={`flex-1 ${adminType.value} ${capitalize ? "capitalize" : ""}`}
        >
          {value || "—"}
        </span>
      )}
    </div>
  );
}
