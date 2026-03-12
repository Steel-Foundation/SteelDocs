"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { convexQuery } from "@convex-dev/react-query"
import { api } from "@convex/_generated/api"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  IconCircleCheckFilled,
  IconCircleX,
  IconCode,
} from "@tabler/icons-react"

import { type RunMode, SourceSelector, McVersionSelector } from "@/components/tracker/TrackerApp"

// ─── Types ────────────────────────────────────────────────────────────────────

type ClassType =
  | "block" | "item" | "entity"
  | "ai_goal" | "ai_brain" | "ai_control" | "ai_pathing"
  | "other"

type ProgressFilter = "not_started" | "wip" | "implemented"

/** Shared shape returned by both classesByBranch and bestClasses queries. */
type ClassRow = {
  _id: string
  _creationTime: number
  class_name: string
  class_type: ClassType
  run_id: string
  percentage_implemented: number
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const TYPE_STYLES: Record<ClassType, string> = {
  block: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  entity: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  item: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20",
  ai_goal: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20",
  ai_brain: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20",
  ai_control: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20",
  ai_pathing: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20",
  other: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
}

const TYPE_FILTER_COLORS: Record<ClassType, string> = {
  block: "border-blue-500 text-blue-700 dark:text-blue-400",
  entity: "border-purple-500 text-purple-700 dark:text-purple-400",
  item: "border-pink-500 text-pink-700 dark:text-pink-400",
  ai_goal: "border-teal-500 text-teal-700 dark:text-teal-400",
  ai_brain: "border-teal-500 text-teal-700 dark:text-teal-400",
  ai_control: "border-teal-500 text-teal-700 dark:text-teal-400",
  ai_pathing: "border-teal-500 text-teal-700 dark:text-teal-400",
  other: "border-zinc-500 text-zinc-600 dark:text-zinc-400",
}

const TYPE_FILTER_SELECTED: Record<ClassType, string> = {
  block: "bg-blue-500 border-blue-500 text-white",
  entity: "bg-purple-500 border-purple-500 text-white",
  item: "bg-pink-500 border-pink-500 text-white",
  ai_goal: "bg-teal-500 border-teal-500 text-white",
  ai_brain: "bg-teal-500 border-teal-500 text-white",
  ai_control: "bg-teal-500 border-teal-500 text-white",
  ai_pathing: "bg-teal-500 border-teal-500 text-white",
  other: "bg-zinc-500 border-zinc-500 text-white",
}

const PROGRESS_FILTER_COLORS: Record<ProgressFilter, string> = {
  not_started: "border-zinc-400 text-zinc-500 dark:text-zinc-400",
  wip: "border-amber-500 text-amber-600 dark:text-amber-400",
  implemented: "border-green-500 text-green-600 dark:text-green-400",
}

const PROGRESS_FILTER_SELECTED: Record<ProgressFilter, string> = {
  not_started: "bg-zinc-500 border-zinc-500 text-white",
  wip: "bg-amber-500 border-amber-500 text-white",
  implemented: "bg-green-500 border-green-500 text-white",
}

// ─── Small components ─────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: ClassType }) {
  return (
    <Badge variant="outline" className={`font-mono text-xs ${TYPE_STYLES[type]}`}>
      {type.replace("_", " ")}
    </Badge>
  )
}

function ProgressCell({ pct }: { pct: number }) {
  const barColor =
    pct === 100 ? "bg-green-500" :
      pct === 0 ? "bg-muted-foreground/20" :
        "bg-amber-400"

  return (
    <div className="flex items-center gap-3 min-w-30 max-w-50">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">
        {Math.round(pct)}%
      </span>
    </div>
  )
}

// ─── Filter options ───────────────────────────────────────────────────────────

const TYPE_OPTIONS: { value: ClassType; label: string }[] = [
  { value: "block", label: "Block" },
  { value: "entity", label: "Entity" },
  { value: "item", label: "Item" },
  { value: "ai_goal", label: "AI Goal" },
  { value: "ai_brain", label: "AI Brain" },
  { value: "ai_control", label: "AI Control" },
  { value: "ai_pathing", label: "AI Pathing" },
  { value: "other", label: "Other" },
]

const PROGRESS_OPTIONS: { value: ProgressFilter; label: string }[] = [
  { value: "not_started", label: "Not started" },
  { value: "wip", label: "In progress" },
  { value: "implemented", label: "Implemented" },
]

const ITEMS_PER_PAGE = 50

// ─── Main table ───────────────────────────────────────────────────────────────

