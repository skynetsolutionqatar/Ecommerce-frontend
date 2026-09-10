import { cn } from "@/lib/utils";

export const adminFormLabel =
  "w-28 shrink-0 pt-2 text-sm font-medium text-muted-foreground";

export const adminFormLabelCompact =
  "w-28 shrink-0 pt-0.5 text-sm font-medium text-muted-foreground";

export function adminFormInputClass({
  hasError = false,
  readOnly = false,
  disabled = false,
}: {
  hasError?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
} = {}) {
  return cn(
    "admin-form-input w-full border-b-2 bg-transparent py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground",
    hasError
      ? "border-destructive focus:border-destructive"
      : "border-border focus:border-[#0a255d] dark:focus:border-white/40",
    readOnly && "admin-form-readonly cursor-not-allowed border-border/70 bg-muted text-muted-foreground",
    disabled && "cursor-not-allowed opacity-60"
  );
}

export function adminFormSelectClass({
  hasError = false,
  disabled = false,
}: {
  hasError?: boolean;
  disabled?: boolean;
} = {}) {
  return cn(
    "admin-form-input w-full border-b-2 bg-transparent py-2 text-sm text-foreground outline-none",
    hasError
      ? "border-destructive focus:border-destructive"
      : "border-border focus:border-[#0a255d] dark:focus:border-white/40",
    disabled && "cursor-not-allowed opacity-60"
  );
}

export const adminFormSectionClass =
  "scroll-mt-28 rounded-xl border border-border bg-card p-6 shadow-sm";

export const adminFormSectionTitle =
  "mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground";

export const adminViewSectionClass = "rounded-xl border border-border bg-card pb-3";

export const adminTableClass = "admin-table w-full text-sm";

export const adminTableHeadClass = "bg-muted text-foreground";

export const adminTableRowClass =
  "border-t border-border transition-colors hover:bg-muted/60";

export const adminTableCellMuted = "text-muted-foreground";

export const adminTableCellPrimary = "font-medium text-foreground";

export const adminStatusBadge = {
  green: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  red: "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400",
  yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  gray: "bg-muted text-muted-foreground",
  orange: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
} as const;
