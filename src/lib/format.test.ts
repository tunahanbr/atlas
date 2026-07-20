import { describe, expect, it } from "vitest";

import {
  formatDateRange,
  formatDelivery,
  formatMoney,
  formatPrice,
  groupBy,
  initials,
} from "./format";

describe("formatMoney", () => {
  it("formats cents as whole-unit currency", () => {
    expect(formatMoney(2400000, "EUR")).toBe("€24,000");
    expect(formatMoney(450000, "USD")).toBe("$4,500");
  });
});

describe("formatPrice", () => {
  it("returns plain amount for fixed prices", () => {
    expect(formatPrice("FIXED", 450000, "EUR")).toBe("€4,500");
  });
  it("prefixes starting prices", () => {
    expect(formatPrice("STARTING_AT", 12000, "EUR")).toBe("from €120");
  });
  it("handles on-request and missing prices", () => {
    expect(formatPrice("ON_REQUEST", null, "EUR")).toBe("On request");
    expect(formatPrice("FIXED", null, "EUR")).toBe("On request");
  });
});

describe("formatDelivery", () => {
  it("uses days under two weeks", () => {
    expect(formatDelivery(10)).toBe("10 days");
  });
  it("rounds to weeks beyond that", () => {
    expect(formatDelivery(42)).toBe("6 weeks");
    expect(formatDelivery(7)).toBe("7 days");
  });
  it("returns null when unset", () => {
    expect(formatDelivery(null)).toBeNull();
  });
});

describe("formatDateRange", () => {
  it("shows Present for current roles", () => {
    expect(formatDateRange(new Date("2022-03-01"), null, true)).toBe("Mar 2022 — Present");
  });
  it("shows the end date otherwise", () => {
    expect(formatDateRange(new Date("2018-06-01"), new Date("2022-02-01"), false)).toBe(
      "Jun 2018 — Feb 2022",
    );
  });
});

describe("initials", () => {
  it("takes at most two letters", () => {
    expect(initials("Lena Hart")).toBe("LH");
    expect(initials("Ada")).toBe("A");
    expect(initials("Jean Luc Picard")).toBe("JL");
  });
});

describe("groupBy", () => {
  it("groups preserving insertion order", () => {
    const grouped = groupBy(
      [
        { name: "TS", cat: "Lang" },
        { name: "Go", cat: "Lang" },
        { name: "React", cat: "UI" },
      ],
      (i) => i.cat,
    );
    expect(grouped.map(([k]) => k)).toEqual(["Lang", "UI"]);
    expect(grouped[0][1]).toHaveLength(2);
  });
});
