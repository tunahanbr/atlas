import { ArrowRight, Clock } from "lucide-react";

import type { PublicProfile } from "@/server/queries";
import { formatDelivery, formatPrice } from "@/lib/format";
import { Section } from "./section";
import { Reveal } from "./reveal";
import { AnalyticsLink } from "./analytics-tracker";

export function Services({
  username,
  services,
}: {
  username: string;
  services: PublicProfile["services"];
}) {
  if (services.length === 0) return null;

  return (
    <Section id="services" title="Services">
      <ul className="hairline divide-y border-y">
        {services.map((service, i) => (
          <Reveal key={service.id} delay={i * 0.04}>
            <li className="group grid gap-4 py-7 transition-[padding] duration-500 sm:grid-cols-[2rem_1fr] sm:gap-5 sm:hover:pl-1">
              <span className="pt-1 font-editorial text-sm italic text-muted-foreground/70">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <h3 className="font-editorial text-xl leading-snug tracking-[-0.01em]">
                      {service.title}
                    </h3>
                    {service.deliveryDays ? (
                      <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="size-3" strokeWidth={1.5} />
                        {formatDelivery(service.deliveryDays)}
                      </span>
                    ) : null}
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-sm font-medium tabular-nums">
                      {formatPrice(service.priceType, service.priceCents, service.currency)}
                    </span>
                    {service.priceType !== "ON_REQUEST" ? (
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {service.priceType === "FIXED" ? "fixed price" : "starting price"}
                      </p>
                    ) : null}
                  </div>
                </div>
                <p className="mt-4 max-w-2xl text-sm leading-[1.7] text-muted-foreground text-pretty">
                  {service.description}
                </p>
                {service.technologies.length > 0 ? (
                  <p className="mt-4 text-xs text-muted-foreground/80">
                    {service.technologies.join("  ·  ")}
                  </p>
                ) : null}
                <AnalyticsLink
                  username={username}
                  event="SERVICE_CLICK"
                  href="#contact"
                  className="group/link mt-5 inline-flex items-center gap-1.5 border-b border-brand/35 pb-0.5 text-xs font-medium text-brand transition-colors hover:border-brand"
                >
                  Discuss this service
                  <ArrowRight className="size-3.5 transition-transform duration-300 group-hover/link:translate-x-1" />
                </AnalyticsLink>
              </div>
            </li>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
