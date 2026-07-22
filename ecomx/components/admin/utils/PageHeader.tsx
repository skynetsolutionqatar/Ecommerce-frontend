"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { colors } from "./Colors";

type PageHeaderProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  showBackButton?: boolean;
  className?: string;
  btnClassName?: string;
};

function PageHeader({
  title,
  description,
  actionLabel,
  onAction,
  showBackButton = false,
  className = "",
  btnClassName = "",
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className={`mb-6 flex items-center justify-between ${className}`}>
      <div className="flex items-start gap-3">
        {showBackButton && (
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft size={16} />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>

      {actionLabel && (
        <Button
          size="sm"
          onClick={onAction}
          className={`gap-2 ${btnClassName} ${colors.mainColor} text-white transition-all hover:bg-opacity-90 cursor-pointer`}
        >
          <Plus className="h-4 w-4 font-bold" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default React.memo(PageHeader);
