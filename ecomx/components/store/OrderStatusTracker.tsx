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

export default function OrderStatusTracker({ order }: { order: ApiOrder }) {
  const states = stepStates(order);
  const isCancelled = order.status === ORDER_STATUS.CANCELLED;
  const isRefunded = order.status === ORDER_STATUS.REFUNDED;

  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <h2 className="mb-4 text-base font-bold text-gray-900 sm:text-sm">Order Tracking</h2>

      {isCancelled ? (
        <p className="mb-4 text-sm md:text-xs font-medium text-muted">This order was cancelled.</p>
      ) : null}
      {isRefunded ? (
        <p className="mb-4 text-sm md:text-xs font-medium text-muted">This order has been refunded.</p>
      ) : null}

      <div className="flex flex-col sm:flex-row sm:items-start">
        {FLOW.map((step, i) => {
          const state = states[i];
          const ts = stepTimestamp(order, step, state);
          const prevDone = i > 0 && states[i - 1] === "done";
          const lineActive = state === "done" || prevDone;

          return (
            <div key={step} className="flex flex-1 sm:flex-col sm:items-center">
              <div className="flex items-center sm:w-full sm:justify-center">
                {i > 0 ? (
                  <span
                    className={`hidden h-0.5 flex-1 sm:block ${
                      lineActive ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                ) : null}

                <div className="flex items-center gap-3 sm:flex-col sm:gap-2">
                  <span
                    className={`flex h-9 w-9 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-full text-sm md:text-xs font-bold ${
                      state === "done"
                        ? "bg-blue-600 text-white"
                        : state === "current"
                          ? "border-2 border-blue-600 bg-blue-50 text-blue-700"
                          : "border-2 border-gray-200 bg-white text-gray-400"
                    }`}
                  >
                    {state === "done" ? "✓" : i + 1}
                  </span>

                  <div className="min-w-0 pb-4 sm:pb-0 sm:text-center">
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
                </div>

                {i < FLOW.length - 1 ? (
                  <span
                    className={`ml-3 w-0.5 self-stretch sm:hidden ${
                      state === "done" ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                ) : null}

                {i < FLOW.length - 1 ? (
                  <span
                    className={`hidden h-0.5 flex-1 sm:block ${
                      state === "done" ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {isCancelled ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2">
          <span className="flex h-7 w-7 md:h-6 md:w-6 items-center justify-center rounded-full bg-red-500 text-[12px] md:text-[10px] text-white">
            ✕
          </span>
          <div>
            <p className="text-sm md:text-xs font-bold text-red-700">{ORDER_STATUS_LABEL.cancelled}</p>
            {historyTime(ORDER_STATUS.CANCELLED, order.statusHistory) ? (
              <p className="text-[12px] md:text-[10px] text-red-600">
                {formatDate(historyTime(ORDER_STATUS.CANCELLED, order.statusHistory)!)}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {isRefunded ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2">
          <span className="flex h-7 w-7 md:h-6 md:w-6 items-center justify-center rounded-full bg-slate-500 text-[12px] md:text-[10px] text-white">
            ↩
          </span>
          <div>
            <p className="text-sm md:text-xs font-bold text-slate-700">{ORDER_STATUS_LABEL.refunded}</p>
            {historyTime(ORDER_STATUS.REFUNDED, order.statusHistory) ? (
              <p className="text-[12px] md:text-[10px] text-slate-600">
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
