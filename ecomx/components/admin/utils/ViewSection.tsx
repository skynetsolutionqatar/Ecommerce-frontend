"use client";

import { forwardRef } from "react";
import { adminType } from "@/lib/admin/typography";
import { adminViewSectionClass } from "@/lib/admin/form-classes";

interface Props {
  id: string;
  title: string;
  children: React.ReactNode;
}

const ViewSection = forwardRef<HTMLElement, Props>(({ id, title, children }, ref) => (
  <section ref={ref} id={id} className={`${adminViewSectionClass} p-6 pt-4`}>
    <h2 className={`mb-6 border-b border-border pb-3 ${adminType.sectionTitle}`}>{title}</h2>
    {children}
  </section>
));

ViewSection.displayName = "ViewSection";

export default ViewSection;
