// Browser-only Firebase services used by the /admin area.
import { getAuth } from "firebase/auth";
import app from "@/lib/firebase";

export const auth = getAuth(app);
