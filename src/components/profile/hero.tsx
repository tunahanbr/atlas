import Link from "next/link";
import { ArrowDownRight, CalendarDays, MapPin } from "lucide-react";

import type { PublicProfile } from "@/server/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AvailabilityBadge } from "./availability-badge";
import { Reveal } from "./reveal";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Hero({ profile }: { profile: PublicProfile }) {
  const name = profile.displayName ?? profile.user.name ?? profile.username;
  const hasWork = profile.projects.length > 0;
  const primaryLabel =
    profile.availability === "AVAILABLE"
      ? "Tell me about your project"
      : profile.availability === "LIMITED"
        ? "Check my availability"
        : "Send a future inquiry";

  return (
    <header id="top" className="scroll-mt-20 pt-28 pb-16 sm:pt-36 sm:pb-20">
      <div className="grid gap-9 sm:grid-cols-[7.5rem_1fr] sm:gap-10">
        <Reveal>
          <div className="flex items-end gap-4 sm:block">
            <div className="relative w-fit">
              <div className="absolute -inset-2 rounded-full border border-foreground/10" />
              <Avatar className="size-16 border-0 sm:size-[4.5rem]">
                {profile.avatarUrl ? (
                  <AvatarImage src={profile.avatarUrl} alt={name} />
                ) : null}
                <AvatarFallback className="bg-secondary font-editorial text-lg text-foreground">
                  {initials(name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground sm:block">
              Profile / 01
            </p>
          </div>
        </Reveal>

        <div>
          <Reveal delay={0.05}>
            {profile.profileLabel ? (
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {profile.profileLabel}
              </p>
            ) : null}
            <h1 className={cn("font-editorial text-[2rem] leading-[1.02] font-normal tracking-[-0.025em] text-balance sm:text-[2.2rem]", profile.profileLabel && "mt-3")}>
              {name}
            </h1>
            {profile.headline ? (
              <p className="mt-4 max-w-xl text-[1.02rem] leading-[1.65] text-quiet text-pretty sm:text-[1.08rem]">
                {profile.headline}
              </p>
            ) : null}
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
              <AvailabilityBadge
                status={profile.availability}
                note={profile.availabilityNote}
                className="rounded-md border-0 bg-secondary/65 px-2.5 py-1.5 font-normal"
              />
              {profile.location ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5" strokeWidth={1.5} />
                  {profile.location}
                </span>
              ) : null}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button render={<a href="#contact" />} nativeButton={false} size="lg">
                {primaryLabel}
                <ArrowDownRight className="size-4" />
              </Button>
              {hasWork ? (
                <Button render={<a href="#work" />} nativeButton={false} variant="outline" size="lg">
                  View selected work
                </Button>
              ) : profile.bookingUrl ? (
                <Button
                  render={
                    <Link href={profile.bookingUrl} target="_blank" rel="noopener noreferrer" />
                  }
                  nativeButton={false}
                  variant="outline"
                  size="lg"
                >
                  <CalendarDays className="size-4" strokeWidth={1.5} />
                  Book a call
                </Button>
              ) : null}
            </div>
            {hasWork && profile.bookingUrl ? (
              <p className="mt-4 text-xs text-muted-foreground">
                Prefer a conversation?{" "}
                <Link
                  href={profile.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-b border-foreground/25 pb-0.5 text-foreground transition-colors hover:border-foreground"
                >
                  Book a short call
                </Link>
              </p>
            ) : null}
          </Reveal>
        </div>
      </div>
    </header>
  );
}
