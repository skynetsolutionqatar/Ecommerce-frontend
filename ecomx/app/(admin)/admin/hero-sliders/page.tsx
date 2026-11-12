"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/admin/utils/PageHeader";
import {
  ListPageShell,
  ListPagination,
  ListTableCard,
  ListToolbar,
} from "@/components/admin/shared";
import { useHeroSliders } from "@/hooks/useHeroSliders";
import { useDebounce } from "@/hooks/useDebounce";
import { LIST_PAGE_SIZE } from "@/lib/admin/client-pagination";
import { ADMIN_ROUTES } from "@/lib/config";
import {
  heroSliderLifecycleLabel,
  HERO_SLIDER_ARCHIVE_FILTER_OPTIONS,
} from "@/lib/admin/hero-slider-status";
import type { ApiHeroSlider, HeroSliderArchiveFilter } from "@/types/hero-slider.types";

function lifecycleBadge(slide: ApiHeroSlider) {
  const label = heroSliderLifecycleLabel(slide);
  if (slide.isArchived) return "bg-orange-100 text-orange-800";
  if (slide.isPublished) return "bg-green-100 text-green-800";
  return "bg-slate-100 text-slate-700";
}

export default function AdminHeroSlidersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [archive, setArchive] = useState<HeroSliderArchiveFilter>("active");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError } = useHeroSliders({
    search: debouncedSearch || undefined,
    archive,
    page,
    limit: LIST_PAGE_SIZE,
    sortBy: "displayOrder",
    sortOrder: "asc",
  });

  const slides = data?.heroSliders ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? slides.length;

  const handlers = useMemo(
    () => ({
      onSearch: (value: string) => {
        setSearch(value);
        setPage(1);
      },
      onArchive: (value: string) => {
        setArchive((value || "active") as HeroSliderArchiveFilter);
        setPage(1);
      },
    }),
    []
  );

  return (
    <ListPageShell isLoading={isLoading} isError={false} loadingMessage="Loading hero slides...">
      <PageHeader
        title="Homepage hero slider"
        description="Weekly hero copy, images, and colors for the storefront carousel."
        actionLabel="Add slide"
        onAction={() => router.push(`${ADMIN_ROUTES.heroSliders}/add`)}
        btnClassName="rounded-md bg-black px-4 py-2 text-sm text-white"
      />

      {isError ? (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          Hero slider API is not available. Mount `/hero-sliders` on the backend and refresh.
        </div>
      ) : null}

      <ListToolbar
        search={search}
        onSearchChange={handlers.onSearch}
        searchPlaceholder="Search slides..."
        filters={[
          {
            key: "archive",
            value: archive,
            placeholder: "Active workspace",
            options: HERO_SLIDER_ARCHIVE_FILTER_OPTIONS.map((o) => ({
              label: o.label,
              value: o.value,
            })),
            onChange: handlers.onArchive,
          },
        ]}
      />

      <ListTableCard
        footer={
          <ListPagination
            page={page}
            totalPages={totalPages}
            total={total}
            showing={slides.length}
            onPageChange={setPage}
            hasNext={pagination?.hasNextPage}
          />
        }
      >
        <table className="admin-table w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-5 py-3 text-left">#</th>
              <th className="px-5 py-3 text-left">Title</th>
              <th className="px-5 py-3 text-left">Offer</th>
              <th className="px-5 py-3 text-left">Mode</th>
              <th className="px-5 py-3 text-left">Order</th>
              <th className="px-5 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {slides.length > 0 ? (
              slides.map((slide: ApiHeroSlider, index: number) => (
                <tr
                  key={slide._id}
                  onClick={() => router.push(ADMIN_ROUTES.heroSlider(slide._id))}
                  className="cursor-pointer border-t hover:bg-gray-50"
                >
                  <td className="px-5 py-4 text-gray-400">
                    {(page - 1) * LIST_PAGE_SIZE + index + 1}
                  </td>
                  <td className="px-5 py-4">{slide.title?.trim() || slide.offerLabel?.trim() || "—"}</td>
                  <td className="px-5 py-4">{slide.offerLabel?.trim() || "—"}</td>
                  <td className="px-5 py-4">{slide.isPoster ? "Poster" : "Content"}</td>
                  <td className="px-5 py-4">{slide.displayOrder}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${lifecycleBadge(slide)}`}
                    >
                      {heroSliderLifecycleLabel(slide)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-400">
                  No hero slides yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </ListTableCard>
    </ListPageShell>
  );
}
