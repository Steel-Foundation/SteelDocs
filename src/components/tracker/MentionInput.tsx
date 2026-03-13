"use client"

import * as React from "react"
import type { Id } from "@convex/_generated/dataModel"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

export type MentionFeature = {
  _id: Id<"features">
  name: string
  completeStatus: boolean
}

type TextSeg    = { id: string; type: "text";    value: string }
type MentionSeg = { id: string; type: "mention"; featureId: Id<"features">; featureName: string }
type PendingSeg = { id: string; type: "pending"; query: string }
type Seg = TextSeg | MentionSeg | PendingSeg

let _uid = 0
function uid() { return String(++_uid) }
function textSeg(value = ""): TextSeg { return { id: uid(), type: "text", value } }

// ─── Serialization ────────────────────────────────────────────────────────────

export function serializeMentions(segs: Seg[]): string {
  return segs
    .map((s) =>
      s.type === "text"    ? s.value :
      s.type === "mention" ? `<#${s.featureId}>` :
      /* pending */          `#${s.query}`
    )
    .join("")
}

export function parseMentions(raw: string, featureMap: Map<string, MentionFeature>): Seg[] {
  if (!raw) return [textSeg()]
  const regex = /<#([^>]+)>/g
  const segs: Seg[] = []
  let last = 0
  let m: RegExpExecArray | null
  while ((m = regex.exec(raw)) !== null) {
    if (m.index > last) segs.push(textSeg(raw.slice(last, m.index)))
    const fid = m[1] as Id<"features">
    segs.push({ id: uid(), type: "mention", featureId: fid, featureName: featureMap.get(fid)?.name ?? fid })
    last = m.index + m[0].length
  }
  if (last < raw.length) segs.push(textSeg(raw.slice(last)))
  if (!segs.length || segs[segs.length - 1].type !== "text") segs.push(textSeg())
  return segs
}

// ─── MentionInput ─────────────────────────────────────────────────────────────

export interface MentionInputProps {
  features: MentionFeature[]
  onCreateFeature: (name: string) => Promise<Id<"features">>
  onSubmit: (serialized: string) => void
  placeholder?: string
  autoFocus?: boolean
  className?: string
}

