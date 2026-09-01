import { BarChart3, ShieldCheck, ShoppingBag } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const features = [
  {
    icon: ShoppingBag,
    title: "Store Management",
    description: "Products, orders, and inventory in one place.",
  },
  {
    icon: BarChart3,
    title: "Live Analytics",
    description: "Track sales, customers, and performance instantly.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Access",
    description: "Role-based control for admin and team members.",
  },
];

export function AuthBrandPanel() {
  return (
    <>
      {/* Desktop brand panel */}
      <aside className="relative hidden w-[44%] max-w-[560px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#061a3d] via-[#0a255d] to-[#0f3460] px-10 py-12 lg:flex xl:px-14">
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/[0.07] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-80 w-80 rounded-full bg-[#3b82f6]/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:40px_40px]" />

        <div className="relative">
          <div className="mb-10">
            <BrandLogo
              height={56}
              variant="footer"
              priority
              alt="Skynet Solution"
              imgClassName="max-w-[260px] object-left"
            />
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
              Management Suite
            </p>
          </div>

          <h2 className="max-w-[320px] font-display text-[32px] font-bold leading-[1.15] text-white xl:text-[36px]">
            Run your store with confidence.
          </h2>
          <p className="mt-4 max-w-[340px] text-[15px] leading-relaxed text-white/60">
            Sign in to manage products, orders, customers, and everything your business needs.
          </p>
        </div>

        <ul className="relative space-y-5">
          {features.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex items-start gap-3.5">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/90 ring-1 ring-white/15">
                <Icon className="h-4 w-4" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-0.5 text-[13px] leading-snug text-white/50">{description}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="relative text-xs text-white/30">© Skynet Solution Qatar</p>
      </aside>

      {/* Mobile brand strip */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#061a3d] via-[#0a255d] to-[#0f3460] px-6 py-8 text-center lg:hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.12),transparent_60%)]" />
        <BrandLogo
          height={52}
          variant="footer"
          priority
          alt="Skynet Solution"
          className="mx-auto"
          imgClassName="max-w-[240px] object-left"
        />
        <p className="relative mt-3 text-xs uppercase tracking-[0.16em] text-white/50">Management Suite</p>
      </div>
    </>
  );
}
