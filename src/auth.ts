import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";
import type { UserRole, RealtorStatus } from "@/generated/prisma/enums";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Adapter kept for future OAuth providers. Credentials require JWT sessions.
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          realtorStatus: user.realtorStatus,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, trigger }) => {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.realtorStatus = user.realtorStatus ?? null;
      }

      // Keep role/status fresh (e.g. after admin approves a realtor).
      if (token.id && (trigger === "update" || !user)) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, realtorStatus: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.realtorStatus = dbUser.realtorStatus;
        }
      }

      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.realtorStatus =
          (token.realtorStatus as RealtorStatus | null) ?? null;
      }
      return session;
    },
  },
});
