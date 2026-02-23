/**
 * Local-dev ingestion script.
 * Reads outputs/output.json and calls ingestRun.
 * Uses Bun for file I/O. Fallbacks ensure it works without CI env vars.
 *
 * Usage:  bun run scripts/script.ts
 */

import { createHash } from "crypto";
import { readFileSync } from "fs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as dotenv from "dotenv";
import { ResultAsync, okAsync, errAsync, safeTry, ok } from "neverthrow";

dotenv.config({ path: ".env.local" });

// ----- Types (matches the new single-file output format) -----

type ClassType = "block" | "item" | "entity" | "ai_goal" | "ai_brain" | "ai_control" | "ai_pathing" | "other";

interface RawMethod {
  method_name: string;
  status: "Implemented" | "NotImplemented";
}

interface RawClass {
  class_name: string;
  class_type: ClassType;
  methods: RawMethod[];
  percentage_implemented: number;
}

interface OutputFile {
  classes: RawClass[];
}

// ----- CI / local context -----

interface RunContext {
  branch: string;
  commitSha: string;
  prNumber?: number;
  mcVersion: string;
}

function getRunContext(): RunContext {
  const branch =
    process.env.GITHUB_HEAD_REF ||
    process.env.GITHUB_REF_NAME ||
    process.env.CI_COMMIT_BRANCH ||
    "local";

  const commitSha =
    process.env.GITHUB_SHA ||
    process.env.CI_COMMIT_SHA ||
    "local-dev";

  const prNumber = process.env.PR_NUMBER
    ? parseInt(process.env.PR_NUMBER, 10)
    : undefined;

  const mcVersion = process.env.MC_VERSION || "local";

  return { branch, commitSha, prNumber, mcVersion };
}

// ----- Convex client -----

function getClient(): ResultAsync<ConvexHttpClient, string> {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
  return url
    ? okAsync(new ConvexHttpClient(url))
    : errAsync("Missing CONVEX_URL / NEXT_PUBLIC_CONVEX_URL");
}

// ----- Load output file -----

function loadOutput(): ResultAsync<{ raw: string; data: OutputFile }, string> {
  const path = "./SteelTracker/outputs/analysis.json";
  return ResultAsync.fromPromise(
    Promise.resolve().then(() => {
      const raw = readFileSync(path, "utf-8");
      const data: OutputFile = JSON.parse(raw);
      return { raw, data };
    }),
    () => `Failed to read ${path}`
  );
}

// ----- Main -----

async function main() {
  const result = await safeTry(async function* () {
    const client = yield* getClient().safeUnwrap();
    const ctx = getRunContext();

    console.log("╔════════════════════════════════════════╗");
    console.log("║     Steel Tracker — Local Ingest       ║");
    console.log("╠════════════════════════════════════════╣");
    console.log(`║ 🌿 Branch:    ${ctx.branch.slice(0, 24).padEnd(24)}║`);
    console.log(`║ 📝 Commit:    ${ctx.commitSha.slice(0, 7).padEnd(24)}║`);
    console.log(`║ 🎮 MC:        ${ctx.mcVersion.slice(0, 24).padEnd(24)}║`);
    console.log("╚════════════════════════════════════════╝");

    console.log("\n📥 Reading SteelTracker/outputs/analysis.json...");
    const { raw, data } = yield* loadOutput().safeUnwrap();

    const content_hash = createHash("sha256").update(raw).digest("hex");
    console.log(`   ${data.classes.length} classes — hash ${content_hash.slice(0, 12)}...`);

    console.log("\n🚀 Calling ingestRun...");
    const runResult = await client.mutation(api.ingestion.ingestRun, {
      commit_sha: ctx.commitSha,
      branch: ctx.branch,
      pr_number: ctx.prNumber,
      mc_version: ctx.mcVersion,
      content_hash,
      classes: data.classes.map((cls) => ({
        class_name: cls.class_name,
        class_type: cls.class_type,
        percentage_implemented: cls.percentage_implemented,
        methods: cls.methods,
      })),
    });

    if (runResult.is_duplicate) {
      console.log(`\n⚠️  Duplicate run (same content_hash). Ghost run inserted: ${runResult.run_id}`);
    } else {
      console.log(`\n✅ Run ingested: ${runResult.run_id}`);
    }

    return ok(undefined);
  });

  if (result.isErr()) {
    console.error("\n❌ Fatal error:", result.error);
    process.exit(1);
  }
}

main();
