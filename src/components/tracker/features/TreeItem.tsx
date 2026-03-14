"use client"

import * as React from "react"
import invariant from "tiny-invariant"
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine"
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { attachInstruction, extractInstruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item"
import type { Instruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item"
import { GripVertical, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { TreeContext } from "./tree-context"
import { DropIndicator } from "./DropIndicator"
import type { TreeNode } from "./tree-types"

const INDENT = 20 // px per level — must match DropIndicator.tsx

export function TreeItem({
  item,
  level,
  index,
  siblings,
}: {
  item: TreeNode
  level: number
  index: number
  siblings: number
}) {
  const { uniqueContextId, onToggleExpand, registerElement } = React.useContext(TreeContext)

  const rowRef = React.useRef<HTMLDivElement>(null)
  const dragHandleRef = React.useRef<HTMLButtonElement>(null)

  const [isDragging, setIsDragging] = React.useState(false)
  const [instruction, setInstruction] = React.useState<Instruction | null>(null)

  const hasChildren = item.children.length > 0

  React.useEffect(() => {
    const el = rowRef.current
    if (!el) return
    return registerElement(item.id, el)
  }, [item.id, registerElement])

  React.useEffect(() => {
    const element = rowRef.current
    const dragHandle = dragHandleRef.current
    invariant(element)
    invariant(dragHandle)

    return combine(
      draggable({
        element: dragHandle,
        getInitialData: () => ({ id: item.id, type: "tree-item", uniqueContextId }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      dropTargetForElements({
        element,
        canDrop: ({ source }) =>
          source.data.uniqueContextId === uniqueContextId &&
          source.data.type === "tree-item" &&
          source.data.id !== item.id,
        getData: ({ input, element }) => {
          const data = { id: item.id, type: "tree-item", uniqueContextId }
          return attachInstruction(data, {
            input,
            element,
            currentLevel: level,
            indentPerLevel: INDENT,
            // only "make-child" is meaningful since we have no ordering
            mode: hasChildren && item.isExpanded ? "expanded" : index === siblings - 1 ? "last-in-group" : "standard",
            block: ["reorder-above", "reorder-below", "reparent"],
          })
        },
        onDrag: ({ self }) => setInstruction(extractInstruction(self.data)),
        onDragLeave: () => setInstruction(null),
        onDrop: () => setInstruction(null),
      }),
    )
  }, [item.id, item.isExpanded, level, index, siblings, hasChildren, uniqueContextId])

  return (
    <div className={cn(isDragging && "opacity-40")}>
      {/* Row */}
      <div
        ref={rowRef}
        className="relative flex items-center border-b border-border/30 group"
        style={{ paddingLeft: level * INDENT }}
      >
        {/* Drag handle */}
        <button
          ref={dragHandleRef}
          tabIndex={-1}
          aria-label="Drag to reparent"
          className="opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity text-muted-foreground shrink-0 touch-none cursor-grab p-1.5"
        >
          <GripVertical className="size-3.5" />
        </button>

        {/* Chevron expand toggle */}
        <button
          tabIndex={-1}
          onClick={() => onToggleExpand(item.id)}
          className={cn(
            "p-1 shrink-0 text-muted-foreground transition-colors",
            hasChildren ? "hover:text-foreground" : "pointer-events-none opacity-0",
          )}
        >
          <ChevronRight
            className={cn("size-3.5 transition-transform duration-150", item.isExpanded && hasChildren && "rotate-90")}
          />
        </button>

        {/* Name */}
        <span
          className={cn(
            "flex-1 py-2.5 text-sm",
            item.completeStatus && "line-through text-muted-foreground",
          )}
        >
          {item.name}
        </span>

        {/* Completed badge */}
        {item.completeStatus && (
          <span className="shrink-0 mr-2 text-[10px] font-medium text-green-600 dark:text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">
            Done
          </span>
        )}

        {instruction && <DropIndicator instruction={instruction} />}
      </div>

      {/* Children */}
      {item.isExpanded && hasChildren && (
        <div>
          {item.children.map((child, idx) => (
            <TreeItem
              key={child.id}
              item={child}
              level={level + 1}
              index={idx}
              siblings={item.children.length}
            />
          ))}
        </div>
      )}
    </div>
  )
}
