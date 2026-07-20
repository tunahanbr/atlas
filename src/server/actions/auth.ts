"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { legacySignIn, legacySignOut } from "@/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SignInResult = { error?: string; success?: string };

async function appOrigin() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    const url = new URL(configured);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("NEXT_PUBLIC_APP_URL must use HTTP(S)");
    return url.origin;
  }
  if (process.env.NODE_ENV === "production") throw new Error("NEXT_PUBLIC_APP_URL is required in production");
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  return `http://${host ?? "localhost:3000"}`;
}

export async function signInWithGitHub() {
  if (!isSupabaseConfigured()) {
    await legacySignIn("github", { redirectTo: "/app" });
    return;
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?error=configuration");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: `${await appOrigin()}/auth/callback?next=/app` },
  });
  if (error || !data.url) redirect("/login?error=oauth");
  redirect(data.url);
}

export async function signInWithMagicLink(
  _prev: SignInResult | undefined,
  formData: FormData,
): Promise<SignInResult> {
  if (!isSupabaseConfigured()) return { error: "Magic Link is not configured on this instance." };
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) return { error: "Enter a valid email address." };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Authentication is not configured." };
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${await appOrigin()}/auth/callback?next=/app` },
  });
  return error
    ? { error: "We could not send the sign-in link. Please try again." }
    : { success: "Check your inbox. Your secure sign-in link is on its way." };
}

export async function signInWithDevLogin(
  _prev: { error?: string } | undefined,
  formData: FormData,
) {
  if (process.env.NODE_ENV === "production") {
    return { error: "Development login is disabled in production." };
  }

  try {
    await legacySignIn("dev-login", {
      email: String(formData.get("email") ?? ""),
      name: String(formData.get("name") ?? ""),
      redirectTo: "/app",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Could not sign you in. Check the email address." };
    }
    throw error; // NEXT_REDIRECT
  }
}

export async function signOutToHome() {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase?.auth.signOut();
    redirect("/");
  }
  await legacySignOut({ redirectTo: "/" });
}
