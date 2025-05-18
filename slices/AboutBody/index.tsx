import { FC } from "react";
import { Content } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";

/**
 * Props for `AboutBody`.
 */
export type AboutBodyProps = SliceComponentProps<Content.AboutBodySlice>;

/**
 * Component for "AboutBody" Slices.
 */
const AboutBody: FC<AboutBodyProps> = ({ slice }) => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="mx-auto max-w-[1563px] px-5 sm:px-10 lg:px-20 pt-10 pb-20 sm:pb-32 flex flex-col sm:flex-row gap-10 lg:pt-20 sm:gap-5"
    >
      <div className="w-full sm:w-1/2 sm:flex justify-center">
        <p className="sm:hidden text-secondary">{slice.primary.title}</p>
        <div><PrismicNextImage field={slice.primary.featured_image} /></div>
      </div>

      <div className="w-full sm:w-1/2 lg:flex flex-col items-start">
        <p className="hidden mb-2 sm:block text-secondary">{slice.primary.title}</p>
        <h2 className="lg:w-[70%]"><PrismicRichText field={slice.primary.featured_text} /></h2>
        <div className="w-full h-[1px] bg-secondary my-5 lg:w-[70%]" />
        <h3 className="lg:w-[70%]"><PrismicRichText field={slice.primary.text} /></h3>
      </div>
    </section>
  );
};

export default AboutBody;
