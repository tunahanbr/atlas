ALTER TABLE "LeadNotificationJob"
  ADD COLUMN "emailCompleted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "webhookCompleted" BOOLEAN NOT NULL DEFAULT false;
