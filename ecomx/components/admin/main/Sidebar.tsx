// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   Menu,
//   X,
//   ChevronDown,
//   ChevronRight,
//   Layers,
//   LogOut,
// } from "lucide-react";
// import { adminSections } from "@/components/admin/utils/SideSection";
// import { colors } from "@/components/admin/utils/Colors";
// import { useAuth } from "@/hooks/useAuth";

// export default function Sidebar() {
//   const [collapsed, setCollapsed] = useState(false);
//   const [hovered, setHovered] = useState(false);
//   const [openMenu, setOpenMenu] = useState<string | null>(null);
//   const pathname = usePathname();
//   const { user, logout } = useAuth();
//   const isExpanded = !collapsed || hovered;

//   const isPathActive = (basePath: string) =>
//     pathname === basePath || pathname.startsWith(`${basePath}/`);

//   const isSubMenuActive = (subMenu: { path: string }[]) =>
//     subMenu.some((sub) => isPathActive(sub.path));

//   useEffect(() => {
//     adminSections.forEach((section) => {
//       section.items.forEach((item) => {
//         if (item.subMenu && isSubMenuActive(item.subMenu)) setOpenMenu(item.name);
//       });
//     });
//   }, [pathname]);

//   const toggleMenu = (menuName: string) => {
//     setOpenMenu((prev) => (prev === menuName ? null : menuName));
//   };

//   const displayName = user?.name ?? "Admin User";
//   const displayRole =
//     user?.role === "admin" || user?.role === "superadmin" ? "System Admin" : "Store Manager";

//   return (
//     <aside
//       className={`flex h-screen flex-col border-r border-slate-100 bg-white transition-all duration-300 ${
//         isExpanded ? "w-[240px]" : "w-[68px]"
//       }`}
//     >
//       {/* Logo */}
//       <div className="flex items-center justify-between px-4 py-4">
//         {isExpanded ? (
//           <div className="flex items-center gap-2.5">
//             <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-900 text-white">
//               <Layers size={18} />
//             </div>
//             <div className="leading-tight">
//               <p className="text-sm font-bold tracking-wide text-slate-900">SKYNET™</p>
//               <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
//                 Management Suite
//               </p>
//             </div>
//           </div>
//         ) : (
//           <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-900 text-white">
//             <Layers size={18} />
//           </div>
//         )}
//         <button
//           type="button"
//           onClick={() => setCollapsed(!collapsed)}
//           className="text-slate-500 hover:text-slate-700"
//           aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
//         >
//           {collapsed ? <Menu size={18} /> : <X size={18} />}
//         </button>
//       </div>

//       {/* Nav */}
//       <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-2">
//         {adminSections.map((section, sIdx) => (
//           <div key={sIdx}>
//             {isExpanded && (
//               <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
//                 {section.title}
//               </p>
//             )}
//             <ul className="space-y-0.5 text-sm">
//               {section.items.map((item, idx) => {
//                 const isParentActive = item.subMenu
//                   ? isSubMenuActive(item.subMenu)
//                   : isPathActive(item.path || "");

//                 return (
//                   <li key={idx}>
//                     {item.subMenu ? (
//                       <>
//                         <button
//                           type="button"
//                           onClick={() => toggleMenu(item.name)}
//                           className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition ${
//                             isParentActive
//                               ? `${colors.mainColor} text-white shadow-sm`
//                               : "text-slate-600 hover:bg-slate-50"
//                           }`}
//                         >
//                           <span className="flex items-center gap-2.5">
//                             {item.icon}
//                             {isExpanded && <span className="font-medium">{item.name}</span>}
//                           </span>
//                           {isExpanded &&
//                             (openMenu === item.name || isParentActive ? (
//                               <ChevronDown size={14} />
//                             ) : (
//                               <ChevronRight size={14} />
//                             ))}
//                         </button>

//                         {isExpanded && openMenu === item.name && (
//                           <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-slate-100 pl-3">
//                             {item.subMenu.map((sub, subIdx) => {
//                               const isActive = isPathActive(sub.path);
//                               return (
//                                 <li key={subIdx}>
//                                   <Link
//                                     href={sub.path}
//                                     className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition ${
//                                       isActive
//                                         ? "font-semibold text-emerald-800"
//                                         : "text-slate-500 hover:text-emerald-700"
//                                     }`}
//                                   >
//                                     {sub.icon}
//                                     {sub.name}
//                                   </Link>
//                                 </li>
//                               );
//                             })}
//                           </ul>
//                         )}
//                       </>
//                     ) : (
//                       <Link
//                         href={item.path || "#"}
//                         className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition ${
//                           isPathActive(item.path || "")
//                             ? `${colors.mainColor} font-medium text-white shadow-sm`
//                             : "text-slate-600 hover:bg-slate-50"
//                         }`}
//                       >
//                         {item.icon}
//                         {isExpanded && item.name}
//                       </Link>
//                     )}
//                   </li>
//                 );
//               })}
//             </ul>
//           </div>
//         ))}
//       </nav>

