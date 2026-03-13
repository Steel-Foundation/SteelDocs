"use client"

import * as React from "react"
import { Toaster, toast } from "sonner"
import { useQuery } from "@tanstack/react-query"
import { useMutation } from "convex/react"
import { convexQuery } from "@convex-dev/react-query"
import { api } from "@convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import { ThemeProvider } from "@/components/tracker/ThemeProvider"
import { ConvexClientProvider } from "@/components/tracker/ConvexClientProvider"
import { TrackerNavbar } from "@/components/tracker/TrackerNavbar"
import { FeaturesTree } from "@/components/tracker/FeaturesTree"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { IconPlus, IconTrash, IconMap, IconListCheck, IconX } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { MentionInput, MentionChip, type MentionFeature } from "@/components/tracker/MentionInput"

// ─── Types ────────────────────────────────────────────────────────────────────

type Feature = {
  _id: Id<"features">
  _creationTime: number
  name: string
  completeStatus: boolean
}

type RoadmapItem = {
  _id: Id<"roadmap_items">
  _creationTime: number
  name: string
  completeStatus: boolean
  feature_id?: Id<"features">
  roadmap_id: Id<"roadmaps">
  order: number
  feature: Feature | null
}

type Roadmap = {
  _id: Id<"roadmaps">
  _creationTime: number
  name: string
  userId: string
}

// ─── New Roadmap Form ─────────────────────────────────────────────────────────

function NewRoadmapForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = React.useState("")

  const createRoadmap = useMutation(api.roadmap.createRoadmap).withOptimisticUpdate(
    (localStore, args) => {
      const roadmaps = localStore.getQuery(api.roadmap.getRoadmaps, {})
      if (roadmaps === undefined) return
      localStore.setQuery(api.roadmap.getRoadmaps, {}, [
        ...roadmaps,
        { _id: `opt-${Date.now()}` as Id<"roadmaps">, _creationTime: Date.now(), name: args.name, userId: "" },
      ])
    }
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    try {
      await createRoadmap({ name: name.trim() })
      setName("")
      onDone()
    } catch {
      toast.error("Failed to create roadmap")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-2">
      <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Roadmap name…" className="h-8 text-sm" />
      <Button type="submit" size="sm" className="h-8 shrink-0">Add</Button>
      <Button type="button" variant="ghost" size="sm" className="h-8 shrink-0" onClick={onDone}>
        <IconX className="size-4" />
      </Button>
    </form>
  )
}

// ─── New Item Form ────────────────────────────────────────────────────────────

function NewItemForm({ roadmapId, onDone }: { roadmapId: Id<"roadmaps">; onDone: () => void }) {
  const { data: features } = useQuery(convexQuery(api.roadmap.getAllFeatures, {}))
  const createItem = useMutation(api.roadmap.createRoadmapItem).withOptimisticUpdate(
    (localStore, args) => {
      const items = localStore.getQuery(api.roadmap.getRoadmapItems, { roadmapId: args.roadmap_id })
      if (items === undefined) return
      localStore.setQuery(api.roadmap.getRoadmapItems, { roadmapId: args.roadmap_id }, [
        ...items,
        {
          _id: `opt-${Date.now()}` as Id<"roadmap_items">,
          _creationTime: Date.now(),
          name: args.name,
          completeStatus: false,
          feature_id: undefined,
          roadmap_id: args.roadmap_id,
          order: (items[items.length - 1]?.order ?? -1) + 1,
          feature: null,
        } as RoadmapItem,
      ])
    }
  )
  const createFeature = useMutation(api.roadmap.createFeature)

  async function handleSubmit(serialized: string) {
    try {
      await createItem({ roadmap_id: roadmapId, name: serialized })
      onDone()
    } catch {
      toast.error("Failed to create item")
    }
  }

  async function handleCreateFeature(name: string): Promise<Id<"features">> {
    return await createFeature({ name })
  }

  return (
    <div className="flex items-start gap-2 p-3 border rounded-lg bg-muted/30">
      <MentionInput
        features={(features ?? []) as MentionFeature[]}
        onCreateFeature={handleCreateFeature}
        onSubmit={handleSubmit}
        placeholder="Item name… (type # to mention a feature)"
        autoFocus
        className="flex-1"
      />
      <Button type="button" variant="ghost" size="sm" className="h-9 shrink-0" onClick={onDone}>
        <IconX className="size-4" />
      </Button>
    </div>
  )
}

