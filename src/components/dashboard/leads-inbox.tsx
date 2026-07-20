"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, MailOpen } from "lucide-react";
import { toast } from "sonner";

import { updateLeadStatus } from "@/server/actions/entities";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Lead = {
  id: string;
  name: string;
  email: string;
  budget: string | null;
  message: string;
  status: "NEW" | "READ" | "ARCHIVED";
  createdAt: Date;
};

export function LeadsInbox({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [tab, setTab] = useState("inbox");
  const [pending, startTransition] = useTransition();

  const visible = leads.filter((l) =>
    tab === "inbox" ? l.status !== "ARCHIVED" : l.status === "ARCHIVED",
  );

  function setStatus(id: string, status: "READ" | "ARCHIVED" | "NEW") {
    startTransition(async () => {
      const result = await updateLeadStatus(id, status);
      if (result.ok) router.refresh();
      else toast.error("Could not update lead");
    });
  }

  return (
    <>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
      </Tabs>

      {visible.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <p className="font-medium">{tab === "inbox" ? "Inbox zero" : "Nothing archived"}</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {tab === "inbox"
              ? "New inquiries from your profile's contact form land here."
              : "Archived leads will appear here."}
          </p>
        </div>
      ) : (
        <ul className={cn("mt-6 space-y-3", pending && "opacity-70")}>
          {visible.map((lead) => (
            <li
              key={lead.id}
              className={cn(
                "rounded-xl border bg-card p-5",
                lead.status === "NEW" && "border-l-2 border-l-brand",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium tracking-tight">{lead.name}</p>
                    {lead.status === "NEW" ? (
                      <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                        New
                      </span>
                    ) : null}
                    {lead.budget ? (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                        {lead.budget}
                      </span>
                    ) : null}
                  </div>
                  <a
                    href={`mailto:${lead.email}`}
                    className="mt-0.5 block text-sm text-brand hover:underline"
                  >
                    {lead.email}
                  </a>
                </div>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {new Date(lead.createdAt).toLocaleDateString("en", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {lead.message}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button render={<a href={`mailto:${lead.email}`} />} nativeButton={false} size="sm" className="rounded-lg">
                  Reply by email
                </Button>
                {lead.status === "NEW" ? (
                  <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setStatus(lead.id, "READ")}>
                    <MailOpen className="size-4" />
                    Mark read
                  </Button>
                ) : null}
                {lead.status !== "ARCHIVED" ? (
                  <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => setStatus(lead.id, "ARCHIVED")}>
                    <Archive className="size-4" />
                    Archive
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => setStatus(lead.id, "READ")}>
                    <ArchiveRestore className="size-4" />
                    Restore
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
