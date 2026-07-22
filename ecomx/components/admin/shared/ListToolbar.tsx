"use client";

import ListFilterSelect, { type ListFilterOption } from "./ListFilterSelect";
import ListSearchBar from "./ListSearchBar";

export type { ListFilterOption };

interface ListToolbarProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: Array<{
    key: string;
    value: string;
    placeholder?: string;
    options: ListFilterOption[];
    onChange: (value: string) => void;
    className?: string;
  }>;
  children?: React.ReactNode;
}

export default function ListToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  filters = [],
  children,
}: ListToolbarProps) {
  const showSearch = onSearchChange !== undefined;

  if (!showSearch && filters.length === 0 && !children) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg bg-white p-4 shadow-sm">
      {showSearch && (
        <ListSearchBar
          value={search ?? ""}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />
      )}

      {filters.map((filter) => (
        <ListFilterSelect
          key={filter.key}
          value={filter.value}
          placeholder={filter.placeholder}
          options={filter.options}
          onChange={filter.onChange}
          className={filter.className}
        />
      ))}

      {children}
    </div>
  );
}
