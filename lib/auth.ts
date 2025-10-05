import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin as adminPlugin, customSession } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import prisma from "./db";
import { ac, admin, user, moderator } from "./permissions";

export type Role = "admin" | "user" | "moderator";
export type PermissionMap = Record<string, string[]>;
export const sesionPermissions: Record<Role, string[]> = {
  admin: ["list", "revoke", "delete"],
  moderator: [],
  user: [],
};

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
    adminPlugin({
      ac,
      roles: {
        admin,
        moderator,
        user,
      },
      adminRoles: ["admin"],
      adminUserIds: ["fMyPrAVPSv2ibAoE480xg2hi5N7NQu7C"],
    }),
    customSession(async ({ session, user: userData }) => {
      const role = ((userData as any).role as Role) || "";
      const roleMap = { user, admin, moderator };
      const currentRole = roleMap[role];
      return {
        session: {
          ...session,
          permissions: sesionPermissions[role] || [],
        },
        user: {
          ...userData,
          permissions: currentRole?.statements ?? {},
        },
      };
    }),
    nextCookies(),
  ],
});
