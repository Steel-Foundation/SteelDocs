import { useState, useEffect, useMemo } from "react";
import { Search, ChevronDown, Blocks, Sword, Filter } from "lucide-react";

interface ClassGroup {
  implemented: boolean;
  todos: string[];
  entries: string[];
}

type Status = "complete" | "partial" | "unimplemented";

function getStatus(group: ClassGroup): Status {
  if (!group.implemented) return "unimplemented";
  return group.todos.length > 0 ? "partial" : "complete";
}

interface ImplementationData {
  blocks: Record<string, ClassGroup>;
  items: Record<string, ClassGroup>;
}

type Tab = "blocks" | "items";
type StatusFilter = "all" | "complete" | "partial" | "unimplemented";

export default function ImplementationTracker() {
  const [data, setData] = useState<ImplementationData | null>(null);
  const [tab, setTab] = useState<Tab>("blocks");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + "data/implementation-status.json")
      .then((r) => r.json())
      .then(setData);
  }, []);

  const currentData = data?.[tab];

  const stats = useMemo(() => {
    if (!currentData) return { total: 0, complete: 0, partial: 0, unimplemented: 0 };
    const classes = Object.entries(currentData);
    const byStatus = { complete: 0, partial: 0, unimplemented: 0 };
    for (const [, g] of classes) {
      byStatus[getStatus(g)] += g.entries.length;
    }
    return {
      total: classes.reduce((sum, [, g]) => sum + g.entries.length, 0),
      ...byStatus,
    };
  }, [currentData]);

  const filtered = useMemo(() => {
    if (!currentData) return [];
    const lowerSearch = search.toLowerCase();
    const statusOrder: Record<Status, number> = { complete: 0, partial: 1, unimplemented: 2 };
    return Object.entries(currentData)
      .filter(([className, group]) => {
        if (statusFilter !== "all" && getStatus(group) !== statusFilter) return false;
        if (!search) return true;
        if (className.toLowerCase().includes(lowerSearch)) return true;
        return group.entries.some((e) => e.toLowerCase().includes(lowerSearch));
      })
      .sort((a, b) => {
        const sa = statusOrder[getStatus(a[1])];
        const sb = statusOrder[getStatus(b[1])];
        if (sa !== sb) return sa - sb;
        return a[0].localeCompare(b[0]);
      });
  }, [currentData, search, statusFilter]);

  const toggleExpand = (className: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(className)) next.delete(className);
      else next.add(className);
      return next;
    });
  };

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
      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total entries" value={stats.total} />
        <StatCard label="Complete" value={stats.complete} color="emerald" />
        <StatCard label="Partial" value={stats.partial} color="amber" />
        <StatCard label="Unimplemented" value={stats.unimplemented} />
      </div>

      {/* Progress bar */}
      <div className="mb-6 p-4 rounded-2xl bg-white/5 dark:bg-white/5 border border-teal-200/30 dark:border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-teal-700 dark:text-white/70">
            Implementation progress
          </span>
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
        {/* Tabs */}
        <div className="flex rounded-xl bg-teal-100 dark:bg-white/5 border border-teal-200/40 dark:border-white/10 p-1">
          <TabButton active={tab === "blocks"} onClick={() => setTab("blocks")}>
            <Blocks className="size-3.5" />
            Blocks
          </TabButton>
          <TabButton active={tab === "items"} onClick={() => setTab("items")}>
            <Sword className="size-3.5" />
            Items
          </TabButton>
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-teal-500 dark:text-white/40 pointer-events-none" />
          <input
            type="text"
            placeholder="Search blocks, items, or classes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-white/5 border border-teal-200/40 dark:border-white/10 rounded-xl text-teal-950 dark:text-white placeholder:text-teal-400 dark:placeholder:text-white/35 focus:outline-none focus:border-emerald-500/60 dark:focus:border-emerald-400/50 transition-all"
          />
        </div>

        {/* Status filter */}
        <div className="flex rounded-xl bg-teal-100 dark:bg-white/5 border border-teal-200/40 dark:border-white/10 p-1">
          <TabButton active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
            <Filter className="size-3.5" />
            All
          </TabButton>
          <TabButton active={statusFilter === "complete"} onClick={() => setStatusFilter("complete")}>
            Complete
          </TabButton>
          <TabButton active={statusFilter === "partial"} onClick={() => setStatusFilter("partial")}>
            Partial
          </TabButton>
          <TabButton active={statusFilter === "unimplemented"} onClick={() => setStatusFilter("unimplemented")}>
            Todo
          </TabButton>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-teal-600 dark:text-white/40 mb-3">
        Showing {filtered.length} class{filtered.length !== 1 ? "es" : ""} ({filtered.reduce((s, [, g]) => s + g.entries.length, 0)} entries)
      </p>

      {/* Class list */}
      <div className="flex flex-col gap-2">
        {filtered.map(([className, group]) => {
          const isOpen = expanded.has(className);
          const matchingEntries = search
            ? group.entries.filter((e) => e.toLowerCase().includes(search.toLowerCase()))
            : group.entries;

          return (
            <div
              key={className}
              className="rounded-xl border border-teal-200/30 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleExpand(className)}
                className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-teal-50 dark:hover:bg-white/5 transition-colors"
              >
                {/* Status indicator */}
                <div
                  className={`size-2.5 rounded-full shrink-0 ${
                    {
                      complete: "bg-emerald-500 dark:bg-emerald-400",
                      partial: "bg-amber-500 dark:bg-amber-400",
                      unimplemented: "bg-teal-300 dark:bg-white/20",
                    }[getStatus(group)]
                  }`}
                />

                {/* Class name */}
                <span className="font-minecraft text-sm text-teal-950 dark:text-white">
                  {className}
                </span>

                {/* Entry count badge */}
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-white/10 text-teal-600 dark:text-white/50">
                  {group.entries.length}
                </span>

                {/* Status badge */}
                {getStatus(group) === "complete" && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-400/15 text-emerald-700 dark:text-emerald-400">
                    Complete
                  </span>
                )}
                {getStatus(group) === "partial" && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-400/15 text-amber-700 dark:text-amber-400">
                    Partial ({group.todos.length} TODO{group.todos.length !== 1 ? "s" : ""})
                  </span>
                )}

                <div className="flex-1" />

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

                  {/* Entries */}
                  <div className={`flex flex-wrap gap-1.5 ${group.todos.length === 0 ? "pt-2 border-t border-teal-100 dark:border-white/5" : ""}`}>
                    {(search ? matchingEntries : group.entries).map((entry) => (
                      <span
                        key={entry}
                        className="text-xs px-2 py-1 rounded-lg bg-teal-50 dark:bg-white/5 text-teal-700 dark:text-white/60 border border-teal-100 dark:border-white/5"
                      >
                        {entry}
                      </span>
                    ))}
                    {search && matchingEntries.length < group.entries.length && (
                      <span className="text-xs px-2 py-1 text-teal-400 dark:text-white/30 italic">
                        +{group.entries.length - matchingEntries.length} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-teal-500 dark:text-white/40">
          <p className="font-minecraft text-lg">No results found</p>
          <p className="text-sm mt-1">Try adjusting your search or filter</p>
        </div>
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

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
        active
          ? "bg-white dark:bg-white/10 text-teal-950 dark:text-white shadow-sm"
          : "text-teal-600 dark:text-white/50 hover:text-teal-950 dark:hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
