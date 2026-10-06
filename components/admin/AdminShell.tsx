"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { ExternalLink, FileText, Home, Images, LayoutDashboard, LogOut, Palette, Settings } from "lucide-react";
import logoPng from "@/public/asset/logo.png";
import { auth } from "@/lib/firebaseClient";
import { describeError, initializeStore, isAdmin } from "@/lib/adminApi";
import { buttonClass, inputClass } from "@/components/admin/fields";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/pages/home", label: "Home page", icon: Home },
  { href: "/admin/pages/about", label: "About page", icon: FileText },
  { href: "/admin/artworks", label: "Artworks", icon: Palette },
  { href: "/admin/pages/galleries", label: "Paintings pages", icon: Images },
  { href: "/admin/pages/settings", label: "Site settings", icon: Settings },
];

type Status = "loading" | "signed-out" | "not-admin" | "ready";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [problem, setProblem] = useState("");

  useEffect(() => {
    return onAuthStateChanged(auth, async (current) => {
      setUser(current);
      setProblem("");
      if (!current) return setStatus("signed-out");

      setStatus("loading");
      try {
        if (!(await isAdmin(current.uid))) return setStatus("not-admin");
        await initializeStore();
        setStatus("ready");
      } catch (error) {
        setProblem(describeError(error));
        setStatus("not-admin");
      }
    });
  }, []);

  if (status === "loading") {
    return <Centered><p className="text-background/70">Loading…</p></Centered>;
  }

  if (status === "signed-out") {
    return <Centered><LoginForm /></Centered>;
  }

  if (status === "not-admin") {
    return (
      <Centered>
        <div className="w-full max-w-md rounded-lg bg-white p-6 text-primary shadow-lg">
          <h1 className="text-lg font-semibold">This account can&apos;t edit the site yet</h1>
          <p className="mt-2 text-sm text-primary/70">
            You&apos;re signed in as <strong>{user?.email}</strong>, but the account hasn&apos;t been added as an admin.
            In the Firebase console, create a document in the <code>admins</code> collection with this ID:
          </p>
          <code className="mt-3 block select-all break-all rounded bg-background px-3 py-2 text-sm">{user?.uid}</code>
          {problem && <p className="mt-3 text-sm text-red-600">{problem}</p>}
          <div className="mt-5 flex gap-3">
            <button className={buttonClass.primary} onClick={() => window.location.reload()}>Try again</button>
            <button className={buttonClass.ghost} onClick={() => signOut(auth)}>Sign out</button>
          </div>
        </div>
      </Centered>
    );
  }

  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  return (
    <div className="min-h-screen bg-background font-sans text-primary md:flex">
      <aside className="bg-primary text-background md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col">
        <div className="flex items-center justify-between px-5 py-4">
          <Link href="/admin" className="block w-24 rounded bg-background px-2 py-1">
            <Image src={logoPng} alt="Tobi Adetimehin" />
          </Link>
          <span className="text-xs uppercase tracking-widest text-background/50">Admin</span>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:overflow-visible">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex shrink-0 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive(href) ? "bg-secondary text-primary" : "text-background/80 hover:bg-background/10"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden border-t border-background/10 p-3 text-sm md:block">
          <p className="truncate px-3 pb-2 text-xs text-background/50">{user?.email}</p>
          <Link href="/" target="_blank" className="flex items-center gap-3 rounded-md px-3 py-2 text-background/80 hover:bg-background/10">
            <ExternalLink size={16} /> View site
          </Link>
          <button onClick={() => signOut(auth)} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-background/80 hover:bg-background/10">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-3xl">{children}</div>
        <div className="mx-auto mt-10 flex max-w-3xl gap-4 text-sm md:hidden">
          <Link href="/" target="_blank" className="underline">View site</Link>
          <button onClick={() => signOut(auth)} className="underline">Sign out</button>
        </div>
      </main>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4 font-sans">{children}</div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "error" | "info"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      setMessage({ tone: "error", text: describeError(error) });
      setBusy(false);
    }
  };

  const handleReset = async () => {
    if (!email.trim()) {
      return setMessage({ tone: "error", text: "Enter your email address first, then choose “Forgot password”." });
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessage({ tone: "info", text: "If that address has an account, a password reset email is on its way." });
    } catch (error) {
      setMessage({ tone: "error", text: describeError(error) });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg bg-white p-6 text-primary shadow-lg">
      <div className="mx-auto mb-5 w-28"><Image src={logoPng} alt="Tobi Adetimehin" /></div>
      <h1 className="text-center text-lg font-semibold">Site admin</h1>
      <p className="mb-5 mt-1 text-center text-sm text-primary/60">Sign in to edit the website.</p>

      <label className="mb-1 block text-sm font-medium" htmlFor="admin-email">Email</label>
      <input
        id="admin-email"
        type="email"
        autoComplete="username"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputClass}
      />

      <label className="mb-1 mt-4 block text-sm font-medium" htmlFor="admin-password">Password</label>
      <input
        id="admin-password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={inputClass}
      />

      {message && (
        <p className={`mt-3 text-sm ${message.tone === "error" ? "text-red-600" : "text-primary/70"}`}>{message.text}</p>
      )}

      <button type="submit" disabled={busy} className={`${buttonClass.primary} mt-5 w-full justify-center`}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
      <button type="button" onClick={handleReset} className="mt-3 w-full text-center text-sm text-primary/60 underline">
        Forgot password
      </button>
    </form>
  );
}
