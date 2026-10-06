"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { describeError, readImageSize, uploadImage } from "@/lib/adminApi";
import { type ImageValue, EMPTY_IMAGE } from "@/lib/types";

export const inputClass =
  "w-full rounded-md border border-primary/20 bg-white px-3 py-2 text-sm text-primary placeholder:text-primary/40 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/40 disabled:bg-background disabled:text-primary/50";

const buttonBase =
  "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export const buttonClass = {
  primary: `${buttonBase} bg-primary text-background hover:bg-primary/85`,
  ghost: `${buttonBase} border border-primary/20 bg-white text-primary hover:bg-background`,
  danger: `${buttonBase} border border-red-200 bg-white text-red-600 hover:bg-red-50`,
};

export function Card({ title, description, children }: { title?: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg bg-white p-5 shadow-sm sm:p-6">
      {title && <h2 className="text-base font-semibold">{title}</h2>}
      {description && <p className="mt-1 text-sm text-primary/60">{description}</p>}
      <div className={`space-y-5 ${title ? "mt-5" : ""}`}>{children}</div>
    </section>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-primary/55">{hint}</span>}
    </label>
  );
}

export function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-[var(--color-secondary)]"
      />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="block text-xs text-primary/55">{hint}</span>}
      </span>
    </label>
  );
}

/** Dollar amount input that keeps its value as a number. */
export function PriceInput({ value, onChange, ...rest }: { value: number; onChange: (value: number) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-primary/50">$</span>
      <input
        type="number"
        min={0}
        step="any"
        inputMode="decimal"
        value={value || ""}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className={`${inputClass} pl-7`}
        {...rest}
      />
    </div>
  );
}

export function ImageField({ label, hint, value, onChange }: { label: string; hint?: string; value: ImageValue; onChange: (value: ImageValue) => void }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [linkDraft, setLinkDraft] = useState<string | null>(null);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setError("");
    setProgress(0);
    try {
      const uploaded = await uploadImage(file, setProgress);
      onChange({ ...uploaded, alt: value.alt });
    } catch (err) {
      setError(describeError(err));
    } finally {
      setProgress(null);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const applyLink = async () => {
    const url = (linkDraft ?? "").trim();
    if (!url) return setLinkDraft(null);
    setError("");
    try {
      onChange({ url, alt: value.alt, ...(await readImageSize(url)) });
      setLinkDraft(null);
    } catch {
      setError("That link didn't load as an image. Check the address and try again.");
    }
  };

  return (
    <div>
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <div className="flex flex-col gap-4 rounded-md border border-primary/15 bg-background/40 p-3 sm:flex-row">
        <div className="flex h-36 w-full shrink-0 items-center justify-center overflow-hidden rounded bg-background sm:w-36">
          {value.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.url} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="text-xs text-primary/50">No image</span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap gap-2">
            <button type="button" className={buttonClass.ghost} disabled={progress !== null} onClick={() => fileInput.current?.click()}>
              <Upload size={15} />
              {progress !== null ? `Uploading ${progress}%` : value.url ? "Replace image" : "Upload image"}
            </button>
            {value.url && (
              <button type="button" className={buttonClass.ghost} onClick={() => onChange({ ...EMPTY_IMAGE })}>
                <X size={15} /> Remove
              </button>
            )}
            <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
          </div>

          {linkDraft === null ? (
            <button type="button" className="text-xs text-primary/60 underline" onClick={() => setLinkDraft("")}>
              or use an image link instead
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="url"
                autoFocus
                placeholder="https://…"
                value={linkDraft}
                onChange={(e) => setLinkDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyLink();
                  }
                }}
                className={inputClass}
              />
              <button type="button" className={buttonClass.ghost} onClick={applyLink}>Use</button>
            </div>
          )}

          <input
            type="text"
            placeholder="Describe the image (for screen readers and search engines)"
            value={value.alt}
            onChange={(e) => onChange({ ...value, alt: e.target.value })}
            className={inputClass}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
      {hint && <span className="mt-1 block text-xs text-primary/55">{hint}</span>}
    </div>
  );
}

/** Sticky footer with the save button and the result of the last save. */
export function SaveBar({ saving, dirty, message, children }: { saving: boolean; dirty: boolean; message: { tone: "ok" | "error"; text: string } | null; children?: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 -mx-4 mt-6 flex flex-wrap items-center gap-3 border-t border-primary/10 bg-background/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
      <button type="submit" disabled={saving || !dirty} className={buttonClass.primary}>
        {saving ? "Saving…" : "Save changes"}
      </button>
      {children}
      <p role="status" className={`text-sm ${message?.tone === "error" ? "text-red-600" : "text-primary/60"}`}>
        {message ? message.text : dirty ? "You have unsaved changes." : ""}
      </p>
    </div>
  );
}

export const SAVED_MESSAGE = { tone: "ok", text: "Saved. Your changes are live on the site." } as const;
export const SAVED_PENDING_MESSAGE = { tone: "ok", text: "Saved. It can take up to a minute to appear on the site." } as const;
