import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth } from "better-auth/minimal";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL!;

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: siteUrl,
    basePath: "/SteelDocs/api/auth",
    secret: "w9VInG2IM0PuTBXsabOpG5Gm+/GN6u//RUj0dRKo9r0=",
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      },
    },
    plugins: [
      convex({ authConfig, options: { basePath: "/SteelDocs/api/auth" } }),
    ],
  });
};

export type AuthUser = Awaited<ReturnType<typeof authComponent.getAuthUser>>;

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.safeGetAuthUser(ctx);
  },
});
