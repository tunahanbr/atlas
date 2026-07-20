import { createHmac } from "node:crypto";

import type { AnalyticsEvent } from "../lib/analytics";
import { analyticsColumn, utcDay } from "../lib/analytics";
import { db } from "./db";

function analyticsSalt(): string {
  return process.env.ANALYTICS_SALT?.trim()
    || process.env.AUTH_SECRET?.trim()
    || (process.env.NODE_ENV === "production" ? "" : "atlas-local-analytics");
}

export function analyticsVisitorHash(clientAddress: string, date = utcDay()): string {
  const salt = analyticsSalt();
  if (!salt) throw new Error("ANALYTICS_SALT or AUTH_SECRET must be configured");
  const day = date.toISOString().slice(0, 10);
  return createHmac("sha256", salt).update(`${day}:${clientAddress}`).digest("hex");
}

export async function recordAnalyticsEvent(
  profileId: string,
  event: AnalyticsEvent,
  pageKey: string,
  clientAddress: string,
): Promise<boolean> {
  const column = analyticsColumn(event);
  const date = utcDay();
  const safePageKey = pageKey.trim().slice(0, 160);
  if (!safePageKey) return false;
  const visitorHash = analyticsVisitorHash(clientAddress, date);

  return db.$transaction(async (tx) => {
    const inserted = await tx.analyticsUniqueVisitor.createMany({
      data: [{ profileId, date, event, pageKey: safePageKey, visitorHash }],
      skipDuplicates: true,
    });
    if (inserted.count === 0) return false;
    await tx.analyticsDaily.upsert({
      where: { profileId_date: { profileId, date } },
      create: { profileId, date, [column]: 1 },
      update: { [column]: { increment: 1 } },
    });
    await tx.analyticsEventDaily.upsert({
      where: {
        profileId_date_event_pageKey: { profileId, date, event, pageKey: safePageKey },
      },
      create: { profileId, date, event, pageKey: safePageKey, uniqueCount: 1 },
      update: { uniqueCount: { increment: 1 } },
    });
    return true;
  });
}

export async function recordContactSubmission(profileId: string) {
  const date = utcDay();
  await db.analyticsDaily.upsert({
    where: { profileId_date: { profileId, date } },
    create: { profileId, date, contactSubmissions: 1 },
    update: { contactSubmissions: { increment: 1 } },
  });
}

export async function getAnalyticsSummary(profileId: string, days: number) {
  const safeDays = [7, 30, 90].includes(days) ? days : 30;
  const end = utcDay();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - safeDays + 1);
  const previousStart = new Date(start);
  previousStart.setUTCDate(previousStart.getUTCDate() - safeDays);

  const [stored, eventRows, projects, services] = await Promise.all([
    db.analyticsDaily.findMany({
      where: { profileId, date: { gte: previousStart, lte: end } },
      orderBy: { date: "asc" },
    }),
    db.analyticsEventDaily.findMany({
      where: { profileId, date: { gte: start, lte: end } },
      select: { event: true, pageKey: true, uniqueCount: true },
    }),
    db.project.findMany({
      where: { profileId },
      select: { id: true, title: true, slug: true, published: true },
    }),
    db.service.findMany({
      where: { profileId },
      select: { id: true, title: true, published: true },
    }),
  ]);

  const currentRows = stored.filter((row) => row.date >= start);
  const previousRows = stored.filter((row) => row.date < start);
  const byDate = new Map(currentRows.map((row) => [row.date.toISOString().slice(0, 10), row]));
  const series = Array.from({ length: safeDays }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    const key = date.toISOString().slice(0, 10);
    const row = byDate.get(key);
    return {
      date,
      profileViews: row?.profileViews ?? 0,
      projectViews: row?.projectViews ?? 0,
      projectClicks: row?.projectClicks ?? 0,
      serviceClicks: row?.serviceClicks ?? 0,
      contactSubmissions: row?.contactSubmissions ?? 0,
    };
  });

  const totals = series.reduce(
    (sum, day) => ({
      profileViews: sum.profileViews + day.profileViews,
      projectViews: sum.projectViews + day.projectViews,
      projectClicks: sum.projectClicks + day.projectClicks,
      serviceClicks: sum.serviceClicks + day.serviceClicks,
      contactSubmissions: sum.contactSubmissions + day.contactSubmissions,
    }),
    { profileViews: 0, projectViews: 0, projectClicks: 0, serviceClicks: 0, contactSubmissions: 0 },
  );

  const previousTotals = previousRows.reduce(
    (sum, day) => ({
      profileViews: sum.profileViews + day.profileViews,
      projectViews: sum.projectViews + day.projectViews,
      projectClicks: sum.projectClicks + day.projectClicks,
      serviceClicks: sum.serviceClicks + day.serviceClicks,
      contactSubmissions: sum.contactSubmissions + day.contactSubmissions,
    }),
    { profileViews: 0, projectViews: 0, projectClicks: 0, serviceClicks: 0, contactSubmissions: 0 },
  );

  const eventTotals = new Map<string, number>();
  for (const row of eventRows) {
    const key = `${row.event}:${row.pageKey}`;
    eventTotals.set(key, (eventTotals.get(key) ?? 0) + row.uniqueCount);
  }

  const topProjects = projects
    .map((project) => ({
      ...project,
      clicks: eventTotals.get(`PROJECT_CLICK:project:${project.id}`) ?? 0,
      views: eventTotals.get(`PROJECT_VIEW:project:${project.id}`) ?? 0,
    }))
    .filter((project) => project.clicks > 0 || project.views > 0)
    .sort((a, b) => b.clicks - a.clicks || b.views - a.views)
    .slice(0, 8);

  const topServices = services
    .map((service) => ({
      ...service,
      clicks: eventTotals.get(`SERVICE_CLICK:service:${service.id}`) ?? 0,
    }))
    .filter((service) => service.clicks > 0)
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 8);

  return {
    days: safeDays,
    series,
    totals,
    previousTotals,
    topProjects,
    topServices,
    conversionRate:
      totals.profileViews > 0
        ? Math.round((totals.contactSubmissions / totals.profileViews) * 1000) / 10
        : 0,
  };
}
