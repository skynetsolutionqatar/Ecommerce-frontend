"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, Lock, ShieldCheck, Headphones } from "lucide-react";
import * as Icons from "./Icons";
import type { CartItem, WishlistItem, StoreUser } from "@/lib/types";
import Avatar from "./Avatar";
import BrandLogo from "./BrandLogo";
import { useClientTheme } from "./ThemeProvider";
import { Colors, type, tw } from "@/lib/theme";
import { ROUTES } from "@/lib/routes";
import { useCategories, STORE_CATEGORY_QUERY } from "@/hooks/useCategories";
import { CategoryIcons, resolveCategoryIcon } from "@/lib/store/category-icons";
import type { ApiCategory } from "@/types/category.types";

interface HeaderProps {
  cart: CartItem[];
  wishlist: WishlistItem[];
  onCartOpen: () => void;
  onWishlistOpen: () => void;
  onSearchOpen: () => void;
  onLoginOpen: () => void;
  onLogout?: () => void;
  user?: StoreUser | null;
  onCategorySelect?: (category: ApiCategory) => void;
}

const MOBILE_NAV_LINKS = [
  { label: "Products", href: ROUTES.shop },
  { label: "Solutions", href: ROUTES.shop },
  { label: "Deals", href: ROUTES.shop },
  { label: "Support", href: ROUTES.shop },
  { label: "Orders", href: ROUTES.orders },
];

