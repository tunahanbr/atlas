import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildLeadEmail,
  buildLeadWebhookPayload,
  escapeHtml,
  getLeadNotificationStatus,
  sendLeadNotifications,
  signWebhookPayload,
} from "./lead-notifications";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const input = {
  lead: {
    id: "lead_123",
    name: "Jane <Cooper>",
    email: "jane@example.com",
    budget: "€5,000 – €15,000",
    message: "We need <script>alert('xss')</script> help.",
    createdAt: new Date("2026-07-20T10:00:00.000Z"),
  },
  owner: { email: "owner@example.com", name: "Lena" },
  profile: { username: "lena" },
};

describe("lead notifications", () => {
  it("builds a stable webhook payload without internal owner data", () => {
    expect(buildLeadWebhookPayload(input)).toEqual({
      event: "lead.created",
      createdAt: "2026-07-20T10:00:00.000Z",
      data: {
        id: "lead_123",
        name: "Jane <Cooper>",
        email: "jane@example.com",
        budget: "€5,000 – €15,000",
        message: "We need <script>alert('xss')</script> help.",
        profile: { username: "lena" },
      },
    });
  });

  it("signs webhook bodies with HMAC-SHA256", () => {
    const payload = '{"event":"lead.created"}';
    const expected = createHmac("sha256", "test-secret")
      .update(payload, "utf8")
      .digest("hex");

    expect(signWebhookPayload(payload, "test-secret")).toBe(expected);
  });

  it("escapes untrusted lead content in HTML email", () => {
    const email = buildLeadEmail(input);

    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("Jane &lt;Cooper&gt;");
    expect(email.html).toContain("&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;");
    expect(email.text).toContain("Jane <Cooper>");
  });

  it("escapes every HTML-sensitive character", () => {
    expect(escapeHtml(`&<>\"'`)).toBe("&amp;&lt;&gt;&quot;&#39;");
  });

  it("only enables completely configured delivery channels", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SMTP_HOST", "smtp.example.com");
    vi.stubEnv("SMTP_FROM", "Atlas <atlas@example.com>");
    vi.stubEnv("SMTP_USER", "atlas");
    vi.stubEnv("SMTP_PASS", "secret");
    vi.stubEnv("LEAD_WEBHOOK_URL", "https://hooks.example.com/atlas");
    vi.stubEnv("LEAD_WEBHOOK_SECRET", "webhook-secret");

    expect(getLeadNotificationStatus()).toEqual({ email: true, webhook: true });

    vi.stubEnv("SMTP_PASS", "");
    vi.stubEnv("LEAD_WEBHOOK_URL", "http://hooks.example.com/atlas");
    expect(getLeadNotificationStatus()).toEqual({ email: false, webhook: false });
  });

  it("delivers a signed webhook without blocking on an unconfigured email channel", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SMTP_HOST", "");
    vi.stubEnv("SMTP_FROM", "");
    vi.stubEnv("LEAD_WEBHOOK_URL", "https://hooks.example.com/atlas");
    vi.stubEnv("LEAD_WEBHOOK_SECRET", "webhook-secret");
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(sendLeadNotifications(input)).resolves.toEqual({
      email: "skipped",
      webhook: "sent",
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = request.body as string;
    expect(url).toBe("https://hooks.example.com/atlas");
    expect(request.redirect).toBe("error");
    expect(request.headers).toMatchObject({
      "X-Atlas-Event": "lead.created",
      "X-Atlas-Delivery": "lead_123",
      "X-Atlas-Signature": `sha256=${signWebhookPayload(body, "webhook-secret")}`,
    });
  });
});
