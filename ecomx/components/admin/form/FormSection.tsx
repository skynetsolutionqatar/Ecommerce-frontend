"use client";

import { forwardRef } from "react";
import {
  adminFormSectionClass,
  adminFormSectionTitle,
} from "@/lib/admin/form-classes";

interface FormSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

/** Billing-style form section — matches PurchaseINVForm card sections. */
const FormSection = forwardRef<HTMLElement, FormSectionProps>(
  ({ id, title, children, className = "" }, ref) => (
    <section ref={ref} id={id} className={`${adminFormSectionClass} ${className}`}>
      <h3 className={adminFormSectionTitle}>{title}</h3>
      {children}
    </section>
  )
);

FormSection.displayName = "FormSection";

export default FormSection;
