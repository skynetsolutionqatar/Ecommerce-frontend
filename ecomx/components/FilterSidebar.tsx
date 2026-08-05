"use client";

import { useState } from "react";
import { Colors } from "@/lib/theme";
import { formatPrice } from "@/lib/utils";
import { countActiveFilters } from "@/lib/store/shop-filters";
import type { FilterState } from "@/lib/types";
import * as Icons from "./Icons";

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onClear: () => void;
  resultCount: number;
  isLoading?: boolean;
  priceMax: number;
  categories?: { id: string; name: string; count?: number }[];
  brands?: string[];
  mobile?: boolean;
  onApply?: () => void;
}

const BRAND = Colors.base_color;

export default function FilterSidebar({
  filters,
  onChange,
  onClear,
  resultCount,
  isLoading = false,
  priceMax,
  categories = [],
  brands = [],
  mobile,
  onApply,
}: FilterSidebarProps) {
  const [sections, setSections] = useState({
    categories: true,
    brand: true,
    price: true,
    availability: true,
    rating: true,
  });

  const toggle = (key: keyof typeof sections) =>
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const activeCount = countActiveFilters(filters, priceMax);

  return (
    <aside className="w-full">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-700"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="14" y2="12" />
            <line x1="4" y1="18" x2="10" y2="18" />
          </svg>
          <span className="text-[14px] font-semibold text-gray-900">Filters</span>
        </div>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="cursor-pointer border-0 bg-transparent text-[13px] md:text-[12px] font-semibold hover:underline"
            style={{ color: BRAND }}
          >
            Clear All
          </button>
        ) : null}
      </div>

      <div className="border-b border-gray-100 bg-gray-50 px-4 py-2.5">
        <p className="text-[13px] md:text-[12px] text-gray-600">
          {isLoading ? (
            "Loading results..."
          ) : (
            <>
              <span className="font-bold" style={{ color: BRAND }}>
                {resultCount}
              </span>{" "}
              {resultCount === 1 ? "result" : "results"} found
            </>
          )}
        </p>
      </div>

      <FilterSection title="Categories" open={sections.categories} onToggle={() => toggle("categories")}>
        {categories.length > 0 ? (
          categories.map((cat) => (
            <FilterCheckbox
              key={cat.id}
              label={cat.name}
              count={cat.count}
              checked={filters.categories.includes(cat.id)}
              onChange={() => {
                const next = filters.categories.includes(cat.id) ? [] : [cat.id];
                onChange({ ...filters, categories: next });
              }}
            />
          ))
        ) : (
          <p className="text-[12px] md:text-[11px] text-gray-400">No categories</p>
        )}
      </FilterSection>

      <FilterSection title="Brand" open={sections.brand} onToggle={() => toggle("brand")}>
        {brands.length > 0 ? (
          brands.map((brand) => (
            <FilterCheckbox
              key={brand}
              label={brand}
              checked={filters.brands.includes(brand)}
              onChange={() => {
                const next = filters.brands.includes(brand) ? [] : [brand];
                onChange({ ...filters, brands: next });
              }}
            />
          ))
        ) : (
          <p className="text-[12px] md:text-[11px] text-gray-400">No brands</p>
        )}
      </FilterSection>

      <FilterSection title="Price Range" open={sections.price} onToggle={() => toggle("price")}>
        <div className="py-1 pb-2">
          <div className="mb-3 flex justify-between text-[12px] md:text-[11px] font-semibold text-gray-700">
            <span>{formatPrice(filters.priceRange[0])}</span>
            <span>
              {filters.priceRange[1] >= priceMax
                ? `${formatPrice(priceMax)}+`
                : formatPrice(filters.priceRange[1])}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={priceMax}
            step={Math.max(50, Math.round(priceMax / 100))}
            value={Math.min(filters.priceRange[1], priceMax)}
            onChange={(e) =>
              onChange({
                ...filters,
                priceRange: [filters.priceRange[0], Number(e.target.value)],
              })
            }
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full"
            style={{
              accentColor: BRAND,
              background: `linear-gradient(to right, ${BRAND} 0%, ${BRAND} ${(Math.min(filters.priceRange[1], priceMax) / priceMax) * 100}%, #e5e7eb ${(Math.min(filters.priceRange[1], priceMax) / priceMax) * 100}%, #e5e7eb 100%)`,
            }}
          />
        </div>
      </FilterSection>

      <FilterSection title="Availability" open={sections.availability} onToggle={() => toggle("availability")}>
        <FilterCheckbox
          label="In Stock"
          checked={filters.inStock}
          onChange={() => onChange({ ...filters, inStock: !filters.inStock })}
        />
        <FilterCheckbox
          label="On Sale"
          checked={filters.hasDiscount}
          onChange={() => onChange({ ...filters, hasDiscount: !filters.hasDiscount })}
        />
      </FilterSection>

      <FilterSection title="Rating" open={sections.rating} onToggle={() => toggle("rating")} last>
        {[4, 3, 2, 1].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() =>
              onChange({ ...filters, minRating: filters.minRating === r ? null : r })
            }
            className="flex w-full cursor-pointer items-center gap-2 border-0 bg-transparent py-1.5 text-left"
          >
            <FilterCheckBoxVisual checked={filters.minRating === r} />
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} className="h-[13px] w-[13px] md:h-[11px] md:w-[11px]" viewBox="0 0 24 24" fill={i <= r ? "#F59E0B" : "#D1D5DB"}>
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
              ))}
            </div>
            <span className="text-[12px] md:text-[11px] text-gray-600">& above</span>
          </button>
        ))}
      </FilterSection>

      {!mobile ? (
        <div className="border-t border-gray-100 px-4 py-4">
          <button
            type="button"
            onClick={onApply}
            className="w-full cursor-pointer rounded-lg border py-2.5 text-[13px] font-semibold transition-colors hover:bg-[#0a255d]/5"
            style={{ borderColor: BRAND, color: BRAND }}
          >
            Apply Filters
          </button>
        </div>
      ) : null}
    </aside>
  );
}

function FilterCheckBoxVisual({ checked }: { checked: boolean }) {
  return (
    <div
      className="flex h-[18px] w-[18px] md:h-4 md:w-4 shrink-0 items-center justify-center rounded border-2 transition-all"
      style={{
        borderColor: checked ? Colors.base_color : "#d1d5db",
        background: checked ? Colors.base_color : "#ffffff",
        color: "#ffffff",
      }}
    >
      {checked ? <Icons.Check /> : null}
    </div>
  );
}

function FilterSection({
  title,
  open,
  onToggle,
  children,
  last,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={last ? "" : "border-b border-gray-100"}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between border-0 bg-transparent px-4 py-3"
      >
        <span className="text-[13px] font-semibold text-gray-900">{title}</span>
        <span className={`flex text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <Icons.ChevronDown />
        </span>
      </button>
      {open ? <div className="px-4 pb-3">{children}</div> : null}
    </div>
  );
}

function FilterCheckbox({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex w-full cursor-pointer items-center gap-2 border-0 bg-transparent py-1.5 text-left"
    >
      <FilterCheckBoxVisual checked={checked} />
      <span className="flex-1 text-[13px] md:text-[12px] leading-snug text-gray-700">{label}</span>
      {count !== undefined && count > 0 ? (
        <span className="text-[12px] md:text-[11px] text-gray-400">({count})</span>
      ) : null}
    </button>
  );
}
