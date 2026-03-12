import { v } from "convex/values";
import { internalQuery, query } from "./_generated/server";
import { classTypeValidator } from "./schema";

// ─── Selector data ────────────────────────────────────────────────────────────

/** All branches and PRs that have had at least one run. */
export const listSources = query({
  handler: async (ctx) => {
    const sources = await ctx.db.query("sources").collect();
    const branches = sources
      .filter((s) => s.pr_number === undefined)
      .map((s) => s.branch)
      .sort();
    const prs = sources
      .filter((s) => s.pr_number !== undefined)
      .sort((a, b) => b.pr_number! - a.pr_number!)
      .map((s) => ({ branch: s.branch, pr_number: s.pr_number! }));
    return { branches, prs };
  },
});

/** All MC versions that have had at least one run. */
export const listMcVersions = query({
  handler: async (ctx) => {
    const versions = await ctx.db.query("mc_versions").collect();
    return versions.map((v) => v.version).sort();
  },
});

/** Total number of classes for a given MC version (denominator for stats). */
export const totalClasses = query({
  args: { mc_version: v.string() },
  handler: async (ctx, args) => {
    const reg = await ctx.db
      .query("class_registry")
      .withIndex("by_version", (q) => q.eq("mc_version", args.mc_version))
      .first();
    return reg?.class_names.length ?? 0;
  },
});

// ─── Table view ───────────────────────────────────────────────────────────────

/** Classes for a specific branch — mode Branch/PR. Reads from class_current. */
export const classesByBranch = query({
  args: {
    branch: v.string(),
    mc_version: v.string(),
    class_type: v.optional(classTypeValidator),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("class_current")
      .withIndex("by_branch_mc_type", (q) =>
        q.eq("branch", args.branch).eq("mc_version", args.mc_version)
      );

    if (args.class_type) {
      q = q.filter((qObj) => qObj.eq(qObj.field("class_type"), args.class_type));
    }

    const rows = await q.collect();

    return rows.map(
      ({ _id, _creationTime, class_name, class_type, run_id, percentage_implemented }) => ({
        _id,
        _creationTime,
        class_name,
        class_type,
        run_id,
        percentage_implemented,
      })
    );
  },
});

/** Best known state per class across all branches — mode All. Reads from class_best. */
export const bestClasses = query({
  args: {
    mc_version: v.string(),
    class_type: v.optional(classTypeValidator),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("class_best")
      .withIndex("by_mc_type", (q) => q.eq("mc_version", args.mc_version));

    if (args.class_type) {
      q = q.filter((qObj) => qObj.eq(qObj.field("class_type"), args.class_type));
    }

    const rows = await q.collect();

    return rows.map(
      ({ _id, _creationTime, class_name, class_type, run_id, percentage_implemented }) => ({
        _id,
        _creationTime,
        class_name,
        class_type,
        run_id,
        percentage_implemented,
      })
    );
  },
});

// ─── Detail sheet ─────────────────────────────────────────────────────────────

/** Full document for a class_current entry (with methods). */
export const classByBranchAndName = query({
  args: { branch: v.string(), mc_version: v.string(), class_name: v.string() },
  handler: async (ctx, args) =>
    ctx.db
      .query("class_current")
      .withIndex("by_branch_mc_class", (q) =>
        q
          .eq("branch", args.branch)
          .eq("mc_version", args.mc_version)
          .eq("class_name", args.class_name)
      )
      .first(),
});

/** Full document for a class_best entry (with methods) — used in All mode. */
export const bestClassByName = query({
  args: { mc_version: v.string(), class_name: v.string() },
  handler: async (ctx, args) =>
    ctx.db
      .query("class_best")
      .withIndex("by_mc_class", (q) =>
        q.eq("mc_version", args.mc_version).eq("class_name", args.class_name)
      )
      .first(),
});

/** Chronological history of changes for a class (for the detail sheet). */
export const classChangesHistory = query({
  args: { mc_version: v.string(), class_name: v.string() },
  handler: async (ctx, args) => {
    const changes = await ctx.db
      .query("class_changes")
      .withIndex("by_mc_class", (q) =>
        q.eq("mc_version", args.mc_version).eq("class_name", args.class_name)
      )
      .order("asc")
      .collect();

    // Join with runs for commit/branch info
    const withRun = await Promise.all(
      changes.map(async (c) => {
        const run = await ctx.db.get(c.run_id);
        return {
          _id: c._id,
          _creationTime: c._creationTime,
          percentage_implemented: c.percentage_implemented,
          commit_sha: run?.commit_sha ?? "",
          branch: run?.branch ?? "",
          pr_number: run?.pr_number,
          triggered_at: run?.triggered_at ?? 0,
        };
      })
    );

    return withRun;
  },
});

/** Run details by ID. */
export const runById = query({
  args: { id: v.id("runs") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

// ─── Internal ─────────────────────────────────────────────────────────────────

/** Used by the /last-hash HTTP endpoint. */
export const latestRunHash = internalQuery({
  args: {
    branch: v.optional(v.string()),
    pr_number: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let run;

    if (args.branch) {
      run = await ctx.db
        .query("runs")
        .withIndex("by_branch", (q) => q.eq("branch", args.branch!))
        .filter((q) => q.eq(q.field("is_duplicate"), false))
        .filter((q) =>
          args.pr_number !== undefined
            ? q.eq(q.field("pr_number"), args.pr_number)
            : q.neq(q.field("pr_number"), undefined) // Ensure we don't accidentally get another PR's run on standard branches
        )
        .order("desc")
        .first();
    } else {
      run = await ctx.db
        .query("runs")
        .filter((q) => q.eq(q.field("is_duplicate"), false))
        .order("desc")
        .first();
    }

    return run ? { content_hash: run.content_hash } : null;
  },
});
