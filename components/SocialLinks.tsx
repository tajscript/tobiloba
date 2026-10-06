import { Instagram, Mail, Twitter } from "lucide-react";
import type { SocialLink } from "@/lib/types";

const ICONS = { instagram: Instagram, twitter: Twitter, email: Mail };
const LABELS = { instagram: "Instagram", twitter: "Twitter", email: "Email" };

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
