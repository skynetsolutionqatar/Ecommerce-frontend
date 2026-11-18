"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
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
  /** Extra cleanup when the clear (X) control is used */
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  wrapperClassName?: string;
  countryId?: string;
  disabled?: boolean;
  showSearchIcon?: boolean;
  /** Show an X to clear the field when it has a value */
  clearable?: boolean;
}

export default function LocationAreaSearchInput({
  id,
  value,
  onChange,
  onSelect,
  onBlur,
  onClear,
  placeholder = "Enter area (e.g. Lusail, West Bay)",
  className = "",
  wrapperClassName = "",
  countryId = DEFAULT_COUNTRY_ID,
  disabled = false,
  showSearchIcon = false,
  clearable = false,
}: LocationAreaSearchInputProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const skipSearchAfterSelectRef = useRef(false);
  const selectingRef = useRef(false);
  const [results, setResults] = useState<ApiAreaSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [openResults, setOpenResults] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (skipSearchAfterSelectRef.current) {
      skipSearchAfterSelectRef.current = false;
      return;
    }

    const term = value.trim();
    if (term.length < 1) {
      setResults([]);
      setSearching(false);
      setActiveIndex(-1);
      return;
    }

    setSearching(true);
    const timer = window.setTimeout(() => {
      void searchAreas({ countryId, q: term })
        .then((areas) => {
          setResults(areas);
          setActiveIndex(areas.length > 0 ? 0 : -1);
          if (areas.length > 0) setOpenResults(true);
        })
        .catch(() => {
          setResults([]);
          setActiveIndex(-1);
        })
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
    selectingRef.current = true;
    skipSearchAfterSelectRef.current = true;
    setResults([]);
    setSearching(false);
    setOpenResults(false);
    setActiveIndex(-1);
    onChange(formatAreaSearchLabel(area));
    onSelect?.(area);
    window.setTimeout(() => {
      selectingRef.current = false;
    }, 0);
  };

  const handleBlur = () => {
    // Skip blur validation while a suggestion click is in progress
    if (selectingRef.current) return;
    onBlur?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!openResults || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
      return;
    }
    if (e.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
      return;
    }
    if (e.key === "Escape") {
      setOpenResults(false);
      setActiveIndex(-1);
    }
  };

  const canClear = clearable && !disabled && value.trim().length > 0;
  const paddingClass = [
    showSearchIcon ? "pl-9" : "pl-3",
    canClear ? "pr-9" : "pr-3",
  ].join(" ");
  const showEmpty =
    openResults && value.trim().length >= 1 && !searching && results.length === 0;

  const handleClear = () => {
    selectingRef.current = true;
    skipSearchAfterSelectRef.current = true;
    setResults([]);
    setSearching(false);
    setOpenResults(false);
    setActiveIndex(-1);
    onChange("");
    onClear?.();
    window.setTimeout(() => {
      selectingRef.current = false;
    }, 0);
  };

  return (
    <div ref={wrapRef} className={`relative ${wrapperClassName}`}>
      {showSearchIcon ? (
        <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
      ) : null}
      <input
        id={id}
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => {
          onChange(e.target.value);
          setOpenResults(true);
        }}
        onFocus={() => results.length > 0 && setOpenResults(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={openResults}
        aria-autocomplete="list"
        aria-controls={id ? `${id}-results` : undefined}
        className={`w-full ${paddingClass} ${className}`}
      />
      {canClear ? (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleClear}
          className="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          aria-label="Clear location"
          title="Clear"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
      {openResults && value.trim().length >= 1 && (searching || results.length > 0 || showEmpty) ? (
        <div
          id={id ? `${id}-results` : undefined}
          role="listbox"
          className="absolute z-[1000] mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg"
        >
          {searching ? (
            <p className="px-3 py-2.5 text-sm text-gray-500">Searching...</p>
          ) : showEmpty ? (
            <p className="px-3 py-2.5 text-sm text-gray-500">
              No matching area. Keep typing or pick on the map.
            </p>
          ) : (
            results.map((area, index) => (
              <button
                key={area._id}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => handleSelect(area)}
                className={`flex w-full px-3 py-2.5 text-left text-sm text-gray-800 ${
                  index === activeIndex ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
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
