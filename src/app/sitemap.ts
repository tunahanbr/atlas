import type { MetadataRoute } from "next";

import { db } from "@/server/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const profiles = await db.profile.findMany({ select: { username: true, updatedAt: true } });

  return [
    { url: base, lastModified: new Date() },
    ...profiles.map((p) => ({
      url: `${base}/${p.username}`,
      lastModified: p.updatedAt,
    })),
  ];
}
