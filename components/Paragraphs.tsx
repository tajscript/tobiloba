/** Renders admin-entered text: a blank line starts a new paragraph, a single line break is kept. */
export default function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/\n\s*\n/)
        .filter((paragraph) => paragraph.trim())
        .map((paragraph, index) => (
          <p key={index} className="whitespace-pre-line">
            {paragraph.trim()}
          </p>
        ))}
    </>
  );
}
