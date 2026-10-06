import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/adminAuth";

const UPLOAD_FOLDER = "tobi-site";

// Images are uploaded from the admin's browser straight to Cloudinary. This
// route hands a signed-in admin a short-lived signature for one upload, so the
// Cloudinary API secret never leaves the server.
export async function POST(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "Not signed in as an admin" }, { status: 401 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Image uploads are not set up yet: the Cloudinary environment variables are missing." },
      { status: 503 }
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  // Cloudinary signs the upload parameters in alphabetical order, followed by the secret.
  const signature = createHash("sha1")
    .update(`folder=${UPLOAD_FOLDER}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  return NextResponse.json({ cloudName, apiKey, timestamp, folder: UPLOAD_FOLDER, signature });
}
