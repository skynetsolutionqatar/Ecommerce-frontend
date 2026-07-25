"use client";

import React from "react";
import {
  adminFormLabel,
  adminFormSelectClass,
} from "@/lib/admin/form-classes";

interface Option {
  label: string;
  value: string;
}

interface FormSelectProps {
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  options: Option[];
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLSelectElement>) => void;
}

function FormSelect({
  label,
  name,
  value,
  placeholder = "Select option",
  required = false,
  options,
  error,
  touched,
  disabled = false,
  onChange,
  onBlur,
}: FormSelectProps) {
  const hasError = Boolean(touched && error);

  return (
    <div className="flex max-w-md items-start gap-4">
      <label className={adminFormLabel}>
        {required && <span className="text-red-500">*</span>} {label}
      </label>
      <div className="flex-1">
        <select
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={adminFormSelectClass({ hasError, disabled })}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {hasError && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}

export default React.memo(FormSelect);
