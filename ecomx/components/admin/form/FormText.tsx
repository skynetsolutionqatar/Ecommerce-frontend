"use client";

import React from "react";

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
}: FormInputProps) {
  const hasError = touched && error;

  return (
    <div className="flex max-w-md items-start gap-4">
      <label className="w-28 pt-2 text-sm font-medium text-gray-700">
        {required && <span className="text-red-500">*</span>} {label}
      </label>
      <div className="flex-1">
        <input
          type={type}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          readOnly={readOnly}
          className={`w-full border-b-2 bg-transparent py-2 text-sm outline-none transition
            ${hasError ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-600"}
            ${readOnly ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-500" : ""}
            ${disabled ? "cursor-not-allowed opacity-60" : ""}
          `}
        />
        {hasError && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}

export default React.memo(FormInput);
