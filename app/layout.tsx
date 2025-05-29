import type { Metadata } from 'next'
import { Merriweather, Montaga } from "next/font/google";
import "@/style/globals.css";
import { createClient } from "@/prismicio";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartProvider } from '@/contexts/cartContext';


const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const montaga = Montaga({
  subsets: ["latin"],
  weight: '400'
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
        <CartProvider>
        <Header />
        {children}
        <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
