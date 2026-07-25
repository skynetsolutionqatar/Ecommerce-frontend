"use client";

import React from "react";
import {
  adminFormInputClass,
  adminFormLabel,
} from "@/lib/admin/form-classes";

interface FormNumberInputProps {
  label: string;
  name: string;
  value: number | string;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
  touched?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  blockNegative?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

function FormNumberInput({
  label,
  name,
  value,
  placeholder,
  required = false,
  min,
  max,
  step,
  error,
  touched,
  onChange,
  onBlur,
  onKeyDown,
  readOnly = false,
  disabled = false,
  blockNegative = true,
}: FormNumberInputProps) {
  const hasError = Boolean(touched && error);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (blockNegative && ["-", "e", "E", "+"].includes(e.key)) {
      e.preventDefault();
    }
    onKeyDown?.(e);
  };

  return (
    <div className="flex max-w-md items-start gap-4">
      <label className={adminFormLabel}>
        {required && <span className="text-red-500">*</span>} {label}
      </label>
      <div className="flex-1">
        <input
          type="number"
          name={name}
          value={value}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          disabled={disabled}
          className={adminFormInputClass({ hasError, readOnly, disabled })}
        />
        {hasError && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}

export default React.memo(FormNumberInput);
