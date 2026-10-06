import { enquiryTarget } from "@/lib/types";

interface EnquiryButtonProps {
  artTitle: string;
  label: string;
  /** Booking page or email address from Site settings. */
  link: string;
  className?: string;
}

/** The single call to action on an artwork: straight to the artist's booking page or email. */
export default function EnquiryButton({ artTitle, label, link, className = "" }: EnquiryButtonProps) {
  const { href, external } = enquiryTarget(link, artTitle);

  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`block text-center px-6 py-2 font-semibold bg-transparent text-secondary border border-secondary rounded-full transition-colors ease-in-out duration-300 hover:bg-secondary hover:text-primary ${className}`}
    >
      {label || "ENQUIRE"}
    </a>
  );
}
