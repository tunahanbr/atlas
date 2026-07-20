import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/app");

  const hasGitHub =
    !!process.env.AUTH_GITHUB_ID && !!process.env.AUTH_GITHUB_SECRET;

  return (
    <main className="flex min-h-svh items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-center text-sm font-semibold tracking-tight">Atlas</p>
        <h1 className="mt-6 text-center text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Sign in to manage your professional profile.
        </p>
        <div className="mt-8">
          <LoginForm hasGitHub={hasGitHub} />
        </div>
      </div>
    </main>
  );
}
