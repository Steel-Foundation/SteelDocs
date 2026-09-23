import { useState, useEffect, useMemo } from "react";
import {
  ChevronDown,
  Filter,
  GitCommitHorizontal,
  TriangleAlert,
  RotateCw,
  LayoutGrid,
  ListChecks,
  FileCode2,
  CheckCircle2,
  Circle,
  Wrench,
} from "lucide-react";
import SegmentedControl from "./SegmentedControl";
import ScopePicker, {
  DEFAULT_SCOPES,
  parseScopes,
  serializeScopes,
  type Category,
  type Scope,
} from "./ScopePicker";

interface GHIssues {
  html_url: string;
  title: string;
  body_text: string | null;
  pull_request: Record<string, string> | null;
}

interface ClassGroup {
  implemented: boolean;
  todos: string[];
  path: string | null;
  entries: string[];
  issues?: GHIssues[];
  prs?: GHIssues[];
}

type Status = "complete" | "partial" | "unimplemented";

const statusMeta = {
  complete: {
    label: "Implemented",
    Icon: CheckCircle2,
    dotClass: "bg-emerald-500 dark:bg-emerald-400",
    badgeClass: "bg-emerald-100 dark:bg-emerald-400/15 text-emerald-700 dark:text-emerald-400",
  },
  partial: {
    label: "In progress",
    Icon: Wrench,
    dotClass: "bg-amber-500 dark:bg-amber-400",
    badgeClass: "bg-amber-100 dark:bg-amber-400/15 text-amber-700 dark:text-amber-400",
  },
  unimplemented: {
    label: "Planned",
    Icon: Circle,
    dotClass: "bg-teal-300 dark:bg-white/20",
    badgeClass: "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/60",
  },
} as const;

function getStatus(group: ClassGroup): Status {
  if (!group.implemented) return "unimplemented";
  return group.todos.length > 0 ? "partial" : "complete";
}

interface SourceMeta {
  source: string;
  steel_version: string | null;
  steel_commit: string | null;
  steel_committed_at: string | null;
}

interface ImplementationData {
  meta?: SourceMeta;
  blocks: Record<string, ClassGroup>;
  items: Record<string, ClassGroup>;
  entities: Record<string, ClassGroup>;
  commands: Record<string, ClassGroup>;
}

async function iterIssues(pages: number, data: ImplementationData) {
  for (let i = 0; i < pages; i++) {
    await fetch(`https://api.github.com/repos/Steel-Foundation/SteelMC/issues?per_page=100&page=${i + 1}`, {
      headers: { "accept": "application/vnd.github.text+json" }
    })
      .then((r) => r.json())
      .then((json: GHIssues[]) => {
        Object.values(json).forEach((pr) => {

          const iter = (group: Record<string, ClassGroup>, use_slash_regex: boolean) => Object.keys(group).forEach((name) => {
            const regex = use_slash_regex ? new RegExp(`\\B${name.toLowerCase()}\\b`) : new RegExp(`\\b${name.toLowerCase()}\\b`);
            if (regex.test(pr.title.toLowerCase()) || (pr.body_text && regex.test(pr.body_text.toLowerCase()))) {
              if (!pr.pull_request) {
                if (group[name].issues) {
                  group[name].issues.push({ title: pr.title, html_url: pr.html_url } as GHIssues);
                  return;
                }
                group[name].issues = [{ title: pr.title, html_url: pr.html_url } as GHIssues];
                return;
              }
              if (group[name].prs) {
                group[name].prs.push({ title: pr.title, html_url: pr.html_url } as GHIssues);
                return;
              }
              group[name].prs = [{ title: pr.title, html_url: pr.html_url } as GHIssues];
            }
          });

          iter(data.items, false);
          iter(data.entities, false);
          iter(data.blocks, false);
          iter(data.commands, true);
        });
      });
  }
  return;
}

const VIEWS: View[] = ["list", "todos"];
const STATUS_FILTERS: StatusFilter[] = ["all", "complete", "partial", "unimplemented"];

