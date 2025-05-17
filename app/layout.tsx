import type { Metadata, ResolvingMetadata } from 'next'
import { Merriweather } from "next/font/google";
import "@/style/globals.css";
import { createClient } from "@/prismicio";

const merri = Merriweather({
  variable: "--font-merri",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const client = createClient();
  const post = await client.getSingle("settings");
 
  return {
    title: post.data.meta_title || "Tobi's Website",
    description: post.data.meta_description || "A visual artist bridging the gap between traditional and digital art",
    openGraph: {
      title: post.data.meta_title || "Tobi's Website",
      description: post.data.meta_description || "A visual artist bridging the gap between traditional and digital art",
      images: [
        {
          url: post.data.meta_image.url || "",
          width: 800,
          height: 600,
        },
      ],
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${merri.variable} antialiased`}
      >
        <>
        <header>I'm the head</header>
        {children}
        <footer>I'm the footer</footer>
        </>
      </body>
    </html>
  );
}
