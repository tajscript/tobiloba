"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { describeError, loadContent, saveContent } from "@/lib/adminApi";
import { PAGE_SCHEMAS } from "@/lib/adminSchema";
import type { ContentKey, ImageValue } from "@/lib/types";
import {
  Card,
  Field,
  ImageField,
  SAVED_MESSAGE,
  SAVED_PENDING_MESSAGE,
  SaveBar,
  buttonClass,
  inputClass,
} from "@/components/admin/fields";
import { useUnsavedWarning } from "@/components/admin/useUnsavedWarning";

type Values = Record<string, string | ImageValue>;

export default function PageEditor({ pageKey }: { pageKey: ContentKey }) {
  const schema = PAGE_SCHEMAS[pageKey];
  const [values, setValues] = useState<Values | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  useUnsavedWarning(dirty);

  useEffect(() => {
    setValues(null);
    setDirty(false);
    setMessage(null);
    loadContent(pageKey)
      .then((content) => setValues(content as unknown as Values))
      .catch((error) => setMessage({ tone: "error", text: describeError(error) }));
  }, [pageKey]);

  const update = (name: string, value: string | ImageValue) => {
    setValues((current) => (current ? { ...current, [name]: value } : current));
    setDirty(true);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values) return;
    setSaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const refreshed = await saveContent(pageKey, values as any);
      setDirty(false);
      setMessage(refreshed ? SAVED_MESSAGE : SAVED_PENDING_MESSAGE);
    } catch (error) {
      setMessage({ tone: "error", text: describeError(error) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">{schema.title}</h1>
        <p className="mt-1 text-sm text-primary/60">{schema.description}</p>
      </header>

      {!values ? (
        <p className={`text-sm ${message ? "text-red-600" : "text-primary/60"}`}>{message?.text ?? "Loading…"}</p>
      ) : (
        <>
          <div className="space-y-6">
            {schema.sections.map((section) => (
              <Card key={section.title} title={section.title} description={section.description}>
                {section.fields.map((field) =>
                  field.type === "image" ? (
                    <ImageField
                      key={field.name}
                      label={field.label}
                      hint={field.hint}
                      value={values[field.name] as ImageValue}
                      onChange={(value) => update(field.name, value)}
                    />
                  ) : (
                    <Field key={field.name} label={field.label} hint={field.hint}>
                      {field.type === "textarea" ? (
                        <textarea
                          rows={field.rows ?? 4}
                          value={values[field.name] as string}
                          onChange={(e) => update(field.name, e.target.value)}
                          className={inputClass}
                        />
                      ) : (
                        <input
                          type="text"
                          value={values[field.name] as string}
                          onChange={(e) => update(field.name, e.target.value)}
                          className={inputClass}
                        />
                      )}
                    </Field>
                  )
                )}
              </Card>
            ))}
          </div>

          <SaveBar saving={saving} dirty={dirty} message={message}>
            <Link href={schema.viewHref} target="_blank" className={buttonClass.ghost}>
              <ExternalLink size={15} /> View page
            </Link>
          </SaveBar>
        </>
      )}
    </form>
  );
}
