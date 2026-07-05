import type { NextAuthConfig } from "next-auth";
import { UserRole } from "@prisma/client";

// Extend NextAuth typings
declare module "next-auth" {
  interface User {
    role: UserRole;
    organizationId: string | null;
  }
  interface Session {
    user: {
      id: string;
      role: UserRole;
      organizationId: string | null;
    } & import("next-auth").DefaultSession["user"]
  }
}

export const authConfig = {
  pages: {
    signIn: "/auth/signin",
    newUser: "/auth/signup",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnAdmin = nextUrl.pathname.startsWith("/dashboard/admin");
      const isOnEmployer = nextUrl.pathname.startsWith("/dashboard/employer");

      if (isOnDashboard) {
        if (!isLoggedIn) return false;
        
        // Admin authorization
        if (isOnAdmin && auth.user.role !== UserRole.ADMIN) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        
        // Employer authorization
        if (isOnEmployer && auth.user.role !== UserRole.EMPLOYER) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }

        return true;
      }
      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId;
      }
      // Handle session updates (e.g. updating organizationId after creating org)
      if (trigger === "update" && session) {
        token.organizationId = session.organizationId ?? token.organizationId;
        token.role = session.role ?? token.role;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.organizationId = token.organizationId as string | null;
      }
      return session;
    },
  },
  providers: [], // defined in auth.ts
} satisfies NextAuthConfig;
