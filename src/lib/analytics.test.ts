import { describe, expect, it } from "vitest";

import { analyticsColumn, utcDay } from "./analytics";

describe("analytics helpers", () => {
  it("maps public events to aggregate columns", () => {
    expect(analyticsColumn("PROFILE_VIEW")).toBe("profileViews");
    expect(analyticsColumn("SERVICE_CLICK")).toBe("serviceClicks");
  });

  it("normalizes timestamps to a UTC calendar day", () => {
    expect(utcDay(new Date("2026-07-20T23:59:59.000Z")).toISOString()).toBe(
      "2026-07-20T00:00:00.000Z",
    );
  });
});
