import { db } from "@/server/db";
import { sendLeadNotifications } from "@/server/lead-notifications";

const MAX_ATTEMPTS = 8;

export async function processLeadNotificationJob(jobId: string) {
  const job = await db.leadNotificationJob.findUnique({
    where: { id: jobId },
    include: { lead: { include: { user: { include: { profile: { select: { username: true } } } } } } },
  });
  if (!job || job.completedAt || job.attempts >= MAX_ATTEMPTS || !job.lead.user.profile) return false;

  const result = await sendLeadNotifications({
    lead: job.lead,
    owner: job.lead.user,
    profile: job.lead.user.profile,
  }, { email: !job.emailCompleted, webhook: !job.webhookCompleted });
  const failed = Object.entries(result).filter(([, state]) => state === "failed").map(([channel]) => channel);
  const attempts = job.attempts + 1;
  const emailCompleted = job.emailCompleted || result.email !== "failed";
  const webhookCompleted = job.webhookCompleted || result.webhook !== "failed";
  if (emailCompleted && webhookCompleted) {
    await db.leadNotificationJob.update({ where: { id: job.id }, data: { attempts, emailCompleted, webhookCompleted, completedAt: new Date(), lastError: null } });
    return true;
  }

  const delayMinutes = Math.min(24 * 60, 2 ** Math.min(attempts, 10));
  await db.leadNotificationJob.update({
    where: { id: job.id },
    data: {
      attempts,
      emailCompleted,
      webhookCompleted,
      lastError: `${failed.join(", ")} delivery failed`,
      nextAttemptAt: new Date(Date.now() + delayMinutes * 60_000),
      ...(attempts >= MAX_ATTEMPTS ? { completedAt: new Date() } : {}),
    },
  });
  return false;
}

export async function processDueLeadNotificationJobs(limit = 25) {
  const jobs = await db.leadNotificationJob.findMany({
    where: { completedAt: null, nextAttemptAt: { lte: new Date() }, attempts: { lt: MAX_ATTEMPTS } },
    orderBy: { nextAttemptAt: "asc" },
    take: Math.max(1, Math.min(limit, 100)),
    select: { id: true },
  });
  const results = await Promise.allSettled(jobs.map((job) => processLeadNotificationJob(job.id)));
  return { selected: jobs.length, completed: results.filter((result) => result.status === "fulfilled" && result.value).length };
}
