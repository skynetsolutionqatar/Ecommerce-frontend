import ContentPageView from "@/components/store/ContentPageView";

export default async function ContentPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ContentPageView slug={slug} />;
}
