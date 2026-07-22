"use client";

import { NAV_MENUS } from "@/lib/data";
import { type } from "@/lib/theme";
import StoreImage from "./StoreImage";

interface MegaMenuProps {
  section: string;
  onClose: () => void;
}

export default function MegaMenu({ section, onClose }: MegaMenuProps) {
  const data = NAV_MENUS[section];
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 gap-8 font-sans md:grid-cols-[1fr_1fr_1fr_auto]">
      <div>
        <ColLabel>Featured</ColLabel>
        {data.featured.map((item) => (
          <MenuLink key={item} onClick={onClose}>{item}</MenuLink>
        ))}
        {data.apparel.length > 0 && (
          <>
            <ColLabel className="mt-5">Services</ColLabel>
            {data.apparel.map((item) => (
              <MenuLink key={item} onClick={onClose} muted>{item}</MenuLink>
            ))}
          </>
        )}
      </div>

      <div>
        <ColLabel>Categories</ColLabel>
        {data.shoes.map((item) => (
          <MenuLink key={item} onClick={onClose} muted>{item}</MenuLink>
        ))}
      </div>

      <div>
        {data.favorites.length > 0 && (
          <>
            <ColLabel>Customer Favorites</ColLabel>
            {data.favorites.map((item) => (
              <MenuLink key={item} onClick={onClose} muted>{item}</MenuLink>
            ))}
          </>
        )}
      </div>

      <div className="flex gap-3">
        {data.imgs.map((img) => (
          <button
            key={img.label}
            type="button"
            onClick={onClose}
            className="w-[148px] overflow-hidden rounded-2xl border border-accent/15 bg-accent-soft/30 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
          >
            <StoreImage src={img.url} alt={img.label} className="block h-[110px] w-full object-cover" />
            <div className="px-3 pb-3 pt-2.5">
              <div className="text-[12.5px] font-semibold text-primary">{img.label}</div>
              <div className="mt-0.5 text-[11px] font-bold text-accent">{img.price}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ColLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mb-3 ${type.eyebrow} text-[10px] tracking-[0.13em] text-accent ${className}`}>
      {children}
    </div>
  );
}

function MenuLink({ children, onClick, muted }: { children: React.ReactNode; onClick: () => void; muted?: boolean }) {
  return (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className={`block py-1.5 text-[13px] leading-normal transition-colors hover:text-accent ${
        muted ? "font-normal text-muted" : "font-semibold text-primary"
      }`}
    >
      {children}
    </a>
  );
}
