"use client";

import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { useFooterContentPages } from "@/hooks/useContentPages";
import { FIXED_CONTENT_PAGE_RESOURCES } from "@/lib/admin/content-page-resources";
import { ROUTES } from "@/lib/routes";
import { tw } from "@/lib/theme";
import { Phone, Mail, MapPin, Clock, Lock, ShieldCheck, BadgeCheck } from "lucide-react";

const linkClass =
  "block text-[13px] md:text-[11.5px] text-white/50 no-underline hover:text-white transition-colors";

const sectionTitleClass =
  "mb-3 text-[12px] md:text-[10px] font-bold uppercase tracking-[0.14em] text-white/35";

export default function Footer() {
  const { data } = useFooterContentPages();
  const pagesBySlug = Object.fromEntries(
    (data?.contentPages ?? []).map((page) => [page.slug, page])
  );

  const footerLinks = FIXED_CONTENT_PAGE_RESOURCES.map((resource) => {
    const page = pagesBySlug[resource.slug];
    return {
      slug: resource.slug,
      label: page?.footerLabel?.trim() || page?.title || resource.menuLabel,
      href: resource.storeRoute,
    };
  });

  const pageHref = (slug: string) =>
    footerLinks.find((l) => l.slug === slug)?.href ?? ROUTES.page(slug);

  const pageLabel = (slug: string, fallback: string) =>
    footerLinks.find((l) => l.slug === slug)?.label ?? fallback;

  return (
    <footer className="text-white" style={{ background: "#0a1731ff" }}>
      <div className={`${tw.storeContainer} pt-8 pb-5`}>
        <div className="mb-5 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href={ROUTES.home}
              className="mb-3 inline-flex transition-opacity hover:opacity-90"
              aria-label="Skynet Solution home"
            >
              <BrandLogo
                height={64}
                variant="footer"
                alt="Skynet Solution"
                imgClassName="max-w-[200px] sm:max-w-[220px]"
              />
            </Link>
            <p className="mb-3 max-w-[260px] text-[13px] md:text-[11.5px] leading-relaxed text-white/45">
              POS hardware, software, and IT solutions for businesses in Qatar.
            </p>
            <div className="flex gap-2">
              {[
                {
                  title: "Facebook",
                  href: "#",
                  icon: (
                    <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ),
                },
                {
                  title: "LinkedIn",
                  href: "#",
                  icon: (
                    <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.45 1.45 0 0 0 1.45-1.45 1.45 1.45 0 0 0-1.45-1.45 1.45 1.45 0 0 0-1.45 1.45 1.45 1.45 0 0 0 1.45 1.45m1.39 9.74v-8.37H5.07v8.37h2.78z" />
                    </svg>
                  ),
                },
                {
                  title: "Instagram",
                  href: "#",
                  icon: (
                    <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ),
                },
              ].map((s) => (
                <a
                  key={s.title}
                  href={s.href}
                  title={s.title}
                  aria-label={s.title}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/40 no-underline transition-colors hover:border-slate-400/50 hover:text-slate-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Store */}
          <div>
            <div className={sectionTitleClass}>STORE</div>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href={ROUTES.shop} className={linkClass}>
                  Shop
                </Link>
              </li>
              <li>
                <Link href={ROUTES.orders} className={linkClass}>
                  My Orders
                </Link>
              </li>
              <li>
                <Link href={ROUTES.account} className={linkClass}>
                  My Account
                </Link>
              </li>
              <li>
                <Link href={pageHref("faq")} className={linkClass}>
                  {pageLabel("faq", "FAQ")}
                </Link>
              </li>
              <li>
                <Link href={pageHref("terms-and-conditions")} className={linkClass}>
                  {pageLabel("terms-and-conditions", "Terms & Conditions")}
                </Link>
              </li>
              <li>
                <Link href={pageHref("cancellation-policy")} className={linkClass}>
                  {pageLabel("cancellation-policy", "Cancellation Policy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className={sectionTitleClass}>CONTACT</div>
            <ul className="flex flex-col gap-2.5">
              <li className="flex items-start gap-2 text-[13px] md:text-[11.5px] text-white/50">
                <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/40" />
                <a
                  href="tel:+97444311525"
                  className="no-underline text-white/50 transition-colors hover:text-white"
                >
                  +974 4431 1525
                </a>
              </li>
              <li className="flex items-start gap-2 text-[13px] md:text-[11.5px] text-white/50">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/40" />
                <a
                  href="mailto:info@skynetintegration.com"
                  className="no-underline text-white/50 transition-colors hover:text-white"
                >
                  info@skynetintegration.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-[13px] md:text-[11.5px] text-white/50">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/40" />
                <span>Doha, Qatar</span>
              </li>
              <li className="flex items-start gap-2 text-[13px] md:text-[11.5px] text-white/50">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/40" />
                <span>Mon – Sat 8AM – 6PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/8 py-2.5">
          {[
            { icon: Lock, text: "Secure checkout" },
            { icon: ShieldCheck, text: "Qatar VAT certified" },
            { icon: BadgeCheck, text: "Trusted supplier" },
          ].map(({ icon: Icon, text }) => (
            <span key={text} className="flex items-center gap-1.5 text-[12px] md:text-[10px] text-white/30">
              <Icon className="h-3.5 w-3.5 shrink-0 text-white/40" />
              {text}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-white/8 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[12px] md:text-[10.5px] text-white/25">
            © {new Date().getFullYear()} Skynet Solution Qatar. All rights reserved.
          </div>
          <nav
            aria-label="Footer policies"
            className="flex flex-wrap items-center gap-x-1 gap-y-2 text-[12px] md:text-[10.5px] text-white/25"
          >
            {footerLinks.map((link, index) => (
              <span key={link.slug} className="inline-flex items-center">
                {index > 0 ? (
                  <span className="mx-2 hidden text-white/15 sm:inline" aria-hidden="true">
                    |
                  </span>
                ) : null}
                <Link
                  href={link.href}
                  className="no-underline text-white/25 transition-colors hover:text-white/60"
                >
                  {link.label}
                </Link>
              </span>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
