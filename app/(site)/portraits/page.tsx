import Gallery from "@/components/Gallery";
import { getArtworksByCategory, getContent } from "@/lib/content";

export default async function Page() {
  const [galleries, settings, artworks] = await Promise.all([
    getContent("galleries"),
    getContent("settings"),
    getArtworksByCategory("portraits"),
  ]);

  return (
    <Gallery
      title={galleries.portraitsTitle}
      artworks={artworks}
      enquiryLabel={settings.enquiryLabel}
      enquiryLink={settings.enquiryLink}
    />
  );
}
