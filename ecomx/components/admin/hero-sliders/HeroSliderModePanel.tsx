"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { adminType } from "@/lib/admin/typography";
import { adminViewSectionClass } from "@/lib/admin/form-classes";
import { cn } from "@/lib/utils";

type HeroSliderModePanelProps = {
  id: string;
  title: string;
  description?: string;
  /** Content panel open by default; poster panel closed */
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
};

/**
 * Two-mode hero editor: content handling (top, open) vs poster assets (below, collapsed).
 */
export default function HeroSliderModePanel({
  id,
  title,
  description,
  defaultOpen = false,
  children,
  className,
}: HeroSliderModePanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section id={id} className={cn(`${adminViewSectionClass} p-6 pt-4`, className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-start justify-between gap-4 border-b border-border pb-3 text-left"
        aria-expanded={open}
        aria-controls={`${id}-body`}
      >
        <div className="min-w-0 flex-1">
          <h2 className={adminType.sectionTitle}>{title}</h2>
          {description ? <p className="mt-1 max-w-2xl text-xs text-slate-600">{description}</p> : null}
        </div>
        <ChevronDown
          className={cn("mt-0.5 h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open ? (
        <div id={`${id}-body`} className="space-y-8 pt-6">
          {children}
        </div>
      ) : null}
    </section>
  );
}
