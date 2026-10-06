import { type Metadata } from "next";

import ArtImage from "@/components/ArtImage";
import Paragraphs from "@/components/Paragraphs";
import { getContent } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export default async function Page() {
  const about = await getContent("about");

  return (
    <section className="mx-auto max-w-[1563px] px-5 sm:px-10 lg:px-20 pt-10 pb-20 sm:pb-32 flex flex-col sm:flex-row gap-10 lg:pt-20 sm:gap-5">
      <div className="w-full sm:w-1/2 sm:flex justify-center">
        <p className="sm:hidden text-secondary">{about.title}</p>
        <div><ArtImage image={about.image} priority sizes="(min-width: 640px) 50vw, 100vw" /></div>
      </div>

      <div className="w-full sm:w-1/2 lg:flex flex-col items-start">
        <p className="hidden mb-2 sm:block text-secondary">{about.title}</p>
        <h2 className="lg:w-[70%]"><Paragraphs text={about.bio} /></h2>
        <div className="w-full h-[1px] bg-secondary my-5 lg:w-[70%]" />
        <h3 className="lg:w-[70%]"><Paragraphs text={about.note} /></h3>
      </div>
    </section>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await getContent("about"));
}
