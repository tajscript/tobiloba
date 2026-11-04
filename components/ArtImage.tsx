"use client";

import Image, { type ImageLoaderProps } from "next/image";
import type { ImageValue } from "@/lib/types";

// Hosts next/image is allowed to optimise (keep in sync with next.config.ts).
const OPTIMIZED_HOSTS = ["res.cloudinary.com"];

function canOptimize(url: string) {
  if (url.startsWith("/")) return true;
  try {
    return OPTIMIZED_HOSTS.includes(new URL(url).hostname);
  } catch {
    return false;
  }
}

function isCloudinary(url: string) {
  return url.startsWith("https://res.cloudinary.com/") && url.includes("/image/upload/");
}

/**
 * Asks Cloudinary for a resized copy instead of sending the original through
 * the Next.js optimiser. Some uploads are 90+ megapixels; the optimiser times
 * out fetching those and the browser ends up decoding the full file.
 */
function cloudinaryLoader({ src, width, quality }: ImageLoaderProps) {
  return src.replace("/image/upload/", `/image/upload/f_auto,q_${quality ?? "auto"},c_limit,w_${width}/`);
}

interface ArtImageProps {
  image: ImageValue | string;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Renders an admin-managed image. Uploaded and bundled images go through
 * next/image; anything pasted in from another host falls back to a plain <img>.
 */
export default function ArtImage({ image, alt, className, sizes, priority }: ArtImageProps) {
  const value: ImageValue = typeof image === "string" ? { url: image, alt: "" } : image;
  if (!value?.url) return null;

  const w = value.width;
  const h = value.height;
  const altText = alt ?? value.alt ?? "";

  if (w && h && canOptimize(value.url)) {
    return (
      <Image
        src={value.url}
        alt={altText}
        width={w}
        height={h}
        sizes={sizes}
        priority={priority}
        loader={isCloudinary(value.url) ? cloudinaryLoader : undefined}
        className={className}
      />
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={value.url} alt={altText} width={w} height={h} loading={priority ? "eager" : "lazy"} className={className} />;
}
