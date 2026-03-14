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
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { IconPlus, IconTrash, IconMap, IconX, IconSend, IconSearch, IconTrashX } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
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

type RoadmapPreviewItem = {
  _id: Id<"roadmap_items">
  name: string
  completeStatus: boolean
}

type RoadmapPreview = Roadmap & {
  previewItems: RoadmapPreviewItem[]
  user: { name: string; image?: string | null } | null
}

function stripMentions(name: string) {
  return name.replace(/<#[^>]+>/g, "").trim()
}

// ─── Roadmap Card ─────────────────────────────────────────────────────────────

function RoadmapCard({ roadmap, isSelected, onClick, className }: {
  roadmap: RoadmapPreview
  isSelected: boolean
  onClick: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col w-48 h-32 rounded-xl text-left transition-colors border overflow-hidden p-3 shrink-0",
        className,
        isSelected
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card hover:bg-muted/60 border-border/50"
      )}
    >
      {/* Title */}
      <span className="text-sm font-semibold truncate mb-2 leading-snug shrink-0">{roadmap.name}</span>

      {/* Preview items */}
      <div className="flex flex-col gap-0.5 overflow-hidden">
        {roadmap.previewItems.map((item) => (
          <div key={item._id} className="flex items-center gap-1.5">
            <div className={cn(
              "size-2 rounded-xs border shrink-0",
              item.completeStatus
                ? isSelected ? "bg-primary-foreground border-primary-foreground" : "bg-primary border-primary"
                : isSelected ? "border-primary-foreground/40" : "border-muted-foreground/40"
            )} />
            <span className={cn(
              "text-xs leading-none truncate",
              isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
            )}>
              {stripMentions(item.name) || "…"}
            </span>
          </div>
        ))}
      </div>

      {/* User info — absolute bottom-left, overlaid on items */}
      {roadmap.user && (
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-background/75 backdrop-blur-sm rounded px-1.5 py-0.5">
          {roadmap.user.image ? (
            <img src={roadmap.user.image} alt={roadmap.user.name} className="size-3.5 rounded-full shrink-0 object-cover" />
          ) : (
            <div className="size-3.5 rounded-full bg-muted-foreground/30 flex items-center justify-center shrink-0 text-[8px] font-semibold">
              {roadmap.user.name[0]}
            </div>
          )}
          <span className="text-xs text-foreground/70 truncate max-w-24">{roadmap.user.name}</span>
        </div>
      )}
    </button>
  )
}

// ─── My Roadmaps Section ──────────────────────────────────────────────────────

