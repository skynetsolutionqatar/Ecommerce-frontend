"use client";
import * as Icons from "./Icons";
import { tw, type } from "@/lib/theme";

const FEATURES = [
  { icon: <Icons.Shield />, title: "Qatar VAT Certified", desc: "All hardware and software solutions are fully Qatar VAT compliant. Generate VAT returns in minutes — not days." },
  { icon: <Icons.Zap />, title: "24/7 Technical Support", desc: "Our local Doha-based support team is available 24/7 for hardware service, software issues, and emergency replacements." },
  { icon: <Icons.Package />, title: "Same-Day Delivery", desc: "Products in stock are dispatched within 4 hours in Doha. Installation service available on the same day." },
  { icon: <Icons.Recycle />, title: "1-Year Hardware Warranty", desc: "All POS hardware comes with a full 1-year parts and labour warranty, serviced in Qatar by certified engineers." },
  { icon: <Icons.Truck />, title: "Free Installation & Setup", desc: "Professional hardware installation, software configuration, and staff training included with every POS system purchase." },
  { icon: <Icons.Leaf />, title: "atACC ERP Integration", desc: "Seamless integration with atACC ERP — accounting, inventory, CRM, HR, and multi-branch management out of the box." },
];

export default function FeaturesSection() {
  return (
    <section className={`py-24 ${tw.sectionBg}`}>
      <div className="w-full">
        <div className="mb-16 text-center">
          <div className={`mb-4 ${type.eyebrow} text-[11px] text-accent`}>
            Why Skynet Solution
          </div>
          <h2 className="font-display text-[clamp(36px,4vw,52px)] font-bold leading-tight text-primary">
            Qatar&apos;s Trusted POS &amp;<br />
            <span className="italic text-accent">ERP Partner Since 2012.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} feature={f} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature, delay }: { feature: typeof FEATURES[number]; delay: number }) {
  return (
    <div
      className={`rounded-3xl border border-border bg-white p-7 shadow-[0_4px_24px_color-mix(in_srgb,var(--color-primary)_5%,transparent)] transition-transform duration-300 hover:-translate-y-1 animate-fade-up [animation-delay:${delay}s]`}
    >
      <div className="mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-gradient-to-br from-accent-soft to-accent-light/40 text-accent shadow-[0_4px_16px_color-mix(in_srgb,var(--color-accent)_20%,transparent)]">
        {feature.icon}
      </div>
      <h3 className="mb-2.5 text-[17px] font-bold text-primary">{feature.title}</h3>
      <p className="text-sm leading-relaxed text-muted">{feature.desc}</p>
    </div>
  );
}
