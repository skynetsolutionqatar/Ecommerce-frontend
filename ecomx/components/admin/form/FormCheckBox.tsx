"use client";

import React from "react";

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
  const hasError = touched && error;

  return (
    <div className="flex max-w-md items-start gap-4">
      <label className="w-28 pt-0.5 text-sm font-medium text-gray-700">{label}</label>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name={name}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            onBlur={onBlur}
            className={`h-4 w-4 rounded border-gray-300 ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
          />
        </div>
        {hasError && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}

export default React.memo(FormCheckbox);
