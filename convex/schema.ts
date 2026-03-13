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

export const methodValidator = v.object({
  method_name: v.string(),
  status: methodStatusValidator,
});

export default defineSchema({
  // ─── Core run registry ──────────────────────────────────────────────────────

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

  // ─── Selector sources (auto-maintained via triggers) ────────────────────────

  /** One entry per unique branch or PR that has had at least one run. */
  sources: defineTable({
    branch: v.string(),
    pr_number: v.optional(v.number()),
  })
    .index("by_branch", ["branch"])
    .index("by_pr", ["pr_number"]),

  /** One entry per unique Minecraft version that has had at least one run. */
  mc_versions: defineTable({
    version: v.string(),
  })
    .index("by_version", ["version"]),

  // ─── Class data ─────────────────────────────────────────────────────────────

  /**
   * Full sorted list of all class names per MC version.
   * Inserted once per mc_version. Provides the denominator for stats.
   */
  class_registry: defineTable({
    mc_version: v.string(),
    class_names: v.array(v.string()),
  })
    .index("by_version", ["mc_version"]),

  /**
   * Materialized current state per (branch × mc_version × class).
   * Upserted on every run. Powers the Branch/PR display mode.
   */
  class_current: defineTable({
    branch: v.string(),
    mc_version: v.string(),
    class_name: v.string(),
    class_type: classTypeValidator,
    run_id: v.id("runs"),
    percentage_implemented: v.number(),
    methods: v.array(methodValidator),
  })
    .index("by_branch_mc_type", ["branch", "mc_version", "class_type"])
    .index("by_branch_mc_class", ["branch", "mc_version", "class_name"]),

  /**
   * Delta log: inserted only when a class's methods change vs the previous run
   * on the same branch. Powers class history and attribution.
   */
  class_changes: defineTable({
    run_id: v.id("runs"),
    mc_version: v.string(),
    class_name: v.string(),
    class_type: classTypeValidator,
    percentage_implemented: v.number(),
    methods: v.array(methodValidator),
  })
    .index("by_mc_class", ["mc_version", "class_name"])
    .index("by_run", ["run_id"]),

  /**
   * Best known state per (mc_version × class), across all branches.
   * Updated when a class_change has a higher % than the current best.
   * Powers the "All (best)" display mode.
   */
  class_best: defineTable({
    mc_version: v.string(),
    class_name: v.string(),
    class_type: classTypeValidator,
    run_id: v.id("runs"),
    percentage_implemented: v.number(),
    methods: v.array(methodValidator),
  })
    .index("by_mc_type", ["mc_version", "class_type"])
    .index("by_mc_class", ["mc_version", "class_name"]),

  // ─── Github Sync ─────────────────────────────────────────────────────────────

  /**
   * Table synchronisée via Webhooks GitHub.
   * Représente une Issue ou une PR.
   */
  github_entities: defineTable({
    github_id: v.number(),
    type: v.union(v.literal("issue"), v.literal("pr")),
    title: v.string(),
    status: v.union(v.literal("open"), v.literal("closed"), v.literal("merged")),
    url: v.string(),
  }).index("by_github_id", ["github_id"]),

  // ─── Roadmap ────────────────────────────────────────────────────────────────

  /**
   * Représente une fonctionnalité globale de l'application.
   * completeStatus est géré exclusivement par le webhook GitHub.
   */
  features: defineTable({
    name: v.string(),
    completeStatus: v.boolean(),
    parentId: v.optional(v.id("features")),
    github_entity_id: v.optional(v.id("github_entities")),
  }).index("by_parent", ["parentId"]),

  /**
   * Une Roadmap appartenant à un utilisateur (publique en lecture).
   */
  roadmaps: defineTable({
    name: v.string(),
    userId: v.string(),
  }).index("by_user", ["userId"]),

  /**
   * Un élément de la todo-list d'une Roadmap.
   */
  roadmap_items: defineTable({
    name: v.string(),
    completeStatus: v.boolean(),
    feature_id: v.optional(v.id("features")),
    roadmap_id: v.id("roadmaps"),
    order: v.number(),
  })
    .index("by_roadmap_and_order", ["roadmap_id", "order"])
    .index("by_roadmap", ["roadmap_id"]),
});
