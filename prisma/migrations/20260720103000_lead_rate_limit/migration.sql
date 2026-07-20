-- CreateTable
CREATE TABLE "LeadRateLimit" (
    "key" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "count" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadRateLimit_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "LeadRateLimit_updatedAt_idx" ON "LeadRateLimit"("updatedAt");
