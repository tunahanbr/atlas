import { ProjectEditor } from "@/components/dashboard/project-editor";

export const metadata = { title: "New project" };

export default function NewProjectPage() {
  return <ProjectEditor project={null} />;
}
