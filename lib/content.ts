import { firebaseConfig } from "@/lib/firebase";
import {
  type Artwork,
  type Category,
  type ContentKey,
  type ContentMap,
  DEFAULT_CONTENT,
  SEED_ARTWORKS,
  normalizeArtwork,
  sortArtworks,
} from "@/lib/types";

// Public pages read Firestore over REST so the responses go through the Next.js
// data cache. Saving in /admin calls /api/revalidate, which clears this tag.
export const CONTENT_TAG = "content";

const BASE = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;

type FirestoreValue = Record<string, any>;

function decodeValue(value: FirestoreValue): unknown {
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("mapValue" in value) return decodeFields(value.mapValue.fields);
  if ("arrayValue" in value) return (value.arrayValue.values ?? []).map(decodeValue);
  return null;
}

function decodeFields(fields: Record<string, FirestoreValue> = {}) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeValue(value)]));
}

/** Returns the parsed response, `null` for a missing document, or throws if Firestore can't be read. */
async function firestoreGet(path: string) {
  const res = await fetch(`${BASE}/${path}${path.includes("?") ? "&" : "?"}key=${firebaseConfig.apiKey}`, {
    next: { tags: [CONTENT_TAG], revalidate: 60 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Firestore responded ${res.status} for ${path}`);
  return res.json();
}

async function readContent<K extends ContentKey>(key: K): Promise<Partial<ContentMap[K]> | null> {
  const doc = await firestoreGet(`content/${key}`);
  return doc ? (decodeFields(doc.fields) as Partial<ContentMap[K]>) : null;
}

export async function getContent<K extends ContentKey>(key: K): Promise<ContentMap[K]> {
  try {
    return { ...DEFAULT_CONTENT[key], ...((await readContent(key)) ?? {}) };
  } catch (error) {
    console.error(`Falling back to default "${key}" content:`, error);
    return DEFAULT_CONTENT[key];
  }
}

export async function getArtworks(): Promise<Artwork[]> {
  try {
    const artworks: Artwork[] = [];
    let pageToken = "";
    do {
      const page = await firestoreGet(`artworks?pageSize=300${pageToken ? `&pageToken=${pageToken}` : ""}`);
      for (const doc of page?.documents ?? []) {
        artworks.push(normalizeArtwork(doc.name.split("/").pop(), decodeFields(doc.fields)));
      }
      pageToken = page?.nextPageToken ?? "";
    } while (pageToken);

    // Nothing has been copied into Firestore yet (no admin has signed in).
    if (artworks.length === 0 && (await readContent("settings")) === null) return SEED_ARTWORKS;

    return sortArtworks(artworks);
  } catch (error) {
    console.error("Falling back to the default artworks:", error);
    return SEED_ARTWORKS;
  }
}

export async function getArtworksByCategory(category: Category) {
  return (await getArtworks()).filter((art) => art.category === category);
}

export async function getArtwork(slug: string) {
  return (await getArtworks()).find((art) => art.slug === slug) ?? null;
}
