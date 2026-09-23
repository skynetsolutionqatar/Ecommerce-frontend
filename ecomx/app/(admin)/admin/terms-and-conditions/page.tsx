"use client";

import FixedContentPageAdmin from "@/components/admin/content-pages/FixedContentPageAdmin";
import { getFixedContentPageResource } from "@/lib/admin/content-page-resources";

const resource = getFixedContentPageResource("terms-and-conditions")!;

export default function AdminTermsPage() {
  return <FixedContentPageAdmin resource={resource} />;
}
