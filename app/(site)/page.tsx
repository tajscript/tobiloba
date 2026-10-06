import { type Metadata } from "next";
import Link from "next/link";

import ArtImage from "@/components/ArtImage";
import Paragraphs from "@/components/Paragraphs";
import { getContent } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export default async function Page() {
  const home = await getContent("home");

  return (
    <>
      <section className="mx-auto max-w-[1536px] lg:px-20">
        <ArtImage image={home.heroImage} priority sizes="100vw" className="object-cover h-[80vh] lg:h-[90vh] lg:object-top sm:mt-5 mx-auto" />
      </section>

      <section className="pt-20 pb-28 max-w-[1536px] mx-auto px-5 sm:px-10 lg:px-20 flex flex-col items-center justify-center">
        <div className="text-center sm:w-[70%] lg:w-1/2"><Paragraphs text={home.introText} /></div>
        {home.introLinkText && (
          <Link href={home.introLinkUrl || "/"} className="border border-secondary px-4 py-2 rounded-full text-secondary mt-5">{home.introLinkText}</Link>
        )}

        <div className="flex w-full flex-col sm:flex-row gap-5 items-center justify-center sm:gap-10 mt-20 sm:mt-32 lg:gap-40">
          <div className="w-full sm:w-96"><ArtImage image={home.featuredImage} sizes="(min-width: 640px) 24rem, 100vw" /></div>

          <div className="text-center">
            <Paragraphs text={home.featuredText} />
            {home.featuredLinkText && (
              <Link href={home.featuredLinkUrl || "/"} className="inline-block border border-secondary px-4 py-2 rounded-full text-secondary mt-5">{home.featuredLinkText}</Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await getContent("home"));
}
