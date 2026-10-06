import ShopGrid from "@/components/ShopGrid";
import { getArtworks } from "@/lib/content";

export default async function Page() {
  const artworks = await getArtworks();

  return <ShopGrid artworks={artworks.filter((art) => art.showInShop)} />;
}
