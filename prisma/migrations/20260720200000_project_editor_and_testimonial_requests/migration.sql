-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "displayName" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "accentColor" TEXT NOT NULL DEFAULT 'stone';

-- AlterTable
ALTER TABLE "Testimonial" ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "TestimonialRequest" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestimonialRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TestimonialRequest_token_key" ON "TestimonialRequest"("token");

-- CreateIndex
CREATE INDEX "TestimonialRequest_profileId_createdAt_idx" ON "TestimonialRequest"("profileId", "createdAt");

-- AddForeignKey
ALTER TABLE "TestimonialRequest" ADD CONSTRAINT "TestimonialRequest_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
