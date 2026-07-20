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
        <h2
          id={`${id}-title`}
          className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground"
        >
          {title}
        </h2>
      </Reveal>
      <div className="mt-8">{children}</div>
    </section>
  );
}
