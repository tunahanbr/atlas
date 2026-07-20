"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ProfileLaunchPanel({
  profilePath,
  isWelcome,
}: {
  profilePath: string;
  isWelcome: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copyProfileUrl() {
    const profileUrl = `${window.location.origin}${profilePath}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(profileUrl);
      } else {
        copyWithFallback(profileUrl);
      }
      setCopied(true);
      toast.success("Profile link copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      try {
        copyWithFallback(profileUrl);
        setCopied(true);
        toast.success("Profile link copied");
        window.setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Could not copy the link");
      }
    }
  }

  return (
    <section className="rounded-md bg-primary px-6 py-6 text-primary-foreground sm:flex sm:items-center sm:justify-between sm:gap-8">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-primary-foreground/60">
          <span className="mr-2 inline-block size-1.5 rounded-full bg-success" />
          Your profile is live
        </p>
        <h2 className="font-editorial mt-3 text-2xl tracking-[-0.02em]">
          {isWelcome ? "Your corner of the internet is ready." : "Ready when you are."}
        </h2>
        <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-primary-foreground/65">
          {isWelcome
            ? "Open it once, then add the proof and offers that make it worth sharing."
            : "Preview the public page or copy the link when you want to share it."}
        </p>
      </div>
      <div className="mt-5 flex shrink-0 flex-wrap gap-2 sm:mt-0">
        <Button
          variant="outline"
          onClick={copyProfileUrl}
          className="border-primary-foreground/25 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy link"}
        </Button>
        <Button
          render={<Link href={profilePath} target="_blank" />}
          nativeButton={false}
          className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
        >
          Open profile
          <ExternalLink className="size-4" />
        </Button>
      </div>
    </section>
  );
}

function copyWithFallback(value: string) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Copy command failed");
}
