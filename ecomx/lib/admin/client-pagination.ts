export const LIST_PAGE_SIZE = 10;

export type ClientPaginationResult<T> = {
  items: T[];
  total: number;
  totalPages: number;
  page: number;
  hasNext: boolean;
};

export function paginateClientList<T>(
  items: T[],
  page: number,
  pageSize: number = LIST_PAGE_SIZE
): ClientPaginationResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    total,
    totalPages,
    page: safePage,
    hasNext: safePage < totalPages,
  };
}
