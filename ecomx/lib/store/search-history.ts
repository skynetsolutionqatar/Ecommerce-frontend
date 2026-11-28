const STORAGE_KEY = "@skynet/search-history/v1";
const MAX_ENTRIES = 25;
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

export type SearchHistoryEntry = {
  query: string;
  categoryLabel?: string;
  categoryId?: string;
  ts: number;
};

function normalizeQuery(q: string): string {
  return q.trim().replace(/\s+/g, " ");
}

function prune(entries: SearchHistoryEntry[]): SearchHistoryEntry[] {
  const cutoff = Date.now() - RETENTION_MS;
  return entries
    .filter((e) => e.query.length > 0 && e.ts >= cutoff)
    .sort((a, b) => b.ts - a.ts)
    .slice(0, MAX_ENTRIES);
}

export function loadSearchHistory(): SearchHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as SearchHistoryEntry[]) : [];
    const list = Array.isArray(parsed) ? parsed : [];
    const pruned = prune(list);
    if (pruned.length !== list.length) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
    }
    return pruned;
  } catch {
    return [];
  }
}

export function addSearchHistory(
  query: string,
  meta?: Pick<SearchHistoryEntry, "categoryLabel" | "categoryId">
): SearchHistoryEntry[] {
  if (typeof window === "undefined") return [];
  const normalized = normalizeQuery(query);
  if (normalized.length < 2) return loadSearchHistory();

  const existing = loadSearchHistory();
  const next: SearchHistoryEntry = {
    query: normalized,
    ts: Date.now(),
    ...(meta?.categoryLabel ? { categoryLabel: meta.categoryLabel } : {}),
    ...(meta?.categoryId ? { categoryId: meta.categoryId } : {}),
  };

  const deduped = existing.filter((e) => e.query.toLowerCase() !== normalized.toLowerCase());
  const merged = prune([next, ...deduped]);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

export function removeSearchHistoryItem(query: string): SearchHistoryEntry[] {
  if (typeof window === "undefined") return [];
  const normalized = normalizeQuery(query).toLowerCase();
  const merged = loadSearchHistory().filter((e) => e.query.toLowerCase() !== normalized);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

export function clearSearchHistory(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}