import NextAuth from "next-auth";
import { cache } from "react";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { db } from "@/server/db";

export const hasLegacyGitHub =
  !!process.env.AUTH_GITHUB_ID && !!process.env.AUTH_GITHUB_SECRET;
export const isDevLoginEnabled = process.env.NODE_ENV !== "production";

// Development-only login: creates/signs in a user by email without any
// external provider. It is never registered in production.
const devCredentials = Credentials({
  id: "dev-login",
  name: "Development login",
  credentials: {
    email: { label: "Email", type: "email" },
    name: { label: "Name", type: "text" },
  },
  async authorize(credentials) {
    const email = String(credentials?.email ?? "").trim().toLowerCase();
    const name = String(credentials?.name ?? "").trim();
    if (!email || !email.includes("@")) return null;

    const user = await db.user.upsert({
      where: { email },
      update: name ? { name } : {},
      create: { email, name: name || email.split("@")[0] },
    });
    return { id: user.id, email: user.email, name: user.name, image: user.image };
  },
});

const legacyAuth = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    ...(hasLegacyGitHub
      ? [
          GitHub({
            clientId: process.env.AUTH_GITHUB_ID!,
            clientSecret: process.env.AUTH_GITHUB_SECRET!,
          }),
        ]
      : []),
    ...(isDevLoginEnabled ? [devCredentials] : []),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});

export const handlers = legacyAuth.handlers;
export const legacySignIn = legacyAuth.signIn;
export const legacySignOut = legacyAuth.signOut;

/**
 * Returns an Auth.js-compatible session with Atlas' internal Prisma user id.
 * Supabase owns the session when configured; the existing Auth.js flow remains
 * available for local development and backwards-compatible self-hosting.
 */
async function resolveAuth() {
  const { isSupabaseConfigured } = await import("@/lib/supabase/config");
  if (!isSupabaseConfigured()) return legacyAuth.auth();

  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) return null;

  const email = data.user.email.trim().toLowerCase();
  const metadata = data.user.user_metadata ?? {};
  const name =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : typeof metadata.name === "string"
        ? metadata.name
        : email.split("@")[0];
  const image =
    typeof metadata.avatar_url === "string" ? metadata.avatar_url : undefined;

  const user = await db.user.upsert({
    where: { email },
    update: { supabaseId: data.user.id, name, ...(image ? { image } : {}) },
    create: { email, supabaseId: data.user.id, name, image },
  });

  return {
    user: { id: user.id, email: user.email, name: user.name, image: user.image },
    expires: data.user.created_at,
  };
}

// Dashboard layouts and pages both need the current user. React's request cache
// keeps that authentication lookup to one round-trip per navigation.
export const auth = cache(resolveAuth);
