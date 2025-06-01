"use client"

import { useState, useMemo, useEffect } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { ContactList, type ContactMessage } from "@/components/contact-list"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, User, Settings } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useDispatch, useSelector } from "react-redux"
import { 
  fetchMessages, 
  markAsRead, 
  starMessage, 
  unstarMessage,
  archiveMessage, 
  unarchiveMessage,
  softDeleteMessage,
  restoreMessage,
  permanentDeleteMessage,
  deleteAllTrashMessages,
  toggleStar,
  toggleArchive,
  clearError
} from "@/store/MessageSlice"
import { AppDispatch, RootState } from "@/store"

export function DashboardLayout() {
  const [currentFilter, setCurrentFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedContact, setSelectedContact] = useState<string | null>(null)
  
  const [actionLoading, setActionLoading] = useState<{[key: string]: string}>({})
  
  const setMessageLoading = (messageId: string, action: string) => {
    setActionLoading(prev => ({ ...prev, [messageId]: action }))
  }
  
  const clearMessageLoading = (messageId: string) => {
    setActionLoading(prev => {
      const newState = { ...prev }
      delete newState[messageId]
      return newState
    })
  }
  
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const dispatch = useDispatch<AppDispatch>()
  
  const { all: messages, loading, error } = useSelector((state: RootState) => state.message)

  useEffect(() => {
    const handleFetchMessages = async () => {
      try {
        await dispatch(fetchMessages()).unwrap()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch messages",
          variant: "destructive",
        })
      }
    }
    
    handleFetchMessages()
  }, [dispatch, toast])

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
      dispatch(clearError())
    }
  }, [error, toast, dispatch])

  const filteredAndSortedMessages = useMemo(() => {
    const filtered = messages.filter((message) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          message.name.toLowerCase().includes(query) ||
          message.email.toLowerCase().includes(query) ||
          message.message.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      switch (currentFilter) {
        case "unread":
          return !message.isRead && !message.isDeleted
        case "starred":
          return message.isStarred && !message.isDeleted
        case "archived":
          return message.isArchived && !message.isDeleted
        case "trash":
          return message.isDeleted
        case "high-priority":
          return message.priority === "high" && !message.isDeleted
        case "contacts":
          return !message.isDeleted
        case "all":
        default:
          return !message.isDeleted
      }
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case "name":
          return a.name.localeCompare(b.name)
        case "newest":
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      }
    })

    return filtered
  }, [messages, currentFilter, searchQuery, sortBy])

  const messageCounts = useMemo(() => {
    const activeMessages = messages.filter((m) => !m.isDeleted)
    return {
      all: activeMessages.length,
      unread: activeMessages.filter((m) => !m.isRead).length,
      starred: activeMessages.filter((m) => m.isStarred).length,
      contacts: activeMessages.length,
      archived: activeMessages.filter((m) => m.isArchived).length,
      trash: messages.filter((m) => m.isDeleted).length,
      total: activeMessages.length,
    }
  }, [messages])

  const handleToggleStar = async (id: string) => {
    try {
      setMessageLoading(id, 'star')
      await dispatch(starMessage(id)).unwrap()
      await dispatch(fetchMessages()).unwrap()
      toast({ description: "Message starred" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to star message",
        variant: "destructive",
      })
    } finally {
      clearMessageLoading(id)
    }
  }

  const handleUnstar = async (id: string) => {
    try {
      setMessageLoading(id, 'unstar')
      await dispatch(unstarMessage(id)).unwrap()
      await dispatch(fetchMessages()).unwrap()
      toast({ description: "Message unstarred" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unstar message",
        variant: "destructive",
      })
    } finally {
      clearMessageLoading(id)
    }
  }

  const handleToggleArchive = async (id: string) => {
    try {
      setMessageLoading(id, 'archive')
      await dispatch(archiveMessage(id)).unwrap()
      await dispatch(fetchMessages()).unwrap()
      toast({ description: "Message archived" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive message",
        variant: "destructive",
      })
    } finally {
      clearMessageLoading(id)
    }
  }

  const handleUnarchive = async (id: string) => {
    try {
      setMessageLoading(id, 'unarchive')
      await dispatch(unarchiveMessage(id)).unwrap()
      await dispatch(fetchMessages()).unwrap()
      toast({ description: "Message unarchived" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unarchive message",
        variant: "destructive",
      })
    } finally {
      clearMessageLoading(id)
    }
  }

  const handleToggleDelete = async (id: string) => {
    try {
      setMessageLoading(id, 'delete')
      await dispatch(softDeleteMessage(id)).unwrap()
      await dispatch(fetchMessages()).unwrap()
      toast({ description: "Message deleted" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      })
    } finally {
      clearMessageLoading(id)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      setMessageLoading(id, 'read')
      await dispatch(markAsRead(id)).unwrap()
      await dispatch(fetchMessages()).unwrap()
      toast({ description: "Message marked as read" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark message as read",
        variant: "destructive",
      })
    } finally {
      clearMessageLoading(id)
    }
  }

  const handleReply = (id: string) => {
    const message = messages.find((m) => m.id === id)
    if (message) {
      toast({
        title: "Reply to " + message.name,
        description: "Reply functionality would open here",
      })
    }
  }

  const handleRestore = async (id: string) => {
    try {
      setMessageLoading(id, 'restore')
      await dispatch(restoreMessage(id)).unwrap()
      await dispatch(fetchMessages()).unwrap()
      toast({ description: "Message restored" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to restore message", variant: "destructive" })
    } finally {
      clearMessageLoading(id)
    }
  }

  const handlePermanentDelete = async (id: string) => {
    try {
      setMessageLoading(id, 'permanentDelete')
      await dispatch(permanentDeleteMessage(id)).unwrap()
      toast({ description: "Message permanently deleted" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete message", variant: "destructive" })
    } finally {
      clearMessageLoading(id)
    }
  }

  const handleDeleteAllTrash = async () => {
    try {
      setMessageLoading('deleteAll', 'deleteAll')
      await dispatch(deleteAllTrashMessages()).unwrap()
      toast({ description: "Trash emptied" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to empty trash", variant: "destructive" })
    } finally {
      clearMessageLoading('deleteAll')
    }
  }

  const handleRefresh = async () => {
    try {
      await dispatch(fetchMessages()).unwrap()
      toast({
        description: "Messages refreshed",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh messages",
        variant: "destructive",
      })
    }
  }

  const handleContactClick = (email: string) => {
    setSelectedContact(email)
    setCurrentFilter("all")
    setSearchQuery(email)
    toast({
      title: "Viewing contact",
      description: `Showing all messages from ${email}`,
    })
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (loading && messages.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider defaultOpen={true}>
        <AppSidebar currentFilter={currentFilter} onFilterChange={setCurrentFilter} messageCounts={messageCounts} />
        <SidebarInset>
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center px-6 gap-4">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">
                  {currentFilter === "contacts" ? "Contacts" : "Contact Messages"}
                </h1>
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                )}
              </div>

              <div className="flex-1 flex items-center justify-end gap-2 w-[100%] ml-auto">
                <DashboardHeader
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  currentFilter={currentFilter}
                  onFilterChange={setCurrentFilter}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  onRefresh={handleRefresh}
                  messageCounts={{
                    total: messageCounts.total,
                    unread: messageCounts.unread,
                  }}
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {getInitials(user?.name || "")}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user?.name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4 p-6">
            <div className="flex items-center justify-between md:hidden">
              <SidebarTrigger />
            </div>
            
            {!loading && filteredAndSortedMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                  <svg
                    className="w-12 h-12 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {currentFilter === "all" && searchQuery === "" 
                    ? "No messages yet" 
                    : currentFilter === "unread"
                    ? "No unread messages"
                    : currentFilter === "starred" 
                    ? "No starred messages"
                    : currentFilter === "archived"
                    ? "No archived messages"
                    : currentFilter === "trash"
                    ? "No deleted messages"
                    : currentFilter === "high-priority"
                    ? "No high priority messages"
                    : searchQuery !== ""
                    ? "No messages found"
                    : "No messages in this filter"
                  }
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  {currentFilter === "all" && searchQuery === "" 
                    ? "When people contact you, their messages will appear here." 
                    : searchQuery !== ""
                    ? `No messages match "${searchQuery}". Try adjusting your search terms.`
                    : "Messages matching this filter will appear here when available."
                  }
                </p>
                {(currentFilter !== "all" || searchQuery !== "") && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setCurrentFilter("all")
                      setSearchQuery("")
                    }}
                  >
                    View All Messages
                  </Button>
                )}
              </div>
            ) : (
              <ContactList
                messages={filteredAndSortedMessages}
                onToggleStar={handleToggleStar}
                onToggleArchive={handleToggleArchive}
                onToggleDelete={handleToggleDelete}
                onMarkAsRead={handleMarkAsRead}
                onReply={handleReply}
                currentFilter={currentFilter}
                onContactClick={handleContactClick}
                actionLoading={actionLoading}
                onPermanentDelete={handlePermanentDelete}
                onDeleteAllTrash={handleDeleteAllTrash}
                onRestore={handleRestore}
                onUnarchive={handleUnarchive}
                onUnstar={handleUnstar}
              />
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}