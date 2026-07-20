import { notFound } from "next/navigation";
import { BadgeCheck } from "lucide-react";

import { db } from "@/server/db";
import { TestimonialSubmissionForm } from "@/components/testimonial-submission-form";

export const metadata = { title: "Share a testimonial", robots: { index: false, follow: false } };

export default async function TestimonialRequestPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{32}$/.test(token)) notFound();
  const request = await db.testimonialRequest.findUnique({
    where: { token },
    include: { profile: { include: { user: { select: { name: true } } } } },
  });
  if (!request) notFound();
  const profileName = request.profile.displayName ?? request.profile.user.name ?? request.profile.username;

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-xl flex-col justify-center px-5 py-12 sm:px-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground"><BadgeCheck className="size-4 text-emerald-600" />Private testimonial request</div>
        <h1 className="font-editorial mt-4 text-4xl leading-tight tracking-tight">Share your experience with {profileName}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">A few honest, specific sentences are more useful than polished praise.</p>
      </div>
      {request.submittedAt ? (
        <div className="rounded-md bg-card/55 px-6 py-12 text-center"><BadgeCheck className="mx-auto size-9 text-emerald-600" /><h2 className="font-editorial mt-4 text-2xl">This request is complete</h2><p className="mt-2 text-sm text-muted-foreground">Thank you—this link has already been used.</p></div>
      ) : <TestimonialSubmissionForm token={token} profileName={profileName} />}
      <p className="mt-8 text-center text-xs text-muted-foreground">Powered by Atlas · This single-use link was created by {profileName}.</p>
    </main>
  );
}
