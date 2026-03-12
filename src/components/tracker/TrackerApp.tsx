"use client"

import * as React from "react"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/tracker/ThemeProvider"
import { ConvexClientProvider } from "@/components/tracker/ConvexClientProvider"
import { TrackerNavbar } from "@/components/tracker/TrackerNavbar"
import { SectionCards } from "@/components/tracker/SectionCards"
import { FeaturesTable } from "@/components/tracker/FeaturesTable"
import { useQuery } from "@tanstack/react-query"
import { convexQuery } from "@convex-dev/react-query"
import { api } from "@convex/_generated/api"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"

// ─── Types ────────────────────────────────────────────────────────────────────

export type RunMode =
  | { type: "all" }
  | { type: "branch"; branch: string }
  | { type: "pr"; branch: string; pr_number: number }

// ─── Source selector ──────────────────────────────────────────────────────────

function SourceSelector({
  mode,
  onModeChange,
}: {
  mode: RunMode
  onModeChange: (m: RunMode) => void
}) {
  const { data: sources } = useQuery(convexQuery(api.queries.listSources, {}))

  const currentValue: string =
    mode.type === "all"
      ? "__all__"
      : mode.type === "branch"
        ? `branch:${mode.branch}`
        : `pr:${mode.pr_number}`

  function handleChange(value: string) {
    if (value === "__all__") {
      onModeChange({ type: "all" })
    } else if (value.startsWith("branch:")) {
      onModeChange({ type: "branch", branch: value.slice(7) })
    } else if (value.startsWith("pr:")) {
      const pr_number = Number(value.slice(3))
      const pr = sources?.prs.find((p) => p.pr_number === pr_number)
      onModeChange({ type: "pr", branch: pr?.branch ?? "", pr_number })
    }
  }

  return (
    <Select value={currentValue} onValueChange={handleChange}>
      <SelectTrigger className="h-9 min-w-44 w-fit text-sm">
        <SelectValue placeholder="Select source…" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">All (best)</SelectItem>
        {sources?.branches && sources.branches.length > 0 && (
          <SelectGroup>
            <SelectLabel>Branches</SelectLabel>
            {sources.branches.map((b) => (
              <SelectItem key={b} value={`branch:${b}`}>{b}</SelectItem>
            ))}
          </SelectGroup>
        )}
        {sources?.prs && sources.prs.length > 0 && (
          <SelectGroup>
            <SelectLabel>Pull Requests</SelectLabel>
            {sources.prs.map((p) => (
              <SelectItem key={p.pr_number} value={`pr:${p.pr_number}`}>
                PR #{p.pr_number}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  )
}

// ─── MC version selector ──────────────────────────────────────────────────────

function McVersionSelector({
  mcVersion,
  onMcVersionChange,
}: {
  mcVersion: string
  onMcVersionChange: (v: string) => void
}) {
  const { data: versions } = useQuery(convexQuery(api.queries.listMcVersions, {}))

  return (
    <Select value={mcVersion} onValueChange={onMcVersionChange}>
      <SelectTrigger className="h-9 min-w-32 w-fit text-sm">
        <SelectValue placeholder="MC version…" />
      </SelectTrigger>
      <SelectContent>
        {(versions ?? []).map((v) => (
          <SelectItem key={v} value={v}>{v}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

function TrackerAppInner({ pathname }: { pathname: string }) {
  const [mcVersion, setMcVersion] = React.useState<string>("")
  const [mode, setMode] = React.useState<RunMode>({ type: "all" })

  // Auto-select latest MC version when data loads
  const { data: versions, isError } = useQuery(convexQuery(api.queries.listMcVersions, {}))
  React.useEffect(() => {
    if (versions && versions.length > 0 && !mcVersion) {
      setMcVersion(versions[versions.length - 1])
    }
  }, [versions, mcVersion])

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <TrackerNavbar />
      <main className="flex flex-col pt-16 min-h-screen">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 px-3 sm:px-4 md:gap-6 md:py-6 md:px-6 max-w-7xl mx-auto w-full">
            {/* Selectors bar */}
            <div className="flex items-center gap-3 flex-wrap">
              <McVersionSelector mcVersion={mcVersion} onMcVersionChange={setMcVersion} />
              <SourceSelector mode={mode} onModeChange={setMode} />
            </div>

            {isError ? (
              <div className="flex flex-col items-center justify-center py-24 text-center mt-8">
                <div className="rounded-full bg-red-100 dark:bg-red-900/40 p-3 mb-4">
                  <svg className="size-6 text-red-600 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-1">Unable to load data</h3>
                <p className="text-muted-foreground">Please check your connection or try again later.</p>
              </div>
            ) : mcVersion ? (
              <>
                <SectionCards mode={mode} mcVersion={mcVersion} />
                <FeaturesTable mode={mode} mcVersion={mcVersion} />
              </>
            ) : null}
          </div>
        </div>
      </main>
      <Toaster />
    </ThemeProvider>
  )
}

export function TrackerApp({ pathname }: { pathname: string }) {
  return (
    <ConvexClientProvider>
      <TrackerAppInner pathname={pathname} />
    </ConvexClientProvider>
  )
}
