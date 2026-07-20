import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getAnalyticsSummary, recordAnalyticsEvent } from "./analytics";

const db = new PrismaClient();
const runId = randomUUID();
const emailPrefix = `atlas-integration-${runId}`;

let firstUserId: string;
let secondUserId: string;
let firstProfileId: string;
let secondProfileId: string;
let firstServiceId: string;
let firstLeadId: string;
let firstDomainId: string;
let firstNoteId: string;

beforeAll(async () => {
  const firstUser = await db.user.create({
    data: {
      email: `${emailPrefix}-one@example.com`,
      profile: { create: { username: `integration-${runId.slice(0, 8)}-one` } },
    },
    include: { profile: true },
  });
  const secondUser = await db.user.create({
    data: {
      email: `${emailPrefix}-two@example.com`,
      profile: { create: { username: `integration-${runId.slice(0, 8)}-two` } },
    },
    include: { profile: true },
  });

  firstUserId = firstUser.id;
  secondUserId = secondUser.id;
  firstProfileId = firstUser.profile!.id;
  secondProfileId = secondUser.profile!.id;

  const [service, lead] = await Promise.all([
    db.service.create({
      data: {
        profileId: firstProfileId,
        title: "Isolation test service",
        description: "A service used to verify profile ownership boundaries.",
        technologies: [],
      },
    }),
    db.lead.create({
      data: {
        userId: firstUserId,
        name: "Integration Lead",
        email: "lead@example.com",
        message: "A lead used to verify account ownership boundaries.",
      },
    }),
  ]);

  firstServiceId = service.id;
  firstLeadId = lead.id;

  const [domain, note] = await Promise.all([
    db.customDomain.create({
      data: {
        profileId: firstProfileId,
        hostname: `integration-${runId.slice(0, 8)}.example.com`,
        verificationToken: randomUUID(),
      },
    }),
    db.leadNote.create({ data: { leadId: firstLeadId, body: "Private CRM note" } }),
  ]);
  firstDomainId = domain.id;
  firstNoteId = note.id;
});

afterAll(async () => {
  await db.user.deleteMany({ where: { email: { startsWith: emailPrefix } } });
  await db.$disconnect();
});

describe("tenant isolation predicates", () => {
  it("cannot update another profile's service", async () => {
    await expect(
      db.service.update({
        where: { id: firstServiceId, profileId: secondProfileId },
        data: { title: "Cross-tenant update" },
      }),
    ).rejects.toMatchObject({ code: "P2025" });

    await expect(db.service.findUnique({ where: { id: firstServiceId } })).resolves.toMatchObject({
      title: "Isolation test service",
      profileId: firstProfileId,
    });
  });

  it("cannot update another user's lead", async () => {
    await expect(
      db.lead.update({
        where: { id: firstLeadId, userId: secondUserId },
        data: { status: "ARCHIVED" },
      }),
    ).rejects.toMatchObject({ code: "P2025" });

    await expect(db.lead.findUnique({ where: { id: firstLeadId } })).resolves.toMatchObject({
      status: "NEW",
      userId: firstUserId,
    });
  });

  it("cannot update another profile's custom domain", async () => {
    await expect(
      db.customDomain.update({
        where: { id: firstDomainId, profileId: secondProfileId },
        data: { status: "VERIFIED" },
      }),
    ).rejects.toMatchObject({ code: "P2025" });
  });

  it("keeps CRM notes inside the owning account", async () => {
    const result = await db.leadNote.deleteMany({
      where: { id: firstNoteId, lead: { userId: secondUserId } },
    });
    expect(result.count).toBe(0);
    await expect(db.leadNote.findUnique({ where: { id: firstNoteId } })).resolves.toMatchObject({
      body: "Private CRM note",
    });
  });

  it("stores analytics as profile-scoped daily aggregates", async () => {
    await recordAnalyticsEvent(firstProfileId, "PROFILE_VIEW", "profile:integration", "192.0.2.10");
    await recordAnalyticsEvent(firstProfileId, "PROFILE_VIEW", "profile:integration", "192.0.2.10");
    await recordAnalyticsEvent(firstProfileId, "PROFILE_VIEW", "profile:integration", "192.0.2.11");
    await recordAnalyticsEvent(firstProfileId, "SERVICE_CLICK", `service:${firstServiceId}`, "192.0.2.10");

    const analytics = await getAnalyticsSummary(firstProfileId, 7);
    expect(analytics.totals).toMatchObject({ profileViews: 2, serviceClicks: 1 });
    expect(analytics.topServices[0]).toMatchObject({ id: firstServiceId, clicks: 1 });
    expect(analytics.series).toHaveLength(7);
  });
});
