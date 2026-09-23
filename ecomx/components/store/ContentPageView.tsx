"use client";

import Link from "next/link";
import * as Icons from "@/components/Icons";
import { useContentPageBySlug } from "@/hooks/useContentPages";
import { ROUTES } from "@/lib/routes";
import { tw, type } from "@/lib/theme";

function renderBody(body: string) {
  return body.split(/\n\n+/).map((block, index) => {
    const lines = block.split("\n");
    const isHeading =
      lines.length === 1 && lines[0].length < 80 && !lines[0].startsWith("Q:");

    if (isHeading) {
      return (
        <h2
          key={index}
          className="mb-3 mt-8 font-display text-lg font-semibold text-primary first:mt-0"
        >
          {lines[0]}
        </h2>
      );
    }

    return (
      <p
        key={index}
        className="mb-4 whitespace-pre-line text-[15px] leading-7 text-gray-600 md:text-[14px]"
      >
        {block}
      </p>
    );
  });
}

function ContentPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${tw.pageTopOffset} min-h-screen pb-24`}
      style={{ background: "#f1f3f6" }}
    >
      <div className="mx-auto flex max-w-[900px] flex-col gap-6 px-3 pt-4 sm:px-5 md:px-8 md:pt-6 lg:px-[50px]">
        <Link href={ROUTES.home} className={`${tw.storeBackLink} w-fit`}>
          <Icons.ChevronLeft /> Back to Home
        </Link>
        {children}
      </div>
    </div>
  );
}

export default function ContentPageView({ slug }: { slug: string }) {
  const { data: page, isLoading, isError } = useContentPageBySlug(slug);

  if (isLoading) {
    return (
      <ContentPageShell>
        <div className={`${tw.card} px-6 py-12 sm:px-8`}>
          <p className="text-sm text-muted">Loading...</p>
        </div>
      </ContentPageShell>
    );
  }

  if (isError || !page) {
    return (
      <ContentPageShell>
        <div className={`${tw.card} px-6 py-12 text-center sm:px-8`}>
          <h1 className="font-display text-2xl font-bold text-primary">Page not found</h1>
          <p className="mt-3 text-sm text-muted">This content page is unavailable.</p>
        </div>
      </ContentPageShell>
    );
  }

  return (
    <ContentPageShell>
      <div className={`${tw.card} px-6 py-8 sm:px-8 sm:py-10`}>
        <div className={`mb-2 ${type.eyebrow} text-[13px] text-muted md:text-[11px]`}>
          Information
        </div>
        <h1 className="font-display text-[28px] font-bold leading-tight text-primary sm:text-[32px]">
          {page.title}
        </h1>
        <div className="mt-8 flex flex-col gap-1">{renderBody(page.body)}</div>
      </div>
    </ContentPageShell>
  );
}
