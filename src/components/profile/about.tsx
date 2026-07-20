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
          <div className="space-y-4">
            {profile.bio.split(/\n\s*\n/).map((paragraph, i) => (
              <p key={i} className="text-sm leading-relaxed text-muted-foreground text-pretty">
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>
      ) : null}

      {hasSkills ? (
        <Reveal delay={0.05}>
          <div className="mt-8 space-y-4">
            {skillGroups.map(([category, skills]) => (
              <div key={category}>
                <h3 className="text-xs font-medium text-muted-foreground">{category}</h3>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <li
                      key={skill.id}
                      className="rounded-md border bg-card px-2.5 py-1 text-xs"
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
          <ul className="mt-8 space-y-3">
            {profile.certifications.map((cert) => (
              <li key={cert.id} className="flex items-start gap-3 text-sm">
                <Award className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
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
