import { type Metadata } from "next";
import { notFound } from "next/navigation";

import ProductDetail from "@/components/ProductDetail";
import { getArtwork, getContent } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const [artwork, settings] = await Promise.all([getArtwork(slug), getContent("settings")]);
  if (!artwork) notFound();

  return <ProductDetail artwork={artwork} enquiryLabel={settings.enquiryLabel} enquiryLink={settings.enquiryLink} />;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getArtwork(slug);
  if (!artwork) return {};

  return {
    title: artwork.title,
    description: artwork.description || undefined,
    openGraph: { images: artwork.image.url ? [{ url: artwork.image.url }] : [] },
  };
}
