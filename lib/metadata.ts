import type { Metadata } from "next";

/** Page-level overrides; anything left blank in the admin falls back to the site-wide settings. */
export function pageMetadata(meta: { metaTitle?: string; metaDescription?: string }): Metadata {
  return {
    ...(meta.metaTitle ? { title: meta.metaTitle } : {}),
    ...(meta.metaDescription ? { description: meta.metaDescription } : {}),
  };
}
