"use client";

import { ChevronDown } from "lucide-react";

export interface ListFilterOption {
  label: string;
  value: string;
}

interface ListFilterSelectProps {
  value: string;
  options: ListFilterOption[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function ListFilterSelect({
  value,
  options,
  placeholder = "All",
  onChange,
  className = "",
}: ListFilterSelectProps) {
  return (
    <div className={`admin-filter-wrap ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="admin-filter-select"
        aria-label={placeholder}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown size={16} aria-hidden />
    </div>
  );
}
