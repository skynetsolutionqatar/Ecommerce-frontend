"use client";

import React from "react";

interface FormCheckboxProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

function FormCheckbox({ label, name, checked, onChange, onBlur }: FormCheckboxProps) {
  return (
    <div className="flex max-w-md items-center gap-4">
      <label className="w-28 text-sm font-medium text-gray-700">{label}</label>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        onBlur={onBlur}
        className="h-4 w-4 rounded border-gray-300"
      />
    </div>
  );
}

export default React.memo(FormCheckbox);
