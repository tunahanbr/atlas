import { describe, expect, it } from "vitest";

import { serializeJsonLd } from "./json-ld";

describe("serializeJsonLd", () => {
  it("serializes ordinary structured data", () => {
    expect(serializeJsonLd({ name: "Lena Hart" })).toBe('{"name":"Lena Hart"}');
  });

  it("cannot terminate the containing script element", () => {
    const serialized = serializeJsonLd({
      description: "</script><script>alert('xss')</script>",
    });

    expect(serialized).not.toContain("<");
    expect(serialized).toContain("\\u003c/script\\u003e");
    expect(JSON.parse(serialized).description).toBe(
      "</script><script>alert('xss')</script>",
    );
  });
});