//       {/* User profile */}
//       <div className="border-t border-slate-100 p-3">
//         <div className={`flex items-center gap-2.5 ${isExpanded ? "" : "justify-center"}`}>
//           <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
//             {displayName.charAt(0).toUpperCase()}
//           </div>
//           {isExpanded && (
//             <div className="min-w-0 flex-1">
//               <p className="truncate text-sm font-semibold text-slate-800">{displayName}</p>
//               <p className="truncate text-[11px] text-slate-400">{displayRole}</p>
//             </div>
//           )}
//           {isExpanded && (
//             <button
//               type="button"
//               onClick={() => void logout()}
//               className="rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
//               aria-label="Log out"
//             >
//               <LogOut size={16} />
//             </button>
//           )}
//         </div>
//       </div>
//     </aside>
//   );
// }
// // "use client";

// // import { useState } from "react";
// // // import { Link } from "react-router-dom";
// // import {
// //   Menu,
// //   X,
// //   ChevronRight,
// //   ChevronDown,
// //   Box,
// //   Mail,
// //   MessageSquare,
// //   FileText,
// //   Shield,
// //   Hash,
// // } from "lucide-react";
// // import SideMenuIcon from "../../utils/SideIcon";
// // import Link from "next/link";
// // import { usePathname } from "next/navigation";

// // interface MenuItem {
// //   name: string;
// //   path?: string;
// //   icon: React.ReactNode;
// //   subMenu?: { name: string; path: string; icon?: React.ReactNode }[];
// // }

// // interface Section {
// //   title: string;
// //   items: MenuItem[];
// // }

// // const sections: Section[] = [
// //   {
// //     title: "MAIN",
// //     items: [{ name: "Dashboard", path: "/dashboard", icon: <SideMenuIcon /> }],
// //   },
// //   {
// //     title: "WEB APPS",
// //     items: [
// //       {
// //         name: "Masters",
// //         icon: <SideMenuIcon />,
// //         subMenu: [
// //           {
// //             name: "Product",
// //             path: "/master/product",
// //             icon: <SideMenuIcon />,
// //           },
// //           {
// //             name: "Customer",
// //             path: "/master/customer",
// //             icon: <SideMenuIcon />,
// //           },
// //         ],
// //       },
// //     ],
// //   },
// //   // add more sections as needed
// // ];

// // export default function Sidebar() {
// //   const [collapsed, setCollapsed] = useState(false);
// //   const [hovered, setHovered] = useState(false);
// //   const [openMenu, setOpenMenu] = useState<string | null>(null);

// //   const pathname = usePathname();

// //   const isExpanded = !collapsed || hovered;

// //   const toggleMenu = (menuName: string) => {
// //     setOpenMenu(openMenu === menuName ? null : menuName);
// //   };

// //   const isSubMenuActive = (subMenu: any[]) => {
// //     return subMenu.some((sub) => pathname.startsWith(sub.path));
// //   };

// //   return (
// //     <aside className="bg-white h-screen flex  flex-col transition-all duration-500">
// //       {/* Header */}
// //       <div
// //         className={`${
// //           collapsed ? "w-16" : "w-48"
// //         } flex items-center justify-between px-4 py-3 transition-all duration-500`}
// //       >
// //         {!collapsed && (
// //           <h1 className="flex items-center gap-2 text-lg font-bold text-blue-900">
// //             {/* <img
// //               src="/images/logo.png"
// //               alt="Logo"
// //               className="w-10 h-10 object-contain"
// //             /> */}
// //             <span className="text-black">ENTERPRISES</span>
// //           </h1>
// //         )}
// //         <button
// //           onClick={() => setCollapsed(!collapsed)}
// //           className="text-gray-600"
// //         >
// //           {collapsed ? <X size={20} /> : <Menu size={20} />}
// //         </button>
// //       </div>

