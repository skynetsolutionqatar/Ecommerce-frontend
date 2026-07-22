"use client";

import { type } from "@/lib/theme";

const MARQUEE_ITEMS = [
  { icon: "🖥️", text: "Qatar VAT Compliant" },
  { icon: "📊", text: "atACC ERP Integration" },
  { icon: "🔒", text: "Secure POS Software" },
  { icon: "🌐", text: "Cloud-Based Backup" },
  { icon: "📱", text: "Arabic + English UI" },
  { icon: "⚡", text: "24/7 Technical Support" },
  { icon: "🖨️", text: "All Brands Supported" },
  { icon: "💳", text: "All Payment Methods" },
];

// Duplicate for seamless infinite loop
const ALL_ITEMS = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

export default function MarqueeSection() {
  return (
    <div className="relative overflow-hidden border-y border-border bg-footer py-4">
      {/* Left fade */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-footer to-transparent" />
      {/* Right fade */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-footer to-transparent" />

      {/* Scrolling strip */}
      <div className="flex w-max animate-marquee items-center">
        {ALL_ITEMS.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2.5 whitespace-nowrap px-8"
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span className={`${type.eyebrow} text-[12px] font-semibold tracking-[0.08em] text-accent`}>
              {item.text}
            </span>
            <span className="ml-2 text-xs text-accent/40">
              ◆
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
