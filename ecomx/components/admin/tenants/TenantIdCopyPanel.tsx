"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Copy, Check } from "lucide-react";
import { adminType } from "@/lib/admin/typography";
import { API_CONFIG } from "@/lib/config";
import type { ApiTenant } from "@/types/tenant.types";

interface TenantIdCopyPanelProps {
  tenant: Pick<
    ApiTenant,
    "_id" | "name" | "slug" | "clientUrl" | "googleConfig"
  >;
}

type CopyField = "id" | "env";

function buildClientEnvBlock(tenant: TenantIdCopyPanelProps["tenant"]): string {
  const lines = [
    `NEXT_PUBLIC_API_URL=${API_CONFIG.baseURL}`,
    `NEXT_PUBLIC_TENANT_ID=${tenant._id}`,
    `NEXT_PUBLIC_TENANT_SLUG=${tenant.slug}`,
  ];

  if (tenant.clientUrl?.trim()) {
    lines.push(`NEXT_PUBLIC_CLIENT_URL=${tenant.clientUrl.trim()}`);
  }

  const googleClientId = tenant.googleConfig?.enabled
    ? tenant.googleConfig.clientId?.trim()
    : "";
  if (googleClientId) {
    lines.push(`NEXT_PUBLIC_GOOGLE_CLIENT_ID=${googleClientId}`);
  }

  lines.push(
    "",
    "# Resend API key, Google client secret, and GOOGLE_CALLBACK_URL stay on the API server",
    "# (set in tenant Integrations in the developer portal, or global API env)."
  );

  return lines.join("\n");
}

export default function TenantIdCopyPanel({ tenant }: TenantIdCopyPanelProps) {
  const [copiedField, setCopiedField] = useState<CopyField | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const envBlock = useMemo(() => buildClientEnvBlock(tenant), [tenant]);

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
        Paste into the client project&apos;s{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">.env.local</code>. API calls use{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">x-tenant-id</code>
        {tenant.name ? ` for ${tenant.name}` : ""}. Configure Resend and Google secrets under
        Integrations on this store (server-side).
      </p>

      <div className="space-y-3">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Tenant ID
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 break-all rounded-md border border-border bg-card px-3 py-2 text-sm font-mono">
              {tenant._id}
            </code>
            {copyButton("id", "Copy ID", () =>
              void handleCopy("id", tenant._id, "Tenant ID")
            )}
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Env block
          </p>
          <div className="flex flex-wrap items-start gap-2">
            <pre className="min-w-0 flex-1 overflow-x-auto whitespace-pre-wrap break-all rounded-md border border-border bg-card px-3 py-2 text-sm font-mono">
              {envBlock}
            </pre>
            {copyButton("env", "Copy env", () =>
              void handleCopy("env", envBlock, "Env block")
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
