"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type CollectionFilter = "all" | "published" | "draft";

export function ContentCollectionToolbar({
  query,
  onQueryChange,
  filter,
  onFilterChange,
  counts,
  children,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  filter: CollectionFilter;
  onFilterChange: (value: CollectionFilter) => void;
  counts: { all: number; published: number; draft: number };
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-md border bg-card/40 p-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative min-w-0 flex-1 md:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search collection…" aria-label="Search collection" className="pl-9" />
        </div>
        <div className="flex min-w-0 items-center gap-1 overflow-x-auto">
          {(["all", "published", "draft"] as const).map((value) => (
            <button key={value} type="button" onClick={() => onFilterChange(value)} className={cn("rounded-md px-2.5 py-1.5 text-xs capitalize transition", filter === value ? "bg-secondary font-medium text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              {value} <span className="ml-1 tabular-nums opacity-65">{counts[value]}</span>
            </button>
          ))}
        </div>
        {children ? <div className="md:ml-auto">{children}</div> : null}
      </div>
    </div>
  );
}
