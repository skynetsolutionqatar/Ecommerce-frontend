"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Copy, Check } from "lucide-react";
import { adminType } from "@/lib/admin/typography";

interface TenantIdCopyPanelProps {
  tenantId: string;
  tenantName?: string;
}

export default function TenantIdCopyPanel({ tenantId, tenantName }: TenantIdCopyPanelProps) {
  const [copied, setCopied] = useState(false);

  const envBlock = `NEXT_PUBLIC_TENANT_ID=${tenantId}`;

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label} copied`);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy to clipboard");
    }
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
            <button
              type="button"
              onClick={() => void handleCopy(tenantId, "Tenant ID")}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold hover:bg-muted"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              Copy ID
            </button>
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
            <button
              type="button"
              onClick={() => void handleCopy(envBlock, "Env line")}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold hover:bg-muted"
            >
              <Copy className="h-4 w-4" />
              Copy env
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
