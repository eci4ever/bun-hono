import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import {
  ac,
  admin as adminRole,
  moderator,
  user as userRole,
} from "./permissions";
import { nextCookies } from "better-auth/next-js";

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
      adminUserIds: ["admin-000"],
    }),
    nextCookies(),
  ],
});