// //       {/* Navigation */}
// //       <div
// //         className={`flex-1 transition-all duration-500 ${
// //           isExpanded ? "w-52" : "w-16"
// //         }`}
// //         onMouseEnter={() => setHovered(true)}
// //         onMouseLeave={() => setHovered(false)}
// //       >
// //         <nav className="h-full overflow-y-auto px-2 py-4 space-y-4">
// //           {sections.map((section, sIdx) => (
// //             <div key={sIdx}>
// //               {/* Section heading or dot */}
// //               <div className="px-2 mb-1">
// //                 {isExpanded ? (
// //                   <span className="text-[11px] font-semibold text-[#7987a1] tracking-wider">
// //                     {section.title}
// //                   </span>
// //                 ) : (
// //                   <span className="flex justify-center mr-3">
// //                     <span className="w-1.5 h-1.5 bg-[#7987a1] rounded-full"></span>
// //                   </span>
// //                 )}
// //               </div>

// //               <ul className="space-y-1 text-sm">
// //                 {section.items.map((item, idx) => (
// //                   <li key={idx}>
// //                     {item.subMenu ? (
// //                       <>
// //                         <button
// //                           onClick={() => toggleMenu(item.name)}
// //                           className="w-full flex items-center justify-between px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition"
// //                         >
// //                           <span className="flex items-center gap-2">
// //                             {/* {item.icon} */}
// //                             {isExpanded && <span>{item.name}</span>}
// //                           </span>
// //                           {isExpanded ? (
// //                             openMenu === item.name || isSubMenuActive(item.subMenu || []) ? (
// //                               <ChevronDown
// //                                 size={14}
// //                                 className="text-gray-500"
// //                               />
// //                             ) : (
// //                               <ChevronRight
// //                                 size={14}
// //                                 className="text-gray-400"
// //                               />
// //                             )
// //                           ) : null}
// //                         </button>
// //                         {isExpanded && openMenu === item.name && (
// //                           <ul className="ml-6 mt-1 space-y-1">
// //                             {item.subMenu.map((sub, subIdx) => (
// //                               <li key={subIdx}>
// //                                 <Link
// //                                   href={sub.path}
// //                                   className="flex items-center gap-2 px-2 py-1 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition"
// //                                 >
// //                                   {/* {sub.icon} */}
// //                                   {sub.name}
// //                                 </Link>
// //                               </li>
// //                             ))}
// //                           </ul>
// //                         )}
// //                       </>
// //                     ) : (
// //                       <Link
// //                         href={item.path || "#"}
// //                         className="flex items-center gap-2 px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition"
// //                       >
// //                         {/* {item.icon} */}
// //                         {isExpanded && item.name}
// //                       </Link>
// //                     )}
// //                   </li>
// //                 ))}
// //               </ul>
// //             </div>
// //           ))}
// //         </nav>
// //       </div>
// //     </aside>
// //   );
// // }

// "use client";

// import { useState, useEffect } from "react";
// import { Menu, X, ChevronRight, ChevronDown } from "lucide-react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";

// interface MenuItem {
//   name: string;
//   path?: string;
//   subMenu?: { name: string; path: string }[];
// }

// interface Section {
//   title: string;
//   items: MenuItem[];
// }

// const sections: Section[] = [
//   {
//     title: "MAIN",
//     items: [{ name: "Dashboard", path: "/dashboard" }],
//   },
//   {
//     title: "WEB APPS",
//     items: [
//       {
//         name: "Masters",
//         subMenu: [
//           { name: "Product", path: "/master/product" },
//           { name: "Customer", path: "/master/customer" },
//         ],
//       },
//     ],
//   },
// ];

// export default function Sidebar() {
//   const [collapsed, setCollapsed] = useState(false);
//   const [openMenu, setOpenMenu] = useState<string | null>(null);

//   const pathname = usePathname();

//   // 🔥 Auto open correct menu on refresh / route change
//   // useEffect(() => {
//   //   sections.forEach((section) => {
//   //     section.items.forEach((item) => {
//   //       if (item.subMenu) {
//   //         const isActive = item.subMenu.some((sub) =>
//   //           pathname.startsWith(sub.path)
//   //         );
//   //         if (isActive) {
//   //           setOpenMenu(item.name);
//   //         }
//   //       }
//   //     });
//   //   });
//   // }, [pathname]);
//   useEffect(() => {
//     sections.forEach((section) => {
//       section.items.forEach((item) => {
//         if (item.subMenu) {
//           const isActive = item.subMenu.some((sub) =>
//             pathname.startsWith(sub.path)
//           );
//           if (isActive) {
//             setOpenMenu(item.name);
//           }
//         }
//       });
//     });
//   }, [pathname]);

