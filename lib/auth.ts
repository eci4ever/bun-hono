import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, customSession } from "better-auth/plugins";
import {
  ac,
  admin as adminRole,
  moderator,
  user as userRole,
} from "./permissions";
import { nextCookies } from "better-auth/next-js";
import { Role, PermissionMap } from "./helpers";

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
      ac,
      role: {
        admin: adminRole,
        user: userRole,
        moderator,
      },
      adminRoles: ["admin"],
      adminUserIds: ["fMyPrAVPSv2ibAoE480xg2hi5N7NQu7C"],
    }),
    customSession(async ({ user, session }) => {
      if (!user) {
        return { user, session };
      }

      // Get user role, default to 'user' if not set
      const userRole = ((user as any).role as Role) || "user";

      // Define role permissions mapping
      const ROLE_PERMISSIONS: Record<Role, PermissionMap> = {
        user: {
          user: ["read"],
          project: ["create", "read", "update"],
          dashboard: ["read"],
        },
        moderator: {
          user: ["read", "update"],
          project: ["create", "read", "update", "delete"],
          dashboard: ["read", "manage"],
        },
        admin: {
          user: [
            "create",
            "read",
            "update",
            "delete",
            "ban",
            "unban",
            "impersonate",
          ],
          project: ["create", "read", "update", "delete", "share"],
          dashboard: ["read", "manage"],
          admin: ["full_access"],
          session: ["list", "revoke", "delete"],
        },
      };

      // Get permissions for the user's role
      const permissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.user;

      return {
        user: {
          ...user,
          permissions,
        },
        session: {
          ...session,
        },
      };
    }),
    nextCookies(),
  ],
});
