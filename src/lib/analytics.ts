export const ANALYTICS_EVENTS = [
  "PROFILE_VIEW",
  "PROJECT_VIEW",
  "PROJECT_CLICK",
  "SERVICE_CLICK",
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

export function analyticsColumn(event: AnalyticsEvent) {
  return {
    PROFILE_VIEW: "profileViews",
    PROJECT_VIEW: "projectViews",
    PROJECT_CLICK: "projectClicks",
    SERVICE_CLICK: "serviceClicks",
  }[event] as "profileViews" | "projectViews" | "projectClicks" | "serviceClicks";
}

export function utcDay(date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}
