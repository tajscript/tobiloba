"use client";

import { useEffect, useState } from "react";
import { Download, ExternalLink, Send, Trash2 } from "lucide-react";
import { type Subscriber, copySubscribersToResend, describeError, listSubscribers, removeSubscriber } from "@/lib/adminApi";
import { buttonClass } from "@/components/admin/fields";

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

function downloadCsv(subscribers: Subscriber[]) {
  const rows = [
    ["Email", "Subscribed", "From"],
    ...subscribers.map((s) => [s.email, s.subscribedAt ? s.subscribedAt.toISOString().slice(0, 10) : "", s.source]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  link.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    listSubscribers()
      .then(setSubscribers)
      .catch((err) => setMessage({ tone: "error", text: describeError(err) }));
  }, []);

  const remove = async (subscriber: Subscriber) => {
    if (!subscribers || !window.confirm(`Remove ${subscriber.email} from the newsletter list? They won't get future newsletters.`)) return;
    setBusy(true);
    setMessage(null);
    try {
      await removeSubscriber(subscriber);
      setSubscribers(subscribers.filter((s) => s.email !== subscriber.email));
      setMessage({ tone: "ok", text: `${subscriber.email} has been removed.` });
    } catch (err) {
      setMessage({ tone: "error", text: describeError(err) });
    } finally {
      setBusy(false);
    }
  };

  const copyToResend = async () => {
    if (!subscribers) return;
    setBusy(true);
    setMessage({ tone: "ok", text: `Adding to Resend… 0 of ${subscribers.length}` });
    try {
      const { failed } = await copySubscribersToResend(
        subscribers.map((s) => s.email),
        (done) => setMessage({ tone: "ok", text: `Adding to Resend… ${done} of ${subscribers.length}` })
      );
      setMessage(
        failed
          ? { tone: "error", text: `${failed} address${failed === 1 ? "" : "es"} could not be added. Please try again.` }
          : { tone: "ok", text: "Everyone on this list is in Resend." }
      );
    } catch (err) {
      setMessage({ tone: "error", text: describeError(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Subscribers</h1>
          <p className="mt-1 text-sm text-primary/60">
            People who signed up for the newsletter in the footer, or said yes on the contact form.
          </p>
        </div>
        {subscribers && subscribers.length > 0 && (
          <button onClick={() => downloadCsv(subscribers)} className={buttonClass.primary}>
            <Download size={15} /> Download list
          </button>
        )}
      </header>

      <div className="mb-6 rounded-lg bg-white p-5 text-sm shadow-sm">
        <h2 className="font-semibold">Sending a newsletter</h2>
        <p className="mt-1 text-primary/70">
          New subscribers are added to Resend automatically. Write and send newsletters there under Broadcasts. Resend
          adds the unsubscribe link and keeps track of who has unsubscribed.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href="https://resend.com/broadcasts" target="_blank" rel="noopener noreferrer" className={buttonClass.ghost}>
            <ExternalLink size={15} /> Open Resend
          </a>
          {subscribers && subscribers.length > 0 && (
            <button onClick={copyToResend} disabled={busy} className={buttonClass.ghost}>
              <Send size={15} /> Add everyone to Resend
            </button>
          )}
        </div>
      </div>

      {message && <p className={`mb-4 text-sm ${message.tone === "error" ? "text-red-600" : "text-primary/70"}`}>{message.text}</p>}

      {!subscribers ? (
        message?.tone !== "error" && <p className="text-sm text-primary/60">Loading…</p>
      ) : subscribers.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <p className="font-medium">No subscribers yet</p>
          <p className="mt-1 text-sm text-primary/60">People who sign up on the site will appear here.</p>
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm text-primary/60">
            {subscribers.length} subscriber{subscribers.length === 1 ? "" : "s"}
          </p>
          <ul className="divide-y divide-primary/10 rounded-lg bg-white shadow-sm">
            {subscribers.map((subscriber) => (
              <li key={subscriber.email} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap">
                <div className="min-w-0 flex-1 basis-48">
                  <p className="truncate font-medium">{subscriber.email}</p>
                  <p className="text-xs text-primary/50">
                    {subscriber.subscribedAt ? dateFormat.format(subscriber.subscribedAt) : "Date unknown"} · {subscriber.source}
                  </p>
                </div>
                <button onClick={() => remove(subscriber)} disabled={busy} className={buttonClass.danger}>
                  <Trash2 size={14} /> Remove
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
