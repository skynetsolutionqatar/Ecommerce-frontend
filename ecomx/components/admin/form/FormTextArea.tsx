"use client";

import React from "react";
import {
  adminFormInputClass,
  adminFormLabel,
} from "@/lib/admin/form-classes";

interface FormTextareaProps {
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  error?: string;
  touched?: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
}

function FormTextarea({
  label,
  name,
  value,
  placeholder,
  required = false,
  rows = 2,
  error,
  touched,
  onChange,
  onBlur,
}: FormTextareaProps) {
  const hasError = Boolean(touched && error);

  return (
    <div className="flex max-w-md items-start gap-4">
      <label className={adminFormLabel}>
        {required && <span className="text-red-500">*</span>} {label}
      </label>
      <div className="flex-1">
        <textarea
          name={name}
          value={value}
          rows={rows}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          className={`${adminFormInputClass({ hasError })} resize-none`}
        />
        {hasError && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}

export default React.memo(FormTextarea);
