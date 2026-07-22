"use client";

import { Search } from "lucide-react";

interface ListSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function ListSearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}: ListSearchBarProps) {
  return (
    <div className={`admin-list-search-wrap ${className}`}>
      <Search size={16} aria-hidden />
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="admin-list-search-input"
      />
    </div>
  );
}
