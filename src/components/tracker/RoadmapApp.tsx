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
import { IconPlus, IconTrash, IconMap, IconListCheck, IconX, IconSend } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { MentionInput, MentionChip, type MentionFeature, type MentionInputHandle } from "@/components/tracker/MentionInput"

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


// ─── Roadmap Items Panel ──────────────────────────────────────────────────────

// Returns raw nodes — the parent div owns layout and sizing.
// Uses readOnly inputs (same element as edit mode) so text renders identically in both states.
function mentionNodes(
  name: string,
  featuresMap: Map<string, MentionFeature>,
  faded: boolean,
): React.ReactNode[] {
  const regex = /<#([^>]+)>/g
  const nodes: React.ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  const inputClass = cn(
    "outline-none bg-transparent m-0 p-0 text-sm leading-none h-[1em] min-w-px [field-sizing:content] pointer-events-none",
    faded && "line-through text-muted-foreground",
  )
  while ((m = regex.exec(name)) !== null) {
    if (m.index > last) nodes.push(<input key={`t${m.index}`} readOnly tabIndex={-1} value={name.slice(last, m.index)} className={inputClass} />)
    nodes.push(<MentionChip key={m.index} name={featuresMap.get(m[1])?.name ?? m[1]} />)
    last = m.index + m[0].length
  }
  if (last < name.length) nodes.push(<input key="t-end" readOnly tabIndex={-1} value={name.slice(last)} className={inputClass} />)
  return nodes
}

