import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getContent } from '@/lib/content';
import { socialLinks } from '@/lib/types';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const socials = socialLinks(await getContent("settings"));

  return (
    <>
      <Header socials={socials} />
      {children}
      <Footer socials={socials} />
    </>
  );
}
