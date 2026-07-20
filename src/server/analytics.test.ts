import { describe, expect, it } from "vitest";

import { analyticsVisitorHash } from "./analytics";

describe("analyticsVisitorHash", () => {
  it("is stable within a day and rotates between days", () => {
    const address = "192.0.2.10";
    const firstDay = new Date("2026-07-20T00:00:00.000Z");
    const secondDay = new Date("2026-07-21T00:00:00.000Z");
    expect(analyticsVisitorHash(address, firstDay)).toBe(analyticsVisitorHash(address, firstDay));
    expect(analyticsVisitorHash(address, firstDay)).not.toBe(analyticsVisitorHash(address, secondDay));
    expect(analyticsVisitorHash(address, firstDay)).not.toContain(address);
  });
});
