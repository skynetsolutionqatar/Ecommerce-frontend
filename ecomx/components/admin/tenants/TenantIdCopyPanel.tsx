"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Copy, Check } from "lucide-react";
import { adminType } from "@/lib/admin/typography";

interface TenantIdCopyPanelProps {
  tenantId: string;
  tenantName?: string;
}

type CopyField = "id" | "env";

export default function TenantIdCopyPanel({ tenantId, tenantName }: TenantIdCopyPanelProps) {
  const [copiedField, setCopiedField] = useState<CopyField | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const envBlock = `NEXT_PUBLIC_TENANT_ID=${tenantId}`;

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleCopy = async (field: CopyField, text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      setCopiedField(field);
      toast.success(`${label} copied`);
      resetTimerRef.current = setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const copyButton = (field: CopyField, label: string, onCopy: () => void) => {
    const copied = copiedField === field;
    return (
      <button
        type="button"
        onClick={onCopy}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold hover:bg-muted"
        aria-label={copied ? `${label} copied` : label}
      >
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : label}
      </button>
    );
  };

  return (
    <section className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-5">
      <h3 className={`${adminType.sectionTitle} mb-1 text-base`}>Client frontend env</h3>
      <p className={`${adminType.pageDescription} mb-4 max-w-2xl`}>
        Paste this into the other project&apos;s{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">.env</code> so API calls send{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">x-tenant-id</code> for
        {tenantName ? ` ${tenantName}` : " this store"}.
      </p>

      <div className="space-y-3">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Tenant ID
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 break-all rounded-md border border-border bg-card px-3 py-2 text-sm font-mono">
              {tenantId}
            </code>
            {copyButton("id", "Copy ID", () => void handleCopy("id", tenantId, "Tenant ID"))}
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Env line
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 break-all rounded-md border border-border bg-card px-3 py-2 text-sm font-mono">
              {envBlock}
            </code>
            {copyButton("env", "Copy env", () => void handleCopy("env", envBlock, "Env line"))}
          </div>
        </div>
      </div>
    </section>
  );
}
