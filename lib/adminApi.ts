// Reads and writes made from the /admin area. They run in the browser as the
// signed-in admin, so access is enforced by firestore.rules.
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebaseClient";
import {
  type Artwork,
  type ContentKey,
  type ContentMap,
  type ImageValue,
  CONTENT_KEYS,
  DEFAULT_CONTENT,
  SEED_ARTWORKS,
  normalizeArtwork,
  sortArtworks,
} from "@/lib/types";

// Cloudinary's free plan rejects images over 10 MB.
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** Tells the public site to drop its cached content so edits show up straight away. */
export async function revalidateSite() {
  try {
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch("/api/revalidate", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function isAdmin(uid: string) {
  return (await getDoc(doc(db, "admins", uid))).exists();
}

/** On the very first admin sign-in, copy the content migrated from Prismic into Firestore. */
export async function initializeStore() {
  if ((await getDoc(doc(db, "content", "settings"))).exists()) return false;

  const batch = writeBatch(db);
  for (const key of CONTENT_KEYS) {
    batch.set(doc(db, "content", key), { ...DEFAULT_CONTENT[key], updatedAt: serverTimestamp() });
  }
  for (const { slug, ...artwork } of SEED_ARTWORKS) {
    batch.set(doc(db, "artworks", slug), { ...artwork, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  }
  await batch.commit();
  await revalidateSite();
  return true;
}

export async function loadContent<K extends ContentKey>(key: K): Promise<ContentMap[K]> {
  const snapshot = await getDoc(doc(db, "content", key));
  const { updatedAt: _updatedAt, ...stored } = snapshot.data() ?? {};
  return { ...DEFAULT_CONTENT[key], ...(stored as Partial<ContentMap[K]>) };
}

export async function saveContent<K extends ContentKey>(key: K, data: ContentMap[K]) {
  await setDoc(doc(db, "content", key), { ...data, updatedAt: serverTimestamp() });
  return revalidateSite();
}

export async function listArtworks(): Promise<Artwork[]> {
  const snapshot = await getDocs(collection(db, "artworks"));
  return sortArtworks(snapshot.docs.map((d) => normalizeArtwork(d.id, d.data())));
}

export async function loadArtwork(slug: string): Promise<Artwork | null> {
  const snapshot = await getDoc(doc(db, "artworks", slug));
  return snapshot.exists() ? normalizeArtwork(snapshot.id, snapshot.data()) : null;
}

export async function saveArtwork({ slug, ...artwork }: Artwork, isNew: boolean) {
  await setDoc(
    doc(db, "artworks", slug),
    { ...artwork, updatedAt: serverTimestamp(), ...(isNew ? { createdAt: serverTimestamp() } : {}) },
    { merge: true }
  );
  return revalidateSite();
}

/** Updates a few fields on several artworks at once (reordering, sold-out toggles). */
export async function patchArtworks(patches: { slug: string; data: Partial<Omit<Artwork, "slug">> }[]) {
  const batch = writeBatch(db);
  for (const { slug, data } of patches) {
    batch.update(doc(db, "artworks", slug), { ...data, updatedAt: serverTimestamp() });
  }
  await batch.commit();
  return revalidateSite();
}

export async function deleteArtwork(slug: string) {
  await deleteDoc(doc(db, "artworks", slug));
  return revalidateSite();
}

export function readImageSize(src: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("That file could not be read as an image."));
    img.src = src;
  });
}

/** Uploads an image to Cloudinary using a one-off signature from our API. */
export async function uploadImage(file: File, onProgress?: (percent: number) => void): Promise<ImageValue> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("That image is larger than 10 MB. Please export a smaller version.");

  const token = await auth.currentUser?.getIdToken();
  const signed = await fetch("/api/admin/upload-signature", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const params = await signed.json().catch(() => ({}));
  if (!signed.ok) throw new Error(params.error || "The image could not be uploaded. Please try again.");

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", params.apiKey);
  form.append("timestamp", String(params.timestamp));
  form.append("folder", params.folder);
  form.append("signature", params.signature);

  // XMLHttpRequest rather than fetch, because fetch can't report upload progress.
  const result = await new Promise<{ secure_url: string; width: number; height: number }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${params.cloudName}/image/upload`);
    xhr.responseType = "json";
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300 && xhr.response?.secure_url
        ? resolve(xhr.response)
        : reject(new Error(xhr.response?.error?.message || "The image could not be uploaded. Please try again."));
    xhr.onerror = () => reject(new Error("Network problem while uploading. Check your connection and try again."));
    xhr.send(form);
  });

  return { url: result.secure_url, alt: "", width: result.width, height: result.height };
}

/** Turns Firebase error codes into something an editor can act on. */
export function describeError(error: unknown) {
  const code = (error as { code?: string })?.code ?? "";
  if (code.includes("permission-denied")) {
    return "You don't have permission to do that. Check that the Firebase security rules have been published.";
  }
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
    return "That email and password don't match an admin account.";
  }
  if (code.includes("too-many-requests")) return "Too many attempts. Please wait a few minutes and try again.";
  if (code.includes("network")) return "Network problem. Check your connection and try again.";
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
