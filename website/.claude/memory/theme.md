# SteelTracker Theme

Teal-950 background · Emerald-400 accents.
Applied as inline CSS variables on a wrapper div in `layout.tsx` (portable, no globals.css dependency).
`forcedTheme="dark"` kept in ThemeProvider so Tailwind `dark:` variants activate.

## CSS Variable Values

| Variable | Value | Note |
|---|---|---|
| --background | oklch(0.18 0.064 194) | teal-950 |
| --foreground | oklch(0.95 0.022 163) | near-white, emerald tint |
| --card | oklch(0.23 0.068 163) | dark emerald surface |
| --card-foreground | oklch(0.95 0.022 163) | |
| --popover | oklch(0.23 0.068 163) | |
| --popover-foreground | oklch(0.95 0.022 163) | |
| --primary | oklch(0.765 0.177 163) | emerald-400 |
| --primary-foreground | oklch(0.18 0.064 194) | dark text on primary |
| --secondary | oklch(0.28 0.070 163) | dark emerald |
| --secondary-foreground | oklch(0.95 0.022 163) | |
| --muted | oklch(0.25 0.062 163) | |
| --muted-foreground | oklch(0.62 0.090 163) | subdued emerald |
| --accent | oklch(0.28 0.070 163) | |
| --accent-foreground | oklch(0.95 0.022 163) | |
| --destructive | oklch(0.65 0.200 22) | red |
| --border | oklch(0.32 0.072 163) | |
| --input | oklch(0.28 0.070 163) | |
| --ring | oklch(0.765 0.177 163) | emerald-400 |
| --chart-1 | oklch(0.765 0.177 163) | emerald-400 |
| --chart-2 | oklch(0.696 0.170 162) | emerald-500 |
| --chart-3 | oklch(0.596 0.145 163) | emerald-600 |
| --chart-4 | oklch(0.845 0.143 165) | emerald-300 |
| --chart-5 | oklch(0.508 0.118 166) | emerald-700 |
| --sidebar | oklch(0.15 0.058 193) | slightly darker, teal hue |
| --sidebar-foreground | oklch(0.90 0.025 163) | |
| --sidebar-primary | oklch(0.765 0.177 163) | emerald-400 |
| --sidebar-primary-foreground | oklch(0.18 0.064 194) | |
| --sidebar-accent | oklch(0.23 0.068 163) | |
| --sidebar-accent-foreground | oklch(0.90 0.025 163) | |
| --sidebar-border | oklch(0.25 0.065 163) | |
| --sidebar-ring | oklch(0.765 0.177 163) | |
| --radius | 0.625rem | |
