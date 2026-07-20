"use client";

import { useState, useTransition } from "react";
import { BadgeCheck, Loader2, Send } from "lucide-react";

import { submitTestimonialRequest } from "@/server/actions/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function TestimonialSubmissionForm({ token, profileName }: { token: string; profileName: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await submitTestimonialRequest(token, {
        authorName: fd.get("authorName"),
        authorRole: fd.get("authorRole"),
        authorCompany: fd.get("authorCompany"),
        content: fd.get("content"),
      });
      if (result.ok) setSubmitted(true);
      else setError(result.error ?? "Could not submit your testimonial");
    });
  }

  if (submitted) {
    return (
      <div className="rounded-md bg-card/55 px-6 py-12 text-center">
        <BadgeCheck className="mx-auto size-9 text-emerald-600" />
        <h1 className="font-editorial mt-4 text-3xl">Thank you</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">Your testimonial was sent to {profileName}. They can review it before publishing.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-md bg-card/55 p-5 sm:p-8">
      <div className="space-y-1.5"><Label htmlFor="authorName">Your name</Label><Input id="authorName" name="authorName" autoComplete="name" required maxLength={80} /></div>
      <div className="grid gap-4 sm:grid-cols-2"><div className="min-w-0 space-y-1.5"><Label htmlFor="authorRole">Your role <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="authorRole" name="authorRole" placeholder="Founder" maxLength={80} /></div><div className="min-w-0 space-y-1.5"><Label htmlFor="authorCompany">Company <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="authorCompany" name="authorCompany" placeholder="Acme Inc." maxLength={80} /></div></div>
      <div className="space-y-1.5"><Label htmlFor="content">What was it like working with {profileName}?</Label><Textarea id="content" name="content" rows={7} required minLength={10} maxLength={1000} placeholder="What changed because of the work? What stood out? Be as specific as you like." /></div>
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      <p className="text-xs leading-5 text-muted-foreground">Your response is marked as client-submitted. It is not published automatically.</p>
      <Button type="submit" className="w-full" size="lg" disabled={pending}>{pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}Send testimonial</Button>
    </form>
  );
}
