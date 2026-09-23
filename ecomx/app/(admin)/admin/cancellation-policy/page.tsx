"use client";

import FixedContentPageAdmin from "@/components/admin/content-pages/FixedContentPageAdmin";
import { getFixedContentPageResource } from "@/lib/admin/content-page-resources";

const resource = getFixedContentPageResource("cancellation-policy")!;

export default function AdminCancellationPolicyPage() {
  return <FixedContentPageAdmin resource={resource} />;
}
