import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { PublicProfile } from "@/server/queries";

export function ProfileFooter({
  socials,
}: {
  socials: PublicProfile["socials"];
}) {
  return (
    <footer className="py-10 sm:py-12">
      {socials.length > 0 ? (
        <ul className="flex flex-wrap gap-x-7 gap-y-2">
          {socials.map((social) => (
            <li key={social.id}>
              <Link
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {social.label}
                <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-8 font-editorial text-sm italic text-muted-foreground">
        Powered by{" "}
        <Link
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground/80 hover:text-foreground"
        >
          Atlas
        </Link>
        {" "}— the open-source home for independent professionals.
      </p>
    </footer>
  );
}
