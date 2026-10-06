import Gallery from "@/components/Gallery";
import { getArtworksByCategory, getContent } from "@/lib/content";

export default async function Page() {
  const [galleries, settings, artworks] = await Promise.all([
    getContent("galleries"),
    getContent("settings"),
    getArtworksByCategory("narrative"),
  ]);

  return (
    <Gallery
      title={galleries.narrativeTitle}
      artworks={artworks}
      enquiryLabel={settings.enquiryLabel}
      enquiryLink={settings.enquiryLink}
    />
  );
}
