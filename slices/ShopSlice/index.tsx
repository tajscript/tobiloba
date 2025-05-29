"use client";

import { FC, useEffect, useState } from "react";
import { Content, isFilled } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { PrismicNextImage } from "@prismicio/next";
import Link from "next/link";

/**
 * Props for `ShopSlice`.
 */
export type ShopSliceProps = SliceComponentProps<Content.ShopSliceSlice>;

export function generateSlug(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .trim();
}

const ShopSlice: FC<ShopSliceProps> = ({ slice }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const client = createClient();

        const fetchedProducts = await Promise.all(
          slice.primary.repeatable_art.map(async (item) => {
            if (isFilled.contentRelationship(item.arts) && item.arts.uid) {
              const productData = await client.getByUID("featured_arts", item.arts.uid);
              const slug = generateSlug(productData.uid);
              return { ...productData, slug };
            }
            return null;
          })
        );

        const validProducts = fetchedProducts.filter(Boolean);
        setFilteredProducts(validProducts);
        setProducts(validProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [slice.primary.repeatable_art]);

  const filterProduct = (type: string) => {
    if (type === "all") {
      setFilteredProducts(products);
    } else if (type === "original") {
      setFilteredProducts(products.filter((product) => product?.data.art_type === "ORIGINAL"));
    } else if (type === "print") {
      setFilteredProducts(products.filter((product) => product?.data.art_type === "PRINT"));
    }
  };

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="bg-primary min-h-[70vh] text-background px-5 pt-10 pb-20 mx-auto sm:px-10 lg:px-20"
    >
      <div className="flex flex-col items-center max-w-[1563px] mx-auto">
        <div className="space-x-5 flex">
          <button
            onClick={() => filterProduct("all")}
            className="transition-all duration-500 ease-in-out hover:underline cursor-pointer"
          >
            {slice.primary.all}
          </button>
          <div className="h-5 w-[2px] bg-background" />
          <button
            onClick={() => filterProduct("original")}
            className="transition-all duration-500 ease-in-out hover:underline cursor-pointer"
          >
            {slice.primary.original}
          </button>
          <div className="h-5 w-[2px] bg-background" />
          <button
            onClick={() => filterProduct("print")}
            className="transition-all duration-500 ease-in-out hover:underline cursor-pointer"
          >
            {slice.primary.print}
          </button>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-10">
          {filteredProducts.map((item, index) => (
            <div key={`${item.slug}-${index}`}>
              <Link href={`/shop/${item.slug}`} className="flex flex-col items-center gap-1">
                <div className="w-full overflow-hidden sm:lg-96 lg:h-96 sm:w-80 sm:h-80">
                  <PrismicNextImage field={item.data.image} />
                </div>

                <div className="text-secondary sm:text-lg">
                  <PrismicRichText field={item.data.title} />
                </div>
                {item.data.art_type === 'PRINT' ? (
                  <div>From ${Number(item.data.amount).toLocaleString()}</div>
                ) : (
                  <div>${Number(item.data.amount).toLocaleString()}</div>
                )}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopSlice;
