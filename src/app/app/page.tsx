import Link from "next/link";
import { ArrowRight, ArrowUpRight, Inbox } from "lucide-react";

import { auth } from "@/auth";
import { db } from "@/server/db";
import { getProfileCompleteness } from "@/server/queries";
import { PageHeader } from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export const metadata = { title: "Overview" };

export default async function OverviewPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [profile, completeness, newLeads, recentLeads] = await Promise.all([
    db.profile.findUnique({
      where: { userId: session.user.id },
      include: {
        services: { select: { id: true } },
        projects: { select: { id: true } },
        testimonials: { select: { id: true } },
      },
    }),
    getProfileCompleteness(session.user.id),
    db.lead.count({ where: { userId: session.user.id, status: "NEW" } }),
    db.lead.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);
  if (!profile || !completeness) redirect("/setup");

  const firstName = (session.user.name ?? "").split(" ")[0];

  const stats = [
    { label: "New leads", value: newLeads, href: "/app/leads" },
    { label: "Services", value: profile.services.length, href: "/app/services" },
    { label: "Projects", value: profile.projects.length, href: "/app/portfolio" },
    {
      label: "Testimonials",
      value: profile.testimonials.length,
      href: "/app/testimonials",
    },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome back${firstName ? `, ${firstName}` : ""}`}
        description="Here's the state of your professional presence."
      >
        <Button
          render={<Link href={`/${profile.username}`} target="_blank" />}
          nativeButton={false}
          variant="outline"
        >
          <ArrowUpRight className="size-4" />
          View public profile
        </Button>
      </PageHeader>

      {!completeness.complete ? (
        <section className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-medium tracking-tight">Profile completeness</h2>
            <span className="text-sm tabular-nums text-muted-foreground">
              {completeness.done}/{completeness.total}
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${(completeness.done / completeness.total) * 100}%` }}
            />
          </div>
          <ul className="mt-4 space-y-2">
            {completeness.checks
              .filter((c) => !c.done)
              .slice(0, 3)
              .map((check) => (
                <li key={check.id}>
                  <Link
                    href={
                      check.id === "service"
                        ? "/app/services"
                        : check.id === "project"
                          ? "/app/portfolio"
                          : check.id === "testimonial"
                            ? "/app/testimonials"
                            : "/app/profile"
                    }
                    className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span className="flex size-4 items-center justify-center rounded-full border" />
                    {check.label}
                    <ArrowRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border bg-card p-5 transition-colors hover:border-foreground/20"
          >
            <p className="text-2xl font-semibold tabular-nums tracking-tight">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </Link>
        ))}
      </section>

      <section className="mt-6 rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-medium tracking-tight">Recent leads</h2>
          <Link
            href="/app/leads"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            View all
          </Link>
        </div>
        {recentLeads.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <Inbox className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No inquiries yet. Share your profile link to get started.
            </p>
          </div>
        ) : (
          <ul className="divide-y">
            {recentLeads.map((lead) => (
              <li key={lead.id} className="flex items-center gap-4 px-6 py-4">
                <span
                  className={
                    lead.status === "NEW"
                      ? "size-2 shrink-0 rounded-full bg-brand"
                      : "size-2 shrink-0 rounded-full bg-transparent"
                  }
                  aria-label={lead.status === "NEW" ? "New" : undefined}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{lead.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{lead.message}</p>
                </div>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {lead.createdAt.toLocaleDateString("en", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

    </>
  );
}
