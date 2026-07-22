"use client";

import { Button } from "@/components/ui/button";

interface ListPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  showing: number;
  onPageChange: (page: number) => void;
  hasNext?: boolean;
}

function getVisiblePages(current: number, total: number, max = 5): number[] {
  if (total <= max) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const half = Math.floor(max / 2);
  let start = Math.max(1, current - half);
  let end = start + max - 1;

  if (end > total) {
    end = total;
    start = Math.max(1, end - max + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function ListPagination({
  page,
  totalPages,
  total,
  showing,
  onPageChange,
  hasNext = page < totalPages,
}: ListPaginationProps) {
  const pages = Math.max(totalPages, 1);
  const visiblePages = getVisiblePages(page, pages);

  return (
    <div className="flex items-center justify-between border-t p-4 text-sm">
      <p className="text-gray-500">
        Showing {showing} of {total}
      </p>
      <div className="flex gap-2">
        <Button
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          disabled={page === 1}
          className="rounded-md border px-3 py-1"
        >
          Prev
        </Button>
        {visiblePages[0] > 1 && (
          <>
            <Button
              onClick={() => onPageChange(1)}
              className={`rounded-md border px-3 py-1 ${page === 1 ? "bg-black text-white" : ""}`}
            >
              1
            </Button>
            {visiblePages[0] > 2 && <span className="px-1 text-gray-400">…</span>}
          </>
        )}
        {visiblePages.map((pageNumber) => (
          <Button
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            className={`rounded-md border px-3 py-1 ${page === pageNumber ? "bg-black text-white" : ""}`}
          >
            {pageNumber}
          </Button>
        ))}
        {visiblePages[visiblePages.length - 1] < pages && (
          <>
            {visiblePages[visiblePages.length - 1] < pages - 1 && (
              <span className="px-1 text-gray-400">…</span>
            )}
            <Button
              onClick={() => onPageChange(pages)}
              className={`rounded-md border px-3 py-1 ${page === pages ? "bg-black text-white" : ""}`}
            >
              {pages}
            </Button>
          </>
        )}
        <Button
          onClick={() => onPageChange(Math.min(page + 1, pages))}
          disabled={!hasNext || page >= pages}
          className="rounded-md border px-3 py-1"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
