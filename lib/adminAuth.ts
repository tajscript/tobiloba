import type { NextRequest } from "next/server";
import { firebaseConfig } from "@/lib/firebase";

/**
 * Checks that an API request comes from a signed-in admin. The browser sends
 * its Firebase ID token as a Bearer token; resolves to the admin's UID or null.
 */
export async function verifyAdmin(request: NextRequest): Promise<string | null> {
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) return null;

  const lookup = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
      cache: "no-store",
    }
  );
  const uid: string | undefined = lookup.ok ? (await lookup.json()).users?.[0]?.localId : undefined;
  if (!uid) return null;

  // The rules only let a user read their own admins/{uid} document, so a
  // successful read as that user proves they are an admin.
  const adminDoc = await fetch(
    `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/admins/${uid}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  );
  return adminDoc.ok ? uid : null;
}
