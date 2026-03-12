"use client"

import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/tracker/ThemeProvider"
import { ConvexClientProvider } from "@/components/tracker/ConvexClientProvider"
import { LoginForm } from "@/components/tracker/LoginForm"

export function TrackerLogin() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <ConvexClientProvider>
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
        <Toaster />
      </ConvexClientProvider>
    </ThemeProvider>
  )
}
