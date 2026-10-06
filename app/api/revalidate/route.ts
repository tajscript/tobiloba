import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { verifyAdmin } from "@/lib/adminAuth";
import { CONTENT_TAG } from "@/lib/content";

// Called by /admin after every save. Only a signed-in admin may clear the cache.
export async function POST(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "Not signed in as an admin" }, { status: 401 });
  }

  revalidateTag(CONTENT_TAG);

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
