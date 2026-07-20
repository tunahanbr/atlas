import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowDownRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Eye,
  FolderKanban,
  MousePointerClick,
  Send,
  Sparkles,
} from "lucide-react";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/shared";
import { db } from "@/server/db";
import { getAnalyticsSummary } from "@/server/analytics";
import { cn } from "@/lib/utils";

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
  const totalInterest = analytics.totals.projectClicks + analytics.totals.serviceClicks;
  const previousInterest = analytics.previousTotals.projectClicks + analytics.previousTotals.serviceClicks;
  const stats = [
    {
      label: "Profile visitors",
      value: analytics.totals.profileViews,
      previous: analytics.previousTotals.profileViews,
      help: "People who discovered your profile",
      icon: Eye,
    },
    {
      label: "Work explored",
      value: analytics.totals.projectViews,
      previous: analytics.previousTotals.projectViews,
      help: "Unique case-study reads",
      icon: FolderKanban,
    },
    {
      label: "Interest signals",
      value: totalInterest,
      previous: previousInterest,
      help: "Project and service clicks",
      icon: MousePointerClick,
    },
    {
      label: "Inquiries",
      value: analytics.totals.contactSubmissions,
      previous: analytics.previousTotals.contactSubmissions,
      help: `${analytics.conversionRate}% of profile visitors`,
      icon: Send,
    },
  ];

  return (
    <>
      <PageHeader
        title="Analytics"
        description="See how visitors move from discovering your profile to starting a conversation."
      >
        <div className="flex gap-1 rounded-lg border bg-card/45 p-1" aria-label="Analytics date range">
          {[7, 30, 90].map((days) => (
            <Button
              key={days}
              render={<Link href={`/app/analytics?days=${days}`} scroll={false} />}
              nativeButton={false}
              variant={analytics.days === days ? "secondary" : "ghost"}
              size="sm"
            >
              {days} days
            </Button>
          ))}
        </div>
      </PageHeader>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-md border bg-card/45 p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-8 place-items-center rounded-md bg-secondary text-secondary-foreground">
                <stat.icon className="size-4" />
              </span>
              <Trend current={stat.value} previous={stat.previous} />
            </div>
            <p className="mt-5 font-editorial text-3xl tabular-nums tracking-[-0.03em]">{stat.value}</p>
            <p className="mt-1 text-sm font-medium">{stat.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{stat.help}</p>
          </div>
        ))}
      </section>

      <section className="mt-5 rounded-md border bg-card/45 p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <h2 className="font-medium tracking-tight">Traffic over time</h2>
            <p className="mt-1 text-xs text-muted-foreground">Daily unique profile visitors and project readers.</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-brand" />Profile</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-sky-500" />Projects</span>
          </div>
        </div>
        <TrafficChart series={analytics.series} />
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="rounded-md border bg-card/45 p-5 sm:p-6">
          <h2 className="font-medium tracking-tight">Visitor journey</h2>
          <p className="mt-1 text-xs text-muted-foreground">Where attention becomes intent. Counts are unique per action and day.</p>
          <div className="mt-6 space-y-5">
            <JourneyRow label="Discovered your profile" value={analytics.totals.profileViews} max={analytics.totals.profileViews} color="bg-brand" />
            <JourneyRow label="Explored work or services" value={totalInterest} max={analytics.totals.profileViews} color="bg-sky-500" />
            <JourneyRow label="Sent an inquiry" value={analytics.totals.contactSubmissions} max={analytics.totals.profileViews} color="bg-emerald-500" />
          </div>
        </div>
        <InsightCard analytics={analytics} />
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <PerformanceList
          title="Project performance"
          description="Ranked by project clicks, with full case-study reads alongside."
          icon={<FolderKanban className="size-4" />}
          empty="Project activity will appear after visitors open your work."
          items={analytics.topProjects.map((project) => ({
            id: project.id,
            label: project.title,
            href: `/app/portfolio/${project.id}`,
            value: project.clicks,
            detail: `${project.views} ${project.views === 1 ? "read" : "reads"}`,
            draft: !project.published,
          }))}
        />
        <PerformanceList
          title="Service interest"
          description="Which offers prompted visitors to take the next step."
          icon={<BriefcaseBusiness className="size-4" />}
          empty="Service interest will appear after visitors click an offer."
          items={analytics.topServices.map((service) => ({
            id: service.id,
            label: service.title,
            href: `/app/services/${service.id}`,
            value: service.clicks,
            detail: `${service.clicks} unique ${service.clicks === 1 ? "click" : "clicks"}`,
            draft: !service.published,
          }))}
        />
      </section>

      <p className="mt-6 text-xs leading-5 text-muted-foreground">
        Privacy-first analytics: Atlas counts a visitor once per page and day using a rotating one-way hash. IP addresses are discarded immediately and no tracking cookies are used.
      </p>
    </>
  );
}

type SeriesDay = {
  date: Date;
  profileViews: number;
  projectViews: number;
  projectClicks: number;
  serviceClicks: number;
  contactSubmissions: number;
};

