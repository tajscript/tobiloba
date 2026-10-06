"use client";

import { useState } from "react";
import Link from "next/link";
import ArtImage from "@/components/ArtImage";
import EnquiryButton from "@/components/EnquiryButton";
import Paragraphs from "@/components/Paragraphs";
import type { Artwork } from "@/lib/types";

interface GalleryProps {
  title: string;
  artworks: Artwork[];
  enquiryLabel: string;
  enquiryLink: string;
}

export default function Gallery({ title, artworks, enquiryLabel, enquiryLink }: GalleryProps) {
  const [selectedArt, setSelectedArt] = useState<Artwork | null>(null);

  return (
    <section className="bg-primary pb-20 text-background min-h-[70vh]">
      <div className="max-w-[1563px] mx-auto px-5 sm:px-10 lg:px-20">
        <h1 className="text-center py-10 text-xl font-semibold sm:text-2xl">{title}</h1>

        {artworks.length === 0 ? (
          <div className="text-center py-10">
            <p>No artworks found.</p>
          </div>
        ) : (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            {artworks.map((art) => (
              <div
                key={art.slug}
                className="w-full cursor-pointer"
                onClick={() => setSelectedArt(art)}
              >
                {art.image.url ? (
                  <ArtImage
                    image={art.image}
                    alt={art.image.alt || art.title}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="h-[22rem] w-full lg:h-96 object-cover"
                  />
                ) : (
                  <div className="h-[22rem] w-full lg:h-96 bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600">No Image</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedArt && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="bg-primary/60 text-background rounded-lg p-6 w-[90%] max-w-md relative">
            <button
              onClick={() => setSelectedArt(null)}
              className="absolute top-2 right-3 text-xl font-bold"
            >
              ×
            </button>

            {selectedArt.image.url && (
              <ArtImage
                image={selectedArt.image}
                alt={selectedArt.image.alt || selectedArt.title}
                sizes="28rem"
                className="w-full h-64 object-cover rounded my-4"
              />
            )}

            <div className="text-left space-y-2">
              <h2 className="text-xl font-semibold text-secondary">{selectedArt.title}</h2>

              {selectedArt.size && (
                <p className="text-sm text-background/50">Size: {selectedArt.size}</p>
              )}

              {selectedArt.description && (
                <div className="text-sm text-background/80">
                  <Paragraphs text={selectedArt.description} />
                </div>
              )}

              {selectedArt.price > 0 && (
                <p className="font-bold mt-2">${selectedArt.price.toLocaleString()}</p>
              )}

              {selectedArt.soldOut ? (
                <p className="text-red-500 font-semibold text-center mt-4">Sold Out</p>
              ) : (
                <EnquiryButton artTitle={selectedArt.title} label={enquiryLabel} link={enquiryLink} className="w-full mt-4" />
              )}

              {selectedArt.showInShop && (
                <div className="text-center">
                  <Link
                    href={`/shop/${selectedArt.slug}`}
                    className="underline text-secondary hover:text-secondary/80 transition-colors duration-300"
                  >
                    View in Shop
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