//   const toggleMenu = (menuName: string) => {
//     setOpenMenu((prev) => (prev === menuName ? null : menuName));
//   };

//   return (
//     <aside className="bg-white h-screen flex flex-col">
//       {/* Header */}
//       <div
//         className={`${
//           collapsed ? "w-16" : "w-52"
//         } flex items-center justify-between px-4 py-3`}
//       >
//         {!collapsed && (
//           <h1 className="text-lg font-bold text-black">ENTERPRISES</h1>
//         )}

//         <button onClick={() => setCollapsed(!collapsed)}>
//           {collapsed ? <X size={20} /> : <Menu size={20} />}
//         </button>
//       </div>

//       {/* Navigation */}
//       <div className={`${collapsed ? "w-16" : "w-52"} flex-1`}>
//         <nav className="px-2 py-4 space-y-4">
//           {sections.map((section, sIdx) => (
//             <div key={sIdx}>
//               {/* Section title */}
//               {!collapsed && (
//                 <span className="text-xs text-gray-400 px-2">
//                   {section.title}
//                 </span>
//               )}

//               <ul className="space-y-1 mt-2">
//                 {section.items.map((item, idx) => {
//                   const isSubActive = item.subMenu?.some((sub) =>
//                     pathname.startsWith(sub.path)
//                   );

//                   return (
//                     <li key={idx}>
//                       {item.subMenu ? (
//                         <>
//                           <button
//                             onClick={() => toggleMenu(item.name)}
//                             className={`w-full flex justify-between px-2 py-2 rounded-md ${
//                               isSubActive
//                                 ? "bg-gray-100 text-green-600"
//                                 : "text-gray-700 hover:bg-gray-100"
//                             }`}
//                           >
//                             {!collapsed && item.name}

//                             {!collapsed &&
//                               (openMenu === item.name ? (
//                                 <ChevronDown size={14} />
//                               ) : (
//                                 <ChevronRight size={14} />
//                               ))}
//                           </button>

//                           {/* Submenu */}
//                           {!collapsed && openMenu === item.name && (
//                             <ul className="ml-4 mt-1 space-y-1">
//                               {item.subMenu.map((sub, subIdx) => {
//                                 const isActive = pathname === sub.path;

//                                 return (
//                                   <li key={subIdx}>
//                                     <Link
//                                       href={sub.path}
//                                       className={`block px-2 py-1 rounded-md ${
//                                         isActive
//                                           ? "text-white bg-green-600"
//                                           : "text-gray-600 hover:bg-gray-50"
//                                       }`}
//                                     >
//                                       {sub.name}
//                                     </Link>
//                                   </li>
//                                 );
//                               })}
//                             </ul>
//                           )}
//                         </>
//                       ) : (
//                         <Link
//                           href={item.path || "#"}
//                           className={`block px-2 py-2 rounded-md ${
//                             pathname === item.path
//                               ? "bg-gray-100 text-blue-600"
//                               : "text-gray-700 hover:bg-gray-100"
//                           }`}
//                         >
//                           {!collapsed && item.name}
//                         </Link>
//                       )}
//                     </li>
//                   );
//                 })}
//               </ul>
//             </div>
//           ))}
//         </nav>
//       </div>
//     </aside>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import { X, Menu, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { motion, AnimatePresence } from "framer-motion";
import { adminSections } from "../utils/SideSection";
import { adminType } from "@/lib/admin/typography";
import { Colors } from "@/lib/theme";
import { colors } from "../utils/Colors";

