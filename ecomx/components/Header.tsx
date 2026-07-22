"use client";

import { useState, useEffect, useRef, JSX } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "./Icons";
import type { CartItem, WishlistItem, StoreUser } from "@/lib/types";
import Avatar from "./Avatar";
import { useClientTheme } from "./ThemeProvider";
import { HERO_CATEGORY_STRIP } from "@/lib/data";
import { Colors, type, tw } from "@/lib/theme";

interface HeaderProps {
  cart: CartItem[];
  wishlist: WishlistItem[];
  onCartOpen: () => void;
  onWishlistOpen: () => void;
  onSearchOpen: () => void;
  onLoginOpen: () => void;
  onLogout?: () => void;
  user?: StoreUser | null;
  page: string;
  setPage: (p: string) => void;
  onNavigateHome: () => void;
}

const SEARCH_CATEGORIES = [
  "POS Systems", "Printers", "Scanners", "Software & ERP",
  "Networking", "Laptops & PCs", "Security & CCTV", "UPS & Power",
];

const NAV_LINKS = [
  { label: "Products", page: "shop" },
  { label: "Solutions", page: "shop" },
  { label: "Deals", page: "shop" },
  { label: "Support", page: "support" },
  { label: "Orders", page: "orders" },
];

// ── Category SVG Icons ────────────────────────────────────────────────────────
const CategoryIcons: Record<string, JSX.Element> = {
  "CCTV & Security": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  "Networking": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  ),
  "POS Systems": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  "Computers": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  "Printers": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <polyline points="6,9 6,2 18,2 18,9" /><rect x="6" y="14" width="12" height="8" />
      <rect x="2" y="9" width="20" height="10" rx="2" /><line x1="6" y1="14" x2="18" y2="14" />
    </svg>
  ),
  "Scanners": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  ),
  "Software & ERP": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <polyline points="16,18 22,12 16,6" /><polyline points="8,6 2,12 8,18" />
    </svg>
  ),
  "Displays": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  "Servers & Storage": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  ),
  "Access Control": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  "UPS & Power": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
    </svg>
  ),
  "Mobile Computers": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  "More": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
};

