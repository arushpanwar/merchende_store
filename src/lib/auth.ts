import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    id: "admin-credentials",
    name: "Admin",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;
      const admin = await prisma.admin.findUnique({
        where: { email: credentials.email.toLowerCase() },
      });
      if (!admin) return null;
      const ok = await bcrypt.compare(credentials.password, admin.passwordHash);
      if (!ok) return null;
      return {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: "admin" as const,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.unshift(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/cart",
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "customer";
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.sub;
        (session.user as { role?: string }).role =
          (token.role as string) ?? "customer";
      }
      return session;
    },
  },
};
