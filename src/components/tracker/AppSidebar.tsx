"use client"

import * as React from "react"
import {
  IconDashboard,
  IconMap,
  IconListCheck,
  IconChartBar,
  IconClock,
  IconCalendar,
  IconTarget,
  IconHistory
} from "@tabler/icons-react"

import { NavSecondary } from "@/components/tracker/NavSecondary"
import { NavUser } from "@/components/tracker/NavUser"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar"

const BASE = "/SteelDocs"

const navItems = [
  {
    title: "Dashboard",
    url: `${BASE}/tracker`,
    icon: IconDashboard,
    items: [
      { title: "Overview", url: "#", icon: IconChartBar, date: "Today" },
      { title: "Features Status", url: "#", icon: IconListCheck, date: "Live" },
      { title: "Recent Impls", url: "#", icon: IconClock, date: "Just now" },
    ]
  },
  {
    title: "Roadmap",
    url: `${BASE}/tracker/roadmap`,
    icon: IconMap,
    items: [
      { title: "Q1 2026", url: "#", icon: IconCalendar, date: "In progress" },
      { title: "Q2 2026", url: "#", icon: IconTarget, date: "Planned" },
      { title: "History", url: "#", icon: IconHistory, date: "Archived" },
    ]
  },
]

export function AppSidebar({ pathname, ...props }: React.ComponentProps<typeof Sidebar> & { pathname?: string }) {
  const currentPath = pathname ?? (typeof window !== "undefined" ? window.location.pathname : "")

  return (
    <Sidebar
      collapsible="icon"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
              <a href={`${BASE}/tracker`}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <img
                    src={`${BASE}/steel_logo.png`}
                    alt="Steel Logo"
                    width={24}
                    height={24}
                    className="size-6"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight hidden">
                  <span className="truncate font-medium">Steel</span>
                  <span className="truncate text-xs">Tracker</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="px-1.5 md:px-0">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={{
                      children: item.title,
                      hidden: false,
                    }}
                    isActive={currentPath === item.url}
                    className="px-2.5 md:px-2"
                    asChild
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary className="p-0" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
