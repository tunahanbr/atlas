import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";

import type { PublicProfile } from "@/server/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AvailabilityBadge } from "./availability-badge";
import { Reveal } from "./reveal";
import { initials } from "@/lib/format";

export function Hero({ profile }: { profile: PublicProfile }) {
  const name = profile.user.name ?? profile.username;

  return (
    <header className="pt-24 pb-14">
      <Reveal>
        <Avatar className="size-20 border">
          {profile.avatarUrl ? (
            <AvatarImage src={profile.avatarUrl} alt={name} />
          ) : null}
          <AvatarFallback className="text-xl">{initials(name)}</AvatarFallback>
        </Avatar>
      </Reveal>

      <Reveal delay={0.05}>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-balance">
          {name}
        </h1>
        {profile.headline ? (
          <p className="mt-2 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            {profile.headline}
          </p>
        ) : null}
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <AvailabilityBadge status={profile.availability} note={profile.availabilityNote} />
          {profile.location ? (
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />
              {profile.location}
            </span>
          ) : null}
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button render={<a href="#contact" />} nativeButton={false} size="lg" className="rounded-xl">
            Work with me
          </Button>
          {profile.bookingUrl ? (
            <Button
              render={
                <Link href={profile.bookingUrl} target="_blank" rel="noopener noreferrer" />
              }
              nativeButton={false}
              variant="outline"
              size="lg"
              className="rounded-xl"
            >
              <CalendarDays className="size-4" />
              Book a call
            </Button>
          ) : null}
        </div>
      </Reveal>
    </header>
  );
}
