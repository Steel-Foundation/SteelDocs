import { v } from "convex/values";
import { query } from "./_generated/server";
import { classTypeValidator } from "./schema";

export const latestRun = query({
  args: {
    branch: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.branch) {
      return await ctx.db
        .query("runs")
        .withIndex("by_branch", (q) => q.eq("branch", args.branch!))
        .filter((q) => q.eq(q.field("is_duplicate"), false))
        .order("desc")
        .first();
    }
    return await ctx.db
      .query("runs")
      .filter((q) => q.eq(q.field("is_duplicate"), false))
      .order("desc")
      .first();
  },
});

// Lightweight listing for the table — no methods array transferred
export const classesOverview = query({
  args: {
    run_id: v.optional(v.id("runs")),
    class_type: v.optional(classTypeValidator),
  },
  handler: async (ctx, args) => {
    if (!args.run_id) return [];
    const run_id = args.run_id;
    const rows = args.class_type !== undefined
      ? await ctx.db
          .query("class_snapshots")
          .withIndex("by_run_and_type", (q) =>
            q.eq("run_id", run_id).eq("class_type", args.class_type!)
          )
          .collect()
      : await ctx.db
          .query("class_snapshots")
          .withIndex("by_run", (q) => q.eq("run_id", run_id))
          .collect();

    return rows.map(({ _id, _creationTime, run_id, class_name, class_type, percentage_implemented }) => ({
      _id,
      _creationTime,
      run_id,
      class_name,
      class_type,
      percentage_implemented,
    }));
  },
});

export const runById = query({
  args: { id: v.id("runs") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

// Full document with methods — loaded on demand in the detail sheet
export const classById = query({
  args: { id: v.id("class_snapshots") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

// Full listing with methods — kept for section-cards stats and internal use
export const classesByType = query({
  args: {
    run_id: v.id("runs"),
    class_type: v.optional(classTypeValidator),
  },
  handler: async (ctx, args) => {
    if (args.class_type !== undefined) {
      return await ctx.db
        .query("class_snapshots")
        .withIndex("by_run_and_type", (q) =>
          q.eq("run_id", args.run_id).eq("class_type", args.class_type!)
        )
        .collect();
    }
    return await ctx.db
      .query("class_snapshots")
      .withIndex("by_run", (q) => q.eq("run_id", args.run_id))
      .collect();
  },
});

export const classHistory = query({
  args: {
    class_name: v.string(),
    branch: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const runs = args.branch
      ? await ctx.db
          .query("runs")
          .withIndex("by_branch", (q) => q.eq("branch", args.branch!))
          .filter((q) => q.eq(q.field("is_duplicate"), false))
          .order("asc")
          .collect()
      : await ctx.db
          .query("runs")
          .filter((q) => q.eq(q.field("is_duplicate"), false))
          .order("asc")
          .collect();

    const runIds = new Set(runs.map((r) => r._id));
    const runMap = new Map(runs.map((r) => [r._id, r]));

    const snapshots = await ctx.db
      .query("class_snapshots")
      .withIndex("by_class_name", (q) => q.eq("class_name", args.class_name))
      .collect();

    return snapshots
      .filter((s) => runIds.has(s.run_id))
      .map((s) => {
        const run = runMap.get(s.run_id)!;
        return {
          triggered_at: run.triggered_at,
          commit_sha: run.commit_sha,
          percentage_implemented: s.percentage_implemented,
        };
      })
      .sort((a, b) => a.triggered_at - b.triggered_at);
  },
});

export const searchClasses = query({
  args: {
    run_id: v.id("runs"),
    search_term: v.string(),
    class_type: v.optional(classTypeValidator),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("class_snapshots")
      .withSearchIndex("search_class_name", (q) => {
        const base = q.search("class_name", args.search_term).eq("run_id", args.run_id);
        return args.class_type !== undefined ? base.eq("class_type", args.class_type) : base;
      })
      .collect();

    return results.map(({ _id, class_name, class_type, percentage_implemented }) => ({
      _id,
      class_name,
      class_type,
      percentage_implemented,
    }));
  },
});
