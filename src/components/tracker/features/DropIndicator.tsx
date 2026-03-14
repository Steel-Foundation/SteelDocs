import type { Instruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item"

const INDENT = 20 // must match TreeItem.tsx

export function DropIndicator({ instruction }: { instruction: Instruction }) {
  if (instruction.type !== "make-child") return null

  const left = (instruction.currentLevel + 1) * INDENT

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0"
      style={{ top: "100%", left, zIndex: 10 }}
    >
      <div className="relative h-px bg-primary">
        <div className="absolute -left-1 -top-1 size-2 rounded-full bg-primary" />
      </div>
    </div>
  )
}
