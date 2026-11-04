import { Instagram, Mail, Twitter } from "lucide-react";
import type { SocialLink } from "@/lib/types";

// lucide has no TikTok icon; this is Tabler's "brand-tiktok" (MIT), drawn to match lucide's stroke style.
function Tiktok({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 7.917v4.034a9.948 9.948 0 0 1 -5 -1.951v4.5a6.5 6.5 0 1 1 -8 -6.326v4.326a2.5 2.5 0 1 0 4 2v-11.5h4.083a6.005 6.005 0 0 0 4.917 4.917z" />
    </svg>
  );
}

const ICONS = { instagram: Instagram, twitter: Twitter, tiktok: Tiktok, email: Mail };
const LABELS = { instagram: "Instagram", twitter: "Twitter", tiktok: "TikTok", email: "Email" };

interface SocialLinksProps {
  links: SocialLink[];
  className?: string;
  iconClassName?: string;
  onClick?: () => void;
}

export default function SocialLinks({ links, className, iconClassName, onClick }: SocialLinksProps) {
  if (links.length === 0) return null;

  return (
    <div className={className}>
      {links.map(({ kind, href }) => {
        const Icon = ICONS[kind];
        return (
          <a
            key={kind}
            href={href}
            aria-label={LABELS[kind]}
            onClick={onClick}
            {...(kind === "email" ? {} : { target: "_blank", rel: "noopener noreferrer" })}
          >
            <Icon className={iconClassName} />
          </a>
        );
      })}
    </div>
  );
}
