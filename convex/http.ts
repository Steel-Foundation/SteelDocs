import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

import { authComponent, createAuth } from "./auth";
const http = httpRouter();
authComponent.registerRoutes(http, createAuth);

http.route({
  path: "/ingest",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    // Check Bearer token against INGEST_PASSWORD env var
    const auth = req.headers.get("Authorization");
    if (!auth || auth !== `Bearer ${process.env.INGEST_PASSWORD}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response("Invalid JSON body", { status: 400 });
    }

    try {
      const result = await ctx.runMutation(internal.ingestion.ingestRun, {
        commit_sha: body.commit_sha as string,
        branch: body.branch as string,
        pr_number: body.pr_number as number | undefined,
        mc_version: body.mc_version as string,
        content_hash: body.content_hash as string,
        classes: body.classes as Array<{
          class_name: string;
          class_type: "block" | "item" | "entity" | "ai_goal" | "ai_brain" | "ai_control" | "ai_pathing" | "other";
          percentage_implemented: number;
          methods: Array<{ method_name: string; status: "Implemented" | "NotImplemented" }>;
        }>,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: "Validation or processing failed", details: e.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

http.route({
  path: "/last-hash",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const { searchParams } = new URL(req.url);
    const branch = searchParams.get("branch") ?? undefined;
    const prParam = searchParams.get("pr_number");
    const pr_number = prParam ? parseInt(prParam, 10) : undefined;

    const result = await ctx.runQuery(internal.queries.latestRunHash, {
      branch,
      pr_number,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
