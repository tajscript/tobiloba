"use client";

import { FC, useEffect, useState } from "react";
import { Content, isFilled } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import Link from "next/link";
import { asText } from "@prismicio/client";
import MakeOfferModal from "@/components/MakeOffer";

/**
 * Props for `Paintings`.
 */
export type PaintingsProps = SliceComponentProps<Content.PaintingsSlice>;

export function generateSlug(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .trim();
}

const Paintings: FC<PaintingsProps> = ({ slice }) => {
  const [arts, setArts] = useState<any[]>([]);
  const [selectedArt, setSelectedArt] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!slice.primary?.art_details || slice.primary.art_details.length === 0) {
          console.warn("No art_details found in slice");
          setArts([]);
          setLoading(false);
          return;
        }

        const client = createClient();

        const fetched = await Promise.all(
          slice.primary.art_details.map(async (item, index) => {
            try {
              if (isFilled.contentRelationship(item.paintings) && item.paintings.uid) {
                const doc = await client.getByUID("featured_arts", item.paintings.uid);

                const slug = generateSlug(doc.uid);
                return { ...doc.data, slug, uid: doc.uid, id: doc.id };
              } else {
                console.warn(`Item ${index} has invalid content relationship:`, item);
                return null;
              }
            } catch (itemError) {
              console.error(`Error fetching item ${index}:`, itemError);
              return null;
            }
          })
        );

        const validArtworks = fetched.filter(Boolean);

        setArts(validArtworks);
      } catch (error) {
        console.error("Error fetching artworks:", error);
        setError(error instanceof Error ? error.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [slice.primary?.art_details]);

  const handleMakeOffer = () => {
    setShowOfferModal(true);
  };

  if (loading) {
    return (
      <section className="bg-primary pb-20 text-background min-h-[70vh] flex items-center justify-center">
        <div className="max-w-[1563px] mx-auto px-5 sm:px-10 lg:px-20 w-full h-full">
          <div className="text-center py-10">Loading artworks...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-primary pb-20 min-h-[70vh] text-background flex items-center justify-center">
        <div className="max-w-[1563px] mx-auto px-5 sm:px-10 lg:px-20">
          <div className="text-center py-10 text-red-400">Error: {error}</div>
        </div>
      </section>
    );
  }

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="bg-primary pb-20 text-background"
    >
      <div className="max-w-[1563px] mx-auto px-5 sm:px-10 lg:px-20">
        <h1 className="text-center py-10 text-xl font-semibold sm:text-2xl">
          <PrismicRichText field={slice.primary.title} />
        </h1>

        {arts.length === 0 ? (
          <div className="text-center py-10">
            <p>No artworks found.</p>
            <p className="text-sm mt-2">
              Check console for debugging information.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            {arts.map((art, index) => (
              <div
                key={art.uid || art.id || index}
                className="w-full cursor-pointer"
                onClick={() => setSelectedArt(art)}
              >
                {art.image ? (
                  <PrismicNextImage
                    field={art.image}
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

            {selectedArt.image && (
              <PrismicNextImage
                field={selectedArt.image}
                className="w-full h-64 object-cover rounded my-4"
              />
            )}

            <div className="text-left space-y-2">
              <h2 className="text-xl font-semibold text-secondary">
                <PrismicRichText field={selectedArt.title} />
              </h2>

              {selectedArt.size && selectedArt.art_type === "ORIGINAL" && (
                <p className="text-sm text-background/50">Size: {selectedArt.size}</p>
              )}

              {selectedArt.description && (
                <div className="text-sm text-background/80">
                  <PrismicRichText field={selectedArt.description} />
                </div>
              )}

              {selectedArt.art_type === "PRINT" ? (
                <div className="space-y-2 mt-4">
                  <p className="font-medium">Available print sizes</p>
                  {selectedArt.print_options?.map((option: any, idx: number) => (
                    <div key={idx} className="text-sm text-background/80">
                      {asText(option.print_size)} — ${option.print_price?.toLocaleString()}
                    </div>
                  ))}
                </div>
              ) : (
                selectedArt.amount && (
                  <p className="font-bold mt-2">${selectedArt.amount.toLocaleString()}</p>
                )
              )}

              <Link
                href={`/shop/${selectedArt.slug}`}
                className="block text-center px-4 py-2 bg-transparent text-secondary border border-secondary rounded-full transition-colors ease-in-out duration-300 hover:bg-secondary hover:text-primary w-full mt-4"
              >
                View in Shop
              </Link>

              <div className="text-center">
                <button 
                  onClick={handleMakeOffer} 
                  className="underline text-secondary hover:text-secondary/80 transition-colors duration-300"
                >
                  or make an offer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Make Offer Modal */}
      <MakeOfferModal
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        artTitle={selectedArt?.title?.[0]?.text || "Untitled"}
        artPrice={selectedArt?.amount || 0}
      />
    </section>
  );
};

export default Paintings;