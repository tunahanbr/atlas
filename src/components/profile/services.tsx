import { Clock } from "lucide-react";

import type { PublicProfile } from "@/server/queries";
import { formatDelivery, formatPrice } from "@/lib/format";
import { Section } from "./section";
import { Reveal } from "./reveal";

export function Services({ services }: { services: PublicProfile["services"] }) {
  if (services.length === 0) return null;

  return (
    <Section id="services" title="Services">
      <ul className="space-y-4">
        {services.map((service, i) => (
          <Reveal key={service.id} delay={i * 0.04}>
            <li className="group rounded-xl border bg-card p-6 transition-colors hover:border-foreground/20">
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <h3 className="font-medium tracking-tight">{service.title}</h3>
                  {service.deliveryDays ? (
                    <span className="mt-1.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {formatDelivery(service.deliveryDays)}
                    </span>
                  ) : null}
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-sm font-semibold tabular-nums">
                    {formatPrice(service.priceType, service.priceCents, service.currency)}
                  </span>
                  {service.priceType !== "ON_REQUEST" ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {service.priceType === "FIXED" ? "fixed price" : "starting price"}
                    </p>
                  ) : null}
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
                {service.description}
              </p>
              {service.technologies.length > 0 ? (
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {service.technologies.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