export const skynetClient = {
  id: "skynet",
  name: "Skynet Solution",
  tagline: "Qatar",
  siteUrl: "https://www.skynetqatar.com/",
  phone: "+974 4431 1525",
  theme: {
    bg: "#FFFFFF",
    bgSoft: "#FAF8F3",
    primary: "#111827",
    primaryMid: "#8B6B1F",
    primaryLight: "#D4A63A",
    accent: "#B88A2A",
    accentHover: "#8B6B1F",
    accentSoft: "#FFF9F0",
    accentLight: "#E8C978",
    muted: "#6B7280",
    border: "#E5E7EB",
  },
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const pathname = usePathname();

  const isExpanded = !collapsed || hovered;

  // ✅ Better matching for nested routes
  const isPathActive = (basePath: string) => {
    return pathname === basePath || pathname.startsWith(basePath + "/");
  };

  const isSubMenuActive = (subMenu: any[]) => {
    return subMenu.some((sub) => isPathActive(sub.path));
  };

  // ✅ Auto open menu on refresh / route change
  useEffect(() => {
    adminSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.subMenu && isSubMenuActive(item.subMenu)) {
          setOpenMenu(item.name);
        }
      });
    });
  }, [pathname]);

  const toggleMenu = (menuName: string) => {
    setOpenMenu((prev) => (prev === menuName ? null : menuName));
  };

  return (
    <aside className="bg-white h-screen flex flex-col transition-all duration-500">
      {/* Header */}
      <div
        className={`${
          collapsed ? "w-16" : "w-48"
        } flex items-center justify-between px-4 py-3 transition-all duration-500`}
      >
        {!collapsed && (
          <h1 className={`flex items-center gap-2 ${adminType.sidebarBrand} font-bold text-blue-900`}>
            <span className="text-emerald-800">SKYNET™</span>
          </h1>
          // <motion.button
          //   type="button"
          //   onClick={() => window.open(skynetClient.siteUrl, "_blank")}
          //   className="flex shrink-0 cursor-pointer flex-col items-start border-0 bg-transparent p-0"
          //   whileHover={{ scale: 1.03 }}
          //   whileTap={{ scale: 0.97 }}
          // >
          //   <span className="font-display text-[20px] font-extrabold leading-none tracking-tight text-gray-900 sm:text-[22px]">
          //     {skynetClient.name.split(" ")[0]}
          //     <span className="text-[11px] font-black text-gray-400">™</span>
          //   </span>
          //   <span className="hidden font-eyebrow text-[7px] tracking-[0.22em] text-gray-400 sm:block">
          //     {skynetClient.tagline}
          //   </span>
          // </motion.button>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-600"
        >
          {collapsed ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <div
        className={`flex-1 transition-all duration-500 ${
          isExpanded ? "w-48" : "w-16"
        }`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <nav className="h-full overflow-y-auto px-2 py-4 space-y-4">
          {adminSections.map((section, sIdx) => (
            <div key={sIdx}>
              {/* Section heading */}
              <div className="px-2 mb-1">
                {isExpanded ? (
                  <span className={adminType.sidebarSection}>
                    {section.title}
                  </span>
                ) : (
                  <span className="flex justify-center mr-3">
                    <span className="w-1.5 h-1.5 bg-[#7987a1] rounded-full"></span>
                  </span>
                )}
              </div>

              <ul className={`space-y-1 ${adminType.sidebarNav}`}>
                {section.items.map((item, idx) => {
                  const isParentActive = item.subMenu
                    ? isSubMenuActive(item.subMenu)
                    : isPathActive(item.path || "");

                  return (
                    <li key={idx}>
                      {item.subMenu ? (
                        <>
                          <button
                            onClick={() => toggleMenu(item.name)}
                            className={`w-full flex items-center justify-between px-2 py-2 rounded-md transition ${
                              isParentActive && isExpanded
                                ? `${colors.mainColor} text-white`
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {/* {item.icon} */}
                              {/* {isExpanded && <span>{item.name}</span>} */}
                              <span className="flex items-center gap-2">
                                {item.icon}
                                {isExpanded && <span>{item.name}</span>}
                              </span>
                            </span>

                            {isExpanded &&
                              (openMenu === item.name || isParentActive ? (
                                <ChevronDown size={14} />
                              ) : (
                                <ChevronRight size={14} />
                              ))}
                          </button>

                          {/* Submenu */}
                          {isExpanded && openMenu === item.name && (
                            <ul className="ml-6 mt-1 space-y-1">
                              {item.subMenu.map((sub, subIdx) => {
                                const isActive = isPathActive(sub.path);

                                return (
                                  <li key={subIdx}>
                                    <Link
                                      href={sub.path}
                                      className={`flex items-center gap-2 px-2 py-1 rounded-md transition ${adminType.sidebarSubNav} ${
                                        isActive
                                          ? `text-white ${colors.mainColor}`
                                          : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                                      }`}
                                    >
                                      {sub.icon}
                                      {sub.name}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </>
                      ) : (
                        <Link
                          href={item.path || "#"}
                          className={`flex items-center gap-2 px-2 py-2 rounded-md transition ${
                            isPathActive(item.path || "")
                              ? `${colors.mainColor} text-white`
                              : "text-gray-700 hover:bg-gray-100"
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
