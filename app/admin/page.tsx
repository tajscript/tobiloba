import Link from "next/link";
import { FileText, Home, Images, Palette, Settings } from "lucide-react";

const SECTIONS = [
  { href: "/admin/pages/home", icon: Home, title: "Home page", text: "Hero image, introduction and featured work." },
  { href: "/admin/pages/about", icon: FileText, title: "About page", text: "Portrait, biography and closing note." },
  { href: "/admin/artworks", icon: Palette, title: "Artworks", text: "Add art, set prices, mark pieces as sold." },
  { href: "/admin/pages/galleries", icon: Images, title: "Paintings pages", text: "Headings for the three paintings pages." },
  { href: "/admin/pages/settings", icon: Settings, title: "Site settings", text: "Enquiry button, site title, description and sharing image." },
];

export default function AdminHome() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="mt-1 text-sm text-primary/60">Choose what you&apos;d like to change. Edits go live as soon as you save.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map(({ href, icon: Icon, title, text }) => (
          <Link key={href} href={href} className="rounded-lg bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <Icon size={20} className="text-secondary" />
            <h2 className="mt-3 font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-primary/60">{text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
