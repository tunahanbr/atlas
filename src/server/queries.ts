import { cache } from "react";

import { db } from "@/server/db";

export const getProfileByUsername = cache(async (username: string, includeDrafts = false) => {
  return db.profile.findFirst({
    where: { username: username.toLowerCase(), ...(includeDrafts ? {} : { published: true }) },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      services: {
        where: includeDrafts ? {} : { published: true },
        orderBy: { order: "asc" },
      },
      projects: {
        where: includeDrafts ? {} : { published: true },
        orderBy: [{ featured: "desc" }, { order: "asc" }],
      },
      testimonials: {
        where: includeDrafts ? {} : { published: true },
        orderBy: { order: "asc" },
      },
      experiences: { orderBy: { order: "asc" } },
      skills: { orderBy: { order: "asc" } },
      certifications: true,
      socials: { orderBy: { order: "asc" } },
    },
  });
});

export type PublicProfile = NonNullable<
  Awaited<ReturnType<typeof getProfileByUsername>>
>;

export async function getProjectBySlug(username: string, slug: string, includeDrafts = false) {
  return db.project.findFirst({
    where: {
      slug,
      ...(includeDrafts ? {} : { published: true }),
      profile: { username: username.toLowerCase(), ...(includeDrafts ? {} : { published: true }) },
    },
    include: {
      profile: {
        include: { user: { select: { name: true } } },
      },
    },
  });
}

export async function getProfileCompleteness(userId: string) {
  const profile = await db.profile.findUnique({
    where: { userId },
    include: {
      services: { where: { published: true }, select: { id: true } },
      projects: { where: { published: true }, select: { id: true } },
      testimonials: { where: { published: true }, select: { id: true } },
      socials: { select: { id: true } },
    },
  });
  if (!profile) return null;

  const checks = [
    { id: "avatar", label: "Add an avatar", done: !!profile.avatarUrl },
    { id: "headline", label: "Write a headline", done: !!profile.headline },
    { id: "bio", label: "Write a bio", done: !!profile.bio },
    { id: "service", label: "Add your first service", done: profile.services.length > 0 },
    { id: "project", label: "Add your first project", done: profile.projects.length > 0 },
    {
      id: "testimonial",
      label: "Add a testimonial",
      done: profile.testimonials.length > 0,
    },
    { id: "social", label: "Add a social link", done: profile.socials.length > 0 },
  ];
  const done = checks.filter((c) => c.done).length;
  return { checks, done, total: checks.length, complete: done === checks.length };
}
