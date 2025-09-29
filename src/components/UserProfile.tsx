"use client"

import { LogOut, User } from "lucide-react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function UserProfile() {
  const { data: session } = useSession()

  if (!session?.user) {
    return null
  }

  return (
    <div className="flex items-center gap-3">
      {/* User Avatar */}
      <div className="flex items-center gap-2">
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || "User"}
            width={32}
            height={32}
            className="rounded-full w-8 h-8"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
        )}
        <div className="hidden sm:block">
          <p className="text-sm font-medium">{session.user.name || session.user.email}</p>
        </div>
      </div>

      {/* Sign Out Button */}
      <form action="/api/auth/signout" method="post">
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-accent transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="sr-only">Sign out</span>
        </Button>
      </form>
    </div>
  )
}
