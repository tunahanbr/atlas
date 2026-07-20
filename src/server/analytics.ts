import type { AnalyticsEvent } from "../lib/analytics";
import { analyticsColumn, utcDay } from "../lib/analytics";
import { db } from "./db";

export async function recordAnalyticsEvent(profileId: string, event: AnalyticsEvent) {
  const column = analyticsColumn(event);
  const date = utcDay();

  await db.analyticsDaily.upsert({
    where: { profileId_date: { profileId, date } },
    create: { profileId, date, [column]: 1 },
    update: { [column]: { increment: 1 } },
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

  const stored = await db.analyticsDaily.findMany({
    where: { profileId, date: { gte: start, lte: end } },
    orderBy: { date: "asc" },
  });
  const byDate = new Map(stored.map((row) => [row.date.toISOString().slice(0, 10), row]));
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
    {
      profileViews: 0,
      projectViews: 0,
      projectClicks: 0,
      serviceClicks: 0,
      contactSubmissions: 0,
    },
  );

  return {
    days: safeDays,
    series,
    totals,
    conversionRate:
      totals.profileViews > 0
        ? Math.round((totals.contactSubmissions / totals.profileViews) * 1000) / 10
        : 0,
  };
}
