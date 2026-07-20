import type { PublicProfile } from "@/server/queries";
import { BadgeCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/format";
import { Section } from "./section";
import { Reveal } from "./reveal";

export function Testimonials({
  testimonials,
}: {
  testimonials: PublicProfile["testimonials"];
}) {
  if (testimonials.length === 0) return null;

  return (
    <Section id="testimonials" title="Testimonials">
      <ul className="space-y-5">
        {testimonials.map((t, i) => (
          <Reveal key={t.id} as="li" delay={i * 0.04}>
              <figure className="rounded-md bg-card/45 px-6 py-7 sm:px-8">
                <blockquote className="font-editorial text-xl leading-[1.45] tracking-[-0.01em] text-pretty sm:text-[1.35rem]">
                  “{t.content}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <Avatar className="size-7 border-0">
                    {t.avatarUrl ? <AvatarImage src={t.avatarUrl} alt={t.authorName} /> : null}
                    <AvatarFallback className="text-xs">{initials(t.authorName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-medium">
                      {t.authorName}
                      {t.verified ? <span className="inline-flex items-center gap-1 text-[10px] font-normal text-emerald-700 dark:text-emerald-300" title="Submitted through a private client request link"><BadgeCheck className="size-3" />Verified client</span> : null}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {[t.authorRole, t.authorCompany].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </figcaption>
              </figure>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
