"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { useMutation } from "convex/react"
import { convexQuery } from "@convex-dev/react-query"
import { api } from "@convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import { IconChevronRight, IconPlus, IconCircleCheck, IconCircle } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type Feature = {
  _id: Id<"features">
  _creationTime: number
  name: string
  completeStatus: boolean
  parentId?: Id<"features">
}

// ─── Add Feature Form ─────────────────────────────────────────────────────────

function AddFeatureForm({ parentId, onDone }: { parentId?: Id<"features">; onDone: () => void }) {
  const [name, setName] = React.useState("")

  const createFeature = useMutation(api.roadmap.createFeature).withOptimisticUpdate(
    (localStore, args) => {
      const newFeature: Feature = {
        _id: `opt-${Date.now()}` as Id<"features">,
        _creationTime: Date.now(),
        name: args.name,
        completeStatus: false,
        parentId: args.parentId,
      }
      if (args.parentId) {
        const children = localStore.getQuery(api.roadmap.getChildFeatures, { featureId: args.parentId })
        if (children === undefined) return
        localStore.setQuery(api.roadmap.getChildFeatures, { featureId: args.parentId }, [...children, newFeature])
      } else {
        const roots = localStore.getQuery(api.roadmap.getRootFeatures, {})
        if (roots === undefined) return
        localStore.setQuery(api.roadmap.getRootFeatures, {}, [...roots, newFeature])
      }
    }
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    try {
      await createFeature({ name: name.trim(), parentId })
      setName("")
      onDone()
    } catch {
      toast.error("Failed to create feature")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-1">
      <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Feature name…" className="h-7 text-sm" />
      <Button type="submit" size="sm" className="h-7 text-xs">Add</Button>
      <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={onDone}>Cancel</Button>
    </form>
  )
}

// ─── Feature Node ─────────────────────────────────────────────────────────────

function FeatureNode({ feature, isAuthenticated, depth = 0 }: {
  feature: Feature
  isAuthenticated: boolean
  depth?: number
}) {
  const [open, setOpen] = React.useState(false)
  const [addingChild, setAddingChild] = React.useState(false)

  const { data: children } = useQuery({
    ...convexQuery(api.roadmap.getChildFeatures, { featureId: feature._id }),
    enabled: open,
  })

  return (
    <div className={cn("pl-0", depth > 0 && "pl-4 border-l border-border ml-2")}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center gap-1 py-0.5 group">
          <CollapsibleTrigger asChild>
            <button className={cn(
              "flex items-center justify-center size-5 rounded text-muted-foreground hover:text-foreground transition-colors",
              !open && "opacity-50"
            )}>
              <IconChevronRight className={cn("size-3.5 transition-transform", open && "rotate-90")} />
            </button>
          </CollapsibleTrigger>

          {feature.completeStatus
            ? <IconCircleCheck className="size-4 text-green-500 shrink-0" />
            : <IconCircle className="size-4 text-muted-foreground shrink-0" />
          }

          <span className={cn("text-sm flex-1", feature.completeStatus && "line-through text-muted-foreground")}>
            {feature.name}
          </span>

          {isAuthenticated && (
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
              onClick={() => { setOpen(true); setAddingChild(true) }}
              title="Add child feature"
            >
              <IconPlus className="size-3.5" />
            </button>
          )}
        </div>

        <CollapsibleContent>
          <div className="mt-0.5">
            {open && children && (children as Feature[]).map((child) => (
              <FeatureNode key={child._id} feature={child} isAuthenticated={isAuthenticated} depth={depth + 1} />
            ))}
            {addingChild && (
              <div className="pl-4 border-l border-border ml-2 mt-1">
                <AddFeatureForm parentId={feature._id} onDone={() => setAddingChild(false)} />
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

// ─── Features Tree ────────────────────────────────────────────────────────────

export function FeaturesTree({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [addingRoot, setAddingRoot] = React.useState(false)
  const { data: rootFeatures, isLoading } = useQuery(convexQuery(api.roadmap.getRootFeatures, {}))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Features</h2>
        {isAuthenticated && (
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => setAddingRoot(true)}>
            <IconPlus className="size-3.5" />
            New Feature
          </Button>
        )}
      </div>

      {isLoading && <div className="text-sm text-muted-foreground py-4 text-center">Loading…</div>}

      {rootFeatures && rootFeatures.length === 0 && !addingRoot && (
        <div className="text-sm text-muted-foreground py-6 text-center border border-dashed rounded-lg">
          No features yet.{isAuthenticated ? " Create the first one." : ""}
        </div>
      )}

      <div className="flex flex-col">
        {(rootFeatures ?? []).map((feature) => (
          <FeatureNode key={feature._id} feature={feature as Feature} isAuthenticated={isAuthenticated} />
        ))}
      </div>

      {addingRoot && <AddFeatureForm onDone={() => setAddingRoot(false)} />}
    </div>
  )
}
