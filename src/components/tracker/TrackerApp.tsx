"use client"

import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/tracker/ThemeProvider"
import { ConvexClientProvider } from "@/components/tracker/ConvexClientProvider"
import { AppSidebar } from "@/components/tracker/AppSidebar"
import { SiteHeader } from "@/components/tracker/SiteHeader"
import { SectionCards } from "@/components/tracker/SectionCards"
import { FeaturesTable } from "@/components/tracker/FeaturesTable"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export function TrackerApp({ pathname }: { pathname: string }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <ConvexClientProvider>
        <SidebarProvider
          defaultOpen={false}
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <AppSidebar variant="floating" pathname={pathname} />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                  <SectionCards />
                  <FeaturesTable />
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </ConvexClientProvider>
    </ThemeProvider>
  )
}
