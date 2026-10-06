import ArtworkForm from "@/components/admin/ArtworkForm";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return <ArtworkForm key={slug} slug={slug} />;
}