// ─── Roadmap Items Panel ──────────────────────────────────────────────────────

function renderMentionedName(
  name: string,
  featuresMap: Map<string, MentionFeature>,
  faded: boolean,
): React.ReactNode {
  const regex = /<#([^>]+)>/g
  const nodes: React.ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  while ((m = regex.exec(name)) !== null) {
    if (m.index > last) nodes.push(name.slice(last, m.index))
    const feature = featuresMap.get(m[1])
    nodes.push(<MentionChip key={m.index} name={feature?.name ?? m[1]} className="mx-0.5" />)
    last = m.index + m[0].length
  }
  if (last < name.length) nodes.push(name.slice(last))
  return (
    <span className={cn("text-sm flex-1 flex flex-wrap items-center gap-x-0.5 gap-y-0.5", faded && "line-through text-muted-foreground")}>
      {nodes}
    </span>
  )
}

function RoadmapItemsPanel({ roadmap, isOwner, onRoadmapDeleted }: {
  roadmap: Roadmap
  isOwner: boolean
  onRoadmapDeleted: () => void
}) {
  const [addingItem, setAddingItem] = React.useState(false)
  const { data: items, isLoading } = useQuery(convexQuery(api.roadmap.getRoadmapItems, { roadmapId: roadmap._id }))
  const { data: allFeatures } = useQuery(convexQuery(api.roadmap.getAllFeatures, {}))
  const featuresMap = React.useMemo(
    () => new Map((allFeatures ?? []).map((f) => [f._id, f as MentionFeature])),
    [allFeatures],
  )

  const toggleItem = useMutation(api.roadmap.toggleRoadmapItem).withOptimisticUpdate(
    (localStore, { id }) => {
      const items = localStore.getQuery(api.roadmap.getRoadmapItems, { roadmapId: roadmap._id })
      if (items === undefined) return
      localStore.setQuery(
        api.roadmap.getRoadmapItems,
        { roadmapId: roadmap._id },
        items.map((item) => item._id === id ? { ...item, completeStatus: !item.completeStatus } : item)
      )
    }
  )

  const deleteItem = useMutation(api.roadmap.deleteRoadmapItem).withOptimisticUpdate(
    (localStore, { id }) => {
      const items = localStore.getQuery(api.roadmap.getRoadmapItems, { roadmapId: roadmap._id })
      if (items === undefined) return
      localStore.setQuery(
        api.roadmap.getRoadmapItems,
        { roadmapId: roadmap._id },
        items.filter((item) => item._id !== id)
      )
    }
  )

  const deleteRoadmap = useMutation(api.roadmap.deleteRoadmap).withOptimisticUpdate(
    (localStore, { id }) => {
      const roadmaps = localStore.getQuery(api.roadmap.getRoadmaps, {})
      if (roadmaps === undefined) return
      localStore.setQuery(api.roadmap.getRoadmaps, {}, roadmaps.filter((r) => r._id !== id))
    }
  )

  const completed = (items ?? []).filter((i) => i.completeStatus).length
  const total = (items ?? []).length

  async function handleDeleteRoadmap() {
    if (!confirm(`Delete roadmap "${roadmap.name}" and all its items?`)) return
    try {
      await deleteRoadmap({ id: roadmap._id })
      onRoadmapDeleted()
    } catch {
      toast.error("Failed to delete roadmap")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{roadmap.name}</h2>
          {total > 0 && <p className="text-xs text-muted-foreground mt-0.5">{completed}/{total} completed</p>}
        </div>
        {isOwner && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setAddingItem(true)}>
              <IconPlus className="size-3.5" />
              Add item
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-destructive hover:text-destructive" onClick={handleDeleteRoadmap}>
              <IconTrash className="size-4" />
            </Button>
          </div>
        )}
      </div>

      {total > 0 && (
        <div className="w-full bg-muted rounded-full h-1.5">
          <div className="bg-primary rounded-full h-1.5 transition-all" style={{ width: `${(completed / total) * 100}%` }} />
        </div>
      )}

      {isLoading && <div className="text-sm text-muted-foreground py-6 text-center">Loading…</div>}
      {!isLoading && total === 0 && !addingItem && (
        <div className="text-sm text-muted-foreground py-8 text-center border border-dashed rounded-lg">
          No items yet.{isOwner ? " Add the first one." : ""}
        </div>
      )}

      <div className="flex flex-col gap-1">
        {(items as RoadmapItem[] | undefined ?? []).map((item) => (
          <div key={item._id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 group">
            <Checkbox
              checked={item.completeStatus}
              onCheckedChange={() => isOwner && toggleItem({ id: item._id }).catch(() => toast.error("Failed to update item"))}
              disabled={!isOwner}
              className="shrink-0"
            />
            {renderMentionedName(item.name, featuresMap, item.completeStatus)}
            {isOwner && (
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                onClick={() => deleteItem({ id: item._id }).catch(() => toast.error("Failed to delete item"))}
              >
                <IconX className="size-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {addingItem && <NewItemForm roadmapId={roadmap._id} onDone={() => setAddingItem(false)} />}
    </div>
  )
}

// ─── Roadmaps Tab ─────────────────────────────────────────────────────────────

function RoadmapsTab({ userId, isAuthenticated }: { userId: string | null; isAuthenticated: boolean }) {
  const [selectedId, setSelectedId] = React.useState<Id<"roadmaps"> | null>(null)
  const [addingRoadmap, setAddingRoadmap] = React.useState(false)
  const { data: roadmaps, isLoading } = useQuery(convexQuery(api.roadmap.getRoadmaps, {}))

  const selected = (roadmaps ?? []).find((r) => r._id === selectedId) as Roadmap | undefined

  React.useEffect(() => {
    if (roadmaps && roadmaps.length > 0 && !selectedId) {
      setSelectedId(roadmaps[0]._id)
    }
  }, [roadmaps, selectedId])

  return (
    <div className="flex gap-6 min-h-[400px]">
      <div className="w-56 shrink-0 flex flex-col gap-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Roadmaps</span>
          {isAuthenticated && (
            <button className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => setAddingRoadmap(true)}>
              <IconPlus className="size-4" />
            </button>
          )}
        </div>

        {isLoading && <div className="text-xs text-muted-foreground py-4">Loading…</div>}

        {(roadmaps ?? []).map((r) => (
          <button
            key={r._id}
            onClick={() => setSelectedId(r._id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors w-full",
              selectedId === r._id ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
            )}
          >
            <IconListCheck className="size-4 shrink-0" />
            <span className="truncate">{r.name}</span>
          </button>
        ))}

        {addingRoadmap && <NewRoadmapForm onDone={() => setAddingRoadmap(false)} />}
      </div>

      <Separator orientation="vertical" className="h-auto" />

      <div className="flex-1 min-w-0">
        {selected ? (
          <RoadmapItemsPanel
            roadmap={selected}
            isOwner={isAuthenticated && userId === selected.userId}
            onRoadmapDeleted={() => setSelectedId(null)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center text-muted-foreground">
            <IconMap className="size-10 mb-3 opacity-30" />
            <p className="text-sm">Select a roadmap to view its items</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

function RoadmapAppInner({ pathname }: { pathname: string }) {
  const { data: session } = authClient.useSession()
  const isAuthenticated = !!session?.user
  const userId = session?.user?.id ?? null

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <TrackerNavbar />
      <main className="flex flex-col pt-16 min-h-screen">
        <div className="flex flex-1 flex-col gap-2 py-4 px-3 sm:px-4 md:gap-6 md:py-6 md:px-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-2">
            <IconMap className="size-6 text-muted-foreground" />
            <h1 className="text-xl font-semibold">Roadmap</h1>
          </div>

          <Tabs defaultValue="roadmaps">
            <TabsList className="mb-6">
              <TabsTrigger value="roadmaps">Roadmaps</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>
            <TabsContent value="roadmaps">
              <RoadmapsTab userId={userId} isAuthenticated={isAuthenticated} />
            </TabsContent>
            <TabsContent value="features">
              <FeaturesTree isAuthenticated={isAuthenticated} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Toaster />
    </ThemeProvider>
  )
}

export function RoadmapApp({ pathname }: { pathname: string }) {
  return (
    <ConvexClientProvider>
      <RoadmapAppInner pathname={pathname} />
    </ConvexClientProvider>
  )
}
