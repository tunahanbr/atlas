-- CreateEnum
CREATE TYPE "CustomDomainStatus" AS ENUM ('PENDING', 'VERIFIED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LeadStatus" ADD VALUE 'QUALIFIED';
ALTER TYPE "LeadStatus" ADD VALUE 'WON';
ALTER TYPE "LeadStatus" ADD VALUE 'LOST';

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'EUR',
ADD COLUMN     "nextFollowUp" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ADD COLUMN     "valueCents" INTEGER;

UPDATE "Lead" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
ALTER TABLE "Lead" ALTER COLUMN "updatedAt" SET NOT NULL;

-- CreateTable
CREATE TABLE "AnalyticsDaily" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "profileViews" INTEGER NOT NULL DEFAULT 0,
    "projectViews" INTEGER NOT NULL DEFAULT 0,
    "projectClicks" INTEGER NOT NULL DEFAULT 0,
    "serviceClicks" INTEGER NOT NULL DEFAULT 0,
    "contactSubmissions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalyticsDaily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomDomain" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "verificationToken" TEXT NOT NULL,
    "status" "CustomDomainStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadNote" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnalyticsDaily_profileId_date_idx" ON "AnalyticsDaily"("profileId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsDaily_profileId_date_key" ON "AnalyticsDaily"("profileId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "CustomDomain_hostname_key" ON "CustomDomain"("hostname");

-- CreateIndex
CREATE UNIQUE INDEX "CustomDomain_verificationToken_key" ON "CustomDomain"("verificationToken");

-- CreateIndex
CREATE INDEX "CustomDomain_profileId_status_idx" ON "CustomDomain"("profileId", "status");

-- CreateIndex
CREATE INDEX "LeadNote_leadId_createdAt_idx" ON "LeadNote"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_userId_nextFollowUp_idx" ON "Lead"("userId", "nextFollowUp");

-- AddForeignKey
ALTER TABLE "AnalyticsDaily" ADD CONSTRAINT "AnalyticsDaily_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadNote" ADD CONSTRAINT "LeadNote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
