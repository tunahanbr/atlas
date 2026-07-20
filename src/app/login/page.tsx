import { redirect } from "next/navigation";
import Link from "next/link";

import { auth, isDevLoginEnabled } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/app");

  const hasGitHub =
    !!process.env.AUTH_GITHUB_ID && !!process.env.AUTH_GITHUB_SECRET;

  return (
    <main className="flex min-h-svh items-center px-5 py-12 sm:px-6">
      <div className="mx-auto grid w-full max-w-4xl gap-12 md:grid-cols-[1fr_24rem] md:items-center md:gap-24">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 font-editorial text-base">
            <span className="size-1.5 rotate-45 bg-foreground" />
            Atlas
          </Link>
          <p className="mt-12 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground md:mt-20">
            Independent by design
          </p>
          <h1 className="font-editorial mt-4 max-w-lg text-[2.5rem] leading-[1.02] tracking-[-0.035em] text-balance sm:text-[3rem]">
            Build a professional home you actually own.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-[1.75] text-muted-foreground">
            Sign in to create or manage a profile built around your work, your offers and direct client conversations.
          </p>
        </div>
        <div>
          <h2 className="font-editorial text-2xl">Sign in or get started</h2>
          <p className="mt-2 text-sm text-muted-foreground">One account, no separate signup flow.</p>
          <div className="mt-7">
          <LoginForm hasGitHub={hasGitHub} devLoginEnabled={isDevLoginEnabled} />
          </div>
        </div>
      </div>
    </main>
  );
}
