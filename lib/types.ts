// Shapes of the editable site content. Everything lives in Firestore:
//   content/{home|about|galleries|settings}  – one document per editable page
//   artworks/{slug}                          – one document per artwork

export interface ImageValue {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface HomeContent {
  heroImage: ImageValue;
  introText: string;
  introLinkText: string;
  introLinkUrl: string;
  featuredImage: ImageValue;
  featuredText: string;
  featuredLinkText: string;
  featuredLinkUrl: string;
  metaTitle: string;
  metaDescription: string;
}

export interface AboutContent {
  title: string;
  image: ImageValue;
  bio: string;
  note: string;
  metaTitle: string;
  metaDescription: string;
}

export interface GalleriesContent {
  narrativeTitle: string;
  portraitsTitle: string;
  studiesTitle: string;
}

export interface SettingsContent {
  metaTitle: string;
  metaDescription: string;
  metaImage: ImageValue;
  /** Text on the button shown with every artwork. */
  enquiryLabel: string;
  /** Where that button leads: a booking page such as Calendly, or an email address. */
  enquiryLink: string;
}

export interface ContentMap {
  home: HomeContent;
  about: AboutContent;
  galleries: GalleriesContent;
  settings: SettingsContent;
}

export type ContentKey = keyof ContentMap;

export const CONTENT_KEYS: ContentKey[] = ["home", "about", "galleries", "settings"];

export type ArtType = "ORIGINAL" | "PRINT";

export const CATEGORIES = [
  { value: "narrative", label: "Narrative paintings" },
  { value: "portraits", label: "Portraits" },
  { value: "studies", label: "Studies" },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];

export interface Artwork {
  slug: string;
  title: string;
  image: ImageValue;
  description: string;
  price: number;
  /** Dimensions of the piece, e.g. "12 x 26". */
  size: string;
  soldOut: boolean;
  /** Which paintings page it appears on, or "" for none. */
  category: Category | "";
  showInShop: boolean;
  /** Lower numbers are listed first. */
  order: number;
}

/**
 * Works out where the enquiry button on an artwork should go. The admin can
 * enter a booking page ("calendly.com/tobi") or an email address; with nothing
 * set the button falls back to the contact page.
 */
export function enquiryTarget(link: string | undefined, artTitle: string): { href: string; external: boolean } {
  const value = (link ?? "").trim();
  if (!value) return { href: "/contact", external: false };

  if (/^mailto:/i.test(value) || /^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/.test(value)) {
    const address = value.replace(/^mailto:/i, "");
    return { href: `mailto:${address}?subject=${encodeURIComponent(`Enquiry about “${artTitle}”`)}`, external: false };
  }

  return { href: /^https?:\/\//i.test(value) ? value : `https://${value.replace(/^\/+/, "")}`, external: true };
}

export const EMPTY_IMAGE: ImageValue = { url: "", alt: "" };

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .trim();
}

// The content that was live in Prismic at the time of the migration. It is
// shown until an admin signs in for the first time, at which point it is
// copied into Firestore and edited from there.
export const DEFAULT_CONTENT: ContentMap = {
  home: {
    heroImage: { url: "/asset/hero.png", alt: "Hero Image", width: 1440, height: 1088 },
    introText:
      "Tobi  brings stories to life through her art, weaving  traditional techniques with reflections on personal experiences, exploring shared human emotions, connecting, healing, and inspiring through creativity.\n\nDiscover more about her process.",
    introLinkText: "LEARN MORE",
    introLinkUrl: "/about",
    featuredImage: { url: "/asset/hero.png", alt: "Hero Image", width: 1440, height: 1088 },
    featuredText: "Click below to see selected works by the artist.",
    featuredLinkText: "GALLERY",
    featuredLinkUrl: "/shop",
    metaTitle: "",
    metaDescription: "",
  },
  about: {
    title: "About the Artist",
    image: { url: "/asset/artist.png", alt: "Tobi's Picture", width: 370, height: 427 },
    bio: "Tobi brings stories to life through her art, weaving traditional techniques with reflections on personal experiences, exploring shared human emotions, connecting, healing, and inspiring through creativity. Tobi brings stories to life through her art, weaving traditional techniques with reflections on personal experiences, exploring shared human emotions, connecting, healing, and inspiring through creativity. Tobi brings stories to life through her art, weaving traditional techniques with reflections on personal experiences, exploring shared human emotions, connecting, healing, and inspiring through creativity. Tobi brings stories to life through her art, weaving traditional techniques with reflections on personal experiences, exploring shared human emotions, connecting, healing, and inspiring through creativity.",
    note: "For inquiries about commissions or purchasing artwork, please use the Contact Form or send an email at tobitheartist@gmail.com",
    metaTitle: "",
    metaDescription: "",
  },
  galleries: {
    narrativeTitle: "NARRATIVE PAINTINGS",
    portraitsTitle: "PORTRAITS",
    studiesTitle: "STUDIES",
  },
  settings: {
    metaTitle: "Tobi's Website",
    metaDescription: "A visual artist bridging gaps between traditional and digital art",
    metaImage: { url: "/asset/artist.png", alt: "Tobi's picture", width: 370, height: 427 },
    enquiryLabel: "ENQUIRE",
    enquiryLink: "",
  },
};

export const SEED_ARTWORKS: Artwork[] = [
  {
    slug: "reverie",
    title: "Reverie",
    image: { url: "/asset/artwork-1.png", alt: "Reverie", width: 423, height: 435 },
    description: "Resting in a river",
    price: 1500,
    size: "12 x 26",
    soldOut: false,
    category: "narrative",
    showInShop: true,
    order: 0,
  },
  {
    slug: "not-if-i-see-you-first",
    title: "Not If I See You First",
    image: { url: "/asset/artwork-1.png", alt: "Not If I See You First", width: 423, height: 435 },
    description: "Limited edition of 10\nPrinted on cotton rag paper.",
    price: 500,
    size: "",
    soldOut: false,
    category: "portraits",
    showInShop: true,
    order: 1,
  },
];

/** Fills in anything missing from a stored artwork so the UI can rely on every field. */
export function normalizeArtwork(slug: string, data: Record<string, unknown>): Artwork {
  const d = data as Partial<Artwork>;
  return {
    slug,
    title: d.title ?? "",
    image: { ...EMPTY_IMAGE, ...(d.image ?? {}) },
    description: d.description ?? "",
    price: Number(d.price) || 0,
    size: d.size ?? "",
    soldOut: Boolean(d.soldOut),
    category: CATEGORIES.some((c) => c.value === d.category) ? (d.category as Category) : "",
    showInShop: d.showInShop !== false,
    order: Number(d.order) || 0,
  };
}

export function sortArtworks(list: Artwork[]) {
  return [...list].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}
