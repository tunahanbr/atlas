import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { db } from "@/server/db";

const hasGitHub =
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

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    ...(hasGitHub
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
