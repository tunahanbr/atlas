import { Award } from "lucide-react";

import type { PublicProfile } from "@/server/queries";
import { groupBy } from "@/lib/format";
import { Section } from "./section";
import { Reveal } from "./reveal";

export function About({
  profile,
}: {
  profile: Pick<PublicProfile, "bio" | "skills" | "certifications">;
}) {
  const hasSkills = profile.skills.length > 0;
  const hasCerts = profile.certifications.length > 0;
  if (!profile.bio && !hasSkills && !hasCerts) return null;

  const skillGroups = groupBy(profile.skills, (s) => s.category ?? "Other");

  return (
    <Section id="about" title="About">
      {profile.bio ? (
        <Reveal>
          <div className="max-w-2xl space-y-5">
            {profile.bio.split(/\n\s*\n/).map((paragraph, i) => (
              <p
                key={i}
                className="font-editorial text-lg leading-[1.65] text-quiet text-pretty first:text-foreground"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>
      ) : null}

      {hasSkills ? (
        <Reveal delay={0.05}>
          <div className="hairline mt-10 grid gap-5 border-t pt-6 sm:grid-cols-2">
            {skillGroups.map(([category, skills]) => (
              <div key={category}>
                <h3 className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                  {category}
                </h3>
                <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  {skills.map((skill) => (
                    <li
                      key={skill.id}
                      className="text-xs text-foreground/80 before:mr-1.5 before:text-muted-foreground before:content-['·']"
                    >
                      {skill.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>
      ) : null}

      {hasCerts ? (
        <Reveal delay={0.1}>
          <ul className="hairline mt-10 space-y-4 border-t pt-6">
            {profile.certifications.map((cert) => (
              <li key={cert.id} className="flex items-start gap-3 text-sm">
                <Award className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                <div>
                  <span className="font-medium">{cert.name}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {cert.issuer}
                    {cert.year ? `, ${cert.year}` : ""}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      ) : null}
    </Section>
  );
}
