"use client";

import React from "react";
import { adminFormLabelCompact } from "@/lib/admin/form-classes";

interface FormCheckboxProps {
  label: string;
  name: string;
  checked: boolean;
  disabled?: boolean;
  error?: string;
  touched?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

function FormCheckbox({
  label,
  name,
  checked,
  disabled = false,
  error,
  touched,
  onChange,
  onBlur,
}: FormCheckboxProps) {
  const hasError = Boolean(touched && error);

  return (
    <div className="flex max-w-md items-start gap-4">
      <label className={adminFormLabelCompact}>{label}</label>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name={name}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            onBlur={onBlur}
            className={`h-4 w-4 rounded border-border accent-emerald-700 ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
          />
        </div>
        {hasError && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}

export default React.memo(FormCheckbox);
