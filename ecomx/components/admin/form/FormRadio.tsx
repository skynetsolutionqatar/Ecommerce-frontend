"use client";

import React from "react";
import { adminFormLabel } from "@/lib/admin/form-classes";
import { colors } from "@/components/admin/utils/Colors";

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
      <label className={adminFormLabel}>{label}</label>
      <div className="flex flex-wrap gap-4">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className={colors.accent}
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}

export default React.memo(FormRadio);
