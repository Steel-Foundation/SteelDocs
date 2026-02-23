import { createHash } from "crypto";
import { readFileSync } from "fs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })


// ----- env vars -----
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
const GITHUB_SHA = process.env.GITHUB_SHA;
const GITHUB_REF_NAME = process.env.GITHUB_REF_NAME;
const PR_NUMBER = process.env.PR_NUMBER;
const MC_VERSION = process.env.MC_VERSION;

if (!CONVEX_URL) throw new Error("Missing env: CONVEX_URL");
if (!GITHUB_SHA) throw new Error("Missing env: GITHUB_SHA");
if (!GITHUB_REF_NAME) throw new Error("Missing env: GITHUB_REF_NAME");
if (!MC_VERSION) throw new Error("Missing env: MC_VERSION");

// ----- read & hash -----
const raw = readFileSync("SteelTracker/outputs/analysis.json", "utf-8");
const content_hash = createHash("sha256").update(raw).digest("hex");

type RawMethod = { method_name: string; status: "Implemented" | "NotImplemented" };
type RawClass = {
  class_name: string;
  class_type: "block" | "item" | "entity" | "ai_goal" | "ai_brain" | "ai_control" | "ai_pathing" | "other";
  methods: RawMethod[];
  percentage_implemented: number;
};
type RawJson = { classes: RawClass[] };

const data: RawJson = JSON.parse(raw);

// ----- ingest -----
const client = new ConvexHttpClient(CONVEX_URL);

async function main() {
  const result = await client.mutation(api.ingestion.ingestRun, {
    commit_sha: GITHUB_SHA!,
    branch: GITHUB_REF_NAME!,
    pr_number: PR_NUMBER ? parseInt(PR_NUMBER, 10) : undefined,
    mc_version: MC_VERSION!,
    content_hash,
    classes: data.classes.map((cls) => ({
      class_name: cls.class_name,
      class_type: cls.class_type,
      percentage_implemented: cls.percentage_implemented,
      methods: cls.methods,
    })),
  });

  console.log(
    `Ingested run ${result.run_id} (is_duplicate: ${result.is_duplicate})`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
