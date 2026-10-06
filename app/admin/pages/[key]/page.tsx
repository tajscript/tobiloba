import { notFound } from "next/navigation";
import PageEditor from "@/components/admin/PageEditor";
import { CONTENT_KEYS, type ContentKey } from "@/lib/types";

export default async function Page({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!CONTENT_KEYS.includes(key as ContentKey)) notFound();

  return <PageEditor pageKey={key as ContentKey} />;
}
