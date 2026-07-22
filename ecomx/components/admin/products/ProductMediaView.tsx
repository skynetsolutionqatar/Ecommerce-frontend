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
    return <p className={`${adminType.label} text-gray-400`}>No images uploaded</p>;
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
            className="group overflow-hidden rounded-xl border border-gray-200 bg-gray-50 transition hover:border-emerald-300 hover:shadow-md"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={isThumbnail ? "Product thumbnail" : `Product image ${index + 1}`}
                className="h-full w-full object-contain p-2 transition group-hover:scale-[1.02]"
                loading="lazy"
              />
              <span className="absolute right-2 top-2 rounded-md bg-white/90 p-1 text-gray-500 opacity-0 shadow-sm transition group-hover:opacity-100">
                <ExternalLink size={14} />
              </span>
            </div>

            <div className="space-y-1 border-t border-gray-100 bg-white p-3">
              {isThumbnail && (
                <span className={`inline-flex rounded-full bg-emerald-50 px-2 py-0.5 ${adminType.badge} font-medium text-emerald-700`}>
                  Thumbnail
                </span>
              )}
              <p className={`break-all ${adminType.badge} text-blue-600 group-hover:underline`}>
                {url}
              </p>
            </div>
          </a>
        );
      })}
    </div>
  );
}
