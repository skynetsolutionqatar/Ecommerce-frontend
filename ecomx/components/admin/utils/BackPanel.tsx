"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, SquarePen, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { adminType } from "@/lib/admin/typography";
import { cn } from "@/lib/utils";
import { colors } from "./Colors";
import DeleteDialog from "./DeleteDialog";

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
  deleteItemName?: string;
  onDelete?: () => void | Promise<void>;
  deleting?: boolean;
  buttons?: FooterButton[];
};

export default function BackPanel({
  children,
  showBack = true,
  tabs,
  editPath,
  deleteItemName,
  onDelete,
  deleting = false,
  buttons = [],
}: BackPanelProps) {
  const router = useRouter();
  const firstTabKey = tabs?.[0]?.key ?? "";
  const [activeTab, setActiveTab] = useState(firstTabKey);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const hasTabs = !!tabs && tabs.length > 0;
  const canDelete = Boolean(onDelete && deleteItemName);

  const resolvedActiveTab =
    hasTabs && tabs.some((tab) => tab.key === activeTab) ? activeTab : firstTabKey;

  const scrollTo = (key: string) => {
    setActiveTab(key);
    document.getElementById(key)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const footerButtons: FooterButton[] = [];

  if (canDelete) {
    footerButtons.push({
      label: "Delete",
      icon: <Trash2 size={16} strokeWidth={2.25} />,
      onClick: () => setDeleteOpen(true),
      disabled: deleting,
      className:
        "rounded-lg border border-red-600 bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50",
    });
  }

  if (editPath) {
    footerButtons.push({
      label: "Edit",
      icon: <SquarePen size={16} strokeWidth={2.25} />,
      onClick: () => router.push(editPath),
      className: cn(
        "rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90",
        colors.mainColor
      ),
    });
  }

  footerButtons.push(...buttons);

  return (
    <div className="h-full p-3">
      <div className="mx-auto flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="flex-1 overflow-y-auto">
          {showBack && (
            <div className="px-2 pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex cursor-pointer items-center gap-1 pl-2 text-foreground transition-all hover:text-foreground"
              >
                <ArrowLeft size={16} className="text-foreground" />
                <span className={adminType.backButton}>Back</span>
              </Button>
            </div>
          )}

          {hasTabs && (
            <div className="sticky top-0 z-30 rounded-t-2xl border-b border-border bg-card p-4 shadow-lg">
              <div className={`${colors.mainColor} rounded-md p-1 text-white shadow-xl`}>
                <div className="mx-auto flex max-w-7xl items-center gap-3 px-2 py-1">
                  <div className="hide-scrollbar flex items-center gap-3 overflow-x-auto pb-1">
                    {tabs!.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => scrollTo(tab.key)}
                        className={`whitespace-nowrap rounded-md px-3 py-2 ${adminType.tabButton} cursor-pointer transition-all duration-200 ${
                          resolvedActiveTab === tab.key
                            ? "bg-card text-foreground shadow-md"
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

          <div className="p-4 sm:p-6">{children}</div>
        </div>

        {footerButtons.length > 0 && (
          <div className="z-30 flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border bg-card px-4 py-3 shadow-md sm:px-6">
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

      {canDelete && (
        <DeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          itemName={deleteItemName!}
          onConfirm={onDelete!}
          loading={deleting}
        />
      )}
    </div>
  );
}
