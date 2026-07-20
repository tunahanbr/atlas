import { ServiceEditor } from "@/components/dashboard/service-editor";

export const metadata = { title: "New service" };

export default function NewServicePage() {
  return <ServiceEditor service={null} />;
}
