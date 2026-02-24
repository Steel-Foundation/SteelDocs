import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const classTypeValidator = v.union(
  v.literal("block"),
  v.literal("item"),
  v.literal("entity"),
  v.literal("ai_goal"),
  v.literal("ai_brain"),
  v.literal("ai_control"),
  v.literal("ai_pathing"),
  v.literal("other")
);

export const methodStatusValidator = v.union(
  v.literal("Implemented"),
  v.literal("NotImplemented")
);

export default defineSchema({
  runs: defineTable({
    commit_sha: v.string(),
    branch: v.string(),
    pr_number: v.optional(v.number()),
    mc_version: v.string(),
    content_hash: v.string(),
    is_duplicate: v.boolean(),
    triggered_at: v.number(),
  })
    .index("by_branch", ["branch", "triggered_at"])
    .index("by_hash", ["content_hash"]),

  class_snapshots: defineTable({
    run_id: v.id("runs"),
    class_name: v.string(),
    class_type: classTypeValidator,
    percentage_implemented: v.number(),
    methods: v.array(
      v.object({
        method_name: v.string(),
        status: methodStatusValidator,
      })
    ),
  })
    .index("by_run", ["run_id"])
    .index("by_class_name", ["class_name"])
    .index("by_run_and_type", ["run_id", "class_type"])
    .searchIndex("search_class_name", {
      searchField: "class_name",
      filterFields: ["class_type", "run_id"],
    }),
});
