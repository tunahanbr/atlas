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
    <main className="flex min-h-svh items-center px-5 py-12 sm:px-6">
      <div className="mx-auto grid w-full max-w-4xl gap-12 md:grid-cols-[1fr_27rem] md:items-center md:gap-20">
        <div>
          <p className="inline-flex items-center gap-2.5 font-editorial text-base">
            <span className="size-1.5 rotate-45 bg-foreground" />
            Atlas
          </p>
          <p className="mt-12 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground md:mt-0">
            Your independent home
          </p>
          <h1 className="font-editorial mt-4 max-w-lg text-[2.5rem] leading-[1.02] tracking-[-0.035em] text-balance sm:text-[3rem]">
            Start with the essentials. Refine as you go.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-[1.75] text-muted-foreground">
            Choose your address, say what you do and set expectations. Your page goes live immediately; projects and services can come next.
          </p>
        </div>
        <div>
          <SetupWizard defaultName={session.user.name ?? ""} />
        </div>
      </div>
    </main>
  );
}
