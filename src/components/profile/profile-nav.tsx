import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowDownRight } from "lucide-react";

export function ProfileNav({
  name,
  links,
  contactHref = "#contact",
}: {
  name: string;
  links: Array<{ href: string; label: string }>;
  contactHref?: string;
}) {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-background/78 backdrop-blur-md">
      <div className="hairline mx-auto flex h-16 max-w-3xl items-center justify-between border-b px-5 sm:px-6">
        <a href="#top" className="group inline-flex items-center gap-2.5">
          <span className="size-1.5 rotate-45 bg-foreground transition-transform duration-500 group-hover:rotate-[225deg]" />
          <span className="font-editorial text-[15px] tracking-[-0.01em]">{name}</span>
        </a>
        <div className="flex items-center gap-1">
          <div className="mr-3 hidden items-center gap-4 md:flex">
            {links.slice(0, 3).map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>
          <ThemeToggle />
          <a
            href={contactHref}
            className="group ml-2 inline-flex items-center gap-1.5 border-b border-foreground/35 pb-0.5 text-xs font-medium transition-colors hover:border-foreground"
          >
            Get in touch
            <ArrowDownRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
          </a>
        </div>
      </div>
    </nav>
  );
}
