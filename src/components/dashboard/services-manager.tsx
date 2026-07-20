"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, GripVertical, Pencil, Plus } from "lucide-react";

import { deleteService } from "@/server/actions/entities";
import { formatDelivery, formatPrice } from "@/lib/format";
import { DeleteButton, EmptyState } from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import { useReorder } from "@/components/dashboard/use-reorder";
import { ContentCollectionToolbar, type CollectionFilter } from "@/components/dashboard/content-collection-toolbar";

type Service = {
  id: string;
  title: string;
  description: string;
  priceType: "FIXED" | "STARTING_AT" | "ON_REQUEST";
  priceCents: number | null;
  currency: string;
  deliveryDays: number | null;
  technologies: string[];
  published: boolean;
};

export function ServicesManager({ services }: { services: Service[] }) {
  const reorder = useReorder(services, "services");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CollectionFilter>("all");
  const visible = useMemo(() => reorder.items.filter((service) => {
    const matchesQuery = `${service.title} ${service.description}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesFilter = filter === "all" || (filter === "published" ? service.published : !service.published);
    return matchesQuery && matchesFilter;
  }), [filter, query, reorder.items]);
  const counts = {
    all: services.length,
    published: services.filter((service) => service.published).length,
    draft: services.filter((service) => !service.published).length,
  };
  const addButton = <Button render={<Link href="/app/services/new" />} nativeButton={false}><Plus className="size-4" />New service</Button>;

  if (services.length === 0) {
    return <EmptyState title="Turn one repeat request into a clear offer" description="Start with a problem clients already ask you to solve. Give it a concrete outcome, timeline, and price signal.">{addButton}</EmptyState>;
  }

  return (
    <>
      <ContentCollectionToolbar query={query} onQueryChange={setQuery} filter={filter} onFilterChange={setFilter} counts={counts}>{addButton}</ContentCollectionToolbar>
      {visible.length ? (
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {visible.map((service, index) => (
            <li key={service.id} {...reorder.dragProps(service.id)} className="group rounded-md border bg-card/45 p-4 transition hover:border-foreground/20 hover:bg-card/70">
              <div className="flex items-start gap-3">
                <GripVertical className="mt-0.5 size-4 cursor-grab text-muted-foreground/60" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><h2 className="truncate font-medium">{service.title}</h2><span className={service.published ? "text-[10px] text-emerald-700 dark:text-emerald-300" : "text-[10px] text-muted-foreground"}>{service.published ? "Published" : "Draft"}</span></div>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{service.description}</p>
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground"><span>{formatPrice(service.priceType, service.priceCents, service.currency)}</span>{service.deliveryDays ? <span>{formatDelivery(service.deliveryDays)}</span> : null}<span>{service.technologies.length} tags</span></div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end gap-1 border-t pt-3">
                <Button variant="ghost" size="icon-sm" aria-label={`Move ${service.title} up`} disabled={index === 0 || reorder.pending || filter !== "all" || Boolean(query)} onClick={() => reorder.moveBy(service.id, -1)}><ChevronUp /></Button>
                <Button variant="ghost" size="icon-sm" aria-label={`Move ${service.title} down`} disabled={index === visible.length - 1 || reorder.pending || filter !== "all" || Boolean(query)} onClick={() => reorder.moveBy(service.id, 1)}><ChevronDown /></Button>
                <Button render={<Link href={`/app/services/${service.id}`} />} nativeButton={false} variant="ghost" size="sm"><Pencil />Edit</Button>
                <DeleteButton id={service.id} action={deleteService} label={service.title} />
              </div>
            </li>
          ))}
        </ul>
      ) : <div className="mt-4 rounded-md border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">No services match this view.</div>}
    </>
  );
}
