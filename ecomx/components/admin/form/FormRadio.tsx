"use client";

import React from "react";

interface RadioOption {
  label: string;
  value: string;
}

interface FormRadioProps {
  label: string;
  name: string;
  value: string;
  options: RadioOption[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function FormRadio({ label, name, value, options, onChange }: FormRadioProps) {
  return (
    <div className="flex max-w-md items-start gap-4">
      <label className="w-28 pt-2 text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-4">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}

export default React.memo(FormRadio);
