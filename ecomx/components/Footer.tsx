"use client";

export default function Footer() {
  return (
    <footer className="text-white" style={{ background: "#0a1731ff" }}>
      <div className="mx-auto max-w-[1440px] px-3 sm:px-5 md:px-8 lg:px-[50px] pt-10 pb-6">
        {/* Main grid — Brand + 5 columns */}
        <div  className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-[200px_1fr_1fr_1fr_1fr_200px] lg:mb-8">

          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="mb-0.5 font-display text-[22px] font-bold text-white">
              Skynet<span className="text-sm text-slate-400">™</span>
            </div>
            <p className="mb-4 max-w-[200px] text-[11.5px] leading-relaxed text-white/45">
              Qatar&apos;s leading POS hardware, ERP software, and IT solutions provider. Trusted by 1,000+ businesses across Qatar.
            </p>
            {/* Social icons */}
            <div className="flex gap-2">
              {[
                { label: "f", title: "Facebook" },
                { label: "in", title: "LinkedIn" },
                { label: "▣", title: "Instagram" },
                { label: "▶", title: "YouTube" },
              ].map(s => (
                <a key={s.label} href="#" title={s.title}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-[10px] font-bold text-white/40 no-underline transition-colors hover:border-slate-400/50 hover:text-slate-200"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">PRODUCTS</div>
            <ul className="flex flex-col gap-2">
              {["POS Systems", "Printers", "Scanners", "CCTV & Security", "Displays", "Software"].map(l => (
                <li key={l}><a href="#" className="block text-[11.5px] text-white/50 no-underline hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">SOLUTIONS</div>
            <ul className="flex flex-col gap-2">
              {["Retail POS", "Restaurant POS", "Pharmacy POS", "Supermarket ERP", "Cloud ERP", "HR Software"].map(l => (
                <li key={l}><a href="#" className="block text-[11.5px] text-white/50 no-underline hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">SUPPORT</div>
            <ul className="flex flex-col gap-2">
              {["Help Center", "Installation Guide", "Warranty Claims", "Track Order", "Contact Us", "Book Demo"].map(l => (
                <li key={l}><a href="#" className="block text-[11.5px] text-white/50 no-underline hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">COMPANY</div>
            <ul className="flex flex-col gap-2">
              {["About Us", "Careers", "Blog", "Partner Program", "Terms & Conditions"].map(l => (
                <li key={l}><a href="#" className="block text-[11.5px] text-white/50 no-underline hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">CONTACT</div>
            <ul className="flex flex-col gap-2.5">
              <li className="flex items-start gap-2 text-[11.5px] text-white/50">
                <span className="mt-0.5 shrink-0 text-white/40">📞</span>
                <a href="tel:+97444311525" className="no-underline text-white/50 hover:text-white transition-colors">+974 4431 1525</a>
              </li>
              <li className="flex items-start gap-2 text-[11.5px] text-white/50">
                <span className="mt-0.5 shrink-0 text-white/40">✉</span>
                <a href="mailto:info@skynetintegration.com" className="no-underline text-white/50 hover:text-white transition-colors">info@skynetintegration.com</a>
              </li>
              <li className="flex items-start gap-2 text-[11.5px] text-white/50">
                <span className="mt-0.5 shrink-0 text-white/40">📍</span>
                <span>Doha, Qatar</span>
              </li>
              <li className="flex items-start gap-2 text-[11.5px] text-white/50">
                <span className="mt-0.5 shrink-0 text-white/40">🕐</span>
                <span>Mon – Sat 8AM – 6PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust badges + payment row */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 py-3">
          <div className="flex flex-wrap items-center gap-4">
            {[
              { icon: "🏆", text: "Qatar VAT Certified" },
              { icon: "✅", text: "ISO 9001:2015" },
              { icon: "🔒", text: "PCI-DSS Compliant" },
              { icon: "◉", text: "atACC Authorized" },
              { icon: "🔐", text: "100% Secure Payments" },
            ].map(b => (
              <span key={b.text} className="flex items-center gap-1 text-[10px] text-white/30">
                <span>{b.icon}</span> {b.text}
              </span>
            ))}
          </div>
          {/* Payment icons */}
          <div className="flex items-center gap-1.5">
            {/* VISA */}
            <div className="flex h-6 w-10 items-center justify-center rounded border border-white/15 bg-white/5">
              <span className="font-bold text-[9px] text-blue-400 tracking-tight">VISA</span>
            </div>
            {/* Mastercard */}
            <div className="flex h-6 w-10 items-center justify-center rounded border border-white/15 bg-white/5">
              <span className="text-[9px] font-bold text-white/50">MC</span>
            </div>
            {/* Mada */}
            <div className="flex h-6 w-10 items-center justify-center rounded border border-white/15 bg-white/5">
              <span className="text-[9px] font-bold text-white/50">mada</span>
            </div>
            {/* Amex */}
            <div className="flex h-6 w-10 items-center justify-center rounded border border-white/15 bg-white/5">
              <span className="text-[9px] font-bold text-white/50">AMEX</span>
            </div>
            {/* KNET */}
            <div className="flex h-6 w-10 items-center justify-center rounded border border-white/15" style={{ background: "#1a3fae" }}>
              <span className="text-[9px] font-bold text-white">KNET</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-3">
          <div className="text-[10.5px] text-white/25">
            © 2025 Skynet Solution Qatar. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[10.5px] text-white/25">
            <a href="#" className="no-underline text-white/25 hover:text-white/60 transition-colors">Privacy Policy</a>
            <a href="#" className="no-underline text-white/25 hover:text-white/60 transition-colors">Terms</a>
            <a href="#" className="no-underline text-white/25 hover:text-white/60 transition-colors">Warranty</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