export function FeaturesTable({
  mode,
  mcVersion,
  onModeChange,
  onMcVersionChange
}: {
  mode: RunMode;
  mcVersion: string;
  onModeChange: (m: RunMode) => void;
  onMcVersionChange: (v: string) => void;
}) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(0)
  const [typeFilter, setTypeFilter] = React.useState<Set<ClassType>>(
    new Set(TYPE_OPTIONS.map((o) => o.value))
  )
  const [progressFilter, setProgressFilter] = React.useState<Set<ProgressFilter>>(new Set())
  const [selectedClassName, setSelectedClassName] = React.useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = React.useState(false)

  const toggleType = (value: ClassType) => {
    setTypeFilter((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
    setCurrentPage(0)
  }

  const toggleProgress = (value: ProgressFilter) => {
    setProgressFilter((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
    setCurrentPage(0)
  }

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  React.useEffect(() => { setCurrentPage(0) }, [mode, mcVersion])

  // Fetch classes depending on mode
  const { data: branchClasses, isPending: branchPending, isError: branchError } = useQuery(
    convexQuery(
      api.queries.classesByBranch,
      mode.type !== "all" ? { branch: mode.branch, mc_version: mcVersion } : "skip"
    )
  )
  const { data: allClasses, isPending: allPending, isError: allError } = useQuery(
    convexQuery(
      api.queries.bestClasses,
      mode.type === "all" ? { mc_version: mcVersion } : "skip"
    )
  )

  const rawClasses = (mode.type === "all" ? allClasses : branchClasses) as ClassRow[] | undefined
  const isLoading = mode.type === "all" ? allPending : branchPending
  const isError = mode.type === "all" ? allError : branchError

  const filtered = React.useMemo(() => {
    let result = rawClasses ?? []
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      result = result.filter((c) => c.class_name.toLowerCase().includes(q))
    }
    if (typeFilter.size < TYPE_OPTIONS.length) {
      result = result.filter((c) => typeFilter.has(c.class_type as ClassType))
    }
    if (progressFilter.size > 0) {
      result = result.filter((c) => {
        const p = c.percentage_implemented
        if (progressFilter.has("not_started") && p === 0) return true
        if (progressFilter.has("wip") && p > 0 && p < 100) return true
        if (progressFilter.has("implemented") && p === 100) return true
        return false
      })
    }
    return result
  }, [rawClasses, debouncedSearch, typeFilter, progressFilter])

  const totalCount = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE))
  const paginated = filtered.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE)

  if (isLoading) return <FeaturesTableSkeleton />

  if (isError) return (
    <div className="flex flex-col items-center justify-center border rounded-lg py-24 text-center bg-muted/20">
      <p className="text-muted-foreground">Unable to fetch classes. Please try again later.</p>
    </div>
  )

  return (
    <>
      <div className="flex flex-col md:flex-row gap-6 md:items-start">
        {/* Left: filters */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-4 md:sticky md:top-20">
          <p className="text-sm text-muted-foreground mb-3 opacity-0">easter egg</p>
          <div className="flex gap-2 w-full">
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Branch / PR</label>
              <div className="[&>button]:w-full [&>button]:min-w-0">
                <SourceSelector mode={mode} onModeChange={onModeChange} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5 flex-[0.7] min-w-0">
              <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Version</label>
              <div className="[&>button]:w-full [&>button]:min-w-0">
                <McVersionSelector mcVersion={mcVersion} onMcVersionChange={onMcVersionChange} />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Search</label>
            <input
              type="text"
              placeholder="Feature name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full px-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Type <span className="font-normal opacity-60">(click to select)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TYPE_OPTIONS.map((opt) => {
                const active = typeFilter.has(opt.value)
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleType(opt.value)}
                    className={[
                      "rounded-full px-2.5 py-0.5 text-xs font-medium border-2 transition-all cursor-pointer select-none",
                      active
                        ? TYPE_FILTER_SELECTED[opt.value]
                        : `bg-transparent opacity-60 ${TYPE_FILTER_COLORS[opt.value]}`,
                    ].join(" ")}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Progress <span className="font-normal opacity-60">(click to select)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PROGRESS_OPTIONS.map((opt) => {
                const active = progressFilter.has(opt.value)
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleProgress(opt.value)}
                    className={[
                      "rounded-full px-2.5 py-0.5 text-xs font-medium border-2 transition-all cursor-pointer select-none",
                      active
                        ? PROGRESS_FILTER_SELECTED[opt.value]
                        : `bg-transparent opacity-60 ${PROGRESS_FILTER_COLORS[opt.value]}`,
                    ].join(" ")}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: table */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {rawClasses === null ? (
                <span className="text-amber-600">No data found</span>
              ) : totalCount > 0 ? (
                <>{totalCount} features</>
              ) : (
                "No results"
              )}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline" size="icon" className="h-8 w-8"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1.5 text-sm">
                <select
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Number(e.target.value))}
                  className="h-8 px-2 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {Array.from({ length: totalPages }, (_, i) => (
                    <option key={i} value={i}>{i + 1}</option>
                  ))}
                </select>
                <span className="text-muted-foreground">of {totalPages}</span>
              </div>
              <Button
                variant="outline" size="icon" className="h-8 w-8"
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[45%]">Feature</TableHead>
                  <TableHead className="w-[20%]">Type</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      No features found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((cls) => (
                    <TableRow key={cls._id} className="group/row">
                      <TableCell>
                        <button
                          className="font-mono text-sm text-left hover:underline decoration-2 hover:font-bold hover:text-emerald-400 underline-offset-2 text-foreground"
                          onClick={() => { setSelectedClassName(cls.class_name); setSheetOpen(true) }}
                        >
                          {cls.class_name}
                        </button>
                      </TableCell>
                      <TableCell><TypeBadge type={cls.class_type as ClassType} /></TableCell>
                      <TableCell><ProgressCell pct={cls.percentage_implemented} /></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetTitle className="sr-only">Feature details</SheetTitle>
          {selectedClassName && (
            <ClassSheet className={selectedClassName} mode={mode} mcVersion={mcVersion} />
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

// ─── Detail sheet ─────────────────────────────────────────────────────────────

function ClassSheet({
  className,
  mode,
  mcVersion,
}: {
  className: string
  mode: RunMode
  mcVersion: string
}) {
  const { data: branchCls, isPending: branchPending } = useQuery(
    convexQuery(
      api.queries.classByBranchAndName,
      mode.type !== "all" ? { branch: mode.branch, mc_version: mcVersion, class_name: className } : "skip"
    )
  )
  const { data: bestCls, isPending: bestPending } = useQuery(
    convexQuery(
      api.queries.bestClassByName,
      mode.type === "all" ? { mc_version: mcVersion, class_name: className } : "skip"
    )
  )

  const cls = mode.type === "all" ? bestCls : branchCls
  const isPending = mode.type === "all" ? bestPending : branchPending

  const { data: run } = useQuery(
    convexQuery(api.queries.runById, cls?.run_id ? { id: cls.run_id } : "skip")
  )

  const { data: history } = useQuery(
    convexQuery(api.queries.classChangesHistory, { mc_version: mcVersion, class_name: className })
  )

  if (isPending || cls === undefined) {
    return (
      <>
        <SheetHeader>
          <SheetTitle><Skeleton className="h-5 w-40" /></SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-6 mx-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-40 w-full" />
        </div>
      </>
    )
  }

  if (!cls) return null

  const implemented = cls.methods.filter((m) => m.status === "Implemented")
  const notImplemented = cls.methods.filter((m) => m.status === "NotImplemented")

  return (
    <>
      <SheetHeader>
        <SheetTitle className="font-mono text-base">{cls.class_name}</SheetTitle>
        <SheetDescription asChild>
          <div className="flex items-center gap-2 mt-1">
            <TypeBadge type={cls.class_type as ClassType} />
            <span className="text-xs text-muted-foreground">
              {implemented.length}/{cls.methods.length} methods implemented
            </span>
          </div>
        </SheetDescription>
      </SheetHeader>

      {/* Progress */}
      <div className="mt-5 mx-4">
        <ProgressCell pct={cls.percentage_implemented} />
      </div>

      {/* Run info */}
      {run && (
        <div className="mt-4 mx-4 rounded-md border bg-muted/30 px-3 py-2.5 space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            {mode.type === "all" ? "Best seen in" : "Run"}
          </p>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
            <span className="text-muted-foreground">Commit</span>
            <span className="font-mono">{run.commit_sha.slice(0, 7)}</span>
            <span className="text-muted-foreground">Branch</span>
            <span className="font-mono">{run.branch}</span>
            <span className="text-muted-foreground">MC version</span>
            <span className="font-mono">{run.mc_version}</span>
            {run.pr_number && (
              <>
                <span className="text-muted-foreground">PR</span>
                <span className="font-mono">#{run.pr_number}</span>
              </>
            )}
            <span className="text-muted-foreground">Date</span>
            <span>{new Date(run.triggered_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
          </div>
        </div>
      )}

      {/* Methods */}
      <div className="mt-6 mx-4 space-y-4">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <IconCode className="size-4" />
          Methods ({cls.methods.length})
        </h4>
        {implemented.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Implemented ({implemented.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {implemented.map((m, i) => (
                <Badge key={i} variant="secondary" className="text-xs font-mono gap-1">
                  <IconCircleCheckFilled className="size-3 text-green-500 shrink-0" />
                  {m.method_name}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {notImplemented.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Not implemented ({notImplemented.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {notImplemented.slice(0, 16).map((m, i) => (
                <Badge key={i} variant="outline" className="text-xs font-mono gap-1 text-muted-foreground">
                  <IconCircleX className="size-3 shrink-0" />
                  {m.method_name}
                </Badge>
              ))}
              {notImplemented.length > 16 && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  +{notImplemented.length - 16} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {/* History */}
      {history !== undefined && history.length > 1 && (
        <div className="mt-6 mx-4">
          <h4 className="text-sm font-medium mb-3">History</h4>
          <div className="space-y-2">
            {history.slice().reverse().map((entry, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="font-mono text-xs text-muted-foreground w-14 shrink-0">
                  {entry.commit_sha.slice(0, 7)}
                </span>
                <span className="font-mono text-xs text-muted-foreground w-16 shrink-0 truncate">
                  {entry.branch}
                </span>
                <ProgressCell pct={entry.percentage_implemented} />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function FeaturesTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[45%]">Feature</TableHead>
            <TableHead className="w-[20%]">Type</TableHead>
            <TableHead>Progress</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 8 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-48" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
              <TableCell><Skeleton className="h-3 w-32 rounded-full" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
