import { FC } from "react";
import { Content } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";

/**
 * Props for `Paintings`.
 */
export type PaintingsProps = SliceComponentProps<Content.PaintingsSlice>;

/**
 * Component for "Paintings" Slices.
 */
const Paintings: FC<PaintingsProps> = ({ slice }) => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="bg-primary pb-20 text-background px-5 sm:px-10 lg:px-20"
    >
      <h1 className="text-center py-10 text-xl font-semibold sm:text-2xl"><PrismicRichText field={slice.primary.title} /></h1>

      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
        {slice.primary.images.map((item, index) => (
          <div key={index} className="w-full">
            {item.image && (
              <PrismicNextImage
                field={item.image}
                className="h-[22rem] w-full lg:h-96"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Paintings;
