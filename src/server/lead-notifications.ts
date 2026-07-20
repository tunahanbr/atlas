import { createHmac } from "node:crypto";
import nodemailer from "nodemailer";

type LeadNotificationInput = {
  lead: {
    id: string;
    name: string;
    email: string;
    budget: string | null;
    message: string;
    createdAt: Date;
  };
  owner: {
    email: string;
    name: string | null;
  };
  profile: {
    username: string;
  };
};

type ChannelResult = "sent" | "skipped" | "failed";

export type LeadNotificationResult = {
  email: ChannelResult;
  webhook: ChannelResult;
};

export function getLeadNotificationStatus() {
  return {
    email: readSmtpConfig().enabled,
    webhook: readWebhookConfig().enabled,
  };
}

export async function sendLeadNotifications(
  input: LeadNotificationInput,
): Promise<LeadNotificationResult> {
  const [email, webhook] = await Promise.all([
    sendLeadEmail(input),
    sendLeadWebhook(input),
  ]);

  return { email, webhook };
}

async function sendLeadEmail(input: LeadNotificationInput): Promise<ChannelResult> {
  const smtp = readSmtpConfig();
  if (!smtp.enabled) return "skipped";

  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: smtp.auth,
      connectionTimeout: 5_000,
      greetingTimeout: 5_000,
      socketTimeout: 8_000,
    });
    const email = buildLeadEmail(input);

    await transporter.sendMail({
      from: smtp.from,
      to: input.owner.email,
      replyTo: input.lead.email,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });
    return "sent";
  } catch (error) {
    console.error("Lead email notification failed", error);
    return "failed";
  }
}

async function sendLeadWebhook(input: LeadNotificationInput): Promise<ChannelResult> {
  const webhook = readWebhookConfig();
  if (!webhook.enabled) return "skipped";

  try {
    const body = JSON.stringify(buildLeadWebhookPayload(input));
    const signature = signWebhookPayload(body, webhook.secret);
    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Atlas-Webhook/1.0",
        "X-Atlas-Event": "lead.created",
        "X-Atlas-Delivery": input.lead.id,
        "X-Atlas-Signature": `sha256=${signature}`,
      },
      body,
      redirect: "error",
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) {
      throw new Error(`Webhook responded with HTTP ${response.status}`);
    }
    return "sent";
  } catch (error) {
    console.error("Lead webhook notification failed", error);
    return "failed";
  }
}

export function buildLeadEmail(input: LeadNotificationInput) {
  const budget = input.lead.budget ?? "Not specified";
  const dashboardUrl = `${appBaseUrl()}/app/leads`;
  const subject = `[Atlas] New inquiry from ${input.lead.name}`;
  const text = [
    `New inquiry for @${input.profile.username}`,
    "",
    `Name: ${input.lead.name}`,
    `Email: ${input.lead.email}`,
    `Budget: ${budget}`,
    "",
    input.lead.message,
    "",
    `Open in Atlas: ${dashboardUrl}`,
  ].join("\n");
  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.6;color:#171717;max-width:640px">
      <p style="color:#666">New inquiry for <strong>@${escapeHtml(input.profile.username)}</strong></p>
      <h1 style="font-size:22px;margin:16px 0">${escapeHtml(input.lead.name)}</h1>
      <p>
        <strong>Email:</strong> ${escapeHtml(input.lead.email)}<br>
        <strong>Budget:</strong> ${escapeHtml(budget)}
      </p>
      <div style="white-space:pre-wrap;background:#f5f5f5;border-radius:10px;padding:16px;margin:20px 0">${escapeHtml(input.lead.message)}</div>
      <p><a href="${escapeHtml(dashboardUrl)}">Open in Atlas</a></p>
    </div>
  `.trim();

  return { subject, text, html };
}

export function buildLeadWebhookPayload(input: LeadNotificationInput) {
  return {
    event: "lead.created" as const,
    createdAt: input.lead.createdAt.toISOString(),
    data: {
      id: input.lead.id,
      name: input.lead.name,
      email: input.lead.email,
      budget: input.lead.budget,
      message: input.lead.message,
      profile: { username: input.profile.username },
    },
  };
}

export function signWebhookPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload, "utf8").digest("hex");
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[character];
  });
}

function appBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

function readSmtpConfig():
  | { enabled: false }
  | {
      enabled: true;
      host: string;
      port: number;
      secure: boolean;
      from: string;
      auth: { user: string; pass: string } | undefined;
    } {
  const host = process.env.SMTP_HOST?.trim();
  const from = process.env.SMTP_FROM?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const authComplete = (!user && !pass) || (!!user && !!pass);

  if (!host || !from || !Number.isInteger(port) || port < 1 || port > 65_535 || !authComplete) {
    return { enabled: false };
  }

  return {
    enabled: true,
    host,
    port,
    secure: process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE === "true"
      : port === 465,
    from,
    auth: user && pass ? { user, pass } : undefined,
  };
}

function readWebhookConfig():
  | { enabled: false }
  | { enabled: true; url: string; secret: string } {
  const value = process.env.LEAD_WEBHOOK_URL?.trim();
  const secret = process.env.LEAD_WEBHOOK_SECRET;
  if (!value || !secret) return { enabled: false };

  try {
    const url = new URL(value);
    const validProtocol =
      url.protocol === "https:" ||
      (process.env.NODE_ENV !== "production" && url.protocol === "http:");
    if (!validProtocol || url.username || url.password) return { enabled: false };
    return { enabled: true, url: url.toString(), secret };
  } catch {
    return { enabled: false };
  }
}
