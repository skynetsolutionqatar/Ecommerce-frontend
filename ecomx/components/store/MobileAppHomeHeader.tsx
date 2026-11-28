"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, MapPin, Search, Store, Truck } from "lucide-react";
import MobileDeliveryAreaSheet from "@/components/store/mobile/MobileDeliveryAreaSheet";
import { useCategories, STORE_CATEGORY_QUERY } from "@/hooks/useCategories";
import { CategoryIcons, resolveCategoryIcon } from "@/lib/store/category-icons";
import { readDeliveryAreaLabel } from "@/lib/store/delivery-area-label";
import { Colors, tw } from "@/lib/theme";
import type { ApiCategory } from "@/types/category.types";
import type { PublicDeliverySettings } from "@/types/delivery-settings.types";

const HEADER_BG = "#0a255d";
const SCROLL_ROUND_PX = 48;

export default function MobileAppHomeHeader({
  onSearchOpen,
  onCategorySelect,
  onShopAll,
  deliverySettings,
}: {
  onSearchOpen: () => void;
  onCategorySelect: (category: ApiCategory) => void;
  onShopAll: () => void;
  deliverySettings?: PublicDeliverySettings | null;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const { data } = useCategories(STORE_CATEGORY_QUERY);
  const categories = data?.categories ?? [];
  const deliveryOrigin = deliverySettings?.originLabel?.trim() || "Qatar-wide delivery";

  const [areaLabel, setAreaLabel] = useState("Select your area");
  const [areaSheetOpen, setAreaSheetOpen] = useState(false);

  const refreshAreaLabel = useCallback(() => {
    setAreaLabel(readDeliveryAreaLabel());
  }, []);

  useEffect(() => {
    refreshAreaLabel();
    const onStorage = (e: StorageEvent) => {
      if (e.key?.includes("checkout") || e.key == null) refreshAreaLabel();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refreshAreaLabel);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refreshAreaLabel);
    };
  }, [refreshAreaLabel]);

  const [hintIdx, setHintIdx] = useState(0);
  const [hintVisible, setHintVisible] = useState(true);
  const searchHints = useMemo(
    () => (categories.length > 0 ? categories.map((c) => c.name) : ["POS", "printers", "scanners"]),
    [categories]
  );

  useEffect(() => {
    if (searchHints.length === 0) return;
    const interval = window.setInterval(() => {
      setHintVisible(false);
      window.setTimeout(() => {
        setHintIdx((i) => (i + 1) % searchHints.length);
        setHintVisible(true);
      }, 400);
    }, 2400);
    return () => window.clearInterval(interval);
  }, [searchHints.length]);

  const { scrollY } = useScroll();
  const bottomRadius = useTransform(scrollY, [0, SCROLL_ROUND_PX], [0, 20]);

  useEffect(() => {
    const node = shellRef.current;
    if (!node) return;
    const sync = () => {
      document.documentElement.style.setProperty(
        "--mobile-home-header-height",
        `${Math.ceil(node.getBoundingClientRect().height)}px`
      );
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(node);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [categories.length]);

  const openAreaSheet = () => setAreaSheetOpen(true);
  const closeAreaSheet = () => {
    setAreaSheetOpen(false);
    refreshAreaLabel();
  };

  return (
    <>
      <motion.header
        ref={shellRef}
        className="fixed left-0 right-0 top-0 z-[149] md:hidden"
        style={{
          background: HEADER_BG,
          borderBottomLeftRadius: bottomRadius,
          borderBottomRightRadius: bottomRadius,
          paddingTop: "max(8px, env(safe-area-inset-top))",
        }}
      >
        <div className="flex items-center justify-between gap-2 px-4 pb-1 pt-0.5">
          <button
            type="button"
            onClick={openAreaSheet}
            className="flex min-w-0 max-w-[48%] items-center gap-1.5 border-0 bg-transparent p-0 text-left"
          >
            <Truck className="h-[18px] w-[18px] shrink-0 text-white" strokeWidth={1.85} aria-hidden />
            <span className="truncate text-xs font-bold text-white">{deliveryOrigin}</span>
          </button>
          <button
            type="button"
            onClick={openAreaSheet}
            className="flex min-w-0 max-w-[52%] items-center gap-1 border-0 bg-transparent p-0 text-white"
            aria-label={`Deliver to: ${areaLabel}`}
          >
            <MapPin className="h-5 w-5 shrink-0" strokeWidth={1.85} aria-hidden />
            <span className="truncate text-[15px] font-extrabold">{areaLabel}</span>
            <ChevronDown className="h-4 w-4 shrink-0" strokeWidth={2.1} aria-hidden />
          </button>
        </div>

        <div className="px-4 pb-2">
          <button
            type="button"
            onClick={onSearchOpen}
            className="flex h-[46px] w-full items-center gap-2 rounded-full border-0 bg-white px-3.5 text-left shadow-sm"
          >
            <Store className="h-[22px] w-[22px] shrink-0" style={{ color: HEADER_BG }} strokeWidth={1.8} />
            <span className="shrink-0 text-[15px] font-semibold text-gray-800">Search for </span>
            <span
              className="min-w-0 flex-1 truncate text-[15px] font-bold transition-opacity duration-300"
              style={{ color: HEADER_BG, opacity: hintVisible ? 1 : 0.35 }}
            >
              {searchHints[hintIdx]}
            </span>
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
              style={{ background: Colors.base_color }}
            >
              <Search className="h-[18px] w-[18px]" strokeWidth={2.2} />
            </span>
          </button>
        </div>

        <div className={`${tw.scrollbarHide} flex gap-2.5 overflow-x-auto px-4 pb-3`}>
          <button
            type="button"
            onClick={onShopAll}
            className="flex min-w-[50px] shrink-0 flex-col items-center gap-1 border-0 bg-transparent"
          >
            <span className="flex h-8 w-8 items-center justify-center text-white">{CategoryIcons.More}</span>
            <span className="max-w-[68px] truncate text-center text-[10px] font-bold text-white">All</span>
            <span className="h-0.5 w-6 rounded-full bg-white" />
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              onClick={() => onCategorySelect(cat)}
              className="flex min-w-[50px] shrink-0 flex-col items-center gap-1 border-0 bg-transparent"
            >
              <span className="flex h-8 w-8 items-center justify-center text-white [&_svg]:h-5 [&_svg]:w-5">
                {resolveCategoryIcon(cat.name)}
              </span>
              <span className="max-w-[68px] truncate text-center text-[10px] font-bold text-white">
                {cat.name}
              </span>
              <span className="h-0.5 w-6 rounded-full bg-transparent" />
            </button>
          ))}
        </div>
      </motion.header>

      <MobileDeliveryAreaSheet open={areaSheetOpen} onClose={closeAreaSheet} />
    </>
  );
}