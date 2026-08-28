"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { searchAreas } from "@/lib/api/location.api";
import { DEFAULT_COUNTRY_ID } from "@/types/location.types";
import type { ApiAreaSearchResult } from "@/types/location.types";

export function formatAreaSearchLabel(area: {
  name: string;
  districtName?: string;
}) {
  return area.districtName ? `${area.name}, ${area.districtName}` : area.name;
}

interface LocationAreaSearchInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (area: ApiAreaSearchResult) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  wrapperClassName?: string;
  countryId?: string;
  disabled?: boolean;
  showSearchIcon?: boolean;
}

export default function LocationAreaSearchInput({
  id,
  value,
  onChange,
  onSelect,
  onBlur,
  placeholder = "Enter area (e.g. Lusail, West Bay)",
  className = "",
  wrapperClassName = "",
  countryId = DEFAULT_COUNTRY_ID,
  disabled = false,
  showSearchIcon = false,
}: LocationAreaSearchInputProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [results, setResults] = useState<ApiAreaSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [openResults, setOpenResults] = useState(false);

  useEffect(() => {
    const term = value.trim();
    if (term.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timer = window.setTimeout(() => {
      void searchAreas({ countryId, q: term })
        .then((areas) => {
          setResults(areas);
          setOpenResults(true);
        })
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 300);

    return () => window.clearTimeout(timer);
  }, [countryId, value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpenResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (area: ApiAreaSearchResult) => {
    onChange(formatAreaSearchLabel(area));
    onSelect?.(area);
    setOpenResults(false);
  };

  const paddingClass = showSearchIcon ? "pl-9 pr-3" : "px-3";

  return (
    <div ref={wrapRef} className={`relative ${wrapperClassName}`}>
      {showSearchIcon ? (
        <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
      ) : null}
      <input
        id={id}
        type="search"
        value={value}
        disabled={disabled}
        onChange={(e) => {
          onChange(e.target.value);
          setOpenResults(true);
        }}
        onFocus={() => results.length > 0 && setOpenResults(true)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete="off"
        className={`w-full ${paddingClass} ${className}`}
      />
      {openResults && value.trim().length >= 2 ? (
        <div className="absolute z-[1000] mt-1 max-h-44 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
          {searching ? (
            <p className="px-3 py-2.5 text-sm text-gray-500">Searching...</p>
          ) 
          // : results.length === 0 ? (
          //   <p className="px-3 py-2.5 text-sm text-gray-500">No areas found in Qatar</p>
          // ) 
          : (
            results.map((area) => (
              <button
                key={area._id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(area)}
                className="flex w-full px-3 py-2.5 text-left text-sm text-gray-800 hover:bg-gray-50"
              >
                {formatAreaSearchLabel(area)}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
