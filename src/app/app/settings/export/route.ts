import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/server/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, email: true, name: true, image: true, createdAt: true, updatedAt: true,
      profile: {
        include: {
          services: true, projects: true, testimonials: true, experiences: true,
          skills: true, certifications: true, socials: true, analytics: true, domains: true,
        },
      },
      leads: { include: { notes: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(JSON.stringify({ exportedAt: new Date().toISOString(), version: 1, user }, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="atlas-${user.profile?.username ?? "account"}-export.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}
