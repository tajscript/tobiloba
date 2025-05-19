import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";

/**
 * Props for `Hero`.
 */
export type HeroProps = SliceComponentProps<Content.HeroSlice>;

/**
 * Component for "Hero" Slices.
 */
const Hero: FC<HeroProps> = ({ slice }) => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="mx-auto max-w-[1536px] lg:px-20"
    >
      <PrismicNextImage field={slice.primary.hero_image} className="object-cover h-[80vh] lg:h-[90vh] lg:object-top sm:mt-5 mx-auto"  />
    </section>
  );
};

export default Hero;
