import { describe, expect, it } from "vitest";

import { normalizeHostname, requestHostname } from "./domains";

describe("custom domains", () => {
  it("normalizes valid DNS hostnames", () => {
    expect(normalizeHostname("Portfolio.Example.com.")).toBe("portfolio.example.com");
  });

  it("rejects URLs, local hosts and IP addresses", () => {
    expect(normalizeHostname("https://example.com")).toBeNull();
    expect(normalizeHostname("localhost")).toBeNull();
    expect(normalizeHostname("127.0.0.1")).toBeNull();
  });

  it("extracts a hostname from forwarded host headers", () => {
    expect(requestHostname("portfolio.example.com:443, proxy.internal")).toBe(
      "portfolio.example.com",
    );
  });
});
