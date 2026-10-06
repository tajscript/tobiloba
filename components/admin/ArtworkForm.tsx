"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { deleteArtwork, describeError, listArtworks, loadArtwork, saveArtwork } from "@/lib/adminApi";
import { type Artwork, type Category, CATEGORIES, EMPTY_IMAGE, slugify } from "@/lib/types";
import {
  Card,
  Field,
  ImageField,
  PriceInput,
  SAVED_MESSAGE,
  SAVED_PENDING_MESSAGE,
  SaveBar,
  Toggle,
  buttonClass,
  inputClass,
} from "@/components/admin/fields";
import { useUnsavedWarning } from "@/components/admin/useUnsavedWarning";

const BLANK: Artwork = {
  slug: "",
  title: "",
  image: { ...EMPTY_IMAGE },
  description: "",
  price: 0,
  size: "",
  soldOut: false,
  category: "",
  showInShop: true,
  order: 0,
};

/** Create form when `slug` is omitted, edit form otherwise. */
export default function ArtworkForm({ slug }: { slug?: string }) {
  const isNew = !slug;
  const router = useRouter();
  const [artwork, setArtwork] = useState<Artwork | null>(isNew ? BLANK : null);
  const [missing, setMissing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  useUnsavedWarning(dirty);

  useEffect(() => {
    if (!slug) return;
    loadArtwork(slug)
      .then((loaded) => (loaded ? setArtwork(loaded) : setMissing(true)))
      .catch((error) => setMessage({ tone: "error", text: describeError(error) }));
  }, [slug]);

  const update = (changes: Partial<Artwork>) => {
    setArtwork((current) => (current ? { ...current, ...changes } : current));
    setDirty(true);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artwork) return;

    const fail = (text: string) => setMessage({ tone: "error", text });
    if (!artwork.title.trim()) return fail("Give the artwork a title.");
    if (!artwork.image.url) return fail("Add an image of the artwork.");

    setSaving(true);
    try {
      const toSave: Artwork = { ...artwork, title: artwork.title.trim(), size: artwork.size.trim() };

      if (isNew) {
        const newSlug = slugify(toSave.title);
        if (!newSlug || newSlug === "new") return fail("Please choose a different title.");
        const existing = await listArtworks();
        if (existing.some((art) => art.slug === newSlug)) {
          return fail("There is already an artwork with this title. Edit that one, or choose a different title.");
        }
        toSave.slug = newSlug;
        toSave.order = existing.reduce((max, art) => Math.max(max, art.order + 1), 0);
      }

      const refreshed = await saveArtwork(toSave, isNew);
      setDirty(false);
      if (isNew) {
        router.replace(`/admin/artworks/${toSave.slug}`);
      } else {
        setArtwork(toSave);
        setMessage(refreshed ? SAVED_MESSAGE : SAVED_PENDING_MESSAGE);
      }
    } catch (error) {
      setMessage({ tone: "error", text: describeError(error) });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!artwork || !window.confirm(`Delete “${artwork.title}”? It will be removed from the site. This cannot be undone.`)) return;
    setSaving(true);
    try {
      await deleteArtwork(artwork.slug);
      setDirty(false);
      router.replace("/admin/artworks");
    } catch (error) {
      setMessage({ tone: "error", text: describeError(error) });
      setSaving(false);
    }
  };

  const backLink = (
    <Link href="/admin/artworks" className="mb-4 inline-flex items-center gap-1 text-sm text-primary/60 hover:text-primary">
      <ArrowLeft size={15} /> All artworks
    </Link>
  );

  if (missing) {
    return (
      <div>
        {backLink}
        <p className="text-sm">This artwork no longer exists.</p>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div>
        {backLink}
        <p className={`text-sm ${message ? "text-red-600" : "text-primary/60"}`}>{message?.text ?? "Loading…"}</p>
      </div>
    );
  }


  return (
    <form onSubmit={handleSubmit}>
      {backLink}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">{isNew ? "Add artwork" : artwork.title || "Edit artwork"}</h1>
        {!isNew && <p className="mt-1 text-sm text-primary/60">Shop address: /shop/{artwork.slug}</p>}
      </header>

      <div className="space-y-6">
        <Card title="Artwork">
          <Field
            label="Title"
            hint={isNew && artwork.title ? `Shop address will be /shop/${slugify(artwork.title)}. It stays the same if you rename the artwork later.` : undefined}
          >
            <input type="text" value={artwork.title} onChange={(e) => update({ title: e.target.value })} className={inputClass} />
          </Field>
          <ImageField label="Image" value={artwork.image} onChange={(image) => update({ image })} />
          <Field label="Description" hint="Shown on the artwork's shop page. Leave a blank line between paragraphs.">
            <textarea rows={4} value={artwork.description} onChange={(e) => update({ description: e.target.value })} className={inputClass} />
          </Field>
        </Card>

        <Card title="Price & size">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Price" hint="Leave empty to show the artwork without a price.">
              <PriceInput value={artwork.price} onChange={(price) => update({ price })} />
            </Field>
            <Field label="Size" hint="For example 12 x 26">
              <input type="text" value={artwork.size} onChange={(e) => update({ size: e.target.value })} className={inputClass} />
            </Field>
          </div>

          <Toggle
            label="Sold out"
            hint="Keeps the artwork visible but replaces the enquiry button with “Sold Out”."
            checked={artwork.soldOut}
            onChange={(soldOut) => update({ soldOut })}
          />
        </Card>

        <Card title="Where it appears">
          <Field label="Paintings page">
            <select value={artwork.category} onChange={(e) => update({ category: e.target.value as Category | "" })} className={inputClass}>
              <option value="">None</option>
              {CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
          </Field>
          <Toggle
            label="Show in the shop"
            hint="When off, the artwork is hidden from the shop listing (its own page still works if someone has the link)."
            checked={artwork.showInShop}
            onChange={(showInShop) => update({ showInShop })}
          />
        </Card>
      </div>

      <SaveBar saving={saving} dirty={dirty || isNew} message={message}>
        {!isNew && (
          <>
            <Link href={`/shop/${artwork.slug}`} target="_blank" className={buttonClass.ghost}>
              <ExternalLink size={15} /> View in shop
            </Link>
            <button type="button" onClick={handleDelete} disabled={saving} className={buttonClass.danger}>
              <Trash2 size={15} /> Delete
            </button>
          </>
        )}
      </SaveBar>
    </form>
  );
}
