import { describe, expect, it } from "vitest";

import { isSameOrigin } from "./http-origin";

describe("same-origin requests", () => {
  it("accepts matching origin and forwarded host", () => {
    expect(isSameOrigin("http://127.0.0.1:3000", "127.0.0.1:3000")).toBe(true);
    expect(isSameOrigin("https://portfolio.example.com", "portfolio.example.com")).toBe(true);
  });

  it("rejects cross-origin and malformed values", () => {
    expect(isSameOrigin("https://attacker.example", "portfolio.example.com")).toBe(false);
    expect(isSameOrigin("not a url", "portfolio.example.com")).toBe(false);
  });
});
