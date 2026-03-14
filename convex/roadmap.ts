import { v } from "convex/values";
import { query } from "./_generated/server";
import { authedMutation } from "./functions";
import { authComponent } from "./auth";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import type { AuthUser } from "./auth";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function requireUserId(user: AuthUser | null): string {
  if (!user) throw new Error("Authentication required");
  return user._id;
}

async function assertRoadmapOwner(
  ctx: MutationCtx & { user: AuthUser | null },
  roadmapId: Id<"roadmaps">
) {
  const userId = requireUserId(ctx.user);
  const roadmap = await ctx.db.get(roadmapId);
  if (!roadmap) throw new Error("Roadmap not found");
  if (roadmap.userId !== userId) throw new Error("Not authorized");
  return roadmap;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export const getRoadmaps = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("roadmaps").collect();
  },
});

export const getAllRoadmapPreviews = query({
  args: {},
  handler: async (ctx) => {
    const roadmaps = await ctx.db.query("roadmaps").collect();

    const previewItems = await Promise.all(
      roadmaps.map((r) =>
        ctx.db
          .query("roadmap_items")
          .withIndex("by_roadmap_and_order", (q) => q.eq("roadmap_id", r._id))
          .take(3)
      )
    );

    const uniqueUserIds = [...new Set(roadmaps.map((r) => r.userId))];
    const users = await Promise.all(
      uniqueUserIds.map((id) => authComponent.getAnyUserById(ctx, id))
    );
    const usersMap = new Map(uniqueUserIds.map((id, i) => [id, users[i] ?? null]));

    return roadmaps.map((r, i) => ({
      ...r,
      previewItems: previewItems[i],
      user: usersMap.get(r.userId) ?? null,
    }));
  },
});

export const getRoadmapItems = query({
  args: { roadmapId: v.id("roadmaps") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("roadmap_items")
      .withIndex("by_roadmap_and_order", (q) => q.eq("roadmap_id", args.roadmapId))
      .collect();

    const featureIds = [...new Set(items.map((i) => i.feature_id).filter((id) => id != null))];
    const features = await Promise.all(featureIds.map((id) => ctx.db.get(id)));
    const featureMap = new Map(features.filter((f) => f != null).map((f) => [f!._id, f]));

    return items.map((item) => ({ ...item, feature: item.feature_id ? (featureMap.get(item.feature_id) ?? null) : null }));
  },
});

export const getRootFeatures = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("features")
      .withIndex("by_parent", (q) => q.eq("parentId", undefined))
      .collect();
  },
});

export const getChildFeatures = query({
  args: { featureId: v.id("features") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("features")
      .withIndex("by_parent", (q) => q.eq("parentId", args.featureId))
      .collect();
  },
});

export const getAllFeatures = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("features").collect();
  },
});

// ─── Feature Mutations ────────────────────────────────────────────────────────

export const createFeature = authedMutation({
  args: {
    name: v.string(),
    parentId: v.optional(v.id("features")),
  },
  handler: async (ctx, args) => {
    requireUserId(ctx.user);
    return await ctx.db.insert("features", {
      name: args.name,
      completeStatus: false,
      parentId: args.parentId,
    });
  },
});

export const updateFeature = authedMutation({
  args: {
    id: v.id("features"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    requireUserId(ctx.user);
    await ctx.db.patch(args.id, { name: args.name });
  },
});

export const deleteFeature = authedMutation({
  args: { id: v.id("features") },
  handler: async (_ctx, _args) => {
    // TODO: Require admin role once role system is implemented
    throw new Error("Feature deletion requires admin role (not yet implemented)");
  },
});

// ─── Roadmap Mutations ────────────────────────────────────────────────────────

export const createRoadmap = authedMutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = requireUserId(ctx.user);
    return await ctx.db.insert("roadmaps", {
      name: args.name,
      userId,
    });
  },
});

export const updateRoadmap = authedMutation({
  args: { id: v.id("roadmaps"), name: v.string() },
  handler: async (ctx, args) => {
    await assertRoadmapOwner(ctx, args.id);
    await ctx.db.patch(args.id, { name: args.name });
  },
});

export const deleteRoadmap = authedMutation({
  args: { id: v.id("roadmaps") },
  handler: async (ctx, args) => {
    await assertRoadmapOwner(ctx, args.id);
    const items = await ctx.db
      .query("roadmap_items")
      .withIndex("by_roadmap", (q) => q.eq("roadmap_id", args.id))
      .collect();
    await Promise.all(items.map((item) => ctx.db.delete(item._id)));
    await ctx.db.delete(args.id);
  },
});

// ─── Roadmap Item Mutations ───────────────────────────────────────────────────

export const createRoadmapItem = authedMutation({
  args: {
    roadmap_id: v.id("roadmaps"),
    name: v.string(),
    feature_id: v.optional(v.id("features")),
  },
  handler: async (ctx, args) => {
    await assertRoadmapOwner(ctx, args.roadmap_id);
    const items = await ctx.db
      .query("roadmap_items")
      .withIndex("by_roadmap", (q) => q.eq("roadmap_id", args.roadmap_id))
      .collect();
    const maxOrder = items.reduce((max, item) => Math.max(max, item.order), -1);
    return await ctx.db.insert("roadmap_items", {
      name: args.name,
      completeStatus: false,
      feature_id: args.feature_id,
      roadmap_id: args.roadmap_id,
      order: maxOrder + 1,
    });
  },
});

export const updateRoadmapItem = authedMutation({
  args: {
    id: v.id("roadmap_items"),
    name: v.optional(v.string()),
    feature_id: v.optional(v.id("features")),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item not found");
    await assertRoadmapOwner(ctx, item.roadmap_id);
    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.feature_id !== undefined) updates.feature_id = args.feature_id;
    await ctx.db.patch(args.id, updates);
  },
});

export const deleteRoadmapItem = authedMutation({
  args: { id: v.id("roadmap_items") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item not found");
    await assertRoadmapOwner(ctx, item.roadmap_id);
    await ctx.db.delete(args.id);
  },
});

export const toggleRoadmapItem = authedMutation({
  args: { id: v.id("roadmap_items") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item not found");
    await assertRoadmapOwner(ctx, item.roadmap_id);
    // Only affects the item — feature.completeStatus is managed by the webhook
    await ctx.db.patch(args.id, { completeStatus: !item.completeStatus });
  },
});
