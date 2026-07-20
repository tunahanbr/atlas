import { describe, expect, it } from "vitest";

import { createContentSecurityPolicy } from "./content-security-policy";

describe("content security policy", () => {
  it("allows React development tooling only in development", () => {
    expect(createContentSecurityPolicy(true)).toContain(
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    );
  });

  it("keeps unsafe eval disabled in production", () => {
    expect(createContentSecurityPolicy(false)).toContain(
      "script-src 'self' 'unsafe-inline';",
    );
    expect(createContentSecurityPolicy(false)).not.toContain("'unsafe-eval'");
  });
});
