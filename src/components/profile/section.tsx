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
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 py-14">
      <Reveal>
        <h2
          id={`${id}-title`}
          className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
        >
          {title}
        </h2>
      </Reveal>
      <div className="mt-6">{children}</div>
    </section>
  );
}
