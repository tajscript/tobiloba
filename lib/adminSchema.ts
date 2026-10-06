import type { ContentKey } from "@/lib/types";

// Describes the form shown for each editable page in /admin/pages/[key].
// To make another piece of text or image editable: add it to the page's type
// and defaults in lib/types.ts, list it here, and render it on the page.

export interface FieldDef {
  name: string;
  label: string;
  type: "text" | "textarea" | "image";
  hint?: string;
  rows?: number;
}

export interface PageSchema {
  title: string;
  description: string;
  /** Where the result can be seen on the public site. */
  viewHref: string;
  sections: { title: string; description?: string; fields: FieldDef[] }[];
}

const PARAGRAPH_HINT = "Leave a blank line between paragraphs.";
const LINK_HINT = "A page on this site such as /about or /shop, or a full web address.";

const seoSection = {
  title: "Search & sharing",
  description: "Optional. Left blank, this page uses the title and description from Site settings.",
  fields: [
    { name: "metaTitle", label: "Page title", type: "text" },
    { name: "metaDescription", label: "Page description", type: "textarea", rows: 2 },
  ] satisfies FieldDef[],
};

export const PAGE_SCHEMAS: Record<ContentKey, PageSchema> = {
  home: {
    title: "Home page",
    description: "The first page visitors see.",
    viewHref: "/",
    sections: [
      {
        title: "Hero",
        fields: [{ name: "heroImage", label: "Hero image", type: "image", hint: "The large image at the top of the page." }],
      },
      {
        title: "Introduction",
        fields: [
          { name: "introText", label: "Text", type: "textarea", rows: 6, hint: PARAGRAPH_HINT },
          { name: "introLinkText", label: "Button label", type: "text", hint: "Leave empty to hide the button." },
          { name: "introLinkUrl", label: "Button link", type: "text", hint: LINK_HINT },
        ],
      },
      {
        title: "Featured work",
        fields: [
          { name: "featuredImage", label: "Image", type: "image" },
          { name: "featuredText", label: "Text", type: "textarea", rows: 3, hint: PARAGRAPH_HINT },
          { name: "featuredLinkText", label: "Button label", type: "text", hint: "Leave empty to hide the button." },
          { name: "featuredLinkUrl", label: "Button link", type: "text", hint: LINK_HINT },
        ],
      },
      seoSection,
    ],
  },
  about: {
    title: "About page",
    description: "The artist's portrait and biography.",
    viewHref: "/about",
    sections: [
      {
        title: "About the artist",
        fields: [
          { name: "title", label: "Heading", type: "text" },
          { name: "image", label: "Portrait", type: "image" },
          { name: "bio", label: "Biography", type: "textarea", rows: 10, hint: PARAGRAPH_HINT },
          { name: "note", label: "Closing note", type: "textarea", rows: 3, hint: "Shown under the divider, e.g. how to get in touch." },
        ],
      },
      seoSection,
    ],
  },
  galleries: {
    title: "Paintings pages",
    description: "Headings for the three paintings pages. Which artworks appear on each is set on the artwork itself.",
    viewHref: "/narrative",
    sections: [
      {
        title: "Paintings pages",
        fields: [
          { name: "narrativeTitle", label: "Narrative paintings heading", type: "text" },
          { name: "portraitsTitle", label: "Portraits heading", type: "text" },
          { name: "studiesTitle", label: "Studies heading", type: "text" },
        ],
      },
    ],
  },
  settings: {
    title: "Site settings",
    description: "How the site appears in browser tabs, search results and link previews.",
    viewHref: "/",
    sections: [
      {
        title: "Enquiry button",
        description: "The button shown with every artwork. It takes visitors straight to your booking page or opens an email to you.",
        fields: [
          { name: "enquiryLabel", label: "Button text", type: "text" },
          {
            name: "enquiryLink",
            label: "Where it goes",
            type: "text",
            hint: "Your Calendly link, or your email address. If left empty the button goes to the Contact page.",
          },
        ],
      },
      {
        title: "Social links",
        description: "The icons in the footer and the mobile menu. Leave a field empty to hide its icon.",
        fields: [
          { name: "instagramUrl", label: "Instagram", type: "text", hint: "For example instagram.com/yourname" },
          { name: "twitterUrl", label: "Twitter / X", type: "text", hint: "For example x.com/yourname" },
          { name: "contactEmail", label: "Email address", type: "text", hint: "The mail icon opens a new email to this address." },
        ],
      },
      {
        title: "Search & sharing",
        fields: [
          { name: "metaTitle", label: "Site title", type: "text" },
          { name: "metaDescription", label: "Site description", type: "textarea", rows: 3 },
          { name: "metaImage", label: "Sharing image", type: "image", hint: "Shown when the site is shared on social media or in messages." },
        ],
      },
    ],
  },
};
