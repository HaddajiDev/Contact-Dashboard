"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Filter, SortDesc, RefreshCw } from "lucide-react"

interface DashboardHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  currentFilter: string
  onFilterChange: (filter: string) => void
  sortBy: string
  onSortChange: (sort: string) => void
  onRefresh: () => void
  messageCounts: {
    total: number
    unread: number
  }
}

export function DashboardHeader({
  searchQuery,
  onSearchChange,
  currentFilter,
  onFilterChange,
  sortBy,
  onSortChange,
  onRefresh,
  messageCounts,
}: DashboardHeaderProps) {
  const getFilterLabel = (filter: string) => {
    switch (filter) {
      case "all":
        return "All"
      case "unread":
        return "Unread"
      case "starred":
        return "Starred"
      case "archived":
        return "Archived"
      case "trash":
        return "Trash"
      case "contacts":
        return "Contacts"
      default:
        return "All"
    }
  }

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case "newest":
        return "Newest"
      case "oldest":
        return "Oldest"
      case "priority":
        return "Priority"
      case "name":
        return "Name"
      default:
        return "Newest"
    }
  }

  return (
    <>
      <Badge variant="secondary" className="ml-2">
        {currentFilter === "contacts" ? `${messageCounts.total} contacts` : `${messageCounts.total} total`}
      </Badge>
      {messageCounts.unread > 0 && currentFilter !== "contacts" && (
        <Badge variant="destructive" className="ml-1">
          {messageCounts.unread} unread
        </Badge>
      )}

      <div className="relative flex-1 max-w-[300px] justify-center">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="pl-9 h-9"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="h-4 w-4 mr-1" />
            {getFilterLabel(currentFilter)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onFilterChange("all")}>All Messages</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange("unread")}>Unread Only</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange("starred")}>Starred</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange("high-priority")}>High Priority</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <SortDesc className="h-4 w-4 mr-1" />
            {getSortLabel(sortBy)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onSortChange("newest")}>Newest First</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange("oldest")}>Oldest First</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange("priority")}>Priority</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange("name")}>Name A-Z</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" size="sm" className="h-9" onClick={onRefresh}>
        <RefreshCw className="h-4 w-4" />
      </Button>
    </>
  )
}
