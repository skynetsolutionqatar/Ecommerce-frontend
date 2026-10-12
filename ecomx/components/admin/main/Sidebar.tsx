"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminMenuItem } from "@/components/admin/utils/SideSection";
import { adminType } from "@/lib/admin/typography";
import { colors } from "@/components/admin/utils/Colors";
import { ADMIN_ROUTES } from "@/lib/config";
import { useAdminMenuSections } from "@/hooks/useAdminMenuSections";

type SidebarProps = {
  mobile?: boolean;
  onNavigate?: () => void;
};

export default function Sidebar({ mobile = false, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const pathname = usePathname();
  const sections = useAdminMenuSections();

  const isExpanded = mobile || !collapsed || hovered;

  const isPathActive = (basePath: string) =>
    pathname === basePath || pathname.startsWith(`${basePath}/`);

  const isSubMenuActive = (subMenu: NonNullable<AdminMenuItem["subMenu"]>) =>
    subMenu.some((sub) => isPathActive(sub.path));

  const routeOpenMenu = useMemo(() => {
    for (const section of sections) {
      for (const item of section.items) {
        if (item.subMenu && isSubMenuActive(item.subMenu)) {
          return item.name;
        }
      }
    }
    return null;
  }, [sections, pathname]);

  useEffect(() => {
    setOpenMenu(routeOpenMenu);
  }, [routeOpenMenu]);

  const toggleMenu = (menuName: string) => {
    setOpenMenu((prev) => (prev === menuName ? null : menuName));
  };

  const handleNavigate = () => {
    onNavigate?.();
  };

  return (
    <aside
      className={`flex h-screen flex-col border-r ${colors.sidebarBorder} ${colors.mainColor} text-white transition-all duration-500 ${
        mobile ? "w-[min(280px,85vw)]" : ""
      }`}
    >
      <div
        className={`${
          mobile ? "w-full" : collapsed ? "w-[4.5rem]" : "w-56"
        } flex shrink-0 items-center justify-between gap-2 px-3 transition-all duration-500 ${
          collapsed && !mobile ? "flex-col gap-2 py-2" : "h-16 py-0"
        }`}
      >
        <Link
          href={ADMIN_ROUTES.dashboard}
          onClick={handleNavigate}
          className={`flex min-w-0 flex-1 items-center border-0 bg-transparent p-0 no-underline ${
            collapsed && !mobile ? "justify-center" : ""
          }`}
        >
          {isExpanded ? (
            <div className="min-w-0 leading-tight">
              <p className={`text-sm font-bold tracking-wide ${colors.sidebarBrand}`}>
                Skynet™
              </p>
              <p
                className={`text-[10px] font-medium uppercase tracking-wider ${colors.sidebarBrandSub}`}
              >
                Management Suite
              </p>
            </div>
          ) : (
            <span className={`text-xs font-bold tracking-wide ${colors.sidebarBrand}`}>
              S™
            </span>
          )}
        </Link>

        {mobile ? (
          <button
            type="button"
            onClick={handleNavigate}
            aria-label="Close menu"
            className="cursor-pointer text-white/80 hover:text-white"
          >
            <X size={20} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="cursor-pointer text-white/80 hover:text-white"
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        )}
      </div>

      <div
        className={`flex-1 transition-all duration-500 ${
          mobile ? "w-full" : isExpanded ? "w-56" : "w-[4.5rem]"
        }`}
        onMouseEnter={() => !mobile && setHovered(true)}
        onMouseLeave={() => !mobile && setHovered(false)}
      >
        <nav className="h-full space-y-4 overflow-y-auto px-2 py-4">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="mb-1 px-2">
                {isExpanded ? (
                  <span className={`${adminType.sidebarSection} ${colors.sidebarSection}`}>
                    {section.title}
                  </span>
                ) : (
                  <span className="mr-3 flex justify-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                  </span>
                )}
              </div>

              <ul className={`space-y-1 ${adminType.sidebarNav}`}>
                {section.items.map((item) => {
                  const hasSubMenu = Boolean(item.subMenu?.length);
                  const isParentActive = hasSubMenu
                    ? isSubMenuActive(item.subMenu!)
                    : isPathActive(item.path || "");
                  const isMenuOpen = openMenu === item.name;

                  return (
                    <li key={item.name}>
                      {hasSubMenu ? (
                        <>
                          <button
                            type="button"
                            onClick={() => toggleMenu(item.name)}
                            className={`flex w-full items-center justify-between rounded-md px-2 py-2 transition ${
                              isParentActive && isExpanded
                                ? colors.sidebarActive
                                : colors.sidebarInactive
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {item.icon}
                              {isExpanded && <span>{item.name}</span>}
                            </span>
                            {isExpanded &&
                              (isMenuOpen ? (
                                <ChevronDown size={14} />
                              ) : (
                                <ChevronRight size={14} />
                              ))}
                          </button>

                          {isExpanded && isMenuOpen && item.subMenu ? (
                            <ul className="ml-6 mt-1 space-y-1">
                              {item.subMenu.map((sub) => {
                                const isActive = isPathActive(sub.path);
                                return (
                                  <li key={sub.path}>
                                    <Link
                                      href={sub.path}
                                      onClick={handleNavigate}
                                      className={`flex items-center gap-2 rounded-md px-2 py-1 transition ${adminType.sidebarSubNav} ${
                                        isActive
                                          ? colors.sidebarSubActive
                                          : colors.sidebarSubInactive
                                      }`}
                                    >
                                      {sub.icon}
                                      {sub.name}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : null}
                        </>
                      ) : (
                        <Link
                          href={item.path || "#"}
                          onClick={handleNavigate}
                          className={`flex items-center gap-2 rounded-md px-2 py-2 transition ${
                            isPathActive(item.path || "")
                              ? colors.sidebarActive
                              : colors.sidebarInactive
                          }`}
                        >
                          {item.icon}
                          {isExpanded && item.name}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
