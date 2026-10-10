"use client";

import { ORDER_STATUS, ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/Constant";
import { formatDate } from "@/lib/utils";
import type { ApiOrder, OrderStatusHistoryEntry } from "@/types/order.types";

const FLOW: OrderStatus[] = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
];

type StepState = "done" | "current" | "upcoming";

function flowIndex(status: string) {
  return FLOW.indexOf(status as OrderStatus);
}

function historyTime(status: string, history?: OrderStatusHistoryEntry[]) {
  return history?.find((h) => h.status === status)?.timestamp;
}

function stepStates(order: ApiOrder): StepState[] {
  const { status, statusHistory } = order;
  const currentIdx = flowIndex(status);

  if (status === ORDER_STATUS.CANCELLED || status === ORDER_STATUS.REFUNDED) {
    return FLOW.map((step) =>
      statusHistory?.some((h) => h.status === step) || step === ORDER_STATUS.PENDING
        ? "done"
        : "upcoming"
    );
  }

  if (status === ORDER_STATUS.DELIVERED) {
    return FLOW.map(() => "done");
  }

  return FLOW.map((_, idx) => {
    if (idx < currentIdx) return "done";
    if (idx === currentIdx) return "current";
    return "upcoming";
  });
}

function stepTimestamp(order: ApiOrder, step: OrderStatus, state: StepState) {
  if (state === "upcoming") return undefined;
  return (
    historyTime(step, order.statusHistory) ??
    (step === ORDER_STATUS.PENDING ? order.createdAt : undefined)
  );
}

function dotClass(state: StepState) {
  if (state === "done") return "bg-blue-600 text-white";
  if (state === "current") return "border-2 border-blue-600 bg-blue-50 text-blue-700";
  return "border-2 border-gray-200 bg-white text-gray-400";
}

function connectorClass(active: boolean) {
  return active ? "bg-blue-600" : "bg-gray-200";
}

export default function OrderStatusTracker({ order }: { order: ApiOrder }) {
  const states = stepStates(order);
  const isCancelled = order.status === ORDER_STATUS.CANCELLED;
  const isRefunded = order.status === ORDER_STATUS.REFUNDED;

  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <h2 className="mb-4 text-base font-bold text-gray-900 sm:text-sm">Order Tracking</h2>

      {isCancelled ? (
        <p className="mb-4 text-sm font-medium text-muted md:text-xs">This order was cancelled.</p>
      ) : null}
      {isRefunded ? (
        <p className="mb-4 text-sm font-medium text-muted md:text-xs">This order has been refunded.</p>
      ) : null}

      {/* Mobile: vertical timeline with centered connector */}
      <ol className="sm:hidden">
        {FLOW.map((step, i) => {
          const state = states[i];
          const ts = stepTimestamp(order, step, state);
          const isLast = i === FLOW.length - 1;
          const connectorActive = state === "done";

          return (
            <li key={step} className="relative flex gap-3">
              <div className="flex w-9 shrink-0 flex-col items-center">
                <span
                  className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${dotClass(state)}`}
                >
                  {state === "done" ? "✓" : i + 1}
                </span>
                {!isLast ? (
                  <span
                    className={`mt-1 w-0.5 flex-1 min-h-[1.75rem] rounded-full ${connectorClass(connectorActive)}`}
                    aria-hidden
                  />
                ) : null}
              </div>
              <div className={`min-w-0 flex-1 ${isLast ? "pb-0" : "pb-5"}`}>
                <p
                  className={`text-sm font-semibold leading-snug ${
                    state === "upcoming" ? "text-gray-600" : "text-gray-900"
                  }`}
                >
                  {ORDER_STATUS_LABEL[step]}
                </p>
                {ts ? (
                  <p className="mt-0.5 text-xs text-gray-600">{formatDate(ts)}</p>
                ) : state === "current" ? (
                  <p className="mt-0.5 text-xs font-medium text-blue-700">In progress</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Tablet/desktop: horizontal stepper */}
      <div className="hidden sm:flex sm:items-start">
        {FLOW.map((step, i) => {
          const state = states[i];
          const ts = stepTimestamp(order, step, state);
          const prevDone = i > 0 && states[i - 1] === "done";
          const lineActive = state === "done" || prevDone;

          return (
            <div key={step} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                {i > 0 ? (
                  <span className={`h-0.5 flex-1 ${connectorClass(lineActive)}`} aria-hidden />
                ) : (
                  <span className="flex-1" aria-hidden />
                )}

                <span
                  className={`mx-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${dotClass(state)}`}
                >
                  {state === "done" ? "✓" : i + 1}
                </span>

                {i < FLOW.length - 1 ? (
                  <span
                    className={`h-0.5 flex-1 ${connectorClass(state === "done")}`}
                    aria-hidden
                  />
                ) : (
                  <span className="flex-1" aria-hidden />
                )}
              </div>

              <div className="mt-2 px-1 text-center">
                <p
                  className={`text-xs font-semibold leading-snug ${
                    state === "upcoming" ? "text-gray-600" : "text-gray-900"
                  }`}
                >
                  {ORDER_STATUS_LABEL[step]}
                </p>
                {ts ? (
                  <p className="mt-0.5 text-[10px] text-gray-600">{formatDate(ts)}</p>
                ) : state === "current" ? (
                  <p className="mt-0.5 text-[10px] font-medium text-blue-700">In progress</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {isCancelled ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-[12px] text-white md:h-6 md:w-6 md:text-[10px]">
            ✕
          </span>
          <div>
            <p className="text-sm font-bold text-red-700 md:text-xs">{ORDER_STATUS_LABEL.cancelled}</p>
            {historyTime(ORDER_STATUS.CANCELLED, order.statusHistory) ? (
              <p className="text-[12px] text-red-600 md:text-[10px]">
                {formatDate(historyTime(ORDER_STATUS.CANCELLED, order.statusHistory)!)}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {isRefunded ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-500 text-[12px] text-white md:h-6 md:w-6 md:text-[10px]">
            ↩
          </span>
          <div>
            <p className="text-sm font-bold text-slate-700 md:text-xs">{ORDER_STATUS_LABEL.refunded}</p>
            {historyTime(ORDER_STATUS.REFUNDED, order.statusHistory) ? (
              <p className="text-[12px] text-slate-600 md:text-[10px]">
                {formatDate(historyTime(ORDER_STATUS.REFUNDED, order.statusHistory)!)}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {order.trackingNumber ? (
        <p className="mt-4 rounded-lg bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">
          Tracking number: {order.trackingNumber}
        </p>
      ) : null}
    </div>
  );
}
