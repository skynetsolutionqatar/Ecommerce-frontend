interface ProductBreadcrumbProps {
  crumbs: string[];
  onNavigateBack: () => void;
}

export default function ProductBreadcrumb({ crumbs, onNavigateBack }: ProductBreadcrumbProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm sm:px-6 md:px-8">
      <nav className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[13px] md:text-[11.5px] text-gray-500">
        {crumbs.map((crumb, index) => (
          <span key={`${crumb}-${index}`} className="flex items-center gap-1">
            {index > 0 ? <span className="text-gray-300">›</span> : null}
            {index < crumbs.length - 1 ? (
              <button
                type="button"
                onClick={onNavigateBack}
                className="cursor-pointer border-0 bg-transparent text-gray-600 hover:text-blue-600 hover:underline"
              >
                {crumb}
              </button>
            ) : (
              <span className="line-clamp-1 font-medium text-gray-700">{crumb}</span>
            )}
          </span>
        ))}
      </nav>
    </div>
  );
}
