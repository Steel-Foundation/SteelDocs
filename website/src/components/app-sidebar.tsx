"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
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

import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
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


const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: IconDashboard,
    items: [
      { title: "Overview", url: "#", icon: IconChartBar, date: "Today" },
      { title: "Features Status", url: "#", icon: IconListCheck, date: "Live" },
      { title: "Recent Impls", url: "#", icon: IconClock, date: "Just now" },
    ]
  },
  {
    title: "Roadmap",
    url: "/roadmap",
    icon: IconMap,
    items: [
      { title: "Q1 2026", url: "#", icon: IconCalendar, date: "In progress" },
      { title: "Q2 2026", url: "#", icon: IconTarget, date: "Planned" },
      { title: "History", url: "#", icon: IconHistory, date: "Archived" },
    ]
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar
      collapsible="icon"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src="/steel_logo.png"
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
              </Link>
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
                    isActive={pathname === item.url}
                    className="px-2.5 md:px-2"
                    asChild
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
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
