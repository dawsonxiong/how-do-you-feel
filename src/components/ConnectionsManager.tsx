"use client"

import { Loader2, Search, User, UserMinus, UserPlus } from "lucide-react"
import Image from "next/image"
import * as React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface Connection {
  id: string
  name: string | null
  email: string
  image: string | null
  sharedAt: string
}

interface UserSearchResult {
  id: string
  name: string | null
  email: string
  image: string | null
}

interface ConnectionsManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConnectionsManager({ open, onOpenChange }: ConnectionsManagerProps) {
  const [viewableUsers, setViewableUsers] = useState<Connection[]>([])
  const [sharingWith, setSharingWith] = useState<Connection[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isAdding, setIsAdding] = useState<string | null>(null)
  const [isRemoving, setIsRemoving] = useState<string | null>(null)

  const fetchConnections = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/mood-share")
      if (response.ok) {
        const data = await response.json()
        setViewableUsers(data.viewableUsers)
        setSharingWith(data.sharingWith)
      }
    } catch (error) {
      console.error("Error fetching connections:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchConnections()
    }
  }, [open])

  const handleSearch = async (query: string) => {
    setSearchQuery(query)

    if (!EMAIL.test(query.trim())) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/users/search?email=${encodeURIComponent(query.trim())}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.users)
      }
    } catch (error) {
      console.error("Error searching users:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddConnection = async (userId: string) => {
    setIsAdding(userId)
    try {
      const response = await fetch("/api/mood-share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUserId: userId }),
      })

      if (response.ok) {
        await fetchConnections()
        setSearchQuery("")
        setSearchResults([])
      } else {
        const error = await response.json()
        alert(error.error || "Failed to add connection")
      }
    } catch (error) {
      console.error("Error adding connection:", error)
      alert("Failed to add connection")
    } finally {
      setIsAdding(null)
    }
  }

  const handleRemoveConnection = async (userId: string) => {
    setIsRemoving(userId)
    try {
      const response = await fetch("/api/mood-share", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUserId: userId }),
      })

      if (response.ok) {
        await fetchConnections()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to remove connection")
      }
    } catch (error) {
      console.error("Error removing connection:", error)
      alert("Failed to remove connection")
    } finally {
      setIsRemoving(null)
    }
  }

  const isSharingWith = (userId: string) => sharingWith.some((user) => user.id === userId)
  const isViewing = (userId: string) => viewableUsers.some((user) => user.id === userId)

  const connectionLabel = (userId: string) => {
    if (isSharingWith(userId) && isViewing(userId)) return "sharing both ways"
    if (isSharingWith(userId)) return "can see your mood"
    return "shares their mood with you"
  }

  // Get unique connections (a user can appear in both arrays when sharing both ways)
  const uniqueConnections = React.useMemo(() => {
    const allConnections = [...viewableUsers, ...sharingWith]
    const seen = new Set<string>()
    return allConnections.filter((user) => {
      if (seen.has(user.id)) {
        return false
      }
      seen.add(user.id)
      return true
    })
  }, [viewableUsers, sharingWith])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            connections
          </DialogTitle>
          <DialogDescription className="mt-2">
            share your mood with friends. you'll see theirs once they share back.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Search for new connections */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">add connection</h3>
              </div>
              <Input
                type="email"
                placeholder="enter their full email..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />

              {isSearching && (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name || user.email}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{user.name || "No name"}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      {isSharingWith(user.id) ? (
                        <span className="text-xs text-muted-foreground">sharing</span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddConnection(user.id)}
                          disabled={isAdding === user.id}
                        >
                          {isAdding === user.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <UserPlus className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Current connections */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">my connections ({uniqueConnections.length})</h3>
              </div>

              {uniqueConnections.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  no connections yet. search for someone to connect with!
                </p>
              ) : (
                <div className="space-y-2">
                  {uniqueConnections.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name || user.email}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{user.name || "No name"}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {connectionLabel(user.id)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!isSharingWith(user.id) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddConnection(user.id)}
                            disabled={isAdding === user.id}
                            title="Share your mood back"
                          >
                            {isAdding === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <UserPlus className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveConnection(user.id)}
                          disabled={isRemoving === user.id}
                        >
                          {isRemoving === user.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <UserMinus className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
