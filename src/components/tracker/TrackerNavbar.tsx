"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Search, Sun, Moon, HatGlasses, LogOut, LogIn, UserPlus } from "lucide-react"
import { useTheme } from "next-themes"
import { authClient } from "@/lib/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const BASE = "/SteelDocs"
const IS_DEV = import.meta.env.DEV

function getInitials(name: string | undefined) {
  if (!name) return "?"
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

// ─── Search ───────────────────────────────────────────────────────────────────

type SearchResult = { url: string; title: string; excerpt: string }

function NavSearch() {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [devWarning, setDevWarning] = useState(false)

  const pagefindRef = useRef<any>(null)
  const loadingRef = useRef<Promise<void> | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const loadPagefind = useCallback(() => {
    if (loadingRef.current) return loadingRef.current
    const bundlePath = import.meta.env.BASE_URL.replace(/\/$/, "") + "/pagefind/pagefind.js"
    loadingRef.current = import(/* @vite-ignore */ bundlePath)
      .then((mod) => { pagefindRef.current = mod })
      .catch(() => { console.warn("Pagefind could not be loaded.") })
    return loadingRef.current
  }, [])

  const handleFocus = useCallback(() => {
    if (IS_DEV) {
      setDevWarning(true)
      setOpen(true)
    } else {
      loadPagefind()
    }
  }, [loadPagefind])

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setQuery(term)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!term.trim()) {
      setOpen(false)
      setResults([])
      return
    }

    if (IS_DEV) return

    debounceRef.current = setTimeout(async () => {
      await loadPagefind()
      if (!pagefindRef.current) return
      try {
        const res = await pagefindRef.current.search(term)
        const top = res.results.slice(0, 7)
        const fragments = await Promise.all(top.map((r: any) => r.data()))
        setResults(fragments.map((f: any) => ({
          url: f.url,
          title: f.meta?.title ?? f.title ?? "",
          excerpt: f.excerpt ?? "",
        })))
        setOpen(true)
      } catch {
        // silently fail
      }
    }, 250)
  }, [loadPagefind])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false)
        ; (e.target as HTMLInputElement).blur()
    } else if (e.key === "Enter" && results.length > 0) {
      window.location.href = results[0].url
      setOpen(false)
    }
  }, [results])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("click", handler)
    return () => document.removeEventListener("click", handler)
  }, [])

  return (
    <div ref={containerRef} className="relative flex-1 max-w-60 hidden md:flex">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-teal-500 dark:text-white/40 pointer-events-none z-10" />
      <input
        type="search"
        value={query}
        placeholder="Search features…"
        onFocus={handleFocus}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        className="w-full pl-8 pr-3 py-1.5 text-sm bg-teal-50 dark:bg-white/8 border border-teal-200 dark:border-white/15 rounded-full text-teal-950 dark:text-white placeholder:text-teal-400 dark:placeholder:text-white/35 focus:outline-none focus:border-emerald-500/60 dark:focus:border-emerald-400/50 transition-all"
      />
      {open && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1.5 rounded-xl bg-white dark:bg-teal-900/95 backdrop-blur-md border border-teal-200 dark:border-white/10 shadow-2xl overflow-hidden"
        >
          {devWarning && (
            <p className="px-4 py-3 text-sm text-teal-500 dark:text-white/50">
              Search unavailable in dev mode.
            </p>
          )}
          {!devWarning && results.length === 0 && query.trim() && (
            <p className="px-4 py-3 text-sm text-teal-500 dark:text-white/50">No results found.</p>
          )}
          {results.map((r, i) => (
            <a
              key={r.url}
              href={r.url}
              onClick={() => setOpen(false)}
              className={[
                "block px-4 py-2.5 transition-colors border-b last:border-0",
                isDark
                  ? "hover:bg-white/10 border-white/5"
                  : "hover:bg-teal-50 border-teal-100",
              ].join(" ")}
            >
              <div className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-teal-950"}`}
                dangerouslySetInnerHTML={{ __html: r.title }}
              />
              <div className={`text-xs mt-0.5 line-clamp-1 ${isDark ? "text-white/50" : "text-teal-500"}`}
                dangerouslySetInnerHTML={{ __html: r.excerpt }}
              />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── User button ──────────────────────────────────────────────────────────────

function UserButton() {
  const { data: session } = authClient.useSession()

  if (!session?.user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center justify-center size-8 rounded-full bg-teal-100 dark:bg-white/10 text-teal-600 dark:text-white/60 hover:bg-teal-200 dark:hover:bg-white/20 transition-all cursor-pointer"
            aria-label="User menu"
          >
            <HatGlasses className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-48 rounded-xl" align="end" sideOffset={8}>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                <HatGlasses className="size-4" />
              </div>
              <div className="flex flex-col text-sm leading-tight">
                <span className="font-medium">Guest</span>
                <span className="text-xs text-muted-foreground">Not signed in</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <a href={`${BASE}/tracker/login`}>
                <LogIn className="mr-2 size-4" />
                Sign in
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={`${BASE}/tracker/signup`}>
                <UserPlus className="mr-2 size-4" />
                Create an account
              </a>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer" aria-label="User menu">
          <Avatar className="size-8">
            <AvatarImage src={session.user.image ?? undefined} alt={session.user.name} />
            <AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-52 rounded-xl" align="end" sideOffset={8}>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-2 py-2">
            <Avatar className="size-8">
              <AvatarImage src={session.user.image ?? undefined} alt={session.user.name} />
              <AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-sm leading-tight">
              <span className="truncate font-medium">{session.user.name}</span>
              <span className="truncate text-xs text-muted-foreground">{session.user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => authClient.signOut()}>
          <LogOut className="mr-2 size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export function TrackerNavbar() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-2 pt-2">
      <nav className="flex items-center gap-3 px-4 py-2.5 rounded-2xl backdrop-blur-md bg-white/80 dark:bg-teal-950/70 border border-teal-200/60 dark:border-white/10 shadow-md max-w-7xl mx-auto">
        {/* Logo */}
        <a
          href={`${BASE}/tracker`}
          className="flex items-center gap-2 font-bold text-xl text-teal-950 dark:text-white shrink-0 mr-2"
        >
          <img src={`${BASE}/steel_logo.png`} alt="Steel" className="size-6" />
          <span className="font-minecraft">Steel<span className="text-emerald-600 dark:text-emerald-400">Tracker</span></span>
        </a>

        {/* Search */}
        <NavSearch />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-1.5 rounded-xl text-teal-600 dark:text-white/60 hover:text-teal-950 dark:hover:text-white hover:bg-teal-100 dark:hover:bg-white/10 transition-all cursor-pointer"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <UserButton />
        </div>
      </nav>
    </header>
  )
}
