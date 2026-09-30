"use client";

import { forwardRef } from "react";
import {
  adminFormSectionBase,
  adminFormSectionClass,
  adminFormSectionTitle,
} from "@/lib/admin/form-classes";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  /** When false, omit scroll-mt (pages without sticky section tabs). Default true. */
  tabScrollAnchor?: boolean;
}

/** Billing-style form section — matches PurchaseINVForm card sections. */
const FormSection = forwardRef<HTMLElement, FormSectionProps>(
  (
    { id, title, children, className = "", tabScrollAnchor = true },
    ref
  ) => (
    <section
      ref={ref}
      id={id}
      className={cn(
        tabScrollAnchor ? adminFormSectionClass : adminFormSectionBase,
        className
      )}
    >
      <h3 className={adminFormSectionTitle}>{title}</h3>
      {children}
    </section>
  )
);

FormSection.displayName = "FormSection";

export default FormSection;
