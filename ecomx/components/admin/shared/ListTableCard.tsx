"use client";

interface ListTableCardProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function ListTableCard({ children, footer }: ListTableCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {children}
      {footer}
    </div>
  );
}
