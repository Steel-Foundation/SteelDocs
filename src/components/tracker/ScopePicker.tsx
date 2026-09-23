import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Blocks,
  Check,
  ChevronDown,
  ChevronRight,
  Minus,
  PawPrint,
  Search,
  Terminal,
  Sword,
  X,
} from "lucide-react";

export type Category = "blocks" | "items" | "entities" | "commands";

export type Scope =
  | { kind: "category"; category: Category }
  | { kind: "class"; category: Category; className: string };

export const CATEGORY_LABELS: Record<Category, string> = {
  blocks: "Blocks",
  items: "Items",
  entities: "Entities",
  commands: "Commands",
};

const CATEGORY_ICONS: Record<Category, typeof Blocks> = {
  blocks: Blocks,
  items: Sword,
  entities: PawPrint,
  commands: Terminal,
};

const CATEGORIES: Category[] = ["blocks", "items", "entities", "commands"];
const GROUP_LIMIT = 25;
const VISIBLE_CHIPS = 3;

export function scopeKey(scope: Scope): string {
  return scope.kind === "category"
    ? `category:${scope.category}`
    : `class:${scope.category}:${scope.className}`;
}

export function serializeScopes(scopes: Scope[]): string {
  return scopes.map(scopeKey).join(",");
}

/**
 * Drops behaviors already covered by a selected category, and any duplicate,
 * so the same set is never expressed two ways.
 */
