import type { PublicProfile } from "@/server/queries";
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
      <ul className="space-y-4">
        {testimonials.map((t, i) => (
          <Reveal key={t.id} delay={i * 0.04}>
            <li>
              <figure className="rounded-xl border bg-card p-6">
                <blockquote className="text-sm leading-relaxed text-pretty">
                  “{t.content}”
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <Avatar className="size-8 border">
                    {t.avatarUrl ? <AvatarImage src={t.avatarUrl} alt={t.authorName} /> : null}
                    <AvatarFallback className="text-xs">{initials(t.authorName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{t.authorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {[t.authorRole, t.authorCompany].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </li>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
