"use client"

import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/tracker/ThemeProvider"
import { ConvexClientProvider } from "@/components/tracker/ConvexClientProvider"
import { TrackerNavbar } from "@/components/tracker/TrackerNavbar"
import { SectionCards } from "@/components/tracker/SectionCards"
import { FeaturesTable } from "@/components/tracker/FeaturesTable"

export function TrackerApp({ pathname }: { pathname: string }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <ConvexClientProvider>
        <TrackerNavbar />
        <main className="flex flex-col pt-16 min-h-screen">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 px-3 sm:px-4 md:gap-6 md:py-6 md:px-6 max-w-7xl mx-auto w-full">
              <SectionCards />
              <FeaturesTable />
            </div>
          </div>
        </main>
        <Toaster />
      </ConvexClientProvider>
    </ThemeProvider>
  )
}