export function normalizeScopes(scopes: Scope[]): Scope[] {
  const categories = new Set(
    scopes.filter((s) => s.kind === "category").map((s) => s.category),
  );
  const seen = new Set<string>();
  return scopes.filter((scope) => {
    if (scope.kind === "class" && categories.has(scope.category)) return false;
    const key = scopeKey(scope);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function parseScopes(raw: string | null): Scope[] {
  if (!raw) return [];
  const known = new Set<string>(CATEGORIES);
  const parsed = raw
    .split(",")
    .map((token): Scope | null => {
      const [kind, category, className] = token.split(":");
      if (!known.has(category)) return null;
      if (kind === "category") return { kind, category: category as Category };
      if (kind === "class" && className) {
        return { kind, category: category as Category, className };
      }
      return null;
    })
    .filter((scope): scope is Scope => scope !== null);
  return normalizeScopes(parsed);
}

interface Option {
  scope: Scope;
  label: string;
  hint: string;
}

interface Group {
  category: Category;
  label: string;
  categoryOption: Option;
  picked: boolean;
  pickedChildren: number;
  options: Option[];
  hidden: number;
}

type CheckState = "on" | "off" | "mixed";

function Checkbox({ state }: { state: CheckState }) {
  const filled = state !== "off";
  return (
    <span
      aria-hidden="true"
      className={`grid place-items-center size-4 shrink-0 rounded border ${
        filled
          ? "bg-emerald-500 border-emerald-500 dark:bg-emerald-400 dark:border-emerald-400"
          : "border-teal-300 dark:border-white/25"
      }`}
    >
      {state === "on" && (
        <Check className="size-3 text-white dark:text-teal-950" strokeWidth={3} />
      )}
      {state === "mixed" && (
        <Minus className="size-3 text-white dark:text-teal-950" strokeWidth={3} />
      )}
    </span>
  );
}

export const DEFAULT_SCOPES: Scope[] = [{ kind: "category", category: "blocks" }];

interface Props {
  catalog: {
    category: Category;
    className: string;
    entryCount: number;
    entries: string[];
  }[];
  categoryCounts: Record<Category, number>;
  scopes: Scope[];
  onChange: (scopes: Scope[]) => void;
  query: string;
  onQueryChange: (query: string) => void;
}

export default function ScopePicker({
  catalog,
  categoryCounts,
  scopes,
  onChange,
  query,
  onQueryChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set(CATEGORIES));
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();

  const selected = useMemo(() => new Set(scopes.map(scopeKey)), [scopes]);
  const trimmed = query.trim().toLowerCase();

  const groups = useMemo<Group[]>(() => {
    return CATEGORIES.map((category) => {
      const label = CATEGORY_LABELS[category];
      const picked = selected.has(`category:${category}`);

      const matches = catalog
        .filter((c) => c.category === category)
        .map((c) => {
          if (!trimmed) return { entry: c, matchedEntry: null as string | null };
          if (c.className.toLowerCase().includes(trimmed)) {
            return { entry: c, matchedEntry: null as string | null };
          }
          const matchedEntry = c.entries.find((e) => e.toLowerCase().includes(trimmed));
          return matchedEntry ? { entry: c, matchedEntry } : null;
        })
        .filter((m): m is { entry: (typeof catalog)[number]; matchedEntry: string | null } =>
          m !== null,
        )
        .map(({ entry, matchedEntry }) => ({
          scope: { kind: "class", category, className: entry.className } as Scope,
          label: entry.className,
          hint: matchedEntry ?? `${entry.entryCount}`,
        }));

      // Selected behaviors float to the top so they stay visible past the cap.
      const pickedChildren = matches.filter((o) => selected.has(scopeKey(o.scope)));
      const rest = matches.filter((o) => !selected.has(scopeKey(o.scope)));
      const ordered = [...pickedChildren, ...rest];

      return {
        category,
        label,
        categoryOption: {
          scope: { kind: "category", category } as Scope,
          label,
          hint: `${categoryCounts[category]}`,
        },
        picked,
        pickedChildren: pickedChildren.length,
        options: ordered.slice(0, GROUP_LIMIT),
        hidden: Math.max(0, ordered.length - GROUP_LIMIT),
      };
    }).filter(
      (group) =>
        !trimmed || group.options.length > 0 || group.label.toLowerCase().includes(trimmed),
    );
  }, [catalog, categoryCounts, selected, trimmed]);

  // A search expands every matching group, otherwise the results stay hidden
  // behind a collapsed header.
  const isExpanded = (key: string) => Boolean(trimmed) || !collapsed.has(key);

  const visibleOptions = useMemo(
    () =>
      groups.flatMap((g) => [
        g.categoryOption,
        ...(isExpanded(g.category) ? g.options : []),
      ]),
    [groups, collapsed, trimmed],
  );

  useEffect(() => setActive(0), [trimmed, open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const toggleGroup = (key: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const add = (scope: Scope) => {
    onChange(normalizeScopes([...scopes, scope]));
    onQueryChange("");
    setOpen(true);
    input.current?.focus();
  };

  const remove = (key: string) => onChange(scopes.filter((s) => scopeKey(s) !== key));

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !query && scopes.length > 0) {
      onChange(scopes.slice(0, -1));
      return;
    }
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActive((i) => {
        const next = event.key === "ArrowDown" ? i + 1 : i - 1;
        return Math.max(0, Math.min(visibleOptions.length - 1, next));
      });
      return;
    }
    if (event.key === "Enter" && open && visibleOptions[active]) {
      event.preventDefault();
      add(visibleOptions[active].scope);
    }
  };

  let optionIndex = -1;

  return (
    <div ref={root} className="relative flex-1 min-w-0">
      <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-white/5 border border-teal-200/40 dark:border-white/10 rounded-xl focus-within:border-emerald-500/60 dark:focus-within:border-emerald-400/50 transition-colors">
        <div
          onMouseDown={(event) => {
            if (event.target !== event.currentTarget) return;
            event.preventDefault();
            setOpen(true);
            input.current?.focus();
          }}
          className="flex-1 min-w-0 flex items-center gap-1.5 h-7 cursor-text"
        >
          <Search className="size-3.5 shrink-0 text-teal-500 dark:text-white/40" />

        {scopes.slice(0, VISIBLE_CHIPS).map((scope) => {
          const key = scopeKey(scope);
          const Icon = CATEGORY_ICONS[scope.category];
          const label =
            scope.kind === "category" ? CATEGORY_LABELS[scope.category] : scope.className;
          return (
            <span
              key={key}
              className={`flex items-center gap-1.5 shrink-0 max-w-[9rem] pl-2 pr-1 py-0.5 rounded-lg text-xs font-medium ${
                scope.kind === "category"
                  ? "bg-emerald-100 dark:bg-emerald-400/15 text-emerald-700 dark:text-emerald-400"
                  : "bg-teal-100 dark:bg-white/10 text-teal-700 dark:text-white/70"
              }`}
            >
              <Icon className="size-3 shrink-0" />
              <span className="truncate">{label}</span>
              <button
                type="button"
                aria-label={`Remove ${label}`}
                onClick={() => remove(key)}
                className="shrink-0 rounded p-0.5 cursor-pointer hover:bg-black/10 dark:hover:bg-white/15"
              >
                <X className="size-3" />
              </button>
            </span>
          );
        })}

        {scopes.length > VISIBLE_CHIPS && (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setOpen(true);
              input.current?.focus();
            }}
            title={scopes
              .slice(VISIBLE_CHIPS)
              .map((scope) =>
                scope.kind === "category" ? CATEGORY_LABELS[scope.category] : scope.className,
              )
              .join(", ")}
            className="shrink-0 px-2 py-0.5 rounded-lg text-xs font-medium cursor-pointer bg-teal-100 dark:bg-white/10 text-teal-600 dark:text-white/60 hover:text-teal-950 dark:hover:text-white"
          >
            +{scopes.length - VISIBLE_CHIPS}
          </button>
        )}

        <input
          ref={input}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          value={query}
          placeholder={scopes.length === 0 ? "Search or scope: category, behavior, entry..." : ""}
          onChange={(event) => {
            onQueryChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="flex-1 min-w-[5rem] bg-transparent text-sm text-teal-950 dark:text-white placeholder:text-teal-400 dark:placeholder:text-white/35 focus:outline-none"
        />

        </div>

        <div className="flex items-center gap-1 shrink-0">
        {scopes.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs px-2 py-0.5 rounded-lg cursor-pointer text-teal-500 dark:text-white/40 hover:text-teal-950 dark:hover:text-white"
          >
            Clear
          </button>
        )}

        <button
          type="button"
          aria-label={open ? "Close the list" : "Open the list"}
          aria-haspopup="listbox"
          aria-expanded={open}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setOpen((wasOpen) => !wasOpen);
            input.current?.focus();
          }}
          className="shrink-0 rounded-lg p-1 cursor-pointer text-teal-400 dark:text-white/30 hover:text-teal-950 dark:hover:text-white"
        >
          <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        </div>
      </div>

      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label="Scope options"
          className="thin-scroll absolute z-20 mt-1.5 w-full max-h-80 overflow-y-auto rounded-xl border border-teal-200/50 dark:border-white/10 bg-white dark:bg-teal-950 shadow-xl p-1"
        >
          {groups.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-teal-500 dark:text-white/35">
              Nothing matches "{query.trim()}"
            </p>
          )}

          {groups.map((group) => {
            const expanded = isExpanded(group.category);
            const Icon = CATEGORY_ICONS[group.category];
            optionIndex += 1;
            const headerIndex = optionIndex;
            return (
              <div key={group.category}>
                <div
                  className={`flex items-center rounded-lg ${
                    headerIndex === active ? "bg-teal-50 dark:bg-white/10" : ""
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-label={expanded ? `Collapse ${group.label}` : `Expand ${group.label}`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => toggleGroup(group.category)}
                    className="shrink-0 p-1.5 rounded-lg cursor-pointer text-teal-400 dark:text-white/30 hover:text-teal-950 dark:hover:text-white disabled:opacity-0 disabled:cursor-default"
                  >
                    {expanded ? (
                      <ChevronDown className="size-3.5" />
                    ) : (
                      <ChevronRight className="size-3.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    role="option"
                    aria-selected={group.picked}
                    aria-checked={
                      group.picked ? "true" : group.pickedChildren > 0 ? "mixed" : "false"
                    }
                    onMouseEnter={() => setActive(headerIndex)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() =>
                      group.picked
                        ? remove(scopeKey(group.categoryOption.scope))
                        : add(group.categoryOption.scope)
                    }
                    className="flex-1 flex items-center gap-2.5 pr-2.5 py-1.5 rounded-lg cursor-pointer text-left min-w-0"
                  >
                    <Checkbox
                      state={
                        group.picked ? "on" : group.pickedChildren > 0 ? "mixed" : "off"
                      }
                    />
                    <Icon className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-950 dark:text-white truncate">
                      {group.label}
                    </span>
                    <span className="flex-1" />
                    <span className="text-[11px] tabular-nums text-teal-500 dark:text-white/35 shrink-0">
                      {group.categoryOption.hint}
                    </span>
                  </button>
                </div>

                {expanded &&
                  group.options.map((option) => {
                    optionIndex += 1;
                    const index = optionIndex;
                    const key = scopeKey(option.scope);
                    const childPicked = group.picked || selected.has(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        role="option"
                        aria-selected={childPicked}
                        disabled={group.picked}
                        title={
                          group.picked
                            ? `Covered by the whole ${group.label} category`
                            : undefined
                        }
                        onMouseEnter={() => setActive(index)}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => (selected.has(key) ? remove(key) : add(option.scope))}
                        className={`w-full flex items-center gap-2.5 pl-7 pr-2.5 py-1.5 rounded-lg text-left cursor-pointer disabled:cursor-default disabled:opacity-55 ${
                          index === active && !group.picked ? "bg-teal-50 dark:bg-white/10" : ""
                        }`}
                      >
                        <Checkbox state={childPicked ? "on" : "off"} />
                        <span className="font-minecraft text-sm truncate text-teal-800 dark:text-white/80">
                          {option.label}
                        </span>
                        <span className="flex-1" />
                        <span className="text-[11px] tabular-nums text-teal-500 dark:text-white/35 shrink-0">
                          {option.hint}
                        </span>
                      </button>
                    );
                  })}

                {expanded && group.hidden > 0 && (
                  <p className="pl-7 pr-2.5 py-1.5 text-[11px] text-teal-400 dark:text-white/25">
                    {group.hidden} more, keep typing to narrow it down
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
