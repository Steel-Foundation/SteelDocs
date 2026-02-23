import {
  customQuery,
  customMutation,
  customCtx,
} from "convex-helpers/server/customFunctions";
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { authComponent } from "./auth";

// Get authenticated user or null if not logged in
async function getUser(ctx: QueryCtx | MutationCtx) {
  try {
    return await authComponent.getAuthUser(ctx);
  } catch {
    // User is not authenticated, return null instead of throwing
    return null;
  }
}

// Custom query with optional authentication
// ctx.user is the user if logged in, null otherwise
export const authedQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    const user = await getUser(ctx);
    return { user };
  })
);

// Custom mutation with optional authentication
// ctx.user is the user if logged in, null otherwise
export const authedMutation = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const user = await getUser(ctx);
    return { user };
  })
);
