import type { ApiOrder } from "@/types/order.types";

type OrderItem = ApiOrder["items"][number];

/** A4 usable height (842pt) minus bottom footer reserve */
const PAGE_CONTENT_HEIGHT = 798;

/** Page 1 fixed blocks: header, title, bill cards, table head, continuation note */
const PAGE1_FIXED_OVERHEAD = 372;

/** Continuation page fixed blocks (header, note, table head) */
const CONTINUATION_FIXED_OVERHEAD = 150;

/** Summary block on the last item page (warranty, bank, totals, assist) */
const SUMMARY_RESERVE = 210;

/** Safety margin so rows do not touch the footer */
const FOOTER_GAP = 20;

const ROW_PADDING_V = 12;
const ROW_LINE_HEIGHT = 12.5;
/** Approx. chars per line in the description column at 8.5pt */
const DESC_CHARS_PER_LINE = 48;

export function estimateItemRowHeight(name: string): number {
  const lines = Math.max(1, Math.ceil(name.length / DESC_CHARS_PER_LINE));
  return ROW_PADDING_V + lines * ROW_LINE_HEIGHT;
}

function rowBudget(pageHeight: number, fixedOverhead: number): number {
  return pageHeight - fixedOverhead - FOOTER_GAP;
}

function takeWhileBudget(
  items: OrderItem[],
  budget: number,
): { taken: OrderItem[]; rest: OrderItem[] } {
  let used = 0;
  let i = 0;

  while (i < items.length) {
    const height = estimateItemRowHeight(items[i].name);
    if (used + height > budget && i > 0) break;
    used += height;
    i++;
  }

  return { taken: items.slice(0, i), rest: items.slice(i) };
}

function itemsHeight(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + estimateItemRowHeight(item.name), 0);
}

function paginateContinuationPages(rest: OrderItem[]): OrderItem[][] {
  const pages: OrderItem[][] = [];
  let remaining = rest;

  while (remaining.length > 0) {
    const withSummaryBudget = rowBudget(
      PAGE_CONTENT_HEIGHT,
      CONTINUATION_FIXED_OVERHEAD + SUMMARY_RESERVE,
    );

    if (itemsHeight(remaining) <= withSummaryBudget) {
      pages.push(remaining);
      break;
    }

    const fullPageBudget = rowBudget(
      PAGE_CONTENT_HEIGHT,
      CONTINUATION_FIXED_OVERHEAD,
    );
    const { taken, rest: next } = takeWhileBudget(remaining, fullPageBudget);

    if (taken.length === 0) {
      pages.push([remaining[0]]);
      remaining = remaining.slice(1);
      continue;
    }

    pages.push(taken);
    remaining = next;
  }

  return pages;
}

export function paginateOrderItems(items: OrderItem[]) {
  if (items.length === 0) {
    return { firstPage: [] as OrderItem[], continuations: [] as OrderItem[][] };
  }

  const page1WithSummaryBudget = rowBudget(
    PAGE_CONTENT_HEIGHT,
    PAGE1_FIXED_OVERHEAD + SUMMARY_RESERVE,
  );

  if (itemsHeight(items) <= page1WithSummaryBudget) {
    return { firstPage: items, continuations: [] as OrderItem[][] };
  }

  const page1OnlyBudget = rowBudget(PAGE_CONTENT_HEIGHT, PAGE1_FIXED_OVERHEAD);
  const { taken: firstPage, rest } = takeWhileBudget(items, page1OnlyBudget);

  if (rest.length === 0) {
    return { firstPage, continuations: [] as OrderItem[][] };
  }

  return {
    firstPage,
    continuations: paginateContinuationPages(rest),
  };
}

/** Total pages: item pages + one fixed terms page. */
export function invoicePageCount(items: OrderItem[]): number {
  const { continuations } = paginateOrderItems(items);
  return 1 + continuations.length + 1;
}

/** Start index for continuation page `index` given first-page size. */
export function itemStartIndex(
  firstPageLength: number,
  continuationIndex: number,
  continuations: OrderItem[][],
): number {
  let start = firstPageLength;
  for (let i = 0; i < continuationIndex; i++) {
    start += continuations[i]?.length ?? 0;
  }
  return start;
}
