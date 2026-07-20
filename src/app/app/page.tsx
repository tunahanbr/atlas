import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";

import { auth } from "@/auth";
import { db } from "@/server/db";
import { getProfileCompleteness } from "@/server/queries";
import { PageHeader } from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { ProfileLaunchPanel } from "@/components/dashboard/profile-launch-panel";

export const metadata = { title: "Overview" };

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
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
  const isWelcome = (await searchParams).welcome === "1";

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
  const remaining = completeness.checks.filter((check) => !check.done);
  const nextCheck = remaining[0];
  const checkHref = (id: string) =>
    id === "service"
      ? "/app/services"
      : id === "project"
        ? "/app/portfolio"
        : id === "testimonial"
          ? "/app/testimonials"
          : "/app/profile";

  return (
    <>
      <PageHeader
        title={`Welcome back${firstName ? `, ${firstName}` : ""}`}
        description="Your public page, conversations and next useful step in one place."
      />

      <ProfileLaunchPanel profilePath={`/${profile.username}`} isWelcome={isWelcome} />

      {!completeness.complete && nextCheck ? (
        <section className="mt-6 rounded-md bg-card/45 p-6 sm:flex sm:items-start sm:justify-between sm:gap-8">
          <div className="max-w-xl">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Recommended next step
            </p>
            <h2 className="font-editorial mt-2 text-xl">{nextCheck.label}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {nextCheck.id === "avatar"
                ? "A recognizable photo makes an otherwise new profile feel immediately more trustworthy."
                : nextCheck.id === "headline"
                  ? "Explain the outcome you create, not only your job title."
                  : nextCheck.id === "bio"
                    ? "Give visitors enough context to understand how you think and work."
                    : nextCheck.id === "service"
                      ? "Turn one common client problem into a clear offer with scope and pricing."
                      : nextCheck.id === "project"
                        ? "Show one outcome you created. Proof makes every other claim easier to believe."
                        : nextCheck.id === "testimonial"
                          ? "A specific client quote answers the trust question you cannot answer yourself."
                          : "Give visitors one place where they can verify more of your work."}
            </p>
            {remaining.length > 1 ? (
              <p className="mt-4 text-xs text-muted-foreground">
                {remaining.length - 1} more {remaining.length - 1 === 1 ? "step" : "steps"} after this
              </p>
            ) : null}
          </div>
          <Button
            render={<Link href={checkHref(nextCheck.id)} />}
            nativeButton={false}
            className="mt-5 sm:mt-0"
          >
            Continue setup
            <ArrowRight className="size-4" />
          </Button>
        </section>
      ) : null}

      {!completeness.complete ? (
        <section className="mt-3 rounded-md bg-card/25 px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Profile foundation</p>
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
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {completeness.checks
              .filter((c) => !c.done)
              .slice(0, 3)
              .map((check) => (
                <li key={check.id}>
                  <Link
                    href={checkHref(check.id)}
                    className="group inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {check.label}
                    <ArrowRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-md bg-card/45 p-5 transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-card/75"
          >
            <p className="font-editorial text-3xl tabular-nums tracking-[-0.02em]">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </Link>
        ))}
      </section>

      <section className="mt-8 rounded-md bg-card/35 px-5">
        <div className="flex items-center justify-between py-5">
          <h2 className="font-editorial text-lg">Recent leads</h2>
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
              No inquiries yet. Your form is live — share the profile where potential clients already know you.
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
