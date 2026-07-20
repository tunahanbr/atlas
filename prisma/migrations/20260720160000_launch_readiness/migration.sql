ALTER TABLE "User" ADD COLUMN "supabaseId" TEXT;
CREATE UNIQUE INDEX "User_supabaseId_key" ON "User"("supabaseId");

ALTER TABLE "Profile" ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "LeadNotificationJob" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LeadNotificationJob_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "LeadNotificationJob_leadId_key" ON "LeadNotificationJob"("leadId");
CREATE INDEX "LeadNotificationJob_completedAt_nextAttemptAt_idx" ON "LeadNotificationJob"("completedAt", "nextAttemptAt");
ALTER TABLE "LeadNotificationJob" ADD CONSTRAINT "LeadNotificationJob_leadId_fkey"
  FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
