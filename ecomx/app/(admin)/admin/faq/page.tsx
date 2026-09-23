"use client";

import FixedContentPageAdmin from "@/components/admin/content-pages/FixedContentPageAdmin";
import { getFixedContentPageResource } from "@/lib/admin/content-page-resources";

const resource = getFixedContentPageResource("faq")!;

export default function AdminFaqPage() {
  return <FixedContentPageAdmin resource={resource} />;
}