export function MentionInput({
  features,
  onCreateFeature,
  onSubmit,
  placeholder,
  autoFocus,
  className,
}: MentionInputProps) {
  const [segs, setSegs] = React.useState<Seg[]>([textSeg()])
  const [ddIdx, setDdIdx] = React.useState(0)
  const inputRefs = React.useRef<Map<string, HTMLInputElement>>(new Map())

  const pending = segs.find((s): s is PendingSeg => s.type === "pending") ?? null

  // ─── Dropdown items ──────────────────────────────────────────────────────────

  const ddItems = React.useMemo(() => {
    if (!pending) return []
    const q = pending.query.trim().toLowerCase()
    const matched = features.filter((f) => f.name.toLowerCase().includes(q))
    const items: Array<{ kind: "existing"; feature: MentionFeature } | { kind: "create"; name: string }> =
      matched.map((f) => ({ kind: "existing" as const, feature: f }))
    const exact = matched.some((f) => f.name.toLowerCase() === q)
    if (q && !exact) items.push({ kind: "create", name: pending.query.trim() })
    return items
  }, [pending, features])

  React.useEffect(() => { setDdIdx(0) }, [pending?.query])

  // ─── Focus helpers ────────────────────────────────────────────────────────────

  function focusSeg(id: string, pos: "start" | "end" = "end") {
    requestAnimationFrame(() => {
      const el = inputRefs.current.get(id)
      if (!el) return
      el.focus()
      const n = pos === "start" ? 0 : el.value.length
      el.setSelectionRange(n, n)
    })
  }

  // ─── Mention lifecycle ────────────────────────────────────────────────────────

  function activatePending(textSegId: string, before: string, query: string) {
    const pId = uid()
    const afterId = uid()
    setSegs((prev) => {
      const idx = prev.findIndex((s) => s.id === textSegId)
      if (idx === -1) return prev
      const next = [...prev]
      next.splice(idx, 1,
        { id: textSegId, type: "text",    value: before } satisfies TextSeg,
        { id: pId,       type: "pending", query         } satisfies PendingSeg,
        { id: afterId,   type: "text",    value: ""     } satisfies TextSeg,
      )
      return next
    })
    requestAnimationFrame(() => inputRefs.current.get(pId)?.focus())
  }

  function commitMention(featureId: Id<"features">, featureName: string) {
    if (!pending) return
    const pId = pending.id
    const afterId = uid()
    setSegs((prev) => {
      const idx = prev.findIndex((s) => s.id === pId)
      if (idx === -1) return prev
      const next = [...prev]
      next.splice(idx, 1,
        { id: uid(),   type: "mention", featureId, featureName } satisfies MentionSeg,
        { id: afterId, type: "text",    value: ""              } satisfies TextSeg,
      )
      return next
    })
    focusSeg(afterId, "start")
  }

  function cancelPending() {
    if (!pending) return
    const insertText = "#" + pending.query
    const pId = pending.id
    let mergedId: string | undefined
    let cursorPos: number | undefined
    setSegs((prev) => {
      const idx = prev.findIndex((s) => s.id === pId)
      if (idx === -1) return prev
      const next = [...prev]
      const leftSeg  = idx > 0 && next[idx - 1].type === "text"              ? next[idx - 1] as TextSeg : null
      const rightSeg = idx < next.length - 1 && next[idx + 1].type === "text" ? next[idx + 1] as TextSeg : null
      mergedId  = leftSeg?.id ?? uid()
      cursorPos = (leftSeg?.value.length ?? 0) + insertText.length
      const merged: TextSeg = {
        id: mergedId,
        type: "text",
        value: (leftSeg?.value ?? "") + insertText + (rightSeg?.value ?? ""),
      }
      const start = leftSeg ? idx - 1 : idx
      const count = (leftSeg ? 1 : 0) + 1 + (rightSeg ? 1 : 0)
      next.splice(start, count, merged)
      return next
    })
    const tid = mergedId
    const pos = cursorPos
    if (tid !== undefined && pos !== undefined) {
      requestAnimationFrame(() => {
        const el = inputRefs.current.get(tid)
        if (!el) return
        el.focus()
        el.setSelectionRange(pos, pos)
      })
    }
  }

  function removeMention(mentionId: string) {
    let mergedId: string | undefined
    setSegs((prev) => {
      const idx = prev.findIndex((s) => s.id === mentionId)
      if (idx === -1) return prev
      const next = [...prev]
      const leftSeg  = idx > 0 && next[idx - 1].type === "text"              ? next[idx - 1] as TextSeg : null
      const rightSeg = idx < next.length - 1 && next[idx + 1].type === "text" ? next[idx + 1] as TextSeg : null
      mergedId = leftSeg?.id ?? uid()
      const merged: TextSeg = { id: mergedId, type: "text", value: (leftSeg?.value ?? "") + (rightSeg?.value ?? "") }
      const start = leftSeg ? idx - 1 : idx
      const count = (leftSeg ? 1 : 0) + 1 + (rightSeg ? 1 : 0)
      next.splice(start, count, merged)
      return next
    })
    if (mergedId) focusSeg(mergedId, "end")
  }

  async function selectItem(item: typeof ddItems[0]) {
    if (item.kind === "existing") {
      commitMention(item.feature._id, item.feature.name)
    } else {
      const newId = await onCreateFeature(item.name)
      commitMention(newId, item.name)
    }
  }

  // ─── Submit ───────────────────────────────────────────────────────────────────

  function doSubmit() {
    const value = serializeMentions(segs)
    if (!value.trim()) return
    onSubmit(value)
    setSegs([textSeg()])
  }

  // ─── Text segment handlers ────────────────────────────────────────────────────

  function onTextChange(seg: TextSeg, segIdx: number, raw: string) {
    // Strip tabs
    const clean = raw.replace(/\t/g, "")
    const hashIdx = clean.indexOf("#")
    if (hashIdx !== -1) {
      activatePending(seg.id, clean.slice(0, hashIdx), clean.slice(hashIdx + 1))
      return
    }
    setSegs((prev) => prev.map((s) => s.id === seg.id ? { ...s, value: clean } : s))
  }

  function onTextKeyDown(e: React.KeyboardEvent<HTMLInputElement>, seg: TextSeg, segIdx: number) {
    if (e.key === "Tab")   { e.preventDefault(); return }
    if (e.key === "Enter") { e.preventDefault(); doSubmit(); return }

    const input = e.currentTarget
    const atStart = input.selectionStart === 0 && input.selectionEnd === 0
    const atEnd = input.selectionStart === input.value.length && input.selectionEnd === input.value.length

    // Navigate left past a mention chip
    if (e.key === "ArrowLeft" && atStart && segIdx > 0) {
      e.preventDefault()
      let target = segIdx - 1
      if (segs[target].type === "mention" && target > 0) target--
      if (segs[target]?.type === "text") focusSeg(segs[target].id, "end")
    }

    // Navigate right past a mention chip
    if (e.key === "ArrowRight" && atEnd && segIdx < segs.length - 1) {
      e.preventDefault()
      let target = segIdx + 1
      if (segs[target].type === "mention" && target < segs.length - 1) target++
      if (segs[target]?.type === "text") focusSeg(segs[target].id, "start")
    }

    // Backspace at start — delete the mention chip to the left
    if (e.key === "Backspace" && atStart && segIdx > 0 && segs[segIdx - 1].type === "mention") {
      e.preventDefault()
      const mentionIdx = segIdx - 1
      let mergedId: string | undefined
      setSegs((prev) => {
        const next = [...prev]
        const leftSeg  = mentionIdx > 0 && next[mentionIdx - 1].type === "text" ? next[mentionIdx - 1] as TextSeg : null
        const rightSeg = next[mentionIdx + 1] as TextSeg
        mergedId = leftSeg?.id ?? uid()
        const merged: TextSeg = { id: mergedId, type: "text", value: (leftSeg?.value ?? "") + rightSeg.value }
        const start = leftSeg ? mentionIdx - 1 : mentionIdx
        const count = (leftSeg ? 1 : 0) + 2
        next.splice(start, count, merged)
        return next
      })
      if (mergedId) {
        requestAnimationFrame(() => {
          const el = inputRefs.current.get(mergedId!)
          if (!el) return
          const pos = el.value.length - seg.value.length
          el.focus()
          el.setSelectionRange(pos, pos)
        })
      }
    }
  }

  // ─── Pending segment handlers ─────────────────────────────────────────────────

  function onPendingChange(segId: string, raw: string) {
    const query = raw.replace(/\t/g, "")
    setSegs((prev) => prev.map((s) => s.id === segId ? { ...s, query } as PendingSeg : s))
  }

  function onPendingKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Tab")       { e.preventDefault(); return }
    if (e.key === "Escape")    { e.preventDefault(); cancelPending(); return }
    if (e.key === "ArrowUp")   { e.preventDefault(); setDdIdx((i) => Math.max(0, i - 1)); return }
    if (e.key === "ArrowDown") { e.preventDefault(); setDdIdx((i) => Math.min(ddItems.length - 1, i + 1)); return }
    if (e.key === "ArrowLeft" && e.currentTarget.selectionStart === 0) { e.preventDefault(); cancelPending(); return }
    if (e.key === "Enter") {
      e.preventDefault()
      const item = ddItems[ddIdx]
      if (item) selectItem(item)
      else if (pending?.query.trim()) selectItem({ kind: "create", name: pending.query.trim() })
      return
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  const hasContent = segs.some((s) =>
    (s.type === "text" && s.value) ||
    s.type === "mention" ||
    (s.type === "pending" && s.query)
  )

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "relative flex flex-wrap items-center gap-y-1 min-h-9 px-3 py-1.5 cursor-text",
          "border border-input rounded-md bg-background text-sm ring-offset-background",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            const last = [...segs].reverse().find((s) => s.type === "text" || s.type === "pending")
            if (last) focusSeg(last.id, "end")
          }
        }}
      >
        {!hasContent && (
          <span className="pointer-events-none select-none text-muted-foreground">
            {placeholder}
          </span>
        )}

        {segs.map((seg, segIdx) => {
          if (seg.type === "text") {
            return (
              <SizingInput
                key={seg.id}
                inputRef={(el) => {
                  if (el) inputRefs.current.set(seg.id, el)
                  else inputRefs.current.delete(seg.id)
                }}
                autoFocus={autoFocus && segIdx === 0}
                value={seg.value}
                onChange={(e) => onTextChange(seg, segIdx, e.target.value)}
                onKeyDown={(e) => onTextKeyDown(e, seg, segIdx)}
                className="outline-none bg-transparent"
              />
            )
          }

          if (seg.type === "mention") {
            return (
              <MentionChip
                key={seg.id}
                name={seg.featureName}
                onRemove={() => removeMention(seg.id)}
              />
            )
          }

          if (seg.type === "pending") {
            return (
              <span
                key={seg.id}
                className="inline-flex items-center gap-0.5 p-1 rounded-sm bg-teal-500/10 border border-teal-500/25 text-teal-600 dark:text-teal-400"
              >
                <span className="select-none opacity-50 text-xs leading-none">#</span>
                <SizingInput
                  inputRef={(el) => {
                    if (el) inputRefs.current.set(seg.id, el)
                    else inputRefs.current.delete(seg.id)
                  }}
                  value={seg.query}
                  onChange={(e) => onPendingChange(seg.id, e.target.value)}
                  onKeyDown={onPendingKeyDown}
                  placeholder="feature…"
                  minWidth={8}
                  className="outline-none bg-transparent placeholder:text-teal-600/40 dark:placeholder:text-teal-400/40"
                />
              </span>
            )
          }

          return null
        })}
      </div>

      {/* Autocomplete dropdown */}
      {pending && (
        <div className="absolute top-full left-0 mt-1 z-50 w-72 max-h-52 overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          {ddItems.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              {pending.query.trim()
                ? <>No match — press <kbd className="font-mono">Enter</kbd> to create</>
                : "Type to search or create a feature…"}
            </p>
          ) : (
            ddItems.map((item, i) => (
              <button
                key={item.kind === "existing" ? item.feature._id : "create"}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); selectItem(item) }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors hover:bg-accent",
                  i === ddIdx && "bg-accent",
                )}
              >
                {item.kind === "existing" ? (
                  <>
                    <span className={cn("size-2 rounded-full shrink-0", item.feature.completeStatus ? "bg-green-500" : "bg-teal-500/50")} />
                    <span className="flex-1 truncate">{item.feature.name}</span>
                    {item.feature.completeStatus && <span className="text-xs text-muted-foreground">done</span>}
                  </>
                ) : (
                  <>
                    <span className="size-2 rounded-full border-2 border-teal-500/60 shrink-0" />
                    <span>Create <strong>"{item.name}"</strong></span>
                  </>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── MentionChip ─────────────────────────────────────────────────────────────
// onRemove: present in the input (to delete the mention), absent in display mode

export function MentionChip({ name, onRemove, className }: {
  name: string
  onRemove?: () => void
  className?: string
}) {
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 p-1 rounded-sm",
      "bg-teal-500/15 text-teal-600 dark:text-teal-400 text-sm font-medium select-none",
      className,
    )}>
      <span className="opacity-50 text-xs">#</span>
      {name}
      {onRemove && (
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); onRemove() }}
          tabIndex={-1}
          className="ml-0.5 opacity-40 hover:opacity-100 transition-opacity leading-none text-xs"
          aria-label={`Remove mention of ${name}`}
        >
          ×
        </button>
      )}
    </span>
  )
}

// ─── SizingInput — auto-width input ──────────────────────────────────────────

interface SizingInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "ref"> {
  inputRef?: (el: HTMLInputElement | null) => void
  minWidth?: number
}

function SizingInput({ inputRef, value, placeholder, minWidth = 2, style, ...props }: SizingInputProps) {
  // Width is driven by the actual value only, not the placeholder
  const width = Math.max(minWidth, String(value ?? "").length + 1)
  return (
    <input
      ref={inputRef}
      value={value}
      placeholder={placeholder}
      style={{ width: `${width}ch`, ...style }}
      {...props}
    />
  )
}
