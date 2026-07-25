"use client";

import { useMemo } from "react";
import { ExternalLink } from "lucide-react";
import { adminType } from "@/lib/admin/typography";

interface ProductMediaViewProps {
  thumbnail?: string;
  images?: string[];
}

function collectImageUrls(thumbnail?: string, images?: string[]) {
  const urls: string[] = [];
  const seen = new Set<string>();

  for (const url of [thumbnail, ...(images ?? [])]) {
    const trimmed = url?.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    urls.push(trimmed);
  }

  return urls;
}

export default function ProductMediaView({ thumbnail, images }: ProductMediaViewProps) {
  const urls = useMemo(() => collectImageUrls(thumbnail, images), [thumbnail, images]);

  if (urls.length === 0) {
    return <p className={`${adminType.label} text-muted-foreground`}>No images uploaded</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {urls.map((url, index) => {
        const isThumbnail = thumbnail?.trim() === url;

        return (
          <a
            key={`${url}-${index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group overflow-hidden rounded-xl border border-border bg-muted transition hover:border-emerald-500/50 hover:shadow-md"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={isThumbnail ? "Product thumbnail" : `Product image ${index + 1}`}
                className="h-full w-full object-contain p-2 transition group-hover:scale-[1.02]"
                loading="lazy"
              />
              <span className="absolute right-2 top-2 rounded-md bg-card/90 p-1 text-muted-foreground opacity-0 shadow-sm transition group-hover:opacity-100">
                <ExternalLink size={14} />
              </span>
            </div>

            <div className="space-y-1 border-t border-border bg-card p-3">
              {isThumbnail && (
                <span className={`inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 ${adminType.badge} font-medium text-emerald-700 dark:text-emerald-400`}>
                  Thumbnail
                </span>
              )}
              <p className={`break-all ${adminType.badge} text-blue-600 group-hover:underline dark:text-blue-400`}>
                {url}
              </p>
            </div>
          </a>
        );
      })}
    </div>
  );
}
