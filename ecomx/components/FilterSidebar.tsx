"use client";
import { useState } from "react";
import { SHOP_CATEGORIES, getCategoryCount, PRICE_MAX, fmt } from "@/lib/data";
import type { FilterState } from "@/lib/types";
import * as Icons from "./Icons";

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onClear: () => void;
  resultCount: number;
  mobile?: boolean;
}

const PRICE_PRESETS: { min: number; max: number; label: string }[] = [
  { min: 0, max: 500, label: "Under QAR 500" },
  { min: 500, max: 1500, label: "QAR 500 – 1,500" },
  { min: 1500, max: 3000, label: "QAR 1,500 – 3,000" },
  { min: 3000, max: PRICE_MAX, label: "QAR 3,000+" },
];

const BRANDS = ["Honeywell", "Zebra", "Datalogic", "ZKTeco", "PowerGuard", "atACC", "SecureVision", "Synology", "PartnerTech", "Star Micronics"];

export default function FilterSidebar({ filters, onChange, onClear, resultCount, mobile }: FilterSidebarProps) {
  const [sections, setSections] = useState({ categories: true, brand: true, price: true, availability: true, rating: true });

  const toggle = (key: keyof typeof sections) =>
    setSections(prev => ({ ...prev, [key]: !prev[key] }));

  const toggleArr = <K extends keyof FilterState>(key: K, val: string) => {
    const arr = filters[key] as string[];
    const next = arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
    onChange({ ...filters, [key]: next });
  };

  const activeCount =
    filters.categories.length + filters.ratings.length + filters.colors.length +
    filters.sizes.length + filters.tags.length +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < PRICE_MAX ? 1 : 0);

  return (
    <aside className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="10" y2="18"/>
          </svg>
          <span className="font-semibold text-[14px] text-gray-900">Filters</span>
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-[12px] font-semibold text-blue-600 cursor-pointer border-0 bg-transparent hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Categories */}
      <FilterSection title="Categories" open={sections.categories} onToggle={() => toggle("categories")}>
        {SHOP_CATEGORIES.map(cat => (
          <FilterCheckbox
            key={cat}
            label={cat}
            count={getCategoryCount(cat)}
            checked={filters.categories.includes(cat)}
            onChange={() => toggleArr("categories", cat)}
          />
        ))}
      </FilterSection>

      {/* Brand */}
      <FilterSection title="Brand" open={sections.brand} onToggle={() => toggle("brand")}>
        {BRANDS.map(brand => (
          <FilterCheckbox
            key={brand}
            label={brand}
            checked={filters.tags.includes(brand)}
            onChange={() => toggleArr("tags", brand)}
          />
        ))}
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range" open={sections.price} onToggle={() => toggle("price")}>
        <div className="py-1 pb-2">
          <div className="mb-2 flex justify-between text-[11px] font-semibold text-gray-700">
            <span>{fmt(filters.priceRange[0])}</span>
            <span>{filters.priceRange[1] >= PRICE_MAX ? `${fmt(PRICE_MAX)}+` : fmt(filters.priceRange[1])}</span>
          </div>
          <input
            type="range"
            min={0}
            max={PRICE_MAX}
            value={filters.priceRange[1]}
            onChange={e => onChange({ ...filters, priceRange: [filters.priceRange[0], Number(e.target.value)] })}
            className="w-full cursor-pointer accent-blue-600"
          />
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability" open={sections.availability} onToggle={() => toggle("availability")}>
        {["In Stock", "Pre-order"].map(s => (
          <FilterCheckbox
            key={s}
            label={s}
            checked={filters.sizes.includes(s)}
            onChange={() => toggleArr("sizes", s)}
          />
        ))}
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Rating" open={sections.rating} onToggle={() => toggle("rating")} last>
        {[4, 3, 2, 1].map(r => (
          <button
            key={r}
            type="button"
            onClick={() => toggleArr("ratings", String(r))}
            className="flex w-full items-center gap-2 border-0 bg-transparent cursor-pointer py-1.5 text-left"
          >
            <div
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all ${
                filters.ratings.includes(String(r))
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 bg-white"
              }`}
            >
              {filters.ratings.includes(String(r)) && <Icons.Check />}
            </div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i <= r ? "#F59E0B" : "#D1D5DB"}>
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
              ))}
            </div>
            <span className="text-[11px] text-gray-600">& above</span>
          </button>
        ))}
      </FilterSection>

      {/* Apply Filters Button */}
      <div className="px-4 py-4 border-t border-gray-100">
        <button
          type="button"
          className="w-full rounded-lg border border-blue-600 py-2.5 text-[13px] font-semibold text-blue-600 bg-white cursor-pointer hover:bg-blue-50 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </aside>
  );
}

function FilterSection({ title, open, onToggle, children, last }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={`${last ? "" : "border-b border-gray-100"}`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between border-0 bg-transparent cursor-pointer px-4 py-3"
      >
        <span className="text-[13px] font-semibold text-gray-900">{title}</span>
        <span className={`flex text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <Icons.ChevronDown />
        </span>
      </button>
      {open && (
        <div className="px-4 pb-3">
          {children}
        </div>
      )}
    </div>
  );
}

function FilterCheckbox({ label, count, checked, onChange }: { label: string; count?: number; checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex w-full items-center gap-2 border-0 bg-transparent cursor-pointer py-1.5 text-left"
    >
      <div
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all ${
          checked ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 bg-white"
        }`}
      >
        {checked && <Icons.Check />}
      </div>
      <span className="flex-1 text-[12px] leading-snug text-gray-700">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="text-[11px] text-gray-400">({count})</span>
      )}
    </button>
  );
}
