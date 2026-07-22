"use client";

import { forwardRef } from "react";

interface FormSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

/** Billing-style form section — matches PurchaseINVForm card sections. */
const FormSection = forwardRef<HTMLElement, FormSectionProps>(
  ({ id, title, children, className = "" }, ref) => (
    <section
      ref={ref}
      id={id}
      className={`scroll-mt-28 rounded-xl bg-white p-6 shadow-sm ${className}`}
    >
      <h3 className="mb-5 text-xs font-semibold uppercase tracking-widest text-gray-400">
        {title}
      </h3>
      {children}
    </section>
  )
);

FormSection.displayName = "FormSection";

export default FormSection;