function readUrlState() {
  if (typeof window === "undefined") {
    return { view: null, status: null, q: "", scopes: DEFAULT_SCOPES };
  }
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view");
  const status = params.get("status");
  const rawScope = params.get("scope");
  return {
    view: VIEWS.includes(view as View) ? (view as View) : null,
    status: STATUS_FILTERS.includes(status as StatusFilter) ? (status as StatusFilter) : null,
    q: params.get("q") ?? "",
    // An absent param is a first visit, "all" is a cleared selection.
    scopes:
      rawScope === null
        ? DEFAULT_SCOPES
        : rawScope === "all"
          ? []
          : parseScopes(rawScope),
  };
}

type View = "list" | "todos";

const CATEGORIES: Category[] = ["blocks", "items", "entities", "commands"];
const SOURCE_BASE = "https://github.com/Steel-Foundation/SteelMC/blob/master/";

interface Row {
  category: Category;
  className: string;
  group: ClassGroup;
}
type StatusFilter = "all" | "complete" | "partial" | "unimplemented";
type ProgressMetric = "surface" | "classes";

export default function ImplementationTracker() {
  const initial = readUrlState();
  const [data, setData] = useState<ImplementationData | null>(null);
  const [ghLoaded, setGhLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [view, setView] = useState<View>(initial.view ?? "list");
  const [scopes, setScopes] = useState<Scope[]>(initial.scopes);
  const [query, setQuery] = useState(initial.q);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initial.status ?? "all");
  const [progressMetric, setProgressMetric] = useState<ProgressMetric>("surface");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    fetch(import.meta.env.BASE_URL + "data/implementation-status.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : "Unknown error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!data || ghLoaded) return;
    fetch("https://api.github.com/repos/Steel-Foundation/SteelMC/issues?per_page=1", {
      headers: { "accept": "application/vnd.github.text+json" }
    })
      .then(async (r) => {
        const pages = Math.ceil(Number.parseInt(r.headers.get("link")?.match(/page=(\d+)>; rel="last"/)?.[1] || "100") / 100);
        await iterIssues(pages, data);
        setData(data);
        setGhLoaded(true);
      });
  }, [data]);

  // Filters live in the query string so a specific view can be linked to directly.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sync = (key: string, value: string, fallback: string) => {
      if (value === fallback) params.delete(key);
      else params.set(key, value);
    };
    sync("view", view, "list");
    sync(
      "scope",
      scopes.length === 0 ? "all" : serializeScopes(scopes),
      serializeScopes(DEFAULT_SCOPES),
    );
    sync("status", statusFilter, "all");
    sync("q", query, "");
    const search = params.toString();
    window.history.replaceState(null, "", search ? `?${search}` : window.location.pathname);
  }, [view, scopes, statusFilter, query]);

  const allRows = useMemo<Row[]>(() => {
    if (!data) return [];
    return CATEGORIES.flatMap((category) =>
      Object.entries(data[category]).map(([className, group]) => ({
        category,
        className,
        group,
      })),
    );
  }, [data]);

  // No scope means everything. Categories and individual behaviors union together.
  const rows = useMemo<Row[]>(() => {
    if (scopes.length === 0) return allRows;
    const categories = new Set(
      scopes.filter((s) => s.kind === "category").map((s) => s.category),
    );
    const classes = new Set(
      scopes
        .filter((s) => s.kind === "class")
        .map((s) => `${s.category}:${s.className}`),
    );
    return allRows.filter(
      (row) =>
        categories.has(row.category) || classes.has(`${row.category}:${row.className}`),
    );
  }, [allRows, scopes]);

  const scopedCategories = useMemo(() => {
    const set = new Set(rows.map((row) => row.category));
    return [...set];
  }, [rows]);

  const entryLabel =
    scopedCategories.length === 1 && scopedCategories[0] !== "entities"
      ? scopedCategories[0]
      : "entries";

  const catalog = useMemo(
    () =>
      allRows.map((row) => ({
        category: row.category,
        className: row.className,
        entryCount: row.group.entries.length,
        entries: row.group.entries,
      })),
    [allRows],
  );

  const categoryCounts = useMemo(() => {
    const counts = { blocks: 0, items: 0, entities: 0, commands: 0 } as Record<Category, number>;
    for (const row of allRows) counts[row.category] += 1;
    return counts;
  }, [allRows]);

  const todoCount = useMemo(
    () => rows.reduce((sum, row) => sum + row.group.todos.length, 0),
    [rows],
  );

  const stats = useMemo(() => {
    const byStatus = { complete: 0, partial: 0, unimplemented: 0 };
    let total = 0;
    for (const { group } of rows) {
      const weight = progressMetric === "classes" ? 1 : group.entries.length;
      byStatus[getStatus(group)] += weight;
      total += weight;
    }
    return { total, ...byStatus };
  }, [rows, progressMetric]);

  const searched = useMemo(() => {
    const lower = query.trim().toLowerCase();
    if (!lower) return rows;
    return rows.filter(
      (row) =>
        row.className.toLowerCase().includes(lower) ||
        row.group.entries.some((entry) => entry.toLowerCase().includes(lower)),
    );
  }, [rows, query]);

  const filtered = useMemo(() => {
    const statusOrder: Record<Status, number> = { complete: 0, partial: 1, unimplemented: 2 };
    return searched
      .filter((row) => statusFilter === "all" || getStatus(row.group) === statusFilter)
      .sort((a, b) => {
        const sa = statusOrder[getStatus(a.group)];
        const sb = statusOrder[getStatus(b.group)];
        if (sa !== sb) return sa - sb;
        return a.className.localeCompare(b.className);
      });
  }, [searched, statusFilter]);

  const todoRows = useMemo(
    () =>
      searched
        .filter((row) => row.group.todos.length > 0)
        .sort((a, b) => a.className.localeCompare(b.className)),
    [searched],
  );

  const toggleExpand = (className: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(className)) next.delete(className);
      else next.add(className);
      return next;
    });
  };

  if (loadError) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-amber-300/50 bg-amber-50 px-6 py-16 text-center dark:border-amber-400/20 dark:bg-amber-400/5">
        <TriangleAlert className="size-8 text-amber-500 dark:text-amber-400" />
        <div>
          <p className="font-minecraft text-lg text-teal-950 dark:text-white">
            Could not load the implementation status
          </p>
          <p className="mt-1 text-sm text-teal-600 dark:text-white/50">{loadError}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-teal-200/60 bg-white px-3 py-2 text-sm font-medium text-teal-800 transition-colors hover:bg-teal-50 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
        >
          <RotateCw className="size-4" />
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pctComplete = stats.total > 0 ? Math.round((stats.complete / stats.total) * 100) : 0;
  const pctPartial = stats.total > 0 ? Math.round((stats.partial / stats.total) * 100) : 0;

  return (
    <div className="w-full">
      <SourceBanner meta={data.meta} />

      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          label={progressMetric === "classes" ? "Total behaviors" : "Total entries"}
          value={stats.total}
        />
        <StatCard label="Complete" value={stats.complete} color="emerald" />
        <StatCard label="Partial" value={stats.partial} color="amber" />
        <StatCard label="Unimplemented" value={stats.unimplemented} />
      </div>

      {/* Progress bar */}
      <div className="mb-6 p-4 rounded-2xl bg-white/5 dark:bg-white/5 border border-teal-200/30 dark:border-white/10">
        <div className="flex flex-col gap-3 mb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-sm font-medium text-teal-700 dark:text-white/70">
              Implementation progress
            </span>
            <p className="mt-0.5 text-xs text-teal-500 dark:text-white/35">
              {progressMetric === "classes"
                ? "Each behavior type counts equally."
                : `Weighted by registered ${entryLabel}.`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SegmentedControl
              label="Progress calculation"
              size="sm"
              value={progressMetric}
              onChange={setProgressMetric}
              segments={[
                { value: "surface", content: "Surface area" },
                { value: "classes", content: "Behaviors" },
              ]}
            />
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="inline-block size-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                <span className="text-teal-700 dark:text-white/60">{pctComplete}%</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block size-2 rounded-full bg-amber-500 dark:bg-amber-400" />
                <span className="text-teal-700 dark:text-white/60">{pctPartial}%</span>
              </span>
            </div>
          </div>
        </div>
        <div className="relative h-3 rounded-full bg-teal-100 dark:bg-white/10 overflow-visible flex group cursor-default">
          <div
            className="h-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-500 rounded-l-full"
            style={{ width: `${pctComplete}%` }}
          />
          <div
            className="h-full bg-amber-500 dark:bg-amber-400 transition-all duration-500"
            style={{ width: `${pctPartial}%` }}
          />

          {/* Tooltip */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full
            px-3 py-2 rounded-lg text-xs bg-gray-900 text-white
            opacity-0 group-hover:opacity-100 transition-opacity duration-150
            pointer-events-none z-10 flex flex-col gap-1 whitespace-nowrap shadow-lg">
            <span className="flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-emerald-400" />
              Complete — {pctComplete}%
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-amber-400" />
              Partial — {pctPartial}%
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-white/20" />
              Not started — {100 - pctComplete - pctPartial}%
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <ScopePicker
          catalog={catalog}
          categoryCounts={categoryCounts}
          scopes={scopes}
          onChange={setScopes}
          query={query}
          onQueryChange={setQuery}
        />

        <SegmentedControl
          label="View"
          value={view}
          onChange={setView}
          segments={[
            {
              value: "list",
              content: (
                <>
                  <LayoutGrid className="size-3.5" />
                  List
                </>
              ),
            },
            {
              value: "todos",
              content: (
                <>
                  <ListChecks className="size-3.5" />
                  TODOs
                  <TabCount value={todoCount} />
                </>
              ),
            },
          ]}
        />

        <SegmentedControl
          label="Status filter"
          value={statusFilter}
          onChange={setStatusFilter}
          segments={[
            {
              value: "all",
              content: (
                <>
                  <Filter className="size-3.5" />
                  All
                </>
              ),
            },
            { value: "complete", content: "Complete" },
            { value: "partial", content: "Partial" },
            { value: "unimplemented", content: "Todo" },
          ]}
        />
      </div>

      {/* Results count */}
      <p className="text-xs text-teal-600 dark:text-white/40 mb-3">
        {view === "todos"
          ? `Showing ${todoRows.reduce((sum, r) => sum + r.group.todos.length, 0)} open TODO${
              todoRows.reduce((sum, r) => sum + r.group.todos.length, 0) !== 1 ? "s" : ""
            } across ${todoRows.length} behavior${todoRows.length !== 1 ? "s" : ""}`
          : `Showing ${filtered.length} class${filtered.length !== 1 ? "es" : ""} (${filtered.reduce(
              (sum, r) => sum + r.group.entries.length,
              0,
            )} entries)`}
      </p>

      {/* TODO board */}
      {view === "todos" && (
        <div className="flex flex-col gap-2">
          {todoRows.map(({ category, className, group }) => (
            <div
              key={`${category}:${className}`}
              className="rounded-xl border border-teal-200/30 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-3 flex flex-col gap-2"
            >
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-minecraft text-sm text-teal-950 dark:text-white">
                  {className}
                </span>
                <CategoryChip category={category} />
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-400/15 text-amber-700 dark:text-amber-400">
                  {group.todos.length} TODO{group.todos.length !== 1 ? "s" : ""}
                </span>
                <div className="flex-1" />
                <SourceLink path={group.path} />
              </div>
              <ul className="flex flex-col gap-1.5 m-0 p-0 list-none">
                {group.todos.map((todo, i) => (
                  <li
                    key={i}
                    className="text-xs leading-relaxed text-teal-800 dark:text-amber-200/70 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-400/5 [overflow-wrap:anywhere]"
                  >
                    {todo}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {todoRows.length === 0 && (
            <div className="text-center py-16 text-teal-500 dark:text-white/40">
              <p className="font-minecraft text-lg">Nothing left on the board</p>
              <p className="text-sm mt-1">Nothing in this scope has an open TODO</p>
            </div>
          )}
        </div>
      )}

      {/* Class list */}
      {view !== "todos" && (
      <div className="flex flex-col gap-2">
        {filtered.map(({ category, className, group }) => {
          const rowKey = `${category}:${className}`;
          const isOpen = expanded.has(rowKey);
          const status = getStatus(group);
          const { Icon: StatusIcon, label: statusLabel, dotClass, badgeClass } = statusMeta[status];

          return (
            <div
              key={rowKey}
              className="rounded-xl border border-teal-200/30 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleExpand(rowKey)}
                aria-expanded={isOpen}
                className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-teal-50 dark:hover:bg-white/5 transition-colors"
              >
                {/* Status indicator */}
                <div className={`size-2.5 rounded-full shrink-0 ${dotClass}`} />

                {/* Class name */}
                <span className="font-minecraft text-sm text-teal-950 dark:text-white">
                  {className}
                </span>

                {/* Entry count badge */}
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-white/10 text-teal-600 dark:text-white/50">
                  {group.entries.length}
                </span>

                {/* Status badge */}
                <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${badgeClass}`}>
                  <StatusIcon className="size-3" aria-hidden="true" />
                  {statusLabel}{status === "partial" ? ` · ${group.todos.length} task${group.todos.length !== 1 ? "s" : ""}` : ""}
                </span>

                {/* Issues badge */}
                {group.issues && <span className="text-xs px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-400/15 text-rose-800 dark:text-rose-400">
                  {group.issues.length} issues open
                </span>}
                {/* PRs badge */}
                {group.prs && <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-400/15 text-indigo-800 dark:text-indigo-400">
                  {group.prs.length} PRs open
                </span>}

                <div className="flex-1" />

                {scopedCategories.length > 1 && <CategoryChip category={category} />}
                <SourceLink path={group.path} />

                {/* Chevron */}
                <ChevronDown
                  className={`size-4 text-teal-400 dark:text-white/30 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div className="px-4 pb-3 pt-0">
                  {/* TODOs */}
                  {group.todos.length > 0 && (
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-teal-100 dark:border-white/5 mb-3">
                      {group.todos.map((todo, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-xs px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-400/5 border border-amber-200/50 dark:border-amber-400/10"
                        >
                          <span className="text-amber-500 dark:text-amber-400 shrink-0 mt-px font-bold">TODO</span>
                          <span className="text-amber-800 dark:text-amber-200/70">{todo}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Issues */}
                  {group.issues && (
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-teal-100 dark:border-white/5 mb-3">
                      {group.issues.map((issue, i) => (
                        <a
                          key={i}
                          href={issue.html_url}
                          className="flex items-start gap-2 text-xs px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-400/5 border border-rose-200/50 dark:border-rose-400/10"
                        >
                          <span className="text-rose-500 dark:text-rose-400 shrink-0 mt-px font-bold">Issue</span>
                          <span className="text-rose-800 dark:text-rose-200/70">{issue.title}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* PRs */}
                  {group.prs && (
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-teal-100 dark:border-white/5 mb-3">
                      {group.prs.map((pr, i) => (
                        <a
                          key={i}
                          href={pr.html_url}
                          className="flex items-start gap-2 text-xs px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-400/5 border border-indigo-200/50 dark:border-indigo-400/10"
                        >
                          <span className="text-indigo-500 dark:text-indigo-400 shrink-0 mt-px font-bold">PR</span>
                          <span className="text-indigo-800 dark:text-indigo-200/70">{pr.title}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Entries */}
                  <div className={`flex flex-wrap gap-1.5 ${group.todos.length === 0 ? "pt-2 border-t border-teal-100 dark:border-white/5" : ""}`}>
                    {group.entries.map((entry) => (
                      <span
                        key={entry}
                        className="text-xs px-2 py-1 rounded-lg bg-teal-50 dark:bg-white/5 text-teal-700 dark:text-white/60 border border-teal-100 dark:border-white/5"
                      >
                        {entry}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      )}

      {view !== "todos" && filtered.length === 0 && (
        <div className="text-center py-16 text-teal-500 dark:text-white/40">
          <p className="font-minecraft text-lg">No results found</p>
          <p className="text-sm mt-1">Try widening the scope or the status filter</p>
        </div>
      )}
    </div>
  );
}

function TabCount({ value }: { value?: number }) {
  if (value === undefined) return null;
  return (
    <span className="text-[11px] tabular-nums text-teal-500 dark:text-white/35">{value}</span>
  );
}

const categoryLabels: Record<Category, string> = {
  blocks: "block",
  items: "item",
  entities: "entity",
  commands: "command",
};

function CategoryChip({ category }: { category: Category }) {
  return (
    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 dark:bg-white/10 text-teal-600 dark:text-white/45">
      {categoryLabels[category]}
    </span>
  );
}

function SourceLink({ path }: { path: string | null }) {
  if (!path) return null;
  return (
    <a
      href={SOURCE_BASE + path}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      title={path}
      className="hidden sm:flex items-center gap-1 max-w-[34ch] truncate text-[11px] text-teal-500 hover:text-emerald-600 dark:text-white/30 dark:hover:text-emerald-400 transition-colors"
    >
      <FileCode2 className="size-3 shrink-0" />
      <span className="truncate">{path.replace("steel-core/src/", "")}</span>
    </a>
  );
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86_400_000],
    ["hour", 3_600_000],
    ["minute", 60_000],
  ];
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  for (const [unit, ms] of units) {
    if (diff >= ms) return formatter.format(-Math.floor(diff / ms), unit);
  }
  return formatter.format(0, "minute");
}

function SourceBanner({ meta }: { meta?: SourceMeta }) {
  if (!meta) return null;
  const isNightly = meta.source === "nightly";
  return (
    <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-teal-200/40 bg-white/60 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/[0.03]">
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
          isNightly
            ? "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-400"
            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-400"
        }`}
      >
        {meta.source}
      </span>
      <span className="text-teal-700 dark:text-white/70">
        {isNightly
          ? "Tracks the latest Steel commit, not a published release."
          : "State as published in this release."}
      </span>
      <div className="flex-1" />
      {meta.steel_version && (
        <span className="font-minecraft text-xs text-teal-600 dark:text-white/50">
          {meta.steel_version}
        </span>
      )}
      {meta.steel_commit && (
        <a
          href={`https://github.com/Steel-Foundation/SteelMC/commit/${meta.steel_commit}`}
          className="flex items-center gap-1 text-xs text-teal-600 underline-offset-2 hover:underline dark:text-white/50"
        >
          <GitCommitHorizontal className="size-3.5" />
          {meta.steel_commit.slice(0, 9)}
        </a>
      )}
      {meta.steel_committed_at && (
        <time
          dateTime={meta.steel_committed_at}
          title={meta.steel_committed_at}
          className="text-xs text-teal-500 dark:text-white/35"
        >
          {relativeTime(meta.steel_committed_at)}
        </time>
      )}
    </div>
  );
}

const colorClasses = {
  default: "text-teal-950 dark:text-white",
  emerald: "text-emerald-600 dark:text-emerald-400",
  amber: "text-amber-600 dark:text-amber-400",
};

function StatCard({ label, value, color = "default" }: { label: string; value: number; color?: keyof typeof colorClasses }) {
  return (
    <div className="p-3 rounded-xl bg-white/60 dark:bg-white/[0.03] border border-teal-200/30 dark:border-white/10">
      <p className="text-xs text-teal-600 dark:text-white/40">{label}</p>
      <p className={`text-2xl font-minecraft mt-0.5 ${colorClasses[color]}`}>
        {value}
      </p>
    </div>
  );
}


