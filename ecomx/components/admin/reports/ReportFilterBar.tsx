"use client";

import { memo, useState } from "react";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ListFilterSelect, { type ListFilterOption } from "@/components/admin/shared/ListFilterSelect";

export interface ReportFilterField {
  key: string;
  label: string;
  value: string;
  placeholder?: string;
  options: ListFilterOption[];
  onChange: (value: string) => void;
  inline?: boolean;
}

interface ReportFilterBarProps {
  filters: ReportFilterField[];
  onClear: () => void;
  activeCount?: number;
}

function ReportFilterBar({ filters, onClear, activeCount = 0 }: ReportFilterBarProps) {
  const [open, setOpen] = useState(false);
  const hasActive = activeCount > 0;
  const inlineFilters = filters.filter((f) => f.inline);
  const panelFilters = filters.filter((f) => !f.inline);

  if (!filters.length) return null;

  return (
    <div className="border-b border-border">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        {panelFilters.length > 0 && (
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors",
              open
                ? "border-border bg-muted text-foreground"
                : "border-border bg-card text-foreground hover:bg-muted"
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
            Filter
            {hasActive && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0a255d] px-1 text-[10px] font-semibold text-white dark:bg-[#061a3d]">
                {activeCount}
              </span>
            )}
          </button>
        )}

        {inlineFilters.map((filter) => (
          <ListFilterSelect
            key={filter.key}
            value={filter.value}
            placeholder={filter.placeholder}
            options={filter.options}
            onChange={filter.onChange}
            className="w-[140px]"
          />
        ))}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            onClear();
            setOpen(false);
          }}
          disabled={!hasActive}
          className="ml-auto h-8 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
        >
          <RotateCcw className="h-3 w-3" />
          Clear
        </Button>
      </div>

      {open && panelFilters.length > 0 && (
        <div className="grid grid-cols-2 gap-2 border-t border-border bg-muted/30 px-4 py-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {panelFilters.map((filter) => (
            <div key={filter.key} className="min-w-0">
              <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                {filter.label}
              </label>
              <ListFilterSelect
                value={filter.value}
                placeholder={filter.placeholder}
                options={filter.options}
                onChange={filter.onChange}
                className="w-full min-w-0"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(ReportFilterBar);
