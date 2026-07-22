"use client";

import React from "react";

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
  const hasError = touched && error;

  return (
    <div className="flex max-w-md items-start gap-4">
      <label className="w-28 pt-2 text-sm font-medium text-gray-700">
        {required && <span className="text-red-500">*</span>} {label}
      </label>
      <div className="flex-1">
        <select
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={`w-full border-b-2 bg-transparent py-2 text-sm outline-none
            ${hasError ? "border-red-500" : "border-gray-300 focus:border-blue-600"}
            ${disabled ? "cursor-not-allowed opacity-60" : ""}
          `}
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
