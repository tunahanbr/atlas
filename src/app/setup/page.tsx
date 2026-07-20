import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/server/db";
import { SetupWizard } from "@/components/onboarding/setup-wizard";

export const metadata = { title: "Set up your profile" };

export default async function SetupPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const existing = await db.profile.findUnique({
    where: { userId: session.user.id },
  });
  if (existing) redirect("/app");

  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <p className="text-center text-sm font-semibold tracking-tight">Atlas</p>
        <h1 className="mt-6 text-center text-2xl font-semibold tracking-tight">
          Claim your corner of the internet
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Thirty seconds now — everything else can wait.
        </p>
        <div className="mt-8">
          <SetupWizard defaultName={session.user.name ?? ""} />
        </div>
      </div>
    </main>
  );
}
