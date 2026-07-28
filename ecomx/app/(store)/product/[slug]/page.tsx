import { use } from "react";
import ProductPageClient from "@/components/store/ProductPageClient";

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  return <ProductPageClient slug={slug} />;
}
