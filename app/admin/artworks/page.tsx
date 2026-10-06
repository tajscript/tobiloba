"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Pencil, Plus } from "lucide-react";
import { describeError, listArtworks, patchArtworks } from "@/lib/adminApi";
import { type Artwork, CATEGORIES } from "@/lib/types";
import { buttonClass } from "@/components/admin/fields";

export default function ArtworksPage() {
  const [artworks, setArtworks] = useState<Artwork[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    listArtworks().then(setArtworks).catch((err) => setError(describeError(err)));
  }, []);

  // Applies a change on screen straight away and rolls it back if saving fails.
  const apply = async (next: Artwork[], patches: Parameters<typeof patchArtworks>[0]) => {
    const previous = artworks;
    setArtworks(next);
    setBusy(true);
    setError("");
    try {
      await patchArtworks(patches);
    } catch (err) {
      setArtworks(previous);
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  const move = (index: number, direction: -1 | 1) => {
    if (!artworks) return;
    const next = [...artworks];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    const reordered = next.map((art, order) => ({ ...art, order }));
    apply(
      reordered,
      reordered.filter((art, i) => art.order !== next[i].order).map((art) => ({ slug: art.slug, data: { order: art.order } }))
    );
  };

  const toggleSoldOut = (art: Artwork) => {
    if (!artworks) return;
    apply(
      artworks.map((a) => (a.slug === art.slug ? { ...a, soldOut: !a.soldOut } : a)),
      [{ slug: art.slug, data: { soldOut: !art.soldOut } }]
    );
  };

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Artworks</h1>
          <p className="mt-1 text-sm text-primary/60">Everything shown in the shop and on the paintings pages, in the order it appears.</p>
        </div>
        <Link href="/admin/artworks/new" className={buttonClass.primary}>
          <Plus size={15} /> Add artwork
        </Link>
      </header>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {!artworks ? (
        !error && <p className="text-sm text-primary/60">Loading…</p>
      ) : artworks.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <p className="font-medium">No artworks yet</p>
          <p className="mt-1 text-sm text-primary/60">Add your first piece to fill the shop and paintings pages.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {artworks.map((art, index) => (
            <li key={art.slug} className="flex flex-wrap items-center gap-4 rounded-lg bg-white p-3 shadow-sm sm:flex-nowrap">
              <div className="flex flex-col">
                <button aria-label={`Move ${art.title} up`} disabled={busy || index === 0} onClick={() => move(index, -1)} className="rounded p-1 text-primary/60 hover:bg-background disabled:opacity-25">
                  <ArrowUp size={15} />
                </button>
                <button aria-label={`Move ${art.title} down`} disabled={busy || index === artworks.length - 1} onClick={() => move(index, 1)} className="rounded p-1 text-primary/60 hover:bg-background disabled:opacity-25">
                  <ArrowDown size={15} />
                </button>
              </div>

              <Link href={`/admin/artworks/${art.slug}`} className="h-16 w-16 shrink-0 overflow-hidden rounded bg-background">
                {art.image.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={art.image.url} alt="" className="h-full w-full object-cover" />
                )}
              </Link>

              <div className="min-w-0 flex-1 basis-40">
                <Link href={`/admin/artworks/${art.slug}`} className="block truncate font-medium hover:underline">{art.title || "Untitled"}</Link>
                <p className="text-sm text-primary/70">${art.price.toLocaleString()}{art.size && ` · ${art.size}`}</p>
                <p className="mt-0.5 text-xs text-primary/50">
                  {CATEGORIES.find((c) => c.value === art.category)?.label ?? "No paintings page"}
                  {!art.showInShop && " · Hidden from shop"}
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" checked={art.soldOut} disabled={busy} onChange={() => toggleSoldOut(art)} className="h-4 w-4 accent-[var(--color-secondary)]" />
                Sold out
              </label>

              <Link href={`/admin/artworks/${art.slug}`} className={buttonClass.ghost}>
                <Pencil size={14} /> Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
