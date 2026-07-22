"use client";

import { forwardRef } from "react";
import { adminType } from "@/lib/admin/typography";

interface Props {
  id: string;
  title: string;
  children: React.ReactNode;
}

const ViewSection = forwardRef<HTMLElement, Props>(
  ({ id, title, children }, ref) => (
    <section ref={ref} id={id} className="rounded-xl bg-white pb-3">
      <h2 className={`mb-6 border-b pb-3 ${adminType.sectionTitle}`}>{title}</h2>
      {children}
    </section>
  )
);

ViewSection.displayName = "ViewSection";

export default ViewSection;
