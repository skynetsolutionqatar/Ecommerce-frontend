"use client";

import { Maximize2 } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

interface ChartExpandButtonProps {
  onClick: () => void;
}

export function ChartExpandButton({ onClick }: ChartExpandButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Expand chart"
      className="rounded-md p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground"
    >
      <Maximize2 size={18} />
    </button>
  );
}

interface ChartExpandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function ChartExpandDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: ChartExpandDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-[200] bg-black/40 duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 supports-backdrop-filter:backdrop-blur-xs"
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed top-1/2 left-1/2 z-[210] grid w-[min(960px,calc(100vw-2rem))] max-h-[min(90vh,calc(100vh-2rem))] -translate-x-1/2 -translate-y-1/2 gap-0 overflow-hidden rounded-xl bg-popover text-popover-foreground text-sm shadow-xl ring-1 ring-border duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
            <div className="min-w-0">
              <DialogPrimitive.Title className="text-base font-semibold text-foreground">
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="mt-1 text-sm text-muted-foreground">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="icon-sm" className="shrink-0">
                <XIcon />
                <span className="sr-only">Close</span>
              </Button>
            </DialogPrimitive.Close>
          </div>
          <div className="overflow-y-auto p-6">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