function TrafficChart({ series }: { series: SeriesDay[] }) {
  const width = 760;
  const height = 250;
  const inset = { top: 18, right: 12, bottom: 30, left: 30 };
  const plotWidth = width - inset.left - inset.right;
  const plotHeight = height - inset.top - inset.bottom;
  const max = Math.max(1, ...series.flatMap((day) => [day.profileViews, day.projectViews]));
  const x = (index: number) => inset.left + (series.length === 1 ? 0 : (index / (series.length - 1)) * plotWidth);
  const y = (value: number) => inset.top + plotHeight - (value / max) * plotHeight;
  const path = (key: "profileViews" | "projectViews") => series.map((day, index) => `${index ? "L" : "M"}${x(index).toFixed(1)},${y(day[key]).toFixed(1)}`).join(" ");
  const hasData = series.some((day) => day.profileViews || day.projectViews);

  if (!hasData) {
    return (
      <div className="mt-6 grid h-64 place-items-center rounded-md bg-background/35 px-6 text-center">
        <div><p className="font-editorial text-lg">Your first visit starts the chart</p><p className="mt-1 text-sm text-muted-foreground">Open your public profile once to verify analytics end to end.</p></div>
      </div>
    );
  }

  return (
    <div className="mt-5 overflow-x-auto" aria-label="Daily profile and project traffic chart">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full min-w-[36rem] overflow-visible" role="img">
        <title>Daily unique profile visitors and project readers</title>
        {[0, 0.5, 1].map((ratio) => {
          const lineY = inset.top + plotHeight * ratio;
          const label = Math.round(max * (1 - ratio));
          return <g key={ratio}><line x1={inset.left} x2={width - inset.right} y1={lineY} y2={lineY} className="stroke-border" strokeDasharray="3 5" /><text x={inset.left - 8} y={lineY + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">{label}</text></g>;
        })}
        <path d={path("profileViews")} fill="none" className="stroke-brand" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        <path d={path("projectViews")} fill="none" className="stroke-sky-500" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {series.map((day, index) => (
          <g key={day.date.toISOString()}>
            <circle cx={x(index)} cy={y(day.profileViews)} r="8" fill="transparent"><title>{formatChartDate(day.date)}: {day.profileViews} profile, {day.projectViews} project</title></circle>
            <circle cx={x(index)} cy={y(day.profileViews)} r="2.5" className="fill-brand" />
          </g>
        ))}
        <text x={inset.left} y={height - 5} className="fill-muted-foreground text-[10px]">{formatChartDate(series[0].date)}</text>
        <text x={width - inset.right} y={height - 5} textAnchor="end" className="fill-muted-foreground text-[10px]">{formatChartDate(series.at(-1)!.date)}</text>
      </svg>
    </div>
  );
}

function formatChartDate(date: Date) {
  return date.toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" });
}

function Trend({ current, previous }: { current: number; previous: number }) {
  if (current === 0 && previous === 0) return <span className="text-[11px] text-muted-foreground">No data yet</span>;
  if (previous === 0) return <span className="rounded-full bg-brand/10 px-2 py-1 text-[11px] font-medium text-brand">New activity</span>;
  const change = Math.round(((current - previous) / previous) * 100);
  return <span className={cn("inline-flex items-center gap-0.5 text-[11px] font-medium", change >= 0 ? "text-success" : "text-destructive")}>{change >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}{Math.abs(change)}%</span>;
}

function JourneyRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const width = max > 0 ? Math.min(100, Math.max(value > 0 ? 4 : 0, (value / max) * 100)) : 0;
  return <div><div className="mb-2 flex items-baseline justify-between gap-4"><span className="text-sm">{label}</span><span className="text-sm font-semibold tabular-nums">{value}</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full", color)} style={{ width: `${width}%` }} /></div></div>;
}

function InsightCard({ analytics }: { analytics: Awaited<ReturnType<typeof getAnalyticsSummary>> }) {
  const { totals } = analytics;
  let title = "Build your baseline";
  let copy = "Share your profile and check back after the first visits. Atlas will show which work and offers create real interest.";
  if (totals.profileViews > 0 && totals.contactSubmissions === 0) {
    title = totals.projectClicks + totals.serviceClicks > 0 ? "Interest is not converting yet" : "Make the next step clearer";
    copy = totals.projectClicks + totals.serviceClicks > 0 ? "Visitors explore your offer but do not inquire yet. Tighten your contact call-to-action and availability message." : "People arrive, but few explore further. Lead with one strong outcome in your headline and featured work.";
  } else if (totals.contactSubmissions > 0) {
    title = "Your profile is creating conversations";
    copy = `${totals.contactSubmissions} ${totals.contactSubmissions === 1 ? "inquiry" : "inquiries"} came through in this period. Review Leads to keep momentum and capture the next step.`;
  }
  return <aside className="rounded-md border bg-brand/[0.06] p-5 sm:p-6"><span className="grid size-9 place-items-center rounded-md bg-brand/12 text-brand"><Sparkles className="size-4" /></span><p className="mt-5 font-editorial text-xl leading-tight">{title}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p></aside>;
}

function PerformanceList({ title, description, icon, empty, items }: { title: string; description: string; icon: React.ReactNode; empty: string; items: Array<{ id: string; label: string; href: string; value: number; detail: string; draft: boolean }> }) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return <div className="rounded-md border bg-card/45 p-5 sm:p-6"><div className="flex items-start gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-md bg-secondary text-secondary-foreground">{icon}</span><div><h2 className="font-medium tracking-tight">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{description}</p></div></div>{items.length ? <ol className="mt-6 space-y-4">{items.map((item, index) => <li key={item.id}><div className="mb-1.5 flex items-center gap-2 text-sm"><span className="w-5 text-xs tabular-nums text-muted-foreground">{index + 1}</span><Link href={item.href} className="min-w-0 flex-1 truncate font-medium hover:underline">{item.label}</Link>{item.draft ? <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">Draft</span> : null}<span className="shrink-0 text-xs tabular-nums text-muted-foreground">{item.detail}</span><ArrowUpRight className="size-3.5 text-muted-foreground" /></div><div className="ml-7 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-brand" style={{ width: `${Math.max(5, (item.value / max) * 100)}%` }} /></div></li>)}</ol> : <p className="mt-6 rounded-md bg-background/35 px-4 py-8 text-center text-sm text-muted-foreground">{empty}</p>}</div>;
}
