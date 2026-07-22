"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, SquarePen, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { adminType } from "@/lib/admin/typography";
import { cn } from "@/lib/utils";
import { colors } from "./Colors";

interface Tab {
  key: string;
  label: string;
}

export interface FooterButton {
  label: string;
  type?: "button" | "submit" | "reset";
  form?: string;
  variant?: "default" | "ghost" | "outline" | "destructive";
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

type BackPanelProps = {
  children: React.ReactNode;
  showBack?: boolean;
  tabs?: Tab[];
  editPath?: string;
  onDelete?: () => void;
  deleting?: boolean;
  buttons?: FooterButton[];
};

export default function BackPanel({
  children,
  showBack = true,
  tabs,
  editPath,
  onDelete,
  deleting = false,
  buttons = [],
}: BackPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(tabs?.[0]?.key ?? "");

  const hasTabs = !!tabs && tabs.length > 0;

  const scrollTo = (key: string) => {
    setActiveTab(key);
    document.getElementById(key)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (tabs && tabs.length > 0) setActiveTab(tabs[0].key);
  }, [tabs]);

  const footerButtons: FooterButton[] = [];
  let deleteButton: FooterButton | null = null;

  if (onDelete) {
    deleteButton = {
      label: deleting ? "Deleting..." : "Delete",
      icon: <Trash2 size={16} strokeWidth={2.25} />,
      onClick: onDelete,
      disabled: deleting,
      className:
        "rounded-lg border border-red-600 bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50",
    };
  }

  if (editPath) {
    footerButtons.push({
      label: "Edit",
      icon: <SquarePen size={16} strokeWidth={2.25} />,
      onClick: () => router.push(editPath),
      className: cn(
        "rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900",
        colors.mainColor
      ),
    });
  }

  footerButtons.push(...buttons);

  return (
    <div className="h-full bg-gray-100 p-3">
      <div className="mx-auto flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="flex-1 overflow-y-auto">
          {showBack && (
            <div className="px-2 pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-1 pl-2 text-black hover:text-black cursor-pointer transition-all"
              >
                <ArrowLeft size={16} className="text-black" />
                <span className={adminType.backButton}>Back</span>
              </Button>
            </div>
          )}

          {hasTabs && (
            <div className="sticky top-0 z-50 rounded-t-2xl border-b border-gray-200 bg-white p-4 shadow-lg">
              <div className={`${colors.mainColor} rounded-md p-1 text-white shadow-xl`}>
                <div className="mx-auto flex max-w-7xl items-center gap-3 px-2 py-1">
                  <div className="hide-scrollbar flex items-center gap-3 overflow-x-auto pb-1">
                    {tabs!.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => scrollTo(tab.key)}
                        className={`whitespace-nowrap rounded-md px-3 py-2 ${adminType.tabButton} transition-all cursor-pointer duration-200 ${
                          activeTab === tab.key
                            ? "bg-white text-gray-900 shadow-md"
                            : "text-white/90 hover:bg-white/20"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-6">{children}</div>
        </div>

        {(deleteButton || footerButtons.length > 0) && (
          <div className="z-50 flex shrink-0 items-center justify-between gap-3 border-t bg-white px-6 py-3 shadow-md">
            <div>
              {deleteButton && (
                <Button
                  type="button"
                  disabled={deleteButton.disabled}
                  onClick={deleteButton.onClick}
                  className={deleteButton.className}
                >
                  {deleteButton.icon && (
                    <span className="mr-2 flex items-center">{deleteButton.icon}</span>
                  )}
                  {deleteButton.label}
                </Button>
              )}
            </div>

            {footerButtons.length > 0 && (
              <div className="flex gap-2">
                {footerButtons.map((button, index) => (
                  <Button
                    key={index}
                    type={button.type ?? "button"}
                    form={button.form}
                    variant={button.variant}
                    disabled={button.disabled}
                    onClick={button.onClick}
                    className={button.className}
                  >
                    {button.icon && <span className="mr-2 flex items-center">{button.icon}</span>}
                    {button.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
