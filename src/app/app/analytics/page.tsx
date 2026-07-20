import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/shared";
import { db } from "@/server/db";
import { getAnalyticsSummary } from "@/server/analytics";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) redirect("/setup");

  const requestedDays = Number((await searchParams).days ?? 30);
  const analytics = await getAnalyticsSummary(profile.id, requestedDays);
  const maxViews = Math.max(1, ...analytics.series.map((day) => day.profileViews));
  const stats = [
    { label: "Profile views", value: analytics.totals.profileViews },
    { label: "Project views", value: analytics.totals.projectViews },
    { label: "Service interest", value: analytics.totals.serviceClicks },
    { label: "Lead conversion", value: `${analytics.conversionRate}%` },
  ];

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Privacy-friendly daily aggregates. No cookies, IP addresses or visitor profiles."
      >
        <div className="flex gap-1 rounded-lg border p-1">
          {[7, 30, 90].map((days) => (
            <Button
              key={days}
              render={<Link href={`/app/analytics?days=${days}`} />}
              nativeButton={false}
              variant={analytics.days === days ? "secondary" : "ghost"}
              size="sm"
            >
              {days}d
            </Button>
          ))}
        </div>
      </PageHeader>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-5">
            <p className="text-2xl font-semibold tabular-nums tracking-tight">{stat.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-xl border bg-card p-6">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <h2 className="font-medium tracking-tight">Profile views</h2>
            <p className="mt-1 text-xs text-muted-foreground">Daily page loads, deduplicated per browser tab.</p>
          </div>
          <p className="text-xs text-muted-foreground">Last {analytics.days} days</p>
        </div>
        <div className="mt-8 flex h-48 items-end gap-1" aria-label="Daily profile views chart">
          {analytics.series.map((day) => (
            <div key={day.date.toISOString()} className="group relative flex h-full flex-1 items-end">
              <div
                className="w-full min-w-0 rounded-t bg-brand/70 transition-colors group-hover:bg-brand"
                style={{
                  height:
                    day.profileViews === 0
                      ? "0%"
                      : `${Math.max(2, (day.profileViews / maxViews) * 100)}%`,
                }}
                title={`${day.date.toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" })}: ${day.profileViews}`}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{analytics.series[0]?.date.toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" })}</span>
          <span>{analytics.series.at(-1)?.date.toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" })}</span>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <Metric label="Project clicks" value={analytics.totals.projectClicks} />
        <Metric label="Service clicks" value={analytics.totals.serviceClicks} />
        <Metric label="Contact submissions" value={analytics.totals.contactSubmissions} />
      </section>
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
