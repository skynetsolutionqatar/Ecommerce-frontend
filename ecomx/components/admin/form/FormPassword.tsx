"use client";

import { Eye, EyeOff } from "lucide-react";
import React from "react";

interface FormPasswordInputProps {
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}

function FormPasswordInput({
  label,
  name,
  value,
  placeholder,
  required = false,
  error,
  touched,
  showPassword,
  setShowPassword,
  onChange,
  onBlur,
}: FormPasswordInputProps) {
  const hasError = touched && error;

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {required && <span className="text-red-500">*</span>} {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          className={`w-full rounded-lg border px-4 py-2 pr-10 focus:outline-none focus:ring-2 ${
            hasError
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-3 flex items-center text-gray-500"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {hasError && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default React.memo(FormPasswordInput);
