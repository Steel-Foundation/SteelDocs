import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: import.meta.env.PUBLIC_SITE_URL ?? "http://localhost:4321",
  basePath: "/SteelDocs/api/auth",
  plugins: [
    convexClient()
  ],
});