function RoadmapItemsPanel({ roadmap, isOwner, onRoadmapDeleted }: {
  roadmap: Roadmap
  isOwner: boolean
  onRoadmapDeleted: () => void
}) {
  const [activeId, setActiveId] = React.useState<Id<"roadmap_items"> | "new">("new")
  const [isCreatingFeature, setIsCreatingFeature] = React.useState(false)
  const activeMentionRef = React.useRef<MentionInputHandle>(null)

  const { data: items, isLoading } = useQuery(convexQuery(api.roadmap.getRoadmapItems, { roadmapId: roadmap._id }))
  const { data: allFeatures } = useQuery(convexQuery(api.roadmap.getAllFeatures, {}))
  const featuresMap = React.useMemo(
    () => new Map((allFeatures ?? []).map((f) => [f._id, f as MentionFeature])),
    [allFeatures],
  )

  const toggleItem = useMutation(api.roadmap.toggleRoadmapItem).withOptimisticUpdate(
    (localStore, { id }) => {
      const cur = localStore.getQuery(api.roadmap.getRoadmapItems, { roadmapId: roadmap._id })
      if (!cur) return
      localStore.setQuery(api.roadmap.getRoadmapItems, { roadmapId: roadmap._id },
        cur.map((item) => item._id === id ? { ...item, completeStatus: !item.completeStatus } : item))
    }
  )

  const deleteItem = useMutation(api.roadmap.deleteRoadmapItem).withOptimisticUpdate(
    (localStore, { id }) => {
      const cur = localStore.getQuery(api.roadmap.getRoadmapItems, { roadmapId: roadmap._id })
      if (!cur) return
      localStore.setQuery(api.roadmap.getRoadmapItems, { roadmapId: roadmap._id }, cur.filter((i) => i._id !== id))
    }
  )

  const updateItem = useMutation(api.roadmap.updateRoadmapItem).withOptimisticUpdate(
    (localStore, args) => {
      const cur = localStore.getQuery(api.roadmap.getRoadmapItems, { roadmapId: roadmap._id })
      if (!cur) return
      localStore.setQuery(api.roadmap.getRoadmapItems, { roadmapId: roadmap._id },
        cur.map((item) => item._id === args.id ? { ...item, name: args.name ?? item.name } : item))
    }
  )

  const createItem = useMutation(api.roadmap.createRoadmapItem).withOptimisticUpdate(
    (localStore, args) => {
      const cur = localStore.getQuery(api.roadmap.getRoadmapItems, { roadmapId: args.roadmap_id })
      if (!cur) return
      localStore.setQuery(api.roadmap.getRoadmapItems, { roadmapId: args.roadmap_id }, [
        ...cur,
        { _id: `opt-${Date.now()}` as Id<"roadmap_items">, _creationTime: Date.now(), name: args.name,
          completeStatus: false, feature_id: undefined, roadmap_id: args.roadmap_id,
          order: (cur[cur.length - 1]?.order ?? -1) + 1, feature: null } as RoadmapItem,
      ])
    }
  )

  const createFeature = useMutation(api.roadmap.createFeature).withOptimisticUpdate(
    (localStore, args) => {
      const cur = localStore.getQuery(api.roadmap.getAllFeatures, {})
      if (!cur) return
      localStore.setQuery(api.roadmap.getAllFeatures, {}, [
        ...cur,
        { _id: `opt-${Date.now()}` as Id<"features">, _creationTime: Date.now(),
          name: args.name, completeStatus: false, parentId: undefined },
      ])
    }
  )

  const deleteRoadmap = useMutation(api.roadmap.deleteRoadmap).withOptimisticUpdate(
    (localStore, { id }) => {
      const cur = localStore.getQuery(api.roadmap.getRoadmaps, {})
      if (!cur) return
      localStore.setQuery(api.roadmap.getRoadmaps, {}, cur.filter((r) => r._id !== id))
    }
  )

  const list = (items ?? []) as RoadmapItem[]
  const completed = list.filter((i) => i.completeStatus).length
  const total = list.length

  async function handleCreateFeature(name: string): Promise<Id<"features">> {
    return await createFeature({ name })
  }

  function navigateTo(idx: number) {
    if (idx < 0) return
    // Auto-save if leaving an existing item
    if (activeId !== "new") {
      const currentValue = activeMentionRef.current?.getValue()
      const current = list.find((i) => i._id === activeId)
      if (current && currentValue !== undefined && currentValue !== current.name) {
        updateItem({ id: current._id, name: currentValue }).catch(() => toast.error("Failed to update item"))
      }
    }
    const newId = idx >= list.length ? "new" : list[idx]._id
    setActiveId(newId)
    requestAnimationFrame(() => activeMentionRef.current?.focus())
  }

  async function handleDeleteRoadmap() {
    if (!confirm(`Delete roadmap "${roadmap.name}" and all its items?`)) return
    try {
      await deleteRoadmap({ id: roadmap._id })
      onRoadmapDeleted()
    } catch {
      toast.error("Failed to delete roadmap")
    }
  }

  // Shared classes — all three states (unchecked / checked / editing) use this exact row
  const ROW = "flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50"
  // Content area inside the row — same for display and edit so text never shifts
  const CONTENT = "flex-1 flex flex-wrap items-center gap-x-0.5 gap-y-0.5 text-sm leading-none min-h-[26px]"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{roadmap.name}</h2>
          {total > 0 && <p className="text-xs text-muted-foreground mt-0.5">{completed}/{total} completed</p>}
        </div>
        {isOwner && (
          <Button variant="ghost" size="sm" className="h-8 text-destructive hover:text-destructive" onClick={handleDeleteRoadmap}>
            <IconTrash className="size-4" />
          </Button>
        )}
      </div>

      {total > 0 && (
        <div className="w-full bg-muted rounded-full h-1.5">
          <div className="bg-primary rounded-full h-1.5 transition-all" style={{ width: `${(completed / total) * 100}%` }} />
        </div>
      )}

      {isLoading && <div className="text-sm text-muted-foreground py-6 text-center">Loading…</div>}

      <div className="flex flex-col gap-1">
        {list.map((item, itemIdx) => (
          <div key={item._id} className={cn(ROW, "group")}>
            <Checkbox
              checked={item.completeStatus}
              onCheckedChange={() => isOwner && toggleItem({ id: item._id }).catch(() => toast.error("Failed to update item"))}
              disabled={!isOwner}
              className="shrink-0"
            />
            {isOwner && activeId === item._id ? (
              <MentionInput
                key={item._id}
                ref={activeMentionRef}
                features={(allFeatures ?? []) as MentionFeature[]}
                onCreateFeature={handleCreateFeature}
                onPendingStateChange={setIsCreatingFeature}
                defaultValue={item.name}
                onSubmit={(name) => {
                  updateItem({ id: item._id, name }).catch(() => toast.error("Failed to update item"))
                  navigateTo(itemIdx + 1)
                }}
                onNavigateUp={() => navigateTo(itemIdx - 1)}
                onNavigateDown={() => navigateTo(itemIdx + 1)}
                className={CONTENT}
              />
            ) : (
              <div
                className={cn(CONTENT, "cursor-text", item.completeStatus && "text-muted-foreground")}
                onClick={() => isOwner && setActiveId(item._id)}
              >
                {mentionNodes(item.name, featuresMap, item.completeStatus)}
              </div>
            )}
            {isOwner && (
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => deleteItem({ id: item._id }).catch(() => toast.error("Failed to delete item"))}
              >
                <IconX className="size-3.5" />
              </button>
            )}
          </div>
        ))}

        {/* New item row — always visible for owners */}
        {isOwner && (
          <div className={ROW} onFocus={() => setActiveId("new")}>
            <Checkbox disabled className="shrink-0 opacity-30" />
            <MentionInput
              key="new"
              ref={activeId === "new" ? activeMentionRef : undefined}
              features={(allFeatures ?? []) as MentionFeature[]}
              onCreateFeature={handleCreateFeature}
              onPendingStateChange={setIsCreatingFeature}
              onSubmit={async (name) => {
                try { await createItem({ roadmap_id: roadmap._id, name }) }
                catch { toast.error("Failed to create item") }
              }}
              onNavigateUp={() => navigateTo(list.length - 1)}
              placeholder="New item…"
              autoFocus={activeId === "new"}
              className={CONTENT}
            />
            <button
              type="button"
              disabled={isCreatingFeature}
              onClick={() => activeMentionRef.current?.submit()}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isCreatingFeature
                ? <span className="block size-3.5 animate-spin rounded-full border-2 border-muted-foreground/25 border-t-muted-foreground/70" />
                : <IconSend className="size-3.5" />}
            </button>
          </div>
        )}
      </div>
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
