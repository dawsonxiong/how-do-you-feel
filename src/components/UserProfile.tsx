"use client"

import { User } from "lucide-react"
import Image from "next/image"
import { useSession } from "next-auth/react"

export function UserProfile() {
  const { data: session } = useSession()

  if (!session?.user) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      {session.user.image ? (
        <Image
          src={session.user.image}
          alt={session.user.name || "User"}
          width={16}
          height={16}
          className="rounded-full w-4 h-4"
        />
      ) : (
        <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-3 h-3" />
        </div>
      )}
      <div className="hidden sm:block">
        <p className="text-sm font-medium">{session.user.name || session.user.email}</p>
      </div>
    </div>
  )
}
