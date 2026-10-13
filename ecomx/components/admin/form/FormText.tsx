"use client";

import React from "react";
import {
  adminFormInputClass,
  adminFormLabel,
} from "@/lib/admin/form-classes";

interface FormInputProps {
  label: string;
  name: string;
  value: string | number;
  placeholder?: string;
  required?: boolean;
  type?: string;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}

function FormInput({
  label,
  name,
  value,
  placeholder,
  required = false,
  type = "text",
  error,
  touched,
  onChange,
  onBlur,
  disabled = false,
  readOnly = false,
  maxLength,
}: FormInputProps) {
  const hasError = Boolean(touched && error);

  return (
    <div className="flex max-w-md items-start gap-4">
      <label className={adminFormLabel}>
        {required && <span className="text-red-500">*</span>} {label}
      </label>
      <div className="flex-1">
        <input
          type={type}
          name={name}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          className={adminFormInputClass({ hasError, readOnly, disabled })}
        />
        {hasError && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}

export default React.memo(FormInput);
