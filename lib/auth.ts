import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, customSession } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { Role, ROLE_PERMISSIONS, sesionPermissions } from "./ac";
import prisma from "./db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  // Allow requests from the frontend development server
  trustedOrigins: ["http://localhost:5173", "http://localhost:3000"],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        required: true,
      },
    },
  },
  plugins: [
    admin({
      adminRoles: ["admin"],
      adminUserIds: ["fMyPrAVPSv2ibAoE480xg2hi5N7NQu7C"],
    }),
    customSession(async ({ user, session }) => {
      if (!user) {
        return { user, session };
      }
      // Get user role, default to 'user' if not set
      const userRole = ((user as any).role as Role) || "user";
      const permissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.user;

      return {
        user: {
          ...user,
          permissions,
        },
        session: {
          ...session,
          permissions: sesionPermissions[userRole],
        },
      };
    }),
    nextCookies(),
  ],
});
