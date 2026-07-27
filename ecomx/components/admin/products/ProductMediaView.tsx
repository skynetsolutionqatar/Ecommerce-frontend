"use client";

import { useMemo, useState } from "react";
import { ExternalLink, ImageOff } from "lucide-react";
import { adminType } from "@/lib/admin/typography";
import { productMediaUrls, sameImageUrl } from "@/lib/admin/product-form";

interface ProductMediaViewProps {
  thumbnail?: unknown;
  images?: unknown;
}

function MediaImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-2 bg-muted p-4 text-muted-foreground">
        <ImageOff size={28} strokeWidth={1.5} />
        <p className={`text-center ${adminType.badge}`}>Image failed to load</p>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="h-full min-h-[200px] w-full object-contain p-3"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export default function ProductMediaView({ thumbnail, images }: ProductMediaViewProps) {
  const urls = useMemo(() => productMediaUrls(thumbnail, images), [thumbnail, images]);
  const thumbnailValue = typeof thumbnail === "string" ? thumbnail.trim() : "";

  if (urls.length === 0) {
    return <p className={`${adminType.label} text-muted-foreground`}>No images uploaded</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {urls.map((url, index) => {
        const isThumbnail = thumbnailValue ? sameImageUrl(thumbnailValue, url) : index === 0;

        return (
          <a
            key={`${url}-${index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group overflow-hidden rounded-xl border border-border bg-card transition hover:border-emerald-500/50 hover:shadow-md"
          >
            <div className="relative min-h-[200px] overflow-hidden bg-muted/40">
              <MediaImage src={url} alt={isThumbnail ? "Product thumbnail" : `Product image ${index + 1}`} />
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
