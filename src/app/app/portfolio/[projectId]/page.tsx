import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/server/db";
import { ProjectEditor } from "@/components/dashboard/project-editor";

export const metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { projectId } = await params;
  const project = await db.project.findFirst({ where: { id: projectId, profile: { userId: session.user.id } } });
  if (!project) notFound();
  return <ProjectEditor project={project} />;
}
