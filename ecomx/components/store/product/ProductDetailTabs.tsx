"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";

const TABS = ["Description", "Specifications", "Downloads", "Support"] as const;
type Tab = (typeof TABS)[number];

interface ProductDetailTabsProps {
  product: Product;
  productSpecs: { label: string; value: string }[];
  productHighlights: string[];
}

export default function ProductDetailTabs({
  product,
  productSpecs,
  productHighlights,
}: ProductDetailTabsProps) {
  const [tab, setTab] = useState<Tab>("Description");

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white px-4 shadow-sm sm:px-6 md:px-8">
      <div className="flex overflow-x-auto border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`relative shrink-0 px-3 py-3 sm:px-5 sm:py-3.5 border-0 cursor-pointer text-[14px] sm:text-[13px] font-semibold transition-colors ${
              tab === t
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
            {tab === t ? (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t bg-blue-600" />
            ) : null}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 py-6 lg:grid-cols-[1fr_220px]">
        <div className="text-[13.5px] leading-relaxed text-gray-700">
          {tab === "Description" ? (
            <p className="mb-2 font-medium text-gray-800">{product.description}</p>
          ) : null}
          {tab === "Specifications" ? (
            productSpecs.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {productSpecs.map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex flex-col gap-0.5 rounded-lg bg-gray-50 px-3 py-2.5"
                  >
                    <span className="text-[11px] md:text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      {label}
                    </span>
                    <span className="text-[13px] font-medium text-gray-800">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No specifications available for this product.
              </p>
            )
          ) : null}
          {tab === "Downloads" ? (
            <div className="flex flex-col gap-3">
              {[
                "Product Datasheet",
                "Quick Start Guide",
                "Warranty Certificate",
                "VAT Compliance Certificate",
              ].map((doc) => (
                <div
                  key={doc}
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
                >
                  <span className="flex items-center gap-2 text-[13px] font-medium text-gray-700">
                    <span className="text-blue-600">📄</span> {doc}
                  </span>
                  <button
                    type="button"
                    className="cursor-pointer border-0 bg-transparent text-[13px] md:text-[12px] font-bold text-blue-600 hover:underline"
                  >
                    Download PDF
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          {tab === "Support" ? (
            <ul className="flex flex-col gap-3">
              {[
                "Call +974 4431 1525 for 24/7 technical support",
                "Remote desktop support available for software issues",
                "On-site engineer visits for hardware faults (Doha)",
                "Replacement units within 24 hours under warranty",
                "Annual Maintenance Contracts (AMC) available",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2.5">
                  <svg
                    className="mt-0.5 h-5 w-5 md:h-4 md:w-4 shrink-0 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                  {tip}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* Feature bullets — right col */}
        {productHighlights.length > 0 ? (
          <div className="hidden lg:flex flex-col gap-2">
            {productHighlights.map((f) => (
              <div
                key={f}
                className="flex items-center gap-2 text-[12.5px] text-gray-700"
              >
                <svg
                  className="h-3.5 w-3.5 shrink-0 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                {f}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
