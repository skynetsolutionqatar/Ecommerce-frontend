"use client";

import { memo } from "react";
import ListFilterSelect, { type ListFilterOption } from "@/components/admin/shared/ListFilterSelect";
import {
  reportFilterBarClass,
  reportFilterGridClass,
  reportFilterLabelClass,
} from "@/lib/admin/report-classes";

interface ReportFilterItem {
  key: string;
  label: string;
  value: string;
  placeholder?: string;
  options: ListFilterOption[];
  onChange: (value: string) => void;
}

interface ReportFilterSectionProps {
  filters: ReportFilterItem[];
}

function ReportFilterSection({ filters }: ReportFilterSectionProps) {
  if (!filters.length) return null;

  return (
    <div className={reportFilterBarClass}>
      <div className={reportFilterGridClass}>
        {filters.map((filter) => (
          <div key={filter.key} className="min-w-0">
            <label className={reportFilterLabelClass}>{filter.label}</label>
            <ListFilterSelect
              value={filter.value}
              placeholder={filter.placeholder ?? "All"}
              options={filter.options}
              onChange={filter.onChange}
              className="w-full min-w-[8rem]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(ReportFilterSection);