function MyRoadmapsSection({ roadmaps, selectedId, onSelect }: {
  roadmaps: RoadmapPreview[]
  selectedId: Id<"roadmaps"> | null
  onSelect: (id: Id<"roadmaps">) => void
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [name, setName] = React.useState("")

  const createRoadmap = useMutation(api.roadmap.createRoadmap).withOptimisticUpdate(
    (localStore, args) => {
      const cur = localStore.getQuery(api.roadmap.getAllRoadmapPreviews, {})
      if (cur === undefined) return
      localStore.setQuery(api.roadmap.getAllRoadmapPreviews, {}, [
        ...cur,
        { _id: `opt-${Date.now()}` as Id<"roadmaps">, _creationTime: Date.now(), name: args.name, userId: "", previewItems: [], user: null },
      ])
    }
  )

  const deleteRoadmap = useMutation(api.roadmap.deleteRoadmap).withOptimisticUpdate(
    (localStore, { id }) => {
      const cur = localStore.getQuery(api.roadmap.getAllRoadmapPreviews, {})
      if (!cur) return
      localStore.setQuery(api.roadmap.getAllRoadmapPreviews, {}, cur.filter((r) => r._id !== id))
    }
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setName("")
    setDialogOpen(false)
    try {
      const id = await createRoadmap({ name: trimmed })
      onSelect(id)
    } catch {
      toast.error("Failed to create roadmap")
    }
  }

  async function handleDelete(id: Id<"roadmaps">) {
    try {
      await deleteRoadmap({ id })
    } catch {
      toast.error("Failed to delete roadmap")
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">My roadmaps</span>
        <button
          onClick={() => setDialogOpen(true)}
          aria-label="New roadmap"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconPlus className="size-4" />
        </button>
      </div>

      <div className="flex items-start gap-3 overflow-x-auto pb-2">
        {roadmaps.map((r) => (
          <div key={r._id} className="relative group shrink-0">
            <RoadmapCard
              roadmap={r}
              isSelected={selectedId === r._id}
              onClick={() => onSelect(r._id)}
            />
            <button
              aria-label="Delete roadmap"
              onClick={() => handleDelete(r._id)}
              className="absolute top-1.5 right-1.5 size-5 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            >
              <IconTrashX className="size-3" />
            </button>
          </div>
        ))}
        {roadmaps.length === 0 && (
          <p className="text-sm text-muted-foreground py-2">No roadmaps yet — create one ↗</p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setName("") }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New roadmap</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Roadmap name…"
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={!name.trim()}>Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── All Roadmaps Grid ────────────────────────────────────────────────────────

function AllRoadmapsGrid({ roadmaps, selectedId, onSelect, userId }: {
  roadmaps: RoadmapPreview[]
  selectedId: Id<"roadmaps"> | null
  onSelect: (id: Id<"roadmaps">) => void
  userId: string | null
}) {
  const [search, setSearch] = React.useState("")
  const [filter, setFilter] = React.useState<"all" | "mine">("all")

  const filtered = roadmaps.filter((r) => {
    if (filter === "mine" && r.userId !== userId) return false
    return r.name.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="pl-8 h-8 text-sm"
          />
        </div>
        {userId && (
          <div className="flex rounded-lg border overflow-hidden shrink-0">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors",
                filter === "all" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter("mine")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors border-l",
                filter === "mine" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
              )}
            >
              Mine
            </button>
          </div>
        )}
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No roadmaps found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((r) => (
            <RoadmapCard
              key={r._id}
              roadmap={r}
              isSelected={selectedId === r._id}
              onClick={() => onSelect(r._id)}
              className="w-full shrink-0"
            />
          ))}
        </div>
      )}
    </div>
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
  const [savingIds, setSavingIds] = React.useState<Set<string>>(new Set())
  const activeMentionRef = React.useRef<MentionInputHandle>(null)

  // Stable refs so cleanup functions can read latest state without stale closures
  const activeIdRef = React.useRef(activeId)
  const listRef = React.useRef<RoadmapItem[]>([])

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
        {
          _id: `opt-${Date.now()}` as Id<"roadmap_items">, _creationTime: Date.now(), name: args.name,
          completeStatus: false, feature_id: undefined, roadmap_id: args.roadmap_id,
          order: (cur[cur.length - 1]?.order ?? -1) + 1, feature: null
        } as RoadmapItem,
      ])
    }
  )

  const createFeature = useMutation(api.roadmap.createFeature).withOptimisticUpdate(
    (localStore, args) => {
      const cur = localStore.getQuery(api.roadmap.getAllFeatures, {})
      if (!cur) return
      localStore.setQuery(api.roadmap.getAllFeatures, {}, [
        ...cur,
        {
          _id: `opt-${Date.now()}` as Id<"features">, _creationTime: Date.now(),
          name: args.name, completeStatus: false, parentId: undefined
        },
      ])
    }
  )

  const deleteRoadmap = useMutation(api.roadmap.deleteRoadmap).withOptimisticUpdate(
    (localStore, { id }) => {
      const cur = localStore.getQuery(api.roadmap.getAllRoadmapPreviews, {})
      if (!cur) return
      localStore.setQuery(api.roadmap.getAllRoadmapPreviews, {}, cur.filter((r) => r._id !== id))
    }
  )

  const list = (items ?? []) as RoadmapItem[]
  const completed = list.filter((i) => i.completeStatus).length
  const total = list.length

  // Keep refs in sync every render so stale-closure-free callbacks can read latest values
  activeIdRef.current = activeId
  listRef.current = list

  async function handleCreateFeature(name: string): Promise<Id<"features">> {
    return await createFeature({ name })
  }

  async function saveItem(id: Id<"roadmap_items">, name: string) {
    setSavingIds((prev) => new Set([...prev, id]))
    try {
      await updateItem({ id, name })
    } catch {
      toast.error("Failed to update item")
    } finally {
      setSavingIds((prev) => { const next = new Set(prev); next.delete(id); return next })
    }
  }

  function saveCurrentIfChanged() {
    const id = activeIdRef.current
    if (id === "new") return
    const currentValue = activeMentionRef.current?.getValue()
    const current = listRef.current.find((i) => i._id === id)
    if (current && currentValue !== undefined && currentValue !== current.name) {
      void saveItem(current._id, currentValue)
    }
  }

  // Save pending changes when the user switches to a different roadmap
  React.useEffect(() => {
    return () => { saveCurrentIfChanged() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roadmap._id])

  // Reset active selection when switching roadmaps
  React.useEffect(() => {
    setActiveId("new")
  }, [roadmap._id])

  function navigateTo(idx: number) {
    if (idx < 0) return
    saveCurrentIfChanged()
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
                  void saveItem(item._id, name)
                  navigateTo(itemIdx + 1)
                }}
                onNavigateUp={() => navigateTo(itemIdx - 1)}
                onNavigateDown={() => navigateTo(itemIdx + 1)}
                className={CONTENT}
              />
            ) : (
              <div
                className={cn(CONTENT, "cursor-text", item.completeStatus && "text-muted-foreground")}
                onClick={() => {
                  if (!isOwner) return
                  saveCurrentIfChanged()
                  setActiveId(item._id)
                  requestAnimationFrame(() => activeMentionRef.current?.focus())
                }}
              >
                {mentionNodes(item.name, featuresMap, item.completeStatus)}
              </div>
            )}
            {isOwner && (
              savingIds.has(item._id) ? (
                <span className="shrink-0 size-3.5 block animate-spin rounded-full border-2 border-muted-foreground/25 border-t-muted-foreground/70" />
              ) : (
                <button
                  aria-label="Delete item"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => deleteItem({ id: item._id }).catch(() => toast.error("Failed to delete item"))}
                >
                  <IconX className="size-3.5" />
                </button>
              )
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
  const isMobile = useIsMobile()
  const { data: roadmaps, isLoading } = useQuery(convexQuery(api.roadmap.getAllRoadmapPreviews, {}))

  const allRoadmaps = (roadmaps ?? []) as RoadmapPreview[]
  const myRoadmaps = isAuthenticated ? allRoadmaps.filter((r) => r.userId === userId) : []
  const selected = allRoadmaps.find((r) => r._id === selectedId) ?? null

  function handleSelect(id: Id<"roadmaps">) {
    setSelectedId((prev) => (prev === id ? null : id))
  }

  const panel = selected ? (
    <RoadmapItemsPanel
      roadmap={selected}
      isOwner={isAuthenticated && userId === selected.userId}
      onRoadmapDeleted={() => setSelectedId(null)}
    />
  ) : null

  return (
    <div className="flex flex-col gap-6">
      {/* My roadmaps */}
      {isAuthenticated && (
        <>
          <MyRoadmapsSection roadmaps={myRoadmaps} selectedId={selectedId} onSelect={handleSelect} />
          <Separator />
        </>
      )}

      {isLoading && <div className="text-sm text-muted-foreground py-4 text-center">Loading…</div>}

      {/* Desktop : side-by-side */}
      <div className="hidden md:flex gap-6 items-start">
        <div className="w-[420px] shrink-0">
          <AllRoadmapsGrid
            roadmaps={allRoadmaps}
            selectedId={selectedId}
            onSelect={handleSelect}
            userId={userId}
          />
        </div>
        <div className="flex-1 min-w-0">
          {panel ?? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
              <IconMap className="size-10 mb-3 opacity-30" />
              <p className="text-sm">Select a roadmap</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile : grille + bottom sheet */}
      <div className="md:hidden">
        <AllRoadmapsGrid
          roadmaps={allRoadmaps}
          selectedId={selectedId}
          onSelect={handleSelect}
          userId={userId}
        />
      </div>
      <Drawer open={isMobile && !!selected} onOpenChange={(open) => { if (!open) setSelectedId(null) }}>
        <DrawerContent>
          <div className="px-4 pb-8 pt-2 overflow-y-auto max-h-[85vh]">
            {panel}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

function RoadmapAppInner({ pathname }: { pathname: string }) {
  const { data: session } = authClient.useSession()
  const isAuthenticated = !!session?.user
  const userId = session?.user?.id ?? null
  const isMobile = useIsMobile()

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <TrackerNavbar />

      {isMobile ? (
        /* ── Mobile: tabs ──────────────────────────────────────────────── */
        <main className="flex flex-col pt-16 min-h-screen">
          <div className="flex flex-1 flex-col gap-2 py-4 px-3">
            <div className="flex items-center gap-3 mb-2">
              <IconMap className="size-6 text-muted-foreground" />
              <h1 className="text-xl font-semibold">Roadmap</h1>
            </div>
            <Tabs defaultValue="roadmaps">
              <TabsList className="mb-4">
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
      ) : (
        /* ── Desktop: resizable panels ─────────────────────────────────── */
        <main className="h-screen pt-16 flex flex-col overflow-hidden">
          <div className="flex-1 flex justify-center overflow-hidden">
            <div className="w-full max-w-7xl mx-auto flex flex-col overflow-hidden">
              <ResizablePanelGroup direction="horizontal" className="flex-1">
                <ResizablePanel defaultSize={75} minSize="40%">
                  <div className="h-full overflow-y-auto py-6 px-6">
                    <div className="flex items-center gap-3 mb-6">
                      <IconMap className="size-6 text-muted-foreground" />
                      <h1 className="text-xl font-semibold">Roadmap</h1>
                    </div>
                    <RoadmapsTab userId={userId} isAuthenticated={isAuthenticated} />
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={20} minSize="17%" maxSize="35%">
                  <div className="h-full overflow-y-auto border-l py-6 px-4">
                    <FeaturesTree isAuthenticated={isAuthenticated} />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>
        </main>
      )}

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
