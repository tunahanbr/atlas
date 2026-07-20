-- CreateTable
CREATE TABLE "AnalyticsEventDaily" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "event" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL,
    "uniqueCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalyticsEventDaily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsUniqueVisitor" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "event" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL,
    "visitorHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsUniqueVisitor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsEventDaily_profileId_date_event_pageKey_key" ON "AnalyticsEventDaily"("profileId", "date", "event", "pageKey");
CREATE INDEX "AnalyticsEventDaily_profileId_date_idx" ON "AnalyticsEventDaily"("profileId", "date");
CREATE INDEX "AnalyticsEventDaily_profileId_event_pageKey_idx" ON "AnalyticsEventDaily"("profileId", "event", "pageKey");
CREATE UNIQUE INDEX "AnalyticsUniqueVisitor_profileId_date_event_pageKey_visitorHash_key" ON "AnalyticsUniqueVisitor"("profileId", "date", "event", "pageKey", "visitorHash");
CREATE INDEX "AnalyticsUniqueVisitor_profileId_date_idx" ON "AnalyticsUniqueVisitor"("profileId", "date");

-- AddForeignKey
ALTER TABLE "AnalyticsEventDaily" ADD CONSTRAINT "AnalyticsEventDaily_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AnalyticsUniqueVisitor" ADD CONSTRAINT "AnalyticsUniqueVisitor_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
