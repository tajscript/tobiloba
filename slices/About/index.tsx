import { FC } from "react";
import { Content } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";

/**
 * Props for `About`.
 */
export type AboutProps = SliceComponentProps<Content.AboutSlice>;

/**
 * Component for "About" Slices.
 */
const About: FC<AboutProps> = ({ slice }) => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="pt-20 pb-28 max-w-[1536px] mx-auto px-5 sm:px-10 lg:px-20 flex flex-col items-center justify-center"
    >
      <div className="text-center sm:w-[70%] lg:w-1/2"><PrismicRichText field={slice.primary.about_text} /></div>
      <button className="border border-secondary px-4 py-2 rounded-full text-secondary mt-5"><PrismicNextLink field={slice.primary.about_link} /></button>

      <div className="flex w-full flex-col sm:flex-row gap-5 items-center justify-center sm:gap-10 mt-20 sm:mt-32 lg:gap-40">
      <div className="w-full sm:w-96"><PrismicNextImage field={slice.primary.featured_image} /></div>

      <div className="text-center">
      <PrismicRichText field={slice.primary.featured_text} />
      <button className="border border-secondary px-4 py-2 rounded-full text-secondary mt-5"><PrismicNextLink field={slice.primary.featured_link} /></button>
      </div>
      </div>
    </section>
  );
};

export default About;
