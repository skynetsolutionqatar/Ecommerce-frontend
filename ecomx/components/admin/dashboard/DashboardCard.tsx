import { memo, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { adminType } from "@/lib/admin/typography";

interface DashboardCardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  headerRight?: ReactNode;
  showMenu?: boolean;
  className?: string;
  children: ReactNode;
}

function DashboardCard({
  title,
  description,
  action,
  headerRight,
  showMenu = false,
  className = "",
  children,
}: DashboardCardProps) {
  const hasHeader = title || description || action || headerRight || showMenu;

  return (
    <article
      className={`rounded-xl border border-gray-100 bg-white shadow-sm ${className}`}
    >
      {hasHeader && (
        <header className="flex items-start justify-between gap-4 border-b border-gray-50 px-5 py-4">
          <div className="min-w-0 flex-1">
            {title && <h3 className={adminType.cardTitle}>{title}</h3>}
            {description && (
              <p className={`mt-1 leading-relaxed ${adminType.cardDescription}`}>{description}</p>
            )}
            {action}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {headerRight}
            {showMenu && (
              <button
                type="button"
                aria-label="More options"
                className="rounded-md p-1 text-gray-400 transition hover:bg-gray-50 hover:text-gray-600"
              >
                <MoreHorizontal size={18} />
              </button>
            )}
          </div>
        </header>
      )}
      <div className="p-5">{children}</div>
    </article>
  );
}

export default memo(DashboardCard);
