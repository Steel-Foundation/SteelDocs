"use client"

import { IconBrain, IconCube, IconSword, IconUsers } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { convexQuery } from "@convex-dev/react-query"
import { api } from "@convex/_generated/api"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { RunMode } from "@/components/tracker/TrackerApp"

type ClassType = "block" | "item" | "entity" | "ai_goal" | "ai_brain" | "ai_control" | "ai_pathing" | "other"

const pct = (implemented: number, total: number) =>
  total > 0 ? Math.round((implemented / total) * 100) : 0

export function SectionCards({ mode, mcVersion }: { mode: RunMode; mcVersion: string }) {
  // Fetch total classes from registry
  const { data: total, isPending: totalPending } = useQuery(
    convexQuery(api.queries.totalClasses, { mc_version: mcVersion })
  )

  // Fetch classes depending on mode
  const branchQuery = convexQuery(
    api.queries.classesByBranch,
    mode.type !== "all"
      ? { branch: mode.branch, mc_version: mcVersion }
      : "skip"
  )
  const allQuery = convexQuery(
    api.queries.bestClasses,
    mode.type === "all" ? { mc_version: mcVersion } : "skip"
  )

  const { data: branchClasses, isPending: branchPending, isError: branchError } = useQuery(branchQuery)
  const { data: allClasses, isPending: allPending, isError: allError } = useQuery(allQuery)

  const classes = mode.type === "all" ? allClasses : branchClasses
  const isPending = totalPending || (mode.type === "all" ? allPending : branchPending)
  const isError = mode.type === "all" ? allError : branchError

  if (isPending) return <SectionCardsSkeleton />
  if (isError) return null // Hide on error
  if (!classes || !mcVersion) return null

  const stats = (classes as { class_type: ClassType; percentage_implemented: number }[]).reduce(
    (acc, curr) => {
      const type = curr.class_type;
      const isAI = type === "ai_goal" || type === "ai_brain" || type === "ai_control" || type === "ai_pathing" || type === "other";
      const key = type === "block" || type === "entity" || type === "item" ? type : isAI ? "aiAll" : null;

      if (key) {
        acc[key].total++;
        if (curr.percentage_implemented === 100) acc[key].implemented++;
        else if (curr.percentage_implemented > 0 && curr.percentage_implemented < 100) acc[key].partial++;
      }

      return acc;
    },
    {
      block: { total: 0, implemented: 0, partial: 0 },
      entity: { total: 0, implemented: 0, partial: 0 },
      item: { total: 0, implemented: 0, partial: 0 },
      aiAll: { total: 0, implemented: 0, partial: 0 },
    }
  );

  const { block: blocks, entity: entities, item: items, aiAll } = stats;

  const totalVal = total ?? classes.length

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 *:data-[slot=card]:bg-linear-to-b *:data-[slot=card]:from-emerald-50 *:data-[slot=card]:to-emerald-100 *:data-[slot=card]:shadow-none *:data-[slot=card]:border *:data-[slot=card]:border-emerald-200 dark:*:data-[slot=card]:from-emerald-900 dark:*:data-[slot=card]:to-emerald-950 dark:*:data-[slot=card]:border-0">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-emerald-700/90 dark:text-white/80">Blocks</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {blocks.implemented}{" "}
            <span className="text-base font-normal text-emerald-700/90 dark:text-white/80">/ {blocks.total}</span>
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconCube className="mr-1 size-3" />
              {pct(blocks.implemented, blocks.total)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">{blocks.partial} partially implemented</div>
          <div className="text-emerald-700/90 dark:text-white/80">Core building blocks</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-emerald-700/90 dark:text-white/80">Entities</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {entities.implemented}{" "}
            <span className="text-base font-normal text-emerald-700/90 dark:text-white/80">/ {entities.total}</span>
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconUsers className="mr-1 size-3" />
              {pct(entities.implemented, entities.total)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">{entities.partial} partially implemented</div>
          <div className="text-emerald-700/90 dark:text-white/80">Mobs and players</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-emerald-700/90 dark:text-white/80">Items</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {items.implemented}{" "}
            <span className="text-base font-normal text-emerald-700/90 dark:text-white/80">/ {items.total}</span>
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconSword className="mr-1 size-3" />
              {pct(items.implemented, items.total)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">{items.partial} partially implemented</div>
          <div className="text-emerald-700/90 dark:text-white/80">Tools and inventory</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-emerald-700/90 dark:text-white/80">AI & Other</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {aiAll.implemented}{" "}
            <span className="text-base font-normal text-emerald-700/90 dark:text-white/80">/ {aiAll.total}</span>
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconBrain className="mr-1 size-3" />
              {pct(aiAll.implemented, aiAll.total)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">{aiAll.partial} partially implemented</div>
          <div className="text-emerald-700/90 dark:text-white/80">Goals, brain, pathing</div>
        </CardFooter>
      </Card>
    </div>
  )
}

function SectionCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-xl" />
      ))}
    </div>
  )
}