export default function Header({
  cart,
  wishlist,
  onCartOpen,
  onWishlistOpen,
  onSearchOpen,
  onLoginOpen,
  onLogout,
  user,
  onCategorySelect,
}: HeaderProps) {
  const router = useRouter();
  const { client } = useClientTheme();
  const { data } = useCategories(STORE_CATEGORY_QUERY);
  const categories = data?.categories ?? [];

  const goTo = (href: string) => router.push(href);

  const categoriesLoading = !data;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catVisible, setCatVisible] = useState(true);
  const [hintIdx, setHintIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [catDropOpen, setCatDropOpen] = useState(false);
  const lastScrollY = useRef(0);
  const swapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const searchHints = useMemo(
    () =>
      categories.length > 0
        ? categories.map((c) => c.name)
        : ["products", "brands"],
    [categories]
  );

  const handleCategoryClick = (category: ApiCategory) => {
    onCategorySelect?.(category);
    setCatDropOpen(false);
    setMobileOpen(false);
  };

  useEffect(() => {
    if (searchHints.length === 0) return;
    const interval = setInterval(() => {
      setVisible(false);
      swapTimerRef.current = setTimeout(() => {
        setHintIdx((i) => (i + 1) % searchHints.length);
        setVisible(true);
      }, 550);
    }, 2500);
    return () => {
      clearInterval(interval);
      if (swapTimerRef.current) clearTimeout(swapTimerRef.current);
    };
  }, [searchHints.length]);

  useEffect(() => {
    const node = headerRef.current;
    if (!node) return;

    const syncHeaderHeight = () => {
      document.documentElement.style.setProperty(
        "--header-height",
        `${Math.ceil(node.getBoundingClientRect().height)}px`
      );
    };

    syncHeaderHeight();
    const observer = new ResizeObserver(syncHeaderHeight);
    observer.observe(node);
    window.addEventListener("resize", syncHeaderHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncHeaderHeight);
    };
  }, []);

  useEffect(() => {
    const fn = () => {
      const y = window.scrollY;
      if (y <= 10) {
        setScrolled(false);
        setCatVisible(true);
      } else {
        setScrolled(true);
        if (y > lastScrollY.current + 4) {
          setCatVisible(false);
        } else if (y < lastScrollY.current - 4) {
          setCatVisible(true);
        }
      }
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", mobileOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [mobileOpen]);

  return (
    <>
      <div ref={headerRef} className="fixed left-0 right-0 top-0 z-[150]">
        {/* ── Top Promo Bar ── */}
        <div
          className="flex items-center justify-between py-1"
          style={{ background: `${Colors.base_color}` }}
        >
          <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-3 sm:px-5 md:px-8 lg:px-[50px]">
            <div className="flex items-center gap-5 text-[12px] md:text-[11px] text-white/85">
              <span className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 shrink-0" />
                Free Delivery on orders over QAR 299
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 shrink-0" />
                Secure Payments
              </span>
              <span className="hidden md:flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                Official Warranty
              </span>
              <span className="hidden lg:flex items-center gap-1.5">
                <Headphones className="h-3.5 w-3.5 shrink-0" />
                Expert Support
              </span>
            </div>
            <div className="flex items-center gap-3 text-[12px] md:text-[11px] text-white/85">
              <button
                type="button"
                className="flex items-center gap-1 hover:text-white transition-colors bg-transparent border-0 cursor-pointer"
              >
                English ▾
              </button>
              <span className="text-white/85">|</span>
              <button
                type="button"
                className="flex items-center gap-1 hover:text-white transition-colors bg-transparent border-0 cursor-pointer"
              >
                QAR ▾
              </button>
            </div>
          </div>
        </div>

        {/* ── Main Header ── */}
        <div
          className="border-b border-gray-200 bg-white"
          style={{
            boxShadow: scrolled
              ? "0 2px 12px rgba(0,0,0,0.08)"
              : "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div className="mx-auto flex max-w-[1440px] items-center gap-3 py-1.5 px-3 sm:px-5 md:px-8 md:gap-4 lg:px-[50px]">
            <motion.button
              type="button"
              onClick={() => goTo(ROUTES.home)}
              className="flex shrink-0 cursor-pointer items-center border-0 bg-transparent p-0"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <BrandLogo
                height={68}
                priority
                alt={client.name}
                imgClassName="max-w-[180px] sm:max-w-[200px]"
              />
            </motion.button>

            {/* All Categories Dropdown */}
            <div className="relative hidden md:block shrink-0">
              <motion.button
                type="button"
                onClick={() => setCatDropOpen((v) => !v)}
                className="flex items-center gap-2 rounded-md px-3 py-2 font-label text-[12.5px] font-semibold text-white whitespace-nowrap"
                style={{ background: `${Colors.base_color}` }}
                whileHover={{ background: "#334155" }}
                whileTap={{ scale: 0.97 }}
              >
                <Icons.Menu />
                All Categories
                <motion.span
                  animate={{ rotate: catDropOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icons.ChevronDown />
                </motion.span>
              </motion.button>
              <AnimatePresence>
                {catDropOpen && (
                  <motion.div
                    className="absolute top-full left-0 z-50 mt-1 max-h-[360px] w-[220px] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.16 }}
                    onMouseLeave={() => setCatDropOpen(false)}
                  >
                    {categoriesLoading ? (
                      <p className="px-4 py-3 text-[12px] text-gray-400">
                        Loading...
                      </p>
                    ) : categories.length > 0 ? (
                      categories.map((cat) => (
                        <button
                          key={cat._id}
                          type="button"
                          onClick={() => handleCategoryClick(cat)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[12.5px] font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 border-0 bg-transparent cursor-pointer transition-colors"
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center text-gray-500">
                            {resolveCategoryIcon(cat.name)}
                          </span>
                          {cat.name}
                        </button>
                      ))
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          goTo(ROUTES.shop);
                          setCatDropOpen(false);
                        }}
                        className="flex w-full px-4 py-2.5 text-left text-[12.5px] font-medium text-gray-700 hover:bg-blue-50 border-0 bg-transparent cursor-pointer"
                      >
                        Browse all products
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search */}
            <motion.button
              type="button"
              onClick={onSearchOpen}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-left transition-all hover:border-blue-400 hover:ring-1 hover:ring-blue-400 cursor-text"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <span className="hidden min-w-0 flex-1 items-center text-[12.5px] text-gray-400 min-[480px]:flex">
                <span className="shrink-0">Search for </span>
                <span
                  className="ml-1 inline-block truncate font-medium text-gray-500 transition-opacity duration-500"
                  style={{ opacity: visible ? 1 : 0 }}
                >
                  {searchHints[hintIdx]}
                </span>
                <span className="shrink-0">...</span>
              </span>
              <span className="flex-1 text-[12px] text-gray-400 min-[480px]:hidden">
                Search...
              </span>
              <span
                className="hidden shrink-0 items-center justify-center rounded-md w-10 h-9 text-white sm:flex"
                style={{ background: `${Colors.base_color}` }}
              >
                <Icons.Search />
              </span>
            </motion.button>

            {/* Desktop Actions */}
            <div className="flex shrink-0 items-center gap-1">
              {user ? (
                <motion.button
                  type="button"
                  onClick={() => goTo(ROUTES.orders)}
                  className="hidden items-center gap-1.5 rounded-md border border-gray-200 bg-transparent px-3 py-2 font-label text-[12px] font-medium text-gray-700 md:flex hover:bg-gray-50 transition-all"
                  whileTap={{ scale: 0.97 }}
                >
                  <Icons.Bag />
                  <span>Orders</span>
                </motion.button>
              ) : null}

              <motion.button
                type="button"
                onClick={onLoginOpen}
                className="hidden items-center gap-1.5 rounded-md border border-gray-200 bg-transparent px-3 py-2 font-label text-[12px] font-medium text-gray-700 md:flex hover:bg-gray-50 transition-all"
                whileTap={{ scale: 0.97 }}
              >
                {user ? (
                  <Avatar
                    name={user.name}
                    size={18}
                    imageUrl={user.avatarUrl}
                    className="border-0 shadow-none"
                  />
                ) : (
                  <Icons.User />
                )}
                <span className="hidden md:inline">
                  {user ? user.name.split(" ")[0] : "Login / Signup"}
                </span>
              </motion.button>

              <motion.button
                type="button"
                onClick={onWishlistOpen}
                className="relative flex items-center gap-1.5 rounded-md border border-gray-200 bg-transparent px-3 py-2 font-label text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition-all"
                whileTap={{ scale: 0.97 }}
                aria-label="Wishlist"
              >
                <Icons.Heart filled={wishlist.length > 0} />
                <span className="hidden lg:inline">Wishlist</span>
                <AnimatePresence>
                  {wishlist.length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 md:h-4 md:w-4 items-center justify-center rounded-full bg-red-500 text-[10px] md:text-[9px] font-black text-white"
                    >
                      {wishlist.length > 9 ? "9+" : wishlist.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <motion.button
                type="button"
                onClick={onCartOpen}
                className="relative flex items-center gap-1.5 rounded-md border border-gray-200 bg-transparent px-3 py-2 font-label text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition-all"
                whileTap={{ scale: 0.97 }}
              >
                <Icons.Bag />
                <span className="hidden lg:inline">Cart</span>
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 md:h-4 md:w-4 items-center justify-center rounded-full bg-red-500 text-[10px] md:text-[9px] font-black text-white"
                    >
                      {cartCount > 9 ? "9+" : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <motion.button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-700 md:hidden hover:bg-gray-50 transition-all"
                whileTap={{ scale: 0.93 }}
                aria-label="Open menu"
              >
                <Icons.Menu />
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── Category icon strip ── */}
        <motion.div
          className="overflow-hidden border-b border-gray-200 bg-white"
          animate={{
            height: catVisible ? "auto" : 0,
            opacity: catVisible ? 1 : 0,
          }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="mx-auto w-full max-w-[1440px] px-3 sm:px-5 md:px-8 lg:px-[50px]">
            <div
              className={`flex items-center overflow-x-auto scroll-smooth ${tw.scrollbarHide} justify-between p-1`}
            >
              {categoriesLoading ? (
                <span className="px-3 py-2 text-[11px] text-gray-400">
                  Loading categories...
                </span>
              ) : categories.length > 0 ? (
                <>
                  {categories.map((cat) => (
                    <motion.button
                      key={cat._id}
                      type="button"
                      onClick={() => handleCategoryClick(cat)}
                      className="group flex shrink-0 flex-col items-center gap-0.5 border-0 bg-transparent px-3 py-1 cursor-pointer md:px-4"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="flex h-6 w-6 md:h-5 md:w-5 items-center justify-center text-gray-600 transition-colors group-hover:text-blue-600">
                        {resolveCategoryIcon(cat.name)}
                      </span>
                      <span className="whitespace-nowrap font-label text-[11px] font-medium text-gray-600 transition-colors group-hover:text-blue-600 md:text-[9px] leading-tight">
                        {cat.name}
                      </span>
                    </motion.button>
                  ))}
                  <motion.button
                    type="button"
                    onClick={() => goTo(ROUTES.shop)}
                    className="group flex shrink-0 flex-col items-center gap-0.5 border-0 bg-transparent px-3 py-1 cursor-pointer md:px-4"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="flex h-6 w-6 md:h-5 md:w-5 items-center justify-center text-gray-600 transition-colors group-hover:text-blue-600">
                      {CategoryIcons.More}
                    </span>
                    <span className="whitespace-nowrap font-label text-[11px] font-medium text-gray-600 transition-colors group-hover:text-blue-600 md:text-[9px] leading-tight">
                      More Categories
                    </span>
                  </motion.button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => goTo(ROUTES.shop)}
                  className="group flex shrink-0 flex-col items-center gap-0.5 border-0 bg-transparent px-3 py-1 cursor-pointer"
                >
                  <span className="flex h-6 w-6 md:h-5 md:w-5 items-center justify-center text-gray-600">
                    {CategoryIcons.More}
                  </span>
                  <span className="font-label text-[11px] md:text-[9px] text-gray-600">
                    Shop All
                  </span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 top-0 z-[310] flex w-[min(300px,85vw)] flex-col overflow-y-auto bg-white"
              style={{
                boxShadow: "4px 0 40px rgba(0,0,0,0.18)",
                borderRadius: "0 24px 24px 0",
              }}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ background: "#0f172a" }}
              >
                <button
                  type="button"
                  onClick={() => {
                    goTo(ROUTES.home);
                    setMobileOpen(false);
                  }}
                  className="border-0 bg-transparent p-0 text-left cursor-pointer"
                >
                  <BrandLogo height={40} variant="light" alt={client.name} imgClassName="max-w-[160px]" />
                </button>
                <motion.button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-white/15 text-white"
                  whileTap={{ scale: 0.9 }}
                >
                  <Icons.X />
                </motion.button>
              </div>

              {categories.length > 0 && (
                <div className="border-b border-gray-100 p-4">
                  <p
                    className={`mb-2 px-1 ${type.eyebrow} text-[11px] text-gray-400`}
                  >
                    CATEGORIES
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        type="button"
                        onClick={() => handleCategoryClick(cat)}
                        className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-[13px] font-medium text-gray-700"
                      >
                        <span className="flex h-5 w-5 items-center justify-center text-gray-500">
                          {resolveCategoryIcon(cat.name)}
                        </span>
                        {cat.name}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        goTo(ROUTES.shop);
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-[13px] font-medium text-gray-700"
                    >
                      <span className="flex h-5 w-5 items-center justify-center text-gray-500">
                        {CategoryIcons.More}
                      </span>
                      More Categories
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 border-b border-gray-100 p-4 md:hidden">
                <button
                  type="button"
                  onClick={() => {
                    onWishlistOpen();
                    setMobileOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-800"
                >
                  <Icons.Heart filled={wishlist.length > 0} />
                  Wishlist
                  {wishlist.length > 0 ? ` (${wishlist.length})` : ""}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onCartOpen();
                    setMobileOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-800"
                >
                  <Icons.Bag />
                  Cart
                  {cartCount > 0 ? ` (${cartCount})` : ""}
                </button>
              </div>

              <nav className="flex-1 p-4">
                <p
                  className={`mb-2 px-1 ${type.eyebrow} text-[11px] text-gray-400`}
                >
                  NAVIGATION
                </p>
                {MOBILE_NAV_LINKS.map((item) => (
                  <motion.button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      goTo(item.href);
                      setMobileOpen(false);
                    }}
                    className="mb-1 flex w-full items-center justify-between rounded-2xl border border-transparent px-4 py-3 text-left font-label text-[14px] font-semibold text-gray-800"
                    whileHover={{
                      background: "#f3f4f6",
                      borderColor: "#e5e7eb",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {item.label}
                    <span className="text-gray-500 text-sm">›</span>
                  </motion.button>
                ))}
              </nav>

              <div className="border-t border-gray-100 p-4 pb-8">
                {user ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3">
                    <Avatar
                      name={user.name}
                      size={40}
                      imageUrl={user.avatarUrl}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-label text-[13px] font-bold text-gray-900">
                        {user.name}
                      </div>
                      <div className="truncate font-label text-[12px] md:text-[10.5px] text-gray-500">
                        {user.email}
                      </div>
                    </div>
                    <motion.button
                      type="button"
                      onClick={() => {
                        onLogout?.();
                        setMobileOpen(false);
                      }}
                      className="shrink-0 rounded-xl border border-gray-300 px-3 py-2 font-label text-[13px] md:text-[11px] font-bold text-gray-700"
                      whileTap={{ scale: 0.95 }}
                    >
                      Sign Out
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    type="button"
                    onClick={() => {
                      onLoginOpen();
                      setMobileOpen(false);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-label text-[13.5px] font-bold text-white shadow"
                    style={{ background: "#0f172a" }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Icons.LogIn /> Sign In / Register
                  </motion.button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
