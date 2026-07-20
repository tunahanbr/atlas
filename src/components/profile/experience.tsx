import type { PublicProfile } from "@/server/queries";
import { formatDateRange } from "@/lib/format";
import { Section } from "./section";
import { Reveal } from "./reveal";

export function Experience({
  experiences,
}: {
  experiences: PublicProfile["experiences"];
}) {
  if (experiences.length === 0) return null;

  return (
    <Section id="experience" title="Experience">
      <ul className="space-y-1">
        {experiences.map((exp, i) => (
          <Reveal key={exp.id} delay={i * 0.03}>
            <li className="flex items-start justify-between gap-6 rounded-md px-3 py-5 transition-colors duration-300 hover:bg-card/45">
              <div className="min-w-0">
                <h3 className="font-editorial text-lg tracking-[-0.01em]">{exp.role}</h3>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">{exp.company}</p>
                {exp.description ? (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                    {exp.description}
                  </p>
                ) : null}
              </div>
              <span className="shrink-0 pt-0.5 text-xs whitespace-nowrap tabular-nums text-muted-foreground">
                {formatDateRange(exp.startDate, exp.endDate, exp.current)}
              </span>
            </li>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
