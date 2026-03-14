"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { useMutation } from "convex/react"
import { convexQuery } from "@convex-dev/react-query"
import { api } from "@convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { extractInstruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item"
import { triggerPostMoveFlash } from "@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash"
import * as liveRegion from "@atlaskit/pragmatic-drag-and-drop-live-region"
import { toast } from "sonner"
import { IconPlus } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { TreeContext, makeTreeContext } from "./features/tree-context"
import { TreeItem } from "./features/TreeItem"
import { buildTree, removeNode, insertAsLastChild } from "./features/tree-utils"
import type { TreeNode } from "./features/tree-types"

// ─── Helpers ──────────────────────────────────────────────────────────────────

type FlatFeature = {
  _id: Id<"features">
  name: string
  completeStatus: boolean
  parentId?: Id<"features">
}

function applyInstruction(
  tree: TreeNode[],
  instruction: ReturnType<typeof extractInstruction>,
  itemId: string,
  targetId: string,
): TreeNode[] {
  if (instruction?.type !== "make-child") return tree
  const item = findInTree(tree, itemId)
  if (!item) return tree
  return insertAsLastChild(removeNode(tree, itemId), targetId, item)
}

function findInTree(nodes: TreeNode[], id: string): TreeNode | undefined {
  for (const n of nodes) {
    if (n.id === id) return n
    const f = findInTree(n.children, id)
    if (f) return f
  }
}

// ─── Add Feature Form ─────────────────────────────────────────────────────────

function AddFeatureForm({ parentId, onDone }: { parentId?: Id<"features">; onDone: () => void }) {
  const [name, setName] = React.useState("")

  const createFeature = useMutation(api.roadmap.createFeature).withOptimisticUpdate(
    (localStore, args) => {
      const cur = localStore.getQuery(api.roadmap.getAllFeatures, {})
      if (!cur) return
      localStore.setQuery(api.roadmap.getAllFeatures, {}, [
        ...cur,
        { _id: `opt-${Date.now()}` as Id<"features">, _creationTime: Date.now(), name: args.name, completeStatus: false, parentId: args.parentId },
      ])
    }
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setName("")
    onDone()
    try {
      await createFeature({ name: trimmed, parentId })
    } catch {
      toast.error("Failed to create feature")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 py-1">
      <Input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && onDone()}
        placeholder="Feature name…"
        className="h-7 text-sm"
      />
      <Button type="submit" size="sm" className="h-7 text-xs shrink-0">Add</Button>
    </form>
  )
}

// ─── Features Tree ─────────────────────────────────────────────────────────────

export function FeaturesTree({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { data: allFeatures, isLoading } = useQuery(convexQuery(api.roadmap.getAllFeatures, {}))

  const moveFeature = useMutation(api.roadmap.moveFeature).withOptimisticUpdate(
    (localStore, args) => {
      const cur = localStore.getQuery(api.roadmap.getAllFeatures, {})
      if (!cur) return
      localStore.setQuery(api.roadmap.getAllFeatures, {}, cur.map((f) =>
        f._id === args.id ? { ...f, parentId: args.parentId } : f
      ))
    }
  )

  // Local state: expanded nodes + locally-reordered tree (for visual DnD)
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set())
  // Local tree override for drag-and-drop reordering (sibling order not in DB)
  const [localTree, setLocalTree] = React.useState<TreeNode[] | null>(null)

  const [addingRoot, setAddingRoot] = React.useState(false)

  const treeRef = React.useRef<TreeNode[]>([])
  const registryRef = React.useRef<Map<string, HTMLElement>>(new Map())

  // Build tree from Convex data, applying local expanded state
  const convexTree = React.useMemo(() => {
    return buildTree((allFeatures ?? []) as FlatFeature[], expandedIds)
  }, [allFeatures, expandedIds])

  // Use local tree if set (after a DnD operation), otherwise Convex tree
  const tree = localTree ?? convexTree

  // Keep ref in sync for the context's memoized getPathToItem
  treeRef.current = tree

  // Reset local tree when Convex data updates (the mutation came back)
  React.useEffect(() => {
    setLocalTree(null)
  }, [allFeatures])

  function handleToggleExpand(itemId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  async function handleMove(itemId: string, newParentId: string | undefined) {
    try {
      await moveFeature({ id: itemId as Id<"features">, parentId: newParentId as Id<"features"> | undefined })
    } catch {
      toast.error("Failed to move feature")
    }
  }

  const context = React.useMemo(
    () => makeTreeContext(treeRef, handleToggleExpand, handleMove, registryRef),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  // Monitor drops
  React.useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) =>
        source.data.uniqueContextId === context.uniqueContextId &&
        source.data.type === "tree-item",
      onDrop({ location, source }) {
        if (!location.current.dropTargets.length) return

        const itemId = source.data.id as string
        const target = location.current.dropTargets[0]
        const targetId = target.data.id as string
        const instruction = extractInstruction(target.data)

        if (instruction?.type !== "make-child") return

        // Apply locally for instant visual feedback
        setLocalTree(applyInstruction(treeRef.current, instruction, itemId, targetId))
        // Expand the target so the dropped item is visible
        setExpandedIds((prev) => new Set([...prev, targetId]))
        // Persist: the new parent is the target
        void handleMove(itemId, targetId)

        // Post-move flash
        setTimeout(() => {
          const element = registryRef.current.get(itemId)
          if (element) triggerPostMoveFlash(element)
        }, 0)
      },
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context])

  React.useEffect(() => {
    return () => { liveRegion.cleanup() }
  }, [])

  return (
    <TreeContext.Provider value={context}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Features</h2>
          {isAuthenticated && (
            <button
              onClick={() => setAddingRoot(true)}
              aria-label="New feature"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <IconPlus className="size-4" />
            </button>
          )}
        </div>

        {isLoading && <div className="text-sm text-muted-foreground py-4 text-center">Loading…</div>}

        {!isLoading && tree.length === 0 && !addingRoot && (
          <div className="text-sm text-muted-foreground py-6 text-center border border-dashed rounded-lg">
            No features yet.{isAuthenticated ? " Create the first one." : ""}
          </div>
        )}

        <div className="flex flex-col">
          {tree.map((item, idx) => (
            <TreeItem
              key={item.id}
              item={item}
              level={0}
              index={idx}
              siblings={tree.length}
            />
          ))}
        </div>

        {addingRoot && (
          <AddFeatureForm onDone={() => setAddingRoot(false)} />
        )}
      </div>
    </TreeContext.Provider>
  )
}
