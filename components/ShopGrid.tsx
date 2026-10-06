import Link from "next/link";
import ArtImage from "@/components/ArtImage";
import type { Artwork } from "@/lib/types";

export default function ShopGrid({ artworks }: { artworks: Artwork[] }) {
  return (
    <section className="bg-primary min-h-[70vh] text-background px-5 pt-10 pb-20 mx-auto sm:px-10 lg:px-20">
      <div className="flex flex-col items-center max-w-[1563px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-10">
          {artworks.map((item) => (
            <div key={item.slug}>
              <Link href={`/shop/${item.slug}`} className="flex flex-col items-center gap-1">
                <div className="w-full overflow-hidden sm:w-80 sm:h-80">
                  <ArtImage image={item.image} alt={item.image.alt || item.title} sizes="(min-width: 640px) 20rem, 100vw" />
                </div>

                <div className="text-secondary sm:text-lg">{item.title}</div>
                {item.soldOut ? <div>Sold Out</div> : item.price > 0 && <div>${item.price.toLocaleString()}</div>}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
