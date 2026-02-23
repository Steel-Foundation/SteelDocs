import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { classTypeValidator, methodStatusValidator } from "./schema";

const classInputValidator = v.object({
  class_name: v.string(),
  class_type: classTypeValidator,
  percentage_implemented: v.number(),
  methods: v.array(
    v.object({
      method_name: v.string(),
      status: methodStatusValidator,
    })
  ),
});

export const ingestRun = mutation({
  args: {
    commit_sha: v.string(),
    branch: v.string(),
    pr_number: v.optional(v.number()),
    mc_version: v.string(),
    content_hash: v.string(),
    classes: v.array(classInputValidator),
  },
  handler: async (ctx, args) => {
    // Check for duplicate via content_hash
    const existing = await ctx.db
      .query("runs")
      .withIndex("by_hash", (q) => q.eq("content_hash", args.content_hash))
      .first();

    if (existing) {
      // Ghost run for traceability — no class_snapshots inserted
      const run_id = await ctx.db.insert("runs", {
        commit_sha: args.commit_sha,
        branch: args.branch,
        pr_number: args.pr_number,
        mc_version: args.mc_version,
        content_hash: args.content_hash,
        is_duplicate: true,
        triggered_at: Date.now(),
      });
      return { run_id, is_duplicate: true };
    }

    const run_id = await ctx.db.insert("runs", {
      commit_sha: args.commit_sha,
      branch: args.branch,
      pr_number: args.pr_number,
      mc_version: args.mc_version,
      content_hash: args.content_hash,
      is_duplicate: false,
      triggered_at: Date.now(),
    });

    // Insert class_snapshots in batches of 100 to stay within Convex write limits
    for (let i = 0; i < args.classes.length; i += 100) {
      const batch = args.classes.slice(i, i + 100);
      await Promise.all(
        batch.map((cls) =>
          ctx.db.insert("class_snapshots", {
            run_id,
            class_name: cls.class_name,
            class_type: cls.class_type,
            percentage_implemented: cls.percentage_implemented,
            methods: cls.methods,
          })
        )
      );
    }

    return { run_id, is_duplicate: false };
  },
});
