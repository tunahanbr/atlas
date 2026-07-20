"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { updateProfile } from "@/server/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ProfileData = {
  username: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  avatarUrl: string | null;
  availability: "AVAILABLE" | "LIMITED" | "UNAVAILABLE";
  availabilityNote: string | null;
  bookingUrl: string | null;
  website: string | null;
  theme: string;
  socials: { label: string; url: string }[];
};

export function ProfileForm({ profile }: { profile: ProfileData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [socials, setSocials] = useState(profile.socials);

  function addSocial() {
    if (socials.length >= 10) return;
    setSocials([...socials, { label: "", url: "" }]);
  }

  function removeSocial(index: number) {
    setSocials(socials.filter((_, i) => i !== index));
  }

  function updateSocial(index: number, field: "label" | "url", value: string) {
    setSocials(socials.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input = {
      username: String(fd.get("username") ?? ""),
      headline: String(fd.get("headline") ?? ""),
      bio: String(fd.get("bio") ?? ""),
      location: String(fd.get("location") ?? ""),
      avatarUrl: String(fd.get("avatarUrl") ?? ""),
      availability: String(fd.get("availability") ?? "AVAILABLE"),
      availabilityNote: String(fd.get("availabilityNote") ?? ""),
      bookingUrl: String(fd.get("bookingUrl") ?? ""),
      website: String(fd.get("website") ?? ""),
      theme: String(fd.get("theme") ?? profile.theme),
      socials: socials.filter((s) => s.label.trim() && s.url.trim()),
    };
    startTransition(async () => {
      const result = await updateProfile(input);
      if (result.ok) {
        toast.success("Profile saved");
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not save");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="rounded-xl border bg-card p-6">
        <h2 className="font-medium tracking-tight">Basics</h2>
        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" defaultValue={profile.username} required />
            <p className="text-xs text-muted-foreground">
              Your public URL: atlas.rocks/<strong>{profile.username}</strong>
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              name="headline"
              defaultValue={profile.headline ?? ""}
              placeholder="Senior Product Engineer — I build web products"
              maxLength={120}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              rows={6}
              defaultValue={profile.bio ?? ""}
              placeholder="Who you are, what you do, who you help. Blank lines separate paragraphs."
              maxLength={2000}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" defaultValue={profile.location ?? ""} placeholder="Berlin, Germany" maxLength={80} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input id="avatarUrl" name="avatarUrl" type="url" defaultValue={profile.avatarUrl ?? ""} placeholder="https://" />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6">
        <h2 className="font-medium tracking-tight">Availability & booking</h2>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="availability">Status</Label>
              <Select name="availability" defaultValue={profile.availability}>
                <SelectTrigger id="availability">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available for work</SelectItem>
                  <SelectItem value="LIMITED">Limited availability</SelectItem>
                  <SelectItem value="UNAVAILABLE">Not available</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="availabilityNote">Note (optional)</Label>
              <Input
                id="availabilityNote"
                name="availabilityNote"
                defaultValue={profile.availabilityNote ?? ""}
                placeholder="Booking projects for Q3"
                maxLength={160}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="bookingUrl">Booking link (Cal.com, Calendly…)</Label>
              <Input id="bookingUrl" name="bookingUrl" type="url" defaultValue={profile.bookingUrl ?? ""} placeholder="https://cal.com/you" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website">Personal website</Label>
              <Input id="website" name="website" type="url" defaultValue={profile.website ?? ""} placeholder="https://" />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-medium tracking-tight">Social links</h2>
          <Button type="button" variant="outline" size="sm" onClick={addSocial} disabled={socials.length >= 10}>
            <Plus className="size-4" />
            Add link
          </Button>
        </div>
        {socials.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            GitHub, LinkedIn, X — anywhere clients can verify your work.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {socials.map((social, i) => (
              <li
                key={i}
                className="grid grid-cols-[minmax(0,0.65fr)_minmax(0,1fr)_auto] items-center gap-2 sm:gap-3"
              >
                <Input
                  value={social.label}
                  onChange={(e) => updateSocial(i, "label", e.target.value)}
                  placeholder="GitHub"
                  maxLength={40}
                  aria-label="Label"
                />
                <Input
                  value={social.url}
                  onChange={(e) => updateSocial(i, "url", e.target.value)}
                  placeholder="https://github.com/you"
                  type="url"
                  aria-label="URL"
                />
                <Button type="button" variant="ghost" size="icon" aria-label="Remove" onClick={() => removeSocial(i)}>
                  <X className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="rounded-xl">
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          Save profile
        </Button>
      </div>
    </form>
  );
}
