import type { ReactNode } from "react";

import { Reveal } from "./reveal";

export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 py-16 sm:py-20">
      <Reveal>
        <div className="flex items-center gap-4">
          <h2
            id={`${id}-title`}
            className="shrink-0 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground"
          >
            {title}
          </h2>
          <span className="hairline h-px flex-1 border-t" aria-hidden="true" />
        </div>
      </Reveal>
      <div className="mt-8">{children}</div>
    </section>
  );
}
