"use client";

import FixedContentPageAdmin from "@/components/admin/content-pages/FixedContentPageAdmin";
import { getFixedContentPageResource } from "@/lib/admin/content-page-resources";

const resource = getFixedContentPageResource("cookie-policy")!;

export default function AdminCookiePolicyPage() {
  return <FixedContentPageAdmin resource={resource} />;
}