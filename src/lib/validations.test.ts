import { describe, expect, it } from "vitest";

import { leadSchema, profileSchema, serviceSchema, usernameSchema } from "./validations";

describe("usernameSchema", () => {
  it("accepts valid usernames", () => {
    expect(usernameSchema.safeParse("lena").success).toBe(true);
    expect(usernameSchema.safeParse("lena-hart-92").success).toBe(true);
  });

  it("rejects invalid formats", () => {
    expect(usernameSchema.safeParse("Le").success).toBe(false); // too short
    expect(usernameSchema.safeParse("Lena").success).toBe(false); // uppercase
    expect(usernameSchema.safeParse("-lena").success).toBe(false); // leading hyphen
    expect(usernameSchema.safeParse("lena_hart").success).toBe(false); // underscore
  });

  it("rejects reserved usernames", () => {
    expect(usernameSchema.safeParse("app").success).toBe(false);
    expect(usernameSchema.safeParse("api").success).toBe(false);
    expect(usernameSchema.safeParse("login").success).toBe(false);
  });
});

describe("serviceSchema", () => {
  const valid = {
    title: "Technical Audit",
    description: "A deep review of your codebase and delivery process.",
    priceType: "FIXED",
    priceCents: 450000,
    currency: "EUR",
    deliveryDays: 10,
    technologies: ["Architecture"],
    published: true,
  };

  it("accepts a valid service", () => {
    expect(serviceSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects negative prices", () => {
    expect(serviceSchema.safeParse({ ...valid, priceCents: -5 }).success).toBe(false);
  });

  it("rejects absurd delivery times", () => {
    expect(serviceSchema.safeParse({ ...valid, deliveryDays: 999 }).success).toBe(false);
  });
});

describe("leadSchema", () => {
  const valid = {
    username: "lena",
    name: "Jane Cooper",
    email: "jane@company.com",
    budget: "€5,000 – €15,000",
    message: "We need a billing platform rebuilt before Q4 launches.",
  };

  it("accepts a valid lead", () => {
    expect(leadSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(leadSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects too-short messages", () => {
    expect(leadSchema.safeParse({ ...valid, message: "hi" }).success).toBe(false);
  });
});

describe("profileSchema URLs", () => {
  const valid = {
    username: "lena",
    availability: "AVAILABLE",
    theme: "system",
    socials: [],
  };

  it("accepts HTTP and HTTPS links", () => {
    expect(
      profileSchema.safeParse({
        ...valid,
        website: "https://example.com/work",
        socials: [{ label: "GitHub", url: "https://github.com/lena" }],
      }).success,
    ).toBe(true);
  });

  it("rejects executable and non-web URL schemes", () => {
    for (const url of ["javascript:alert(1)", "data:text/html,test", "file:///tmp/test"]) {
      expect(
        profileSchema.safeParse({
          ...valid,
          socials: [{ label: "Unsafe", url }],
        }).success,
      ).toBe(false);
    }
  });
});
