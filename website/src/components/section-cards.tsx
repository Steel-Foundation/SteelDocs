"use client"

import { IconBrain, IconCube, IconSword, IconUsers } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { convexQuery } from "@convex-dev/react-query"
import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel"

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

type ClassType = "block" | "item" | "entity" | "ai_goal" | "ai_brain" | "ai_control" | "ai_pathing" | "other"

function computeStats(
  classes: { class_type: ClassType; percentage_implemented: number }[],
  type: ClassType
) {
  const subset = classes.filter((c) => c.class_type === type)
  return {
    total: subset.length,
    implemented: subset.filter((c) => c.percentage_implemented === 100).length,
    partial: subset.filter((c) => c.percentage_implemented > 0 && c.percentage_implemented < 100).length,
  }
}

const pct = (implemented: number, total: number) =>
  total > 0 ? Math.round((implemented / total) * 100) : 0

export function SectionCards() {
  const { data: latestRun, isPending: latestRunPending } = useQuery(
    convexQuery(api.queries.latestRun, {})
  )
  const { data: classes, isPending: classesPending } = useQuery({
    ...convexQuery(api.queries.classesOverview, { run_id: latestRun?._id as Id<"runs"> }),
    enabled: !!latestRun,
  })

  if (latestRunPending || (!!latestRun && classesPending)) {
    return <SectionCardsSkeleton />
  }

  if (!latestRun || !classes) return null

  const blocks = computeStats(classes, "block")
  const entities = computeStats(classes, "entity")
  const items = computeStats(classes, "item")

  // Aggregate all AI subtypes + other into one card
  const aiTypes: ClassType[] = ["ai_goal", "ai_brain", "ai_control", "ai_pathing", "other"]
  const aiAll = {
    total: aiTypes.reduce((s, t) => s + computeStats(classes, t).total, 0),
    implemented: aiTypes.reduce((s, t) => s + computeStats(classes, t).implemented, 0),
    partial: aiTypes.reduce((s, t) => s + computeStats(classes, t).partial, 0),
  }

  return (
    <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-4 *:data-[slot=card]:bg-linear-to-b *:data-[slot=card]:from-emerald-900 *:data-[slot=card]:to-emerald-950 *:data-[slot=card]:shadow-none *:data-[slot=card]:border-0">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-white/80">Blocks</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {blocks.implemented}{" "}
            <span className="text-base font-normal text-white/80">/ {blocks.total}</span>
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconCube className="mr-1 size-3" />
              {pct(blocks.implemented, blocks.total)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {blocks.partial} partially implemented
          </div>
          <div className="text-white/80">Core building blocks</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-white/80">Entities</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {entities.implemented}{" "}
            <span className="text-base font-normal text-white/80">/ {entities.total}</span>
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconUsers className="mr-1 size-3" />
              {pct(entities.implemented, entities.total)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {entities.partial} partially implemented
          </div>
          <div className="text-white/80">Mobs and players</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-white/80">Items</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {items.implemented}{" "}
            <span className="text-base font-normal text-white/80">/ {items.total}</span>
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconSword className="mr-1 size-3" />
              {pct(items.implemented, items.total)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {items.partial} partially implemented
          </div>
          <div className="text-white/80">Tools and inventory</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-white/80">AI & Other</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {aiAll.implemented}{" "}
            <span className="text-base font-normal text-white/80">/ {aiAll.total}</span>
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconBrain className="mr-1 size-3" />
              {pct(aiAll.implemented, aiAll.total)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {aiAll.partial} partially implemented
          </div>
          <div className="text-white/80">Goals, brain, pathing</div>
        </CardFooter>
      </Card>
    </div>
  )
}

function SectionCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-xl" />
      ))}
    </div>
  )
}
