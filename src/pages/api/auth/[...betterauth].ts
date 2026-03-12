export const prerender = false;

import type { APIRoute } from "astro";
import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

const { handler } = convexBetterAuthNextJs({
  convexUrl: import.meta.env.PUBLIC_CONVEX_URL,
  convexSiteUrl: import.meta.env.PUBLIC_CONVEX_SITE_URL,
});

export const GET: APIRoute = ({ request }) => handler.GET(request);
export const POST: APIRoute = ({ request }) => handler.POST(request);
