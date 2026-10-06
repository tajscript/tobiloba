import type { Metadata } from 'next'
import { Merriweather, Montaga } from "next/font/google";
import "@/style/globals.css";
import { getContent } from "@/lib/content";


const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const montaga = Montaga({
  subsets: ["latin"],
  weight: '400'
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getContent("settings");
  const title = settings.metaTitle || "Tobi's Website";
  const description = settings.metaDescription || "A visual artist bridging the gap between traditional and digital art";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: settings.metaImage.url ? [{ url: settings.metaImage.url }] : [],
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${merriweather.className} ${montaga.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
