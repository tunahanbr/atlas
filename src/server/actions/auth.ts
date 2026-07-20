"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";

export async function signInWithGitHub() {
  await signIn("github", { redirectTo: "/app" });
}

export async function signInWithDevLogin(
  _prev: { error?: string } | undefined,
  formData: FormData,
) {
  try {
    await signIn("dev-login", {
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
  await signOut({ redirectTo: "/" });
}
