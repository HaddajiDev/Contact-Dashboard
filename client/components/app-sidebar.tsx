"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Mail, MessageSquare, Users, Settings, Archive, Trash2, Star } from "lucide-react"

interface AppSidebarProps {
  currentFilter: string
  onFilterChange: (filter: string) => void
  messageCounts: {
    all: number
    unread: number
    starred: number
    contacts: number
    archived: number
    trash: number
  }
}

export function AppSidebar({ currentFilter, onFilterChange, messageCounts }: AppSidebarProps) {
  const menuItems = [
    {
      title: "All Messages",
      filter: "all",
      icon: Mail,
      count: messageCounts.all,
    },
    {
      title: "Unread",
      filter: "unread",
      icon: MessageSquare,
      count: messageCounts.unread,
    },
    {
      title: "Starred",
      filter: "starred",
      icon: Star,
      count: messageCounts.starred,
    },
    {
      title: "Contacts",
      filter: "contacts",
      icon: Users,
      count: messageCounts.contacts,
    },
    {
      title: "Archive",
      filter: "archived",
      icon: Archive,
      count: messageCounts.archived,
    },
    {
      title: "Trash",
      filter: "trash",
      icon: Trash2,
      count: messageCounts.trash,
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <Mail className="h-6 w-6" />
          <span className="font-semibold text-lg">Contact Dashboard</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Messages</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={currentFilter === item.filter}
                    onClick={() => onFilterChange(item.filter)}
                  >
                    <div className="flex items-center justify-between w-full cursor-pointer">
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </div>
                      <span className="text-xs bg-muted px-2 py-1 rounded-full">{item.count}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <div className="flex items-center gap-2 w-full cursor-pointer">
                    <Settings className="h-4 w-4" />
                    <span>Preferences</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-2 text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</div>
      </SidebarFooter>
    </Sidebar>
  )
}
