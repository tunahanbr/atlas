import type { MetadataRoute } from "next";

import { db } from "@/server/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/+$/,
    "",
  );
  const profiles = await db.profile.findMany({
    select: {
      username: true,
      updatedAt: true,
      projects: {
        where: { published: true },
        select: { slug: true, updatedAt: true },
      },
    },
  });

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    ...profiles.map((p) => ({
      url: `${base}/${p.username}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...profiles.flatMap((profile) =>
      profile.projects.map((project) => ({
        url: `${base}/${profile.username}/work/${project.slug}`,
        lastModified: project.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ),
  ];
}
