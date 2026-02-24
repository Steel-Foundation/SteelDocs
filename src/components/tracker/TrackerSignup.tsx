"use client"

import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/tracker/ThemeProvider"
import { ConvexClientProvider } from "@/components/tracker/ConvexClientProvider"
import { SignupForm } from "@/components/tracker/SignupForm"

export function TrackerSignup() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <ConvexClientProvider>
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
          <div className="w-full max-w-sm">
            <SignupForm />
          </div>
        </div>
        <Toaster />
      </ConvexClientProvider>
    </ThemeProvider>
  )
}