export default function Header({
  cart, wishlist,
  onCartOpen, onWishlistOpen, onSearchOpen, onLoginOpen, onLogout,
  user, setPage, onNavigateHome,
}: HeaderProps) {
  const { client } = useClientTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catVisible, setCatVisible] = useState(true);
  const [hintIdx, setHintIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [catDropOpen, setCatDropOpen] = useState(false);
  const lastScrollY = useRef(0);
  const swapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      swapTimerRef.current = setTimeout(() => {
        setHintIdx((i) => (i + 1) % SEARCH_CATEGORIES.length);
        setVisible(true);
      }, 550);
    }, 2500);
    return () => {
      clearInterval(interval);
      if (swapTimerRef.current) clearTimeout(swapTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const setH = (full: boolean) => {
      document.documentElement.style.setProperty("--header-height", full ? "138px" : "78px");
    };
    const fn = () => {
      const y = window.scrollY;
      if (y <= 10) { setScrolled(false); setCatVisible(true); setH(true); }
      else {
        setScrolled(true);
        if (y > lastScrollY.current + 4) { setCatVisible(false); setH(false); }
        else if (y < lastScrollY.current - 4) { setCatVisible(true); setH(true); }
      }
      lastScrollY.current = y;
    };
    setH(true);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", mobileOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [mobileOpen]);

  const cats = [...HERO_CATEGORY_STRIP, { label: "More Categories", img: "", shopCategory: "" }];

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-[150]">

        {/* ── Top Promo Bar ── */}
        <div className="flex items-center justify-between py-1" style={{ background: `${Colors.base_color}` }}>
          <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-3 sm:px-5 md:px-8 lg:px-[50px]">
            <div className="flex items-center gap-5 text-[11px] text-white/85">
              <span className="flex items-center gap-1.5">🚚 Free Delivery on orders over QAR 299</span>
              <span className="hidden sm:flex items-center gap-1.5">🔒 Secure Payments</span>
              <span className="hidden md:flex items-center gap-1.5">🛡️ Official Warranty</span>
              <span className="hidden lg:flex items-center gap-1.5">🎧 Expert Support</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-white/85">
              <button type="button" className="flex items-center gap-1 hover:text-white transition-colors bg-transparent border-0 cursor-pointer">English ▾</button>
              <span className="text-white/85">|</span>
              <button type="button" className="flex items-center gap-1 hover:text-white transition-colors bg-transparent border-0 cursor-pointer">QAR ▾</button>
            </div>
          </div>
        </div>

        {/* ── Main Header ── */}
        <div
          className="border-b border-gray-200 bg-white"
          style={{ boxShadow: scrolled ? "0 2px 12px rgba(0,0,0,0.08)" : "0 1px 3px rgba(0,0,0,0.04)" }}
        >
          <div className="mx-auto flex max-w-[1440px] items-center gap-3 py-1.5 px-3 sm:px-5 md:px-8 md:gap-4 lg:px-[50px]">

            {/* Logo */}
            <motion.button type="button" onClick={onNavigateHome}
              className="flex shrink-0 cursor-pointer flex-col items-start border-0 bg-transparent p-0"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >
              <span className="font-display text-[20px] font-extrabold leading-none tracking-tight text-gray-900 sm:text-[22px]">
                {client.name.split(" ")[0]}<span className="text-[11px] font-black text-gray-400">™</span>
              </span>
              <span className={`hidden ${type.eyebrow} text-[7px] tracking-[0.22em] text-gray-400 sm:block`}>{client.tagline}</span>
            </motion.button>

            {/* All Categories Dropdown */}
            <div className="relative hidden md:block shrink-0">
              <motion.button type="button" onClick={() => setCatDropOpen(v => !v)}
                className="flex items-center gap-2 rounded-md px-3 py-2 font-label text-[12.5px] font-semibold text-white whitespace-nowrap"
                style={{ background: `${Colors.base_color}` }}
                whileHover={{ background: "#334155" }} whileTap={{ scale: 0.97 }}
              >
                <Icons.Menu />
                All Categories
                <motion.span animate={{ rotate: catDropOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <Icons.ChevronDown />
                </motion.span>
              </motion.button>
              <AnimatePresence>
                {catDropOpen && (
                  <motion.div
                    className="absolute top-full left-0 z-50 mt-1 w-[200px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.16 }} onMouseLeave={() => setCatDropOpen(false)}
                  >
                    {HERO_CATEGORY_STRIP.map((cat) => (
                      <button key={cat.label} type="button"
                        onClick={() => { setPage("shop"); setCatDropOpen(false); }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[12.5px] font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 border-0 bg-transparent cursor-pointer transition-colors"
                      >
                        <span className="text-gray-500 w-4 h-4 flex-shrink-0">
                          {CategoryIcons[cat.label] ?? <Icons.Grid />}
                        </span>
                        {cat.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search */}
            <motion.button type="button" onClick={onSearchOpen}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-left transition-all hover:border-blue-400 hover:ring-1 hover:ring-blue-400 cursor-text"
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            >
              <span className="hidden min-w-0 flex-1 items-center text-[12.5px] text-gray-400 min-[480px]:flex">
                <span className="shrink-0">Search for products, brands and more...</span>
              </span>
              <span className="flex-1 text-[12px] text-gray-400 min-[480px]:hidden">Search...</span>
              <span className="hidden shrink-0 items-center justify-center rounded-md w-10 h-9 text-white sm:flex" style={{ background: `${Colors.base_color}` }}>
                <Icons.Search />
              </span>
            </motion.button>

            {/* Desktop Actions */}
            <div className="flex shrink-0 items-center gap-1">
              <motion.button type="button" onClick={onLoginOpen}
                className="hidden items-center gap-1.5 rounded-md border border-gray-200 bg-transparent px-3 py-2 font-label text-[12px] font-medium text-gray-700 md:flex hover:bg-gray-50 transition-all"
                whileTap={{ scale: 0.97 }}
              >
                {user ? <Avatar name={user.name} size={18} imageUrl={user.avatarUrl} className="border-0 shadow-none" /> : <Icons.User />}
                <span className="hidden md:inline">{user ? user.name.split(" ")[0] : "Login / Signup"}</span>
              </motion.button>

              <motion.button type="button" onClick={onWishlistOpen}
                className="relative hidden items-center gap-1.5 rounded-md border border-gray-200 bg-transparent px-3 py-2 font-label text-[12px] font-medium text-gray-700 sm:flex hover:bg-gray-50 transition-all"
                whileTap={{ scale: 0.97 }}
              >
                <Icons.Heart filled={wishlist.length > 0} />
                <span className="hidden lg:inline">Wishlist</span>
                <AnimatePresence>
                  {wishlist.length > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white"
                    >{wishlist.length > 9 ? "9+" : wishlist.length}</motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Compare */}
              <motion.button type="button"
                className="hidden items-center gap-1.5 rounded-md border border-gray-200 bg-transparent px-3 py-2 font-label text-[12px] font-medium text-gray-700 lg:flex hover:bg-gray-50 transition-all"
                whileTap={{ scale: 0.97 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                <span>Compare</span>
              </motion.button>

              <motion.button type="button" onClick={onCartOpen}
                className="relative flex items-center gap-1.5 rounded-md border border-gray-200 bg-transparent px-3 py-2 font-label text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition-all"
                whileTap={{ scale: 0.97 }}
              >
                <Icons.Bag />
                <span className="hidden lg:inline">Cart</span>
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white"
                    >{cartCount > 9 ? "9+" : cartCount}</motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <motion.button type="button" onClick={() => setMobileOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-700 md:hidden hover:bg-gray-50 transition-all"
                whileTap={{ scale: 0.93 }} aria-label="Open menu"
              >
                <Icons.Menu />
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── Category Icon Strip ── */}
        <motion.div
          className="overflow-hidden border-b border-gray-200 bg-white"
          animate={{ height: catVisible ? "auto" : 0, opacity: catVisible ? 1 : 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="mx-auto w-full max-w-[1440px] px-3 sm:px-5 md:px-8 lg:px-[50px]">
            <div className={`flex items-center overflow-x-auto scroll-smooth ${tw.scrollbarHide} justify-between p-1`}>
              {cats.map((cat, i) => (
                <motion.button
                  key={`${cat.label}-${i}`}
                  type="button"
                  onClick={() => setPage("shop")}
                  className="group flex shrink-0 flex-col items-center gap-0.5 border-0 bg-transparent px-3 py-1 cursor-pointer md:px-4"
                  whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }}
                >
                  <span className="text-gray-600 transition-colors group-hover:text-blue-600" style={{ lineHeight: 1 }}>
                    {cat.label === "More Categories"
                      ? <span className="flex h-5 w-5 items-center justify-center">{CategoryIcons["More"]}</span>
                      : <span className="flex h-5 w-5 items-center justify-center">{CategoryIcons[cat.label] ?? CategoryIcons["More"]}</span>}
                  </span>
                  <span className="whitespace-nowrap font-label text-[8.5px] font-medium text-gray-600 transition-colors group-hover:text-blue-600 md:text-[9px] leading-tight">
                    {cat.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 top-0 z-[310] flex w-[min(300px,85vw)] flex-col overflow-y-auto bg-white"
              style={{ boxShadow: "4px 0 40px rgba(0,0,0,0.18)", borderRadius: "0 24px 24px 0" }}
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              <div className="flex items-center justify-between px-5 py-4" style={{ background: "#0f172a" }}>
                <div>
                  <div className="font-display text-lg font-extrabold text-white">{client.name.split(" ")[0]}<span className="text-slate-300 text-sm">™</span></div>
                  <div className={`${type.eyebrow} text-[7.5px] tracking-widest text-slate-400/70`}>{client.tagline}</div>
                </div>
                <motion.button type="button" onClick={() => setMobileOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white" whileTap={{ scale: 0.9 }}
                ><Icons.X /></motion.button>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-gray-100 p-4">
                {[
                  { icon: <Icons.Search />, label: "Search", fn: () => { onSearchOpen(); setMobileOpen(false); } },
                  { icon: <Icons.Heart filled={wishlist.length > 0} />, label: `Wishlist${wishlist.length > 0 ? ` (${wishlist.length})` : ""}`, fn: () => { onWishlistOpen(); setMobileOpen(false); } },
                  { icon: <Icons.Bag />, label: `Cart${cartCount > 0 ? ` (${cartCount})` : ""}`, fn: () => { onCartOpen(); setMobileOpen(false); } },
                ].map(({ icon, label, fn }) => (
                  <motion.button key={label} type="button" onClick={fn}
                    className="flex flex-col items-center gap-1.5 rounded-2xl border border-gray-100 bg-gray-50 py-3 text-gray-700"
                    whileHover={{ background: "#f3f4f6" }} whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-[18px]">{icon}</span>
                    <span className="text-[9.5px] font-semibold leading-tight text-center">{label}</span>
                  </motion.button>
                ))}
              </div>
              <nav className="flex-1 p-4">
                <p className={`mb-2 px-1 ${type.eyebrow} text-[9px] text-gray-400`}>NAVIGATION</p>
                {NAV_LINKS.map(item => (
                  <motion.button key={item.label} type="button"
                    onClick={() => { setPage(item.page); setMobileOpen(false); }}
                    className="mb-1 flex w-full items-center justify-between rounded-2xl border border-transparent px-4 py-3 text-left font-label text-[14px] font-semibold text-gray-800"
                    whileHover={{ background: "#f3f4f6", borderColor: "#e5e7eb" }} whileTap={{ scale: 0.98 }}
                  >
                    {item.label}<span className="text-gray-500 text-sm">›</span>
                  </motion.button>
                ))}
              </nav>
              <div className="border-t border-gray-100 p-4 pb-8">
                {user ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3">
                    <Avatar name={user.name} size={40} imageUrl={user.avatarUrl} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-label text-[13px] font-bold text-gray-900">{user.name}</div>
                      <div className="truncate font-label text-[10.5px] text-gray-500">{user.email}</div>
                    </div>
                    <motion.button type="button" onClick={() => { onLogout?.(); setMobileOpen(false); }}
                      className="shrink-0 rounded-xl border border-gray-300 px-3 py-1.5 font-label text-[11px] font-bold text-gray-700"
                      whileTap={{ scale: 0.95 }}
                    >Sign Out</motion.button>
                  </div>
                ) : (
                  <motion.button type="button" onClick={() => { onLoginOpen(); setMobileOpen(false); }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-label text-[13.5px] font-bold text-white shadow"
                    style={{ background: "#0f172a" }} whileTap={{ scale: 0.97 }}
                  ><Icons.LogIn /> Sign In / Register</motion.button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
