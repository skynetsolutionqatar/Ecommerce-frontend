import { use } from "react";
import ProductReviewsPageClient from "@/components/store/ProductReviewsPageClient";

export default function ProductReviewsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  return <ProductReviewsPageClient slug={slug} />;
}
