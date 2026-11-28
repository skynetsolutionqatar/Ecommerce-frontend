const STORAGE_KEY = "@skynet/search-history/v1";
const MAX_ENTRIES = 25;
/** Keep searches for 30 days, matching the mobile app. */
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

export type SearchHistoryEntry = {
  query: string;
  categoryLabel?: string;
  categoryId?: string;
  ts: number;
};

function normalizeQuery(q: string) {
  return q.trim().replace(/\s+/g, " ");
}

function prune(entries: SearchHistoryEntry[]): SearchHistoryEntry[] {
  const cutoff = Date.now() - RETENTION_MS;
  return entries
    .filter((entry) => entry.query.length > 0 && entry.ts >= cutoff)
    .sort((a, b) => b.ts - a.ts)
    .slice(0, MAX_ENTRIES);
}

function read(): SearchHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as unknown;
    return prune(Array.isArray(raw) ? (raw as SearchHistoryEntry[]) : []);
  } catch {
    return [];
  }
}

function write(entries: SearchHistoryEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function loadSearchHistory(): SearchHistoryEntry[] {
  const entries = read();
  write(entries);
  return entries;
}

export function addSearchHistory(
  query: string,
  meta?: Pick<SearchHistoryEntry, "categoryLabel" | "categoryId">
): SearchHistoryEntry[] {
  const normalized = normalizeQuery(query);
  if (normalized.length < 2) return loadSearchHistory();

  const next: SearchHistoryEntry = {
    query: normalized,
    ts: Date.now(),
    ...(meta?.categoryLabel ? { categoryLabel: meta.categoryLabel } : {}),
    ...(meta?.categoryId ? { categoryId: meta.categoryId } : {}),
  };
  const deduped = read().filter((entry) => entry.query.toLowerCase() !== normalized.toLowerCase());
  const merged = prune([next, ...deduped]);
  write(merged);
  return merged;
}

export function removeSearchHistoryItem(query: string): SearchHistoryEntry[] {
  const normalized = normalizeQuery(query).toLowerCase();
  const merged = read().filter((entry) => entry.query.toLowerCase() !== normalized);
  write(merged);
  return merged;
}

export function clearSearchHistory(): SearchHistoryEntry[] {
  write([]);
  return [];
}
