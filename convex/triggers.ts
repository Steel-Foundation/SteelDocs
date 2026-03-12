import { Triggers } from "convex-helpers/server/triggers";
import {
  customMutation,
  customCtx,
} from "convex-helpers/server/customFunctions";
import {
  mutation as rawMutation,
  internalMutation as rawInternalMutation,
} from "./_generated/server";
import type { DataModel } from "./_generated/dataModel";

const triggers = new Triggers<DataModel>();

// ─── Trigger: runs → sources ──────────────────────────────────────────────────
// On every new run, ensure the branch/PR is registered in sources.
triggers.register("runs", async (ctx, change) => {
  if (change.operation !== "insert") return;
  const run = change.newDoc;

  const existing = await ctx.db
    .query("sources")
    .withIndex("by_branch", (q) => q.eq("branch", run.branch))
    .first();

  if (!existing) {
    await ctx.db.insert("sources", {
      branch: run.branch,
      pr_number: run.pr_number,
    });
  }
});

// ─── Trigger: runs → mc_versions ─────────────────────────────────────────────
// On every new run, ensure the MC version is registered in mc_versions.
triggers.register("runs", async (ctx, change) => {
  if (change.operation !== "insert") return;
  const run = change.newDoc;

  const existing = await ctx.db
    .query("mc_versions")
    .withIndex("by_version", (q) => q.eq("version", run.mc_version))
    .first();

  if (!existing) {
    await ctx.db.insert("mc_versions", { version: run.mc_version });
  }
});

// ─── Wrapped exports ──────────────────────────────────────────────────────────
export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
export const internalMutation = customMutation(
  rawInternalMutation,
  customCtx(triggers.wrapDB)
);
