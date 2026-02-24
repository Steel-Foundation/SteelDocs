import {
  AbilityBuilder,
  createMongoAbility,
  type MongoAbility,
  type MongoQuery,
} from "@casl/ability";
import type { AuthUser } from "./auth";

// User type is inferred from the better-auth component
// It can be null for visitors (unauthenticated users)
type User = AuthUser | null;

// Define all possible actions
type Action = "create" | "read" | "update" | "delete" | "manage";

// Define all subjects (resources) in your app
type Subject = "Run" | "ClassSnapshot" | "all";

// Define the ability type
export type AppAbility = MongoAbility<[Action, Subject], MongoQuery>;

/**
 * Build user abilities based on their authentication status and role.
 * 
 * CASL recommends having a single ability builder function that returns
 * all permissions for a user. This is more maintainable than having
 * separate functions per subject.
 * 
 * @param user - The authenticated user or null for visitors
 * @returns The built ability instance
 */
export function defineAbilityFor(user: User): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (user === null) {
    // Visitors can read all tracker data (public project)
    can("read", "Run");
    can("read", "ClassSnapshot");
  } else {
    // Authenticated users can manage all tracker data
    can("manage", "Run");
    can("manage", "ClassSnapshot");

    // You can add more granular permissions based on user properties
    // For example, if user has a role field:
    // if (user.role === "admin") {
    //   can("manage", "all");
    // }
  }

  return build();
}

/**
 * Check if a user has permission to perform an action on a subject.
 * This is a convenience wrapper around defineAbilityFor().
 * 
 * @param user - The authenticated user or null for visitors
 * @param action - The action to check (create, read, update, delete, manage)
 * @param subject - The subject/resource to check against
 * @returns boolean indicating if user has permission
 * 
 * @example
 * ```ts
 * // In a query/mutation handler:
 * if (!hasPermission(ctx.user, "create", "Run")) {
 *   throw new Error("You don't have permission to create runs");
 * }
 * ```
 */
export function hasPermission(
  user: User,
  action: Action,
  subject: Subject
): boolean {
  const ability = defineAbilityFor(user);
  return ability.can(action, subject);
}

/**
 * Throws an error if the user doesn't have permission.
 * Useful for guard clauses in mutations.
 * 
 * @param user - The authenticated user or null for visitors
 * @param action - The action to check
 * @param subject - The subject/resource to check against
 * @throws Error if user doesn't have permission
 */
export function requirePermission(
  user: User,
  action: Action,
  subject: Subject
): void {
  if (!hasPermission(user, action, subject)) {
    throw new Error(
      `Permission denied: cannot ${action} ${subject}`
    );
  }
}
