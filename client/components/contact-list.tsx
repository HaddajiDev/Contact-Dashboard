"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, Archive, Trash2, Reply, MoreHorizontal, Undo, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useMemo } from "react"

export interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  timestamp: string
  isRead: boolean
  isStarred: boolean
  isArchived: boolean
  isDeleted: boolean
  priority: "high" | "medium" | "low"
}

interface ContactsViewProps {
  messages: ContactMessage[]
  onContactClick: (email: string) => void
}

function ContactsView({ messages, onContactClick }: ContactsViewProps) {
  const uniqueContacts = useMemo(() => {
    const contactMap = new Map()

    messages.forEach((message) => {
      if (!contactMap.has(message.email)) {
        contactMap.set(message.email, {
          name: message.name,
          email: message.email,
          messageCount: 1,
          lastMessage: message.timestamp,
          hasUnread: !message.isRead,
          isStarred: message.isStarred,
        })
      } else {
        const existing = contactMap.get(message.email)
        existing.messageCount += 1
        if (!message.isRead) existing.hasUnread = true
        if (message.isStarred) existing.isStarred = true
        if (new Date(message.timestamp) > new Date(existing.lastMessage)) {
          existing.lastMessage = message.timestamp
        }
      }
    })

    return Array.from(contactMap.values()).sort(
      (a, b) => new Date(b.lastMessage).getTime() - new Date(a.lastMessage).getTime(),
    )
  }, [messages])

  const getInitials = (name: string) => {
    const nameParts = name.split(" ")
    let initials = ""
    for (let i = 0; i < nameParts.length; i++) {
      initials += nameParts[i].charAt(0).toUpperCase()
    }
    return initials
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
  }

  if (uniqueContacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-muted-foreground text-lg mb-2">No contacts found</div>
        <div className="text-sm text-muted-foreground">No contact messages yet.</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {uniqueContacts.map((contact) => (
        <Card
          key={contact.email}
          className="transition-all hover:shadow-md cursor-pointer"
          onClick={() => onContactClick(contact.email)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                    {getInitials(contact.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{contact.name}</h3>
                    {contact.hasUnread && (
                      <Badge variant="secondary" className="text-xs">
                        Unread
                      </Badge>
                    )}
                    {contact.isStarred && <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{contact.email}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      {contact.messageCount} message{contact.messageCount !== 1 ? "s" : ""}
                    </span>
                    <span>Last: {formatTimestamp(contact.lastMessage)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-xs">
                  {contact.messageCount}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

interface ContactListProps {
  messages: ContactMessage[]
  onToggleStar: (id: string) => void
  onToggleArchive: (id: string) => void
  onToggleDelete: (id: string) => void
  onMarkAsRead: (id: string) => void
  onReply: (id: string) => void
  currentFilter: string,
  actionLoading?: { [key: string]: string }
  onPermanentDelete: (id: string) => void
  onDeleteAllTrash?: () => void
  onRestore: (id: string) => void
  onUnarchive: (id: string) => void
  onUnstar: (id: string) => void
}

export function ContactList({
  messages,
  onToggleStar,
  onToggleArchive,
  onToggleDelete,
  onMarkAsRead,
  onReply,
  currentFilter,
  onContactClick,
  actionLoading = {},
  onPermanentDelete,
  onDeleteAllTrash,
  onRestore,
  onUnarchive,
  onUnstar,
}: ContactListProps & { onContactClick?: (email: string) => void }) {
  if (currentFilter === "contacts") {
    return <ContactsView messages={messages} onContactClick={onContactClick || (() => {})} />
  }

  const getInitials = (name: string) => {
    const nameParts = name.split(" ")
    let initials = ""
    for (let i = 0; i < nameParts.length; i++) {
      initials += nameParts[i].charAt(0).toUpperCase()
    }
    return initials
  }

  const isActionLoading = (messageId: string, action: string) => {
    return actionLoading[messageId] === action
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "default"
    }
  }

  const trashHeader = currentFilter === "trash" && messages.length > 0 && (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold">Trash ({messages.length})</h2>
      <Button 
        variant="destructive" 
        onClick={(e) => {
          e.stopPropagation();
          onDeleteAllTrash?.();
        }}
        disabled={isActionLoading('deleteAll', 'deleteAll')}
      >
        {isActionLoading('deleteAll', 'deleteAll') ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4 mr-2" />
        )}
        Empty Trash
      </Button>
    </div>
  );

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-muted-foreground text-lg mb-2">No messages found</div>
        <div className="text-sm text-muted-foreground">
          {currentFilter === "all" ? "No contact messages yet." : `No ${currentFilter} messages.`}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {trashHeader}
      {messages.map((message) => (
        <Card
          key={message.id}
          className={`transition-all hover:shadow-md cursor-pointer ${
            !message.isRead ? "border-l-4 border-l-primary" : ""
          } ${message.isArchived ? "opacity-60" : ""} ${message.isDeleted ? "opacity-40" : ""}`}
          onClick={() => !message.isDeleted && !message.isRead && onMarkAsRead(message.id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {getInitials(message.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-medium ${!message.isRead ? "font-semibold" : ""}`}>
                      {message.name}
                    </h3>
                    {!message.isRead && (
                      <Badge variant="secondary" className="text-xs">
                        New
                      </Badge>
                    )}
                    <Badge variant={getPriorityColor(message.priority)} className="text-xs">
                      {message.priority}
                    </Badge>
                    {message.isArchived && (
                      <Badge variant="outline" className="text-xs">
                        Archived
                      </Badge>
                    )}
                    {message.isDeleted && (
                      <Badge variant="destructive" className="text-xs">
                        Deleted
                      </Badge>
                    )}
                    {isActionLoading(message.id, 'read') && (
                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{message.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatTimestamp(message.timestamp)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!message.isDeleted && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${message.isStarred ? "text-yellow-500" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        message.isStarred ? onUnstar(message.id) : onToggleStar(message.id)
                      }}
                      disabled={isActionLoading(message.id, 'star') || isActionLoading(message.id, 'unstar')}
                    >
                      {isActionLoading(message.id, 'star') || isActionLoading(message.id, 'unstar') ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Star className="h-4 w-4" fill={message.isStarred ? "currentColor" : "none"} />
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onReply(message.id)}>
                          <Reply className="h-4 w-4 mr-2" />
                          Reply
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => message.isArchived ? onUnarchive(message.id) : onToggleArchive(message.id)}
                          disabled={isActionLoading(message.id, 'archive') || isActionLoading(message.id, 'unarchive')}
                        >
                          {isActionLoading(message.id, 'archive') || isActionLoading(message.id, 'unarchive') ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : message.isArchived ? (
                            <Undo className="h-4 w-4 mr-2" />
                          ) : (
                            <Archive className="h-4 w-4 mr-2" />
                          )}
                          {message.isArchived ? "Unarchive" : "Archive"}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive" 
                          onClick={() => onToggleDelete(message.id)}
                          disabled={isActionLoading(message.id, 'delete')}
                        >
                          {isActionLoading(message.id, 'delete') ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className={`text-sm leading-relaxed ${!message.isRead ? "font-medium" : "text-muted-foreground"}`}>
              {message.message}
            </p>
            <div className="flex gap-2 mt-4">
              {message.isDeleted ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRestore(message.id)
                    }}
                    disabled={isActionLoading(message.id, 'restore')}
                  >
                    {isActionLoading(message.id, 'restore') ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Undo className="h-3 w-3 mr-1" />
                    )}
                    Restore
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      onPermanentDelete(message.id)
                    }}
                    disabled={isActionLoading(message.id, 'permanentDelete')}
                  >
                    {isActionLoading(message.id, 'permanentDelete') ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3 mr-1" />
                    )}
                    Delete Permanently
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    className="h-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      onReply(message.id)
                    }}
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      message.isArchived ? onUnarchive(message.id) : onToggleArchive(message.id)
                    }}
                    disabled={isActionLoading(message.id, 'archive') || isActionLoading(message.id, 'unarchive')}
                  >
                    {isActionLoading(message.id, 'archive') || isActionLoading(message.id, 'unarchive') ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        {message.isArchived ? "Unarchiving..." : "Archiving..."}
                      </>
                    ) : message.isArchived ? (
                      <>
                        <Undo className="h-3 w-3 mr-1" />
                        Unarchive
                      </>
                    ) : (
                      <>
                        <Archive className="h-3 w-3 mr-1" />
                        Archive
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}