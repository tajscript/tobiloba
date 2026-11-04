import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/adminAuth";
import { addToNewsletter, removeFromNewsletter } from "@/lib/emailServices";
import { normalizeEmail } from "@/lib/subscribers";

// Resend's free plan allows two requests a second.
const pause = () => new Promise((resolve) => setTimeout(resolve, 600));

// Adds addresses to the Resend audience. /admin sends them in small batches.
export async function POST(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "Not signed in as an admin" }, { status: 401 });
  }

  const { emails } = await request.json();
  const list: string[] = (Array.isArray(emails) ? emails : []).map(normalizeEmail).filter(Boolean).slice(0, 25);

  let added = 0;
  for (const email of list) {
    if (await addToNewsletter(email)) added++;
    await pause();
  }

  return NextResponse.json({ added, failed: list.length - added });
}

// Removes one address from the Resend audience.
export async function DELETE(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "Not signed in as an admin" }, { status: 401 });
  }

  const email = normalizeEmail((await request.json()).email);
  if (!email) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  const removed = await removeFromNewsletter(email);
  return NextResponse.json({ removed }, { status: removed ? 200 : 502 });
}
