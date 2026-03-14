import type { Instruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item"
import type { Id } from "@convex/_generated/dataModel"

export type { Instruction }

export type TreeNode = {
  id: Id<"features">
  name: string
  completeStatus: boolean
  isExpanded: boolean
  children: TreeNode[]
}

export type TreeAction =
  | { type: "toggle-expand"; itemId: string }
  | { type: "set-last-moved"; itemId: string | null }

export type TreeState = {
  expandedIds: Set<string>
  lastMovedId: string | null
}
