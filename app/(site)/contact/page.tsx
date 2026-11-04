import ContactForm from "@/components/ContactForm";
import { getContent } from "@/lib/content";
import { socialLinks } from "@/lib/types";

export default async function Page() {
  const socials = socialLinks(await getContent("settings"));

  return <ContactForm socials={socials} />;
}
