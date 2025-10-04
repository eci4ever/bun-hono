import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin as adminPlugin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import prisma from "./db";
import { ac, admin, user } from "./permissions";

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
        user,
      },
      adminRoles: ["admin"],
      adminUserIds: ["fMyPrAVPSv2ibAoE480xg2hi5N7NQu7C"],
    }),
    nextCookies(),
  ],
});
