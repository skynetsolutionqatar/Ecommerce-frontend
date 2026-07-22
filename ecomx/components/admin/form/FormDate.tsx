"use client";

import React from "react";

interface FormDateInputProps {
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  min?: string;
  max?: string;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}

function FormDateInput({
  label,
  name,
  value,
  placeholder,
  required = false,
  min,
  max,
  error,
  touched,
  disabled = false,
  onChange,
  onBlur,
}: FormDateInputProps) {
  const hasError = touched && error;

  return (
    <div className="flex max-w-md items-start gap-4">
      <label className="w-28 pt-2 text-sm font-medium text-gray-700">
        {required && <span className="text-red-500">*</span>} {label}
      </label>
      <div className="flex-1">
        <input
          type="date"
          name={name}
          value={value}
          placeholder={placeholder}
          min={min}
          max={max}
          disabled={disabled}
          onChange={onChange}
          onBlur={onBlur}
          className={`w-full border-b-2 bg-transparent py-2 text-sm outline-none transition
            ${hasError ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-600"}
            ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        />
        {hasError && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}

export default React.memo(FormDateInput);
